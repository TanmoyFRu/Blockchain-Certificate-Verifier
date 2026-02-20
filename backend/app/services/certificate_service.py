import hashlib
import os
import qrcode
import base64
from io import BytesIO
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from datetime import datetime
from app.config.settings import settings

STORAGE_DIR = "storage"
TEMPLATE_DIR = "app/templates"

def generate_certificate_pdf(owner_name: str, course_name: str, org_name: str, cert_hash: str) -> str:
    verify_url = f"{settings.FRONTEND_URL}/verify?hash={cert_hash}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(verify_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode()
    qr_data_uri = f"data:image/png;base64,{qr_base64}"

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    template = env.get_template("certificate_template.html")
    
    html_content = template.render(
        owner_name=owner_name,
        course_name=course_name,
        org_name=org_name,
        date=datetime.now().strftime('%B %d, %Y'),
        qr_path=qr_data_uri,
        cert_hash=cert_hash
    )

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"cert_{owner_name.replace(' ', '_')}_{timestamp}.pdf"
    filepath = os.path.join(STORAGE_DIR, filename)

    with open(filepath, "wb") as result_file:
        pisa_status = pisa.CreatePDF(html_content, dest=result_file)
        
    if pisa_status.err:
        raise Exception("Failed to generate PDF from HTML")

    return filepath

def get_file_hash(filepath: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def get_content_hash(owner_name: str, course_name: str, org_name: str) -> str:
    """Preview hash based on content before PDF generation"""
    content = f"{owner_name}|{course_name}|{org_name}|{datetime.now().strftime('%Y%m%d')}"
    return hashlib.sha256(content.encode()).hexdigest()

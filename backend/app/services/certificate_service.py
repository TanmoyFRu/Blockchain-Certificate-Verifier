import hashlib
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from datetime import datetime

STORAGE_DIR = "storage"

def generate_certificate_pdf(owner_name: str, course_name: str, org_name: str) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"cert_{owner_name.replace(' ', '_')}_{timestamp}.pdf"
    filepath = os.path.join(STORAGE_DIR, filename)

    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    # Simple Design
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width / 2, height - 100, "CERTIFICATE OF COMPLETION")
    
    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 180, "This is to certify that")
    
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2, height - 220, owner_name)
    
    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 280, "has successfully completed the course")
    
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 320, course_name)
    
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, 100, f"Issued by: {org_name}")
    c.drawCentredString(width / 2, 80, f"Date: {datetime.now().strftime('%Y-%m-%d')}")

    c.save()
    return filepath

def get_file_hash(filepath: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

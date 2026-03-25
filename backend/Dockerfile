FROM python:3.12-slim

WORKDIR /app

# Install required system packages for reportlab/pdf generation if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libcairo2-dev \
    pango1.0-tools \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir poetry

COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false \
    && poetry install --without dev --no-interaction --no-ansi

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

<div align="center">

```
 ██████╗██╗   ██╗██████╗ ██╗  ██╗██╗██████╗ ███████╗
██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██║██╔══██╗██╔════╝
██║      ╚████╔╝ ██████╔╝███████║██║██████╔╝█████╗  
██║       ╚██╔╝  ██╔═══╝ ██╔══██║██║██╔══██╗██╔══╝  
╚██████╗   ██║   ██║     ██║  ██║██║██║  ██║███████╗
 ╚═════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝
```

</div>

# Cyphire

> Blockchain-powered certificate verification. Immutable, instant, and tamper-proof.

Built with **React + Vite**, **FastAPI**, and **Polygon Network** integration.

---

## What is Cyphire?

Cyphire lets institutions issue digitally-signed credentials that anyone can verify in seconds — without contacting the issuer, without trusting a middleman, and without the possibility of forgery.

### The Problem
- PDFs and paper certificates are trivially forged.
- Employers must phone or email institutions to confirm credentials — slow and unreliable.
- A single database breach or institutional closure can erase records permanently.

### The Solution

Every credential issued through Cyphire is:

1. **Hashed** — A SHA-256 fingerprint of the recipient name, course, and issuing organisation is computed. Even a single character change produces a completely different hash.
2. **Anchored on-chain** — The hash is written to a smart contract on the Polygon network via a signed transaction. It is immutable from that point.
3. **Instantly verifiable** — Anyone can paste the hash (or upload the original PDF) on the public verify page. Cyphire checks the hash against both the local database and the blockchain in one call.

```mermaid
graph LR
    subgraph Issue
        A[Issuer Dashboard] -->|POST /certificates/issue| B[FastAPI]
        B -->|SHA-256 hash| C[Smart Contract]
        B -->|Store PDF| D[MinIO / Local Storage]
        B -->|Store metadata| E[(SQLite / PostgreSQL)]
    end

    subgraph Verify
        F[Public Verify Page] -->|GET /certificates/verify/:hash| B
        F -->|POST /certificates/verify-file| B
        B -->|verifyCertificate call| C
    end
```

---

## Features

| Feature | Detail |
|---|---|
| **Hash-based verification** | Verify any credential by its unique SHA-256 hash |
| **PDF upload verification** | Upload the original PDF — hash is extracted and checked automatically |
| **Blockchain anchoring** | Every issuance writes a transaction to the Polygon smart contract |
| **On-chain revocation** | Issuers can revoke credentials; revocation is recorded on-chain |
| **Certificate PDF generation** | Auto-generates a styled PDF for each credential on issue |
| **MinIO storage** | Generated PDFs uploaded to MinIO (falls back gracefully if unavailable) |
| **Issuer dashboard** | Protected dashboard with credential audit log, analytics, and issuance form |
| **JWT authentication** | HS256-signed access tokens, configurable expiry |
| **Organisation management** | Multi-org support — each issuer is linked to an organisation |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, Framer Motion, Recharts, lucide-react |
| Backend | Python 3.9+, FastAPI, SQLAlchemy, Pydantic v2, pydantic-settings |
| Auth | JWT (python-jose), bcrypt |
| Blockchain | Web3.py, Polygon (configurable RPC) |
| Storage | MinIO (optional) / Local filesystem fallback |
| Database | SQLite (dev) / PostgreSQL (prod) |
| PDF Generation | ReportLab |

---

## Project Structure

```
Cyphire/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Verify.jsx        # Public verification page
│   │   │   ├── Login.jsx         # Issuer authentication
│   │   │   └── Dashboard.jsx     # Issuer management console
│   │   ├── components/ui/        # Shared UI components
│   │   ├── services/api.js       # Axios client
│   │   └── App.jsx               # Routes: / → /verify, /login, /dashboard
│   └── vite.config.js
│
├── backend/
│   └── app/
│       ├── main.py               # FastAPI app, CORS, static files, router registration
│       ├── config/settings.py    # All env vars via pydantic-settings
│       ├── db/database.py        # SQLAlchemy engine + session
│       ├── models/               # SQLAlchemy ORM models
│       ├── schemas/              # Pydantic request/response schemas
│       ├── routes/
│       │   ├── auth.py           # /auth/register, /auth/login
│       │   ├── certificates.py   # /certificates/* (issue, verify, revoke, delete, list)
│       │   └── organizations.py  # /organizations/* (create, get, update)
│       ├── services/
│       │   ├── auth_service.py   # JWT creation, user lookup, password hashing
│       │   ├── blockchain_service.py  # Web3 issue/revoke/verify calls
│       │   ├── certificate_service.py # PDF generation, SHA-256 hashing
│       │   └── minio_service.py  # MinIO upload and URL generation
│       └── templates/            # HTML template for certificate PDF
│
├── .env                          # Environment variables (see below)
├── run.ps1                       # One-command launcher (Windows)
└── README.md
```

---

## API Reference

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register a new issuer account |
| POST | `/auth/login` | None | Returns a JWT access token |

**Login request body:**
```json
{ "email": "admin@org.com", "password": "secret" }
```
**Login response:**
```json
{ "access_token": "<jwt>" }
```

---

### Certificates — `/certificates`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/certificates/issue` | JWT | Issue a new credential, anchor on-chain, generate PDF |
| GET | `/certificates/verify/{cert_hash}` | None | Verify by hash — checks DB + blockchain |
| POST | `/certificates/verify-file` | None | Upload PDF — hash extracted and verified |
| POST | `/certificates/{cert_id}/revoke` | JWT | Revoke a credential on-chain |
| DELETE | `/certificates/{cert_id}` | JWT | Delete a credential from the database |
| GET | `/certificates/` | JWT | List all credentials for the issuer's organisation |

**Issue request body:**
```json
{ "owner_name": "Alice Johnson", "course_name": "Blockchain Fundamentals" }
```

**Verify response:**
```json
{
  "local_record": { "id": 1, "cert_hash": "...", "owner_name": "...", "course_name": "...", "tx_hash": "0x...", "revoked": false },
  "on_chain": { "exists": true, "issuer": "0x...", "timestamp": 1700000000, "revoked": false },
  "pdf_url": "https://..."
}
```

---

### Organisations — `/organizations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/organizations/` | None | Create a new organisation |
| GET | `/organizations/me` | JWT | Get the current user's organisation |
| GET | `/organizations/{org_id}` | None | Get an organisation by ID |
| PUT | `/organizations/{org_id}` | JWT | Update organisation details |

---

## Blockchain Integration

Cyphire uses a custom Solidity smart contract deployed on Polygon (or any EVM chain). The contract exposes three functions:

```solidity
function issueCertificate(string _certHash) external
function revokeCertificate(string _certHash) external
function verifyCertificate(string _certHash) external view
    returns (bool exists, address issuer, uint256 timestamp, bool revoked)
```

If `RPC_URL` or `PRIVATE_KEY` are not set, the blockchain service runs in **mock mode** — issuance and revocation still work and return placeholder transaction hashes. This is useful for local development without a funded wallet.

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=sqlite:///./cyphire.db
# For production PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/cyphire

# Auth
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Blockchain (leave blank to run in mock mode)
RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-wallet-private-key-hex
CONTRACT_ADDRESS=0xYourDeployedContractAddress

# Frontend (used for CORS)
FRONTEND_URL=http://localhost:3000

# MinIO (leave as defaults for local play.min.io, or configure your own)
MINIO_ENDPOINT=play.min.io:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=certificates
MINIO_SECURE=true
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### 1. Clone

```bash
git clone https://github.com/yourusername/cyphire.git
cd cyphire
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

# Copy and fill in your .env
cp .env.example .env

uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. One-command (Windows)

A `run.ps1` script at the repo root starts both servers simultaneously:

```powershell
.\run.ps1
```

### 5. Access

| Service | URL |
|---|---|
| Verify page | http://localhost:3000/verify |
| Issuer login | http://localhost:3000/login |
| API docs (Swagger) | http://localhost:8000/docs |
| API docs (Redoc) | http://localhost:8000/redoc |

---

## First-Time Setup

1. Register an organisation via `POST /organizations/` with a name, wallet address, and optional domain.
2. Register an issuer account via `POST /auth/register` and link them to the organisation ID.
3. Log in at `/login` — your JWT is stored in `localStorage`.
4. Issue credentials from the Dashboard. Each issuance generates a PDF, uploads it to MinIO, and writes the hash to the blockchain.
5. Share the credential hash with the recipient. They verify it at `/verify`.

---

## License

MIT — Built for a more trusted world.

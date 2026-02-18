import json
from web3 import Web3
from app.config.settings import settings

# Minimal ABI for the functions we need
ABI = [
    {
        "inputs": [{"internalType": "string", "name": "_certHash", "type": "string"}],
        "name": "issueCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "string", "name": "_certHash", "type": "string"}],
        "name": "verifyCertificate",
        "outputs": [
            {"internalType": "bool", "name": "", "type": "bool"},
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "bool", "name": "", "type": "bool"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
]

class BlockchainService:
    def __init__(self):
        self.w3 = None
        self.account = None
        self.contract = None

        # Basic validation to avoid crashing on placeholder values
        if settings.RPC_URL.startswith("http") and len(settings.PRIVATE_KEY) >= 64:
            try:
                self.w3 = Web3(Web3.HTTPProvider(settings.RPC_URL))
                self.account = self.w3.eth.account.from_key(settings.PRIVATE_KEY)
                self.contract = self.w3.eth.contract(address=settings.CONTRACT_ADDRESS, abi=ABI)
            except Exception as e:
                print(f"Blockchain Init Warning: {e}")
                self.w3 = None

    def issue_on_chain(self, cert_hash: str):
        if not self.w3:
            return "MOCK_TX_HASH_NO_RPC"

        nonce = self.w3.eth.get_transaction_count(self.account.address)
        
        # Build transaction
        tx = self.contract.functions.issueCertificate(cert_hash).build_transaction({
            'chainId': self.w3.eth.chain_id,
            'gas': 200000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': nonce,
        })

        # Sign and send
        signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=settings.PRIVATE_KEY)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        return self.w3.to_hex(tx_hash)

    def verify_on_chain(self, cert_hash: str):
        if not self.w3:
            return None
        
        try:
            exists, issuer, timestamp, revoked = self.contract.functions.verifyCertificate(cert_hash).call()
            return {
                "exists": exists,
                "issuer": issuer,
                "timestamp": timestamp,
                "revoked": revoked
            }
        except Exception:
            return None

blockchain_service = BlockchainService()

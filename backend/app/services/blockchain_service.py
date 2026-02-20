import json
from web3 import Web3
from app.config.settings import settings

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
    {
        "inputs": [{"internalType": "string", "name": "_certHash", "type": "string"}],
        "name": "revokeCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]

class BlockchainService:
    def __init__(self):
        self.w3 = None
        self.account = None
        self.contract = None

        if settings.RPC_URL.startswith("http") and len(settings.PRIVATE_KEY) >= 64:
            try:
                self.w3 = Web3(Web3.HTTPProvider(settings.RPC_URL, request_kwargs={'timeout': 10}))
                if self.w3.is_connected():
                    self.account = self.w3.eth.account.from_key(settings.PRIVATE_KEY)
                    self.contract = self.w3.eth.contract(address=settings.CONTRACT_ADDRESS, abi=ABI)
                    print(f"Blockchain initialized: {settings.CONTRACT_ADDRESS}")
                else:
                    print("Blockchain Warning: Could not connect to RPC")
                    self.w3 = None
            except Exception as e:
                print(f"Blockchain Init Warning: {e}")
                self.w3 = None

    def issue_on_chain(self, cert_hash: str):
        if not self.w3:
            return "MOCK_TX_HASH_NO_RPC"

        try:
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            base_tx = {
                'from': self.account.address,
                'to': settings.CONTRACT_ADDRESS,
                'data': self.contract.encode_abi("issueCertificate", [cert_hash]),
            }
            gas_estimate = self.w3.eth.estimate_gas(base_tx)
            
            tx = self.contract.functions.issueCertificate(cert_hash).build_transaction({
                'chainId': self.w3.eth.chain_id,
                'gas': int(gas_estimate * 1.2), 
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=settings.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            if receipt.status != 1:
                raise Exception("Transaction failed on chain")
                
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            print(f"Blockchain Error: {e}")
            raise e

    def revoke_on_chain(self, cert_hash: str):
        if not self.w3:
            return "MOCK_TX_HASH_REVOKED_NO_RPC"

        try:
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            base_tx = {
                'from': self.account.address,
                'to': settings.CONTRACT_ADDRESS,
                'data': self.contract.encode_abi("revokeCertificate", [cert_hash]),
            }
            gas_estimate = self.w3.eth.estimate_gas(base_tx)
            
            tx = self.contract.functions.revokeCertificate(cert_hash).build_transaction({
                'chainId': self.w3.eth.chain_id,
                'gas': int(gas_estimate * 1.2),
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=settings.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            if receipt.status != 1:
                raise Exception("Revocation failed on chain")
                
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            print(f"Blockchain Revocation Error: {e}")
            raise e

    def verify_on_chain(self, cert_hash: str):
        if not self.w3:
            return {
                "exists": True,
                "issuer": "0xMOCK_ISSUER",
                "timestamp": 1700000000,
                "revoked": False
            }
        
        try:
            exists, issuer, timestamp, revoked = self.contract.functions.verifyCertificate(cert_hash).call()
            return {
                "exists": exists,
                "issuer": issuer,
                "timestamp": timestamp,
                "revoked": revoked
            }
        except Exception as e:
            print(f"Verification Check Error: {e}")
            return None

blockchain_service = BlockchainService()

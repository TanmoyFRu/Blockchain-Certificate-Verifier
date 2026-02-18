import os
import sys
from solcx import compile_files, install_solc
from web3 import Web3
from dotenv import load_dotenv

# Add parent dir to path to import settings
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.config.settings import settings

load_dotenv()

def deploy():
    if not settings.RPC_URL or not settings.PRIVATE_KEY:
        print("Error: RPC_URL and PRIVATE_KEY must be set in .env")
        return

    print("Installing solc...")
    install_solc("0.8.0")

    print("Compiling contract...")
    contract_path = os.path.join(os.path.dirname(__file__), "../../contracts/CertificateVerifier.sol")
    compiled_sol = compile_files(
        [contract_path],
        output_values=["abi", "bin"],
        solc_version="0.8.0"
    )

    contract_id, contract_interface = compiled_sol.popitem()
    abi = contract_interface['abi']
    bytecode = contract_interface['bin']

    w3 = Web3(Web3.HTTPProvider(settings.RPC_URL))
    account = w3.eth.account.from_key(settings.PRIVATE_KEY)

    print(f"Deploying from: {account.address}")

    CertificateVerifier = w3.eth.contract(abi=abi, bytecode=bytecode)

    nonce = w3.eth.get_transaction_count(account.address)

    # Build transaction
    tx = CertificateVerifier.constructor().build_transaction({
        'chainId': w3.eth.chain_id,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
    })

    # Sign and send
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=settings.PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    print(f"Transaction sent! Hash: {w3.to_hex(tx_hash)}")
    
    print("Waiting for receipt...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    print(f"Contract deployed at: {tx_receipt.contractAddress}")
    print("\nUPDATE YOUR .env WITH THIS ADDRESS:")
    print(f"CONTRACT_ADDRESS={tx_receipt.contractAddress}")

if __name__ == "__main__":
    deploy()

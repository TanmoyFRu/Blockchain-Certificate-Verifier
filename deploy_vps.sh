#!/bin/bash
# Server setup script for Ubuntu 20.04/22.04/24.04 VPS (AWS EC2, DigitalOcean, Linode)
set -e

echo "Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

echo "Installing Docker Compose..."
sudo apt-get install -y docker-compose-plugin

echo "Setup complete. To deploy the application:"
echo "1. Git clone your repository here."
echo "2. Edit the generated .env file to match your production domain/IP."
echo "3. Run 'docker compose up -d --build'"

cat <<EOF > .env
# Production Environment Variables
FRONTEND_URL=http://YOUR_SERVER_IP:3000
VITE_API_URL=http://YOUR_SERVER_IP:8000
DATABASE_URL=sqlite:///./storage/cyphire.db

# Update these securely
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=admin123supersecret
MINIO_SECRET_KEY=admin123supersecret
MINIO_SECURE=false

# Optional Blockchain Config
RPC_URL=https://polygon-rpc.com
# PRIVATE_KEY=
# CONTRACT_ADDRESS=
EOF

echo "A stub .env file has been created. Update the IP address and run docker-compose."

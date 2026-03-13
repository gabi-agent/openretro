# Quick Reference Commands

## Docker Compose
```bash
# Build and start
docker compose -f docker-compose.yml up -d --build

# Rebuild with no cache
docker compose -f docker-compose.yml up -d --build --no-cache --force-recreate

# Stop and remove
docker compose -f docker-compose.yml down

# View logs
docker logs container-name

# Check running containers
docker ps | grep container-name
```

## Python Virtualenv
```bash
# Create virtualenv
python3 -m venv venv

# Activate
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run
uvicorn main:app --host 0.0.0.0 --port 9982
```

## Firewall (UFW)
```bash
# Open port
sudo ufw allow 9982/tcp

# Check status
sudo ufw status
```

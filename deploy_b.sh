#!/bin/bash

# エラーが発生したら即停止
set -e

# ==========================================
# 1. Docker Build & Push
# ==========================================
echo "--- 1. Docker Image Build ---"
# App Runner用に linux/amd64 でビルド
docker build --no-cache --platform linux/amd64 --load --provenance=false -f Dockerfile.prod -t backend-app .

echo "--- 2. Push to ECR ---"
export ECR_REPO_URL="876208240845.dkr.ecr.ap-northeast-1.amazonaws.com/architecture-sandbox-backend"

# ECRログイン
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 876208240845.dkr.ecr.ap-northeast-1.amazonaws.com

# タグ付け & プッシュ
docker tag backend-app:latest $ECR_REPO_URL:latest
docker push $ECR_REPO_URL:latest

# ==========================================
# 2. Infrastructure Update (Terraform)
# ==========================================
echo "--- 3. Deploy via Terraform ---"
cd terraform

terraform apply -auto-approve

cd ../
echo "Done!"
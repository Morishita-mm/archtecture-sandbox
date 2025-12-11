#!/bin/bash

# 修正点: -e を変数ごとに書く必要があります
# バックスラッシュ (\) で改行して見やすくしています

docker compose exec \
  -e VITE_API_BASE_URL=https://7zsrayjxek.ap-northeast-1.awsapprunner.com  \
  -e VITE_APP_SHARE_URL=https://d13hd7ljwokuq9.cloudfront.net \
  frontend npm run build

cd frontend && npm run deploy
scp -r ./dist package.json docker-compose.yaml Dockerfile .dockerignore ../pnpm-lock.yaml ../.env zomi:/srv/s3ntiment-backend/

scp -r ../shared/dist zomi:/srv/s3ntiment-backend/shared/dist
scp -r ../shared/package.json zomi:/srv/s3ntiment-backend/shared/package.json
pnpm run build

scp -r ./dist package.json docker-compose.yaml Dockerfile .dockerignore ../pnpm-lock.yaml ../.env zomi-ts:/srv/s3ntiment-backend/

scp -r ../shared/dist zomi-ts:/srv/s3ntiment-backend/shared
scp -r ../shared/package.json zomi-ts:/srv/s3ntiment-backend/shared/package.json
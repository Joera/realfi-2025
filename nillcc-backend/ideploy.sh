pnpm run build

scp -r ./dist package.json docker-compose.yaml Dockerfile .dockerignore ../pnpm-lock.yaml ../.env /srv/s3ntiment-backend/

scp -r ../shared/dist /srv/s3ntiment-backend/shared
scp -r ../shared/package.json /srv/s3ntiment-backend/shared/package.json
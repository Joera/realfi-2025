FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY dist ./dist
COPY shared ./shared
COPY contracts ./contracts
COPY package.json pnpm-lock.yaml ./
RUN echo "node-linker=hoisted" > .npmrc
RUN pnpm install --prod --no-frozen-lockfile

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
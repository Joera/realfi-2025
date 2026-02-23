# Use Node 20 Alpine for smaller image size
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files and lockfile
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for building)
RUN pnpm install --frozen-lockfile

# Copy source code and TypeScript config
COPY . .

# Build TypeScript to JavaScript
RUN pnpm run build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files and lockfile
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 8080

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main.js"]
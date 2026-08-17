# Stage 1: Build static assets using Vite
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on package-lock/package.json
COPY package*.json ./
RUN npm ci

# Copy codebase and compile the project
COPY . .
RUN npm run build

# Stage 2: Serve compiled assets using Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

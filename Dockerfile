# Stage 1: Build ứng dụng NestJS
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json và package-lock.json (hoặc yarn.lock)
COPY package*.json ./
COPY yarn.lock ./

# Cài đặt dependencies
RUN yarn install --frozen-lockfile

# Copy toàn bộ source code
COPY . .

# Build ứng dụng NestJS (nếu dùng TypeScript)
RUN yarn build

# Stage 2: Chạy ứng dụng
FROM node:20-alpine

WORKDIR /app

# Copy chỉ những file cần thiết từ builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist

# Mở cổng mà ứng dụng NestJS chạy (ví dụ: 3000)
EXPOSE 3000

# Lệnh khởi chạy ứng dụng
CMD ["yarn", "start:prod"]
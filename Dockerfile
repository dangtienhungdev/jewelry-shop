FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy source code
COPY . .

# Build ứng dụng
RUN npm run build

# Tạo thư mục uploads
RUN mkdir -p uploads

# Expose port 8000
EXPOSE 8000

# Chạy ứng dụng
CMD ["npm", "run", "start:prod"]
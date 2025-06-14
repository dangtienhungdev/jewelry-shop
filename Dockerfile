# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Install necessary packages for building native dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force && \
    npm install --force

# Copy the rest of the application code to the working directory
COPY . .

# Remove node_modules and do a fresh install to ensure native modules are built correctly
RUN rm -rf node_modules && \
    npm install --force && \
    npm rebuild bcrypt --build-from-source

# Build the NestJS application
RUN npm run build

# Clean up build tools to reduce image size but keep libc6-compat for runtime
RUN apk del python3 make g++ gcc musl-dev

# Expose the application port
EXPOSE 8000

# Define the command to run the application
CMD [ "node", "dist/main.js" ]
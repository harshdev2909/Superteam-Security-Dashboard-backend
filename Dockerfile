# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy everything first
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client (now schema.prisma is available)
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "dev"]

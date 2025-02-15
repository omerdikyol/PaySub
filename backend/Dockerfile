# PaySub backend service

FROM node:18-slim

# Set environment
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including TypeScript
RUN npm install && \
    npm install -g typescript && \
    npm install @types/node --save-dev

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build && \
    npm prune --production

EXPOSE 3000

# Run the compiled JavaScript
CMD [ "node", "dist/server.js" ]

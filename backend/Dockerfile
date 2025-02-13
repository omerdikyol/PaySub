# PaySub backend service

FROM node:16

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm install

COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Run the compiled JavaScript
CMD [ "node", "dist/server.js" ]

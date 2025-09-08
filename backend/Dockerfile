FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the TypeScript code
RUN npm run build

# Set NODE_ENV for production
ENV NODE_ENV=production

EXPOSE $PORT

CMD ["npm", "start"]
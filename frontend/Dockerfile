FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --verbose --timeout=120000

COPY . .

RUN npm run build

EXPOSE ${PORT:-3000}

CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${PORT:-3000}"]

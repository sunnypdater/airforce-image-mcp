FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ ./dist/
ENV AIRFORCE_TIMEOUT_MS=60000
CMD ["node", "dist/cli.js"]

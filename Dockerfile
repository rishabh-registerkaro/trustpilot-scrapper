FROM node:18-alpine

WORKDIR /app

# Install Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

EXPOSE 3001

CMD ["node", "app.js"]

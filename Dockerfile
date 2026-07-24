FROM node:20-slim

RUN apt-get update && apt-get install -y \
    git curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Puppeteer is a dev-only dependency (build/test scripts). Skip its ~150MB
# Chromium download during `npm ci` — it is never used at runtime in production.
ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /app

COPY start.production.sh /usr/local/bin/start.production.sh
RUN chmod +x /usr/local/bin/start.production.sh

ENTRYPOINT ["/usr/local/bin/start.production.sh"]

EXPOSE 3000

FROM node:24-bookworm-slim

WORKDIR /workspace

COPY --chown=node:node package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

COPY --chown=node:node . .
USER node

RUN npm run check
CMD ["npm", "test"]

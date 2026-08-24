FROM node:24-bookworm-slim

WORKDIR /workspace

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .
USER node

RUN npm run check
CMD ["npm", "test"]

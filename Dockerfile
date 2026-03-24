FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Copy manifests first to maximize build cache usage.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json apps/client/package.json
COPY apps/serveur/package.json apps/serveur/package.json

RUN pnpm install --frozen-lockfile

COPY . .

# Build client and server once for production runtime.
RUN pnpm --filter @cineconnect/client build && pnpm --filter @cineconnect/serveur build

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter @cineconnect/serveur db:migrate && pnpm --filter @cineconnect/serveur start"]

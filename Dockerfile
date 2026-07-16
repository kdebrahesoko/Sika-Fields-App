# ── Dev / Staging image ──────────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ && \
    corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/

RUN pnpm install --no-frozen-lockfile

ENV NODE_ENV=production
ENV PORT=3000
ENV BASE_PATH=/

RUN cd artifacts/api-server && pnpm exec tsx ./build.ts

RUN cd artifacts/sikafields && pnpm run build

RUN cp -r artifacts/sikafields/dist/public ./public

EXPOSE 3000

CMD ["node", "artifacts/api-server/dist/index.cjs"]

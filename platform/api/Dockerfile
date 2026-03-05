FROM node:22-slim
RUN groupadd -g 1000 api && useradd -u 1000 -g api -m api
WORKDIR /app
COPY --chown=api:api package.json package-lock.json ./
RUN npm ci --production
COPY --chown=api:api . .
RUN mkdir -p data && chown api:api data
USER api
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1
CMD ["node", "--loader", "tsx", "src/server.ts"]

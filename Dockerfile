FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy pre-built standalone output (built locally via npm run build)
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
COPY prisma ./prisma
COPY node_modules/.prisma ./node_modules/.prisma
COPY node_modules/@prisma ./node_modules/@prisma
COPY node_modules/prisma ./node_modules/prisma
COPY scripts/docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]

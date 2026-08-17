FROM node:20-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM node:20-alpine AS backend
WORKDIR /backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend ./
RUN npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./backend/
COPY backend/prisma ./backend/prisma
COPY backend/tsconfig.json ./backend/tsconfig.json
WORKDIR /app/backend
RUN npm ci && npx prisma generate

COPY --from=backend /backend/dist ./dist
COPY --from=frontend /frontend/dist /app/frontend/dist
RUN mkdir -p uploads

EXPOSE 5000
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node dist/src/main.js"]

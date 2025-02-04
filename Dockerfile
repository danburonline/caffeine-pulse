# Base stage for both development and production
FROM node:20-slim as base
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]

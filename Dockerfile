# Base stage for both development and production
FROM node:20-slim as base
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base as development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev:backend"]

# Production stage
FROM base as production
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]

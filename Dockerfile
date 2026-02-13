FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite default port
EXPOSE 5173

# Run in dev mode for now to ensure HMR works
CMD ["npm", "run", "dev", "--", "--host"]
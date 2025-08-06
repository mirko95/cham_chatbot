# Step 1: Use a lightweight Node.js image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json & package-lock.json first (better caching)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the project files
COPY . .

# Step 6: Build the project for production
RUN npm run build

# Step 7: Expose port 4173 (Vite preview default) or 3000 depending on setup
EXPOSE 4173

# Step 8: Start the app in preview mode
CMD ["npm", "run", "preview"]

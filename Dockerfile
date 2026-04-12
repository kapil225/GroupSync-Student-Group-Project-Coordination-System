# ═══════════════════════════════════════════════════════════════
# Dockerfile — Multi-Stage Build for GroupSync
# ═══════════════════════════════════════════════════════════════
#
# This Dockerfile uses a multi-stage build strategy:
#
#   Stage 1 (build):  Install Node.js, install dependencies,
#                     and build the production-ready static files.
#
#   Stage 2 (serve):  Copy only the built files into a lightweight
#                     Nginx container that serves them.
#
# WHY MULTI-STAGE?
#   - The build stage needs Node.js, npm, and all dev dependencies
#     (hundreds of MB). But the final app is just static HTML/CSS/JS.
#   - By separating build from serving, the final image is tiny
#     (~25MB instead of ~1GB) — faster to deploy and more secure.
#
# HOW TO USE:
#
#   1. Build the image:
#      docker build -t groupsync .
#
#   2. Run the container:
#      docker run -p 8080:80 groupsync
#
#   3. Open http://localhost:8080 in your browser
#
#   4. Stop the container:
#      docker stop <container_id>
#
# ═══════════════════════════════════════════════════════════════


# ─────────────────────────────────────────
# STAGE 1: BUILD
#
# We start from a Node.js base image, install
# all dependencies, and run the Vite build.
# This produces static files in the /dist folder.
# ─────────────────────────────────────────

FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (for better Docker caching).
# If package.json hasn't changed, Docker skips npm install
# on subsequent builds — saving a lot of time.
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Now copy the rest of the source code
COPY . .

# Build the production bundle
# This creates a /app/dist folder with optimized HTML/CSS/JS
RUN npm run build


# ─────────────────────────────────────────
# STAGE 2: SERVE
#
# We use Nginx (a fast, lightweight web server)
# to serve our static files. We only copy the
# built /dist folder — no Node.js needed here.
# ─────────────────────────────────────────

FROM nginx:alpine AS production

# Copy the built files from Stage 1 into Nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx config for single-page app routing
# (so that refreshing on any page doesn't give a 404)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard HTTP)
EXPOSE 80

# Start Nginx in the foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]

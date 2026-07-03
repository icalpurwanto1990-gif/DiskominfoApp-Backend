# Build assets stage
FROM node:18-alpine AS assets-builder
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install --save-dev @tailwindcss/oxide-linux-x64-musl
COPY . .
RUN npm run build

# Final container stage
FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    oniguruma-dev \
    postgresql-dev \
    icu-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd intl zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Copy built assets from builder stage
COPY --from=assets-builder /app/public/build ./public/build

# Install dependency composer
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Setup Nginx and Supervisor configuration
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/supervisord.conf /etc/supervisord.conf
COPY ./docker/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

# Set permissions
RUN mkdir -p /var/www/html/public/uploads && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/uploads

# Create Nginx temp folder and configure permissions
RUN mkdir -p /var/lib/nginx/tmp && chown -R www-data:www-data /var/lib/nginx

# Expose port
EXPOSE 8080

# Start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

#!/usr/bin/env bash
set -e

# Automatically configure JAVA_HOME and PATH if not already exported
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk-17}"
export PATH="$JAVA_HOME/bin:$HOME/.local/maven/bin:$PATH"

# Ensure local PostgreSQL instance is running
if ! /usr/lib/postgresql/18/bin/pg_isready -h 127.0.0.1 -p 5433 >/dev/null 2>&1; then
    echo "Starting local PostgreSQL on port 5433..."
    /usr/lib/postgresql/18/bin/pg_ctl -D "$HOME/.local/postgres_data" -o "-p 5433 -k /tmp" -l "$HOME/.local/postgres_data/logfile" start || true
fi

# Set dev environment variables
export SPRING_PROFILES_ACTIVE="dev"
export DB_URL="${DB_URL:-jdbc:postgresql://localhost:5432/gymsaas}"
export DB_USERNAME="${DB_USERNAME:-postgres}"
export DB_PASSWORD="${DB_PASSWORD:-postgres}"
export PORT="${PORT:-8080}"

echo "=========================================================="
echo " Starting Gym Management SaaS Spring Boot Application... "
echo " Environment: DEV | Port: $PORT | PostgreSQL: 5433/gymsaas"
echo " Swagger UI: http://localhost:$PORT/swagger-ui.html       "
echo "=========================================================="

# Navigate into gym-saas-backend if running from root
if [ -d "gym-saas-backend" ]; then
    cd gym-saas-backend
fi

chmod +x mvnw
./mvnw spring-boot:run

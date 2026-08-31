# Gym Management SaaS Platform

> Multi-tenant, production-ready Gym Management SaaS platform built with Java 17, Spring Boot 3, Spring Security 6, JWT, PostgreSQL, Flyway, and Angular.

---

## Architecture Highlights

- **Multi-Tenancy Model**: Shared database, shared schema with row-level isolation via `tenant_id` foreign keys.
- **Stateless Authentication**: JJWT 0.12.x HS512 with `userId`, `tenantId`, `role`, and `gymName` claims.
- **Token Security**: 30-day refresh token rotation stored in database with instant revocation.
- **Tenant Context**: `ThreadLocal<UUID>` isolation strictly populated from authenticated JWT claims and cleared per request.
- **Database Versioning**: Flyway migrations (V1 to V14) managing 18 schema tables, GIN full-text search indexes, partial indexes, and automatic triggers.
- **Rate Limiting**: Bucket4j token-bucket rate limiting on public authentication endpoints.
- **Interactive Documentation**: OpenAPI / Swagger UI integrated at `/swagger-ui.html`.

---

## Project Structure

```
Gymapp/
├── start-backend.sh                 # Local start script with PostgreSQL checks
├── .gitignore
├── .vscode/                         # IDE launch & Java configuration
│   ├── launch.json
│   └── settings.json
└── gym-saas-backend/                # Spring Boot 3 REST API
    ├── pom.xml
    ├── mvnw
    ├── start-backend.sh
    └── src/
        ├── main/
        │   ├── java/com/gymsaas/
        │   │   ├── GymSaasApplication.java
        │   │   ├── common/          # Config, exceptions, response envelopes, entity base
        │   │   ├── security/        # JWT, TenantContext, UserDetails, RateLimit
        │   │   └── module/
        │   │       ├── auth/        # Login, refresh, password reset
        │   │       ├── tenant/      # Gym onboarding, gym settings
        │   │       ├── user/        # Staff and user management
        │   │       └── audit/       # Immutable audit logs
        │   └── resources/
        │       ├── application.yml
        │       ├── application-dev.yml
        │       ├── application-prod.yml
        │       └── db/migration/   # Flyway V1 through V14 migrations
        └── test/                    # Security, unit, and integration tests
```

---

## Getting Started Locally

### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL 15+

### Quick Start
1. Run the local backend script:
```bash
./start-backend.sh
```

2. Access the APIs & Documentation:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health Endpoint**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **API Base**: `http://localhost:8080/api/v1`

---

## Running Tests

Run the complete test suite including cross-tenant security verification tests:
```bash
cd gym-saas-backend
./mvnw clean test
```

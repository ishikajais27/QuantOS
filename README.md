# QuantOS — Multi-Exchange Trading Platform

A containerised, multi-module trading platform with real-time order matching,
market data normalisation, arbitrage detection, and a live Next.js frontend.

## Prerequisites

- Docker >= 24
- Docker Compose >= 2.20
- (Optional for local dev) Java 17, Maven 3.9+

## Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd quantos

# 2. Configure environment
cp .env.example .env
# Edit .env and set secure values for POSTGRES_PASSWORD and JWT_SECRET

# 3. Build and start everything
docker-compose up --build

# 4. Open browser
open http://localhost
```

## Services & Ports (internal)

| Service     | Port | Description                        |
| ----------- | ---- | ---------------------------------- |
| nginx       | 80   | Reverse proxy (only exposed port)  |
| frontend    | 3000 | Next.js 14 UI                      |
| api         | 8080 | REST API (orders, portfolio, etc.) |
| engine      | 8081 | Order matching engine              |
| market-data | 8082 | Feed normaliser + Redis pub        |
| analytics   | 8083 | Bellman-Ford, VWAP, volatility     |
| push        | 8084 | STOMP WebSocket push server        |
| strategy    | 8085 | Strategy execution stub            |
| postgres    | 5432 | PostgreSQL 15                      |
| redis       | 6379 | Redis 7                            |

## URL Routes (via nginx on port 80)

| Path        | Proxied To        |
| ----------- | ----------------- |
| `/api/*`    | api:8080          |
| `/engine/*` | engine:8081       |
| `/ws`       | push:8084 (STOMP) |
| `/*`        | frontend:3000     |

## Build individual modules

```bash
mvn clean package -pl engine -am
mvn clean package -pl market-data -am
mvn clean package -pl analytics -am
mvn clean package -pl api -am
mvn clean package -pl push -am
mvn clean package -pl strategy -am
```

## Stopping

```bash
docker-compose down          # keep volumes
docker-compose down -v       # destroy volumes (wipes DB)
```

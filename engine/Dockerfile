# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /workspace

# Copy parent POM and ALL module POMs (Maven reactor needs them all)
COPY pom.xml ./
COPY engine/pom.xml         engine/
COPY market-data/pom.xml    market-data/
COPY analytics/pom.xml      analytics/
COPY api/pom.xml            api/
COPY push/pom.xml           push/
COPY strategy/pom.xml       strategy/

# Pre-download dependencies for caching
RUN mvn -pl engine dependency:go-offline -B --no-transfer-progress 2>/dev/null || true

# Copy engine source
COPY engine/src engine/src

# Build engine only
RUN mvn -pl engine package -DskipTests -B --no-transfer-progress

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/engine/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
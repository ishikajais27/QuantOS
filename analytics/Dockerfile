FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /workspace

COPY pom.xml ./
COPY engine/pom.xml         engine/
COPY market-data/pom.xml    market-data/
COPY analytics/pom.xml      analytics/
COPY api/pom.xml            api/
COPY push/pom.xml           push/
COPY strategy/pom.xml       strategy/

RUN mvn -pl analytics dependency:go-offline -B --no-transfer-progress 2>/dev/null || true

COPY analytics/src analytics/src

RUN mvn -pl analytics package -DskipTests -B --no-transfer-progress

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/analytics/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
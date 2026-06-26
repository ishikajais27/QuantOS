FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /workspace

COPY pom.xml ./
COPY engine/pom.xml         engine/
COPY market-data/pom.xml    market-data/
COPY analytics/pom.xml      analytics/
COPY api/pom.xml            api/
COPY push/pom.xml           push/
COPY strategy/pom.xml       strategy/

RUN mvn -pl push dependency:go-offline -B --no-transfer-progress 2>/dev/null || true

COPY push/src push/src

RUN mvn -pl push package -DskipTests -B --no-transfer-progress

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/push/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
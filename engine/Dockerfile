FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
COPY engine/pom.xml engine/pom.xml
COPY market-data/pom.xml market-data/pom.xml
COPY analytics/pom.xml analytics/pom.xml
COPY api/pom.xml api/pom.xml
COPY push/pom.xml push/pom.xml
COPY strategy/pom.xml strategy/pom.xml
RUN mvn dependency:go-offline -pl engine -am -q
COPY engine/src engine/src
RUN mvn clean package -pl engine -am -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/engine/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
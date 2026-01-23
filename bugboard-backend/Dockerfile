# Usa un'immagine leggera di Java 21 come base
FROM eclipse-temurin:21-jdk-jammy

# Crea una cartella di lavoro all'interno del container
WORKDIR /app

# Copia il file JAR generato da Maven (assicurati di aver fatto 'mvnw package')
COPY target/bugboard26-0.0.1-SNAPSHOT.jar app.jar

# Espone la porta 8080 (quella usata di default da Spring Boot)
EXPOSE 8080

# Comando per avviare l'applicazione
ENTRYPOINT ["java", "-jar", "app.jar"]
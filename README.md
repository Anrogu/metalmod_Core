# 
# 🔩 Metalmod Core

Metalmod Core es una aplicación de código abierto fullstack diseñada para optimizar y digitalizar el registro de reportes de mantenimiento de máquinas CNC, tornos y equipos industriales dentro de la planta.
## 🚀 Características

    Gestión de Mantenimiento: Registro detallado de incidencias y mantenimientos preventivos/correctivos.

    Trazabilidad: Historial completo del estado de la maquinaria.

    Arquitectura Escalable: Despliegue en contenedores para facilitar su implementación en cualquier entorno.

## 🛠️ Tecnologías (Stack)

El proyecto está construido utilizando tecnologías modernas para garantizar rendimiento y escalabilidad:

    Backend: Java ☕ | Spring Boot 🌿

    Base de Datos: PostgreSQL 🐘

    Frontend: React ⚛️ | Node.js 🇳

    Despliegue: Docker 🐳

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

    Git

    Docker y Docker Compose

## 📦 Instalación y Ejecución

Gracias a Docker, levantar el proyecto es un proceso rápido. Sigue estos pasos:

    Clona el repositorio:
    Bash

    git clone https://github.com/tu-usuario/metalmod-core.git
    cd metalmod-core

    Configura las variables de entorno:
    Crea un archivo .env en la raíz del proyecto (puedes basarte en un .env.example si existe) y configura tus credenciales de PostgreSQL:
    Fragmento de código

    POSTGRES_USER=postgres
    POSTGRES_PASSWORD='TuPasswordSeguro$'
    POSTGRES_DB=metalmod_core
    SERVER_PORT=8080
    SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/metalmod_core
    SPRING_DATASOURCE_USERNAME=postgres
    SPRING_DATASOURCE_PASSWORD='TuPasswordSeguro$'
    SPRING_JPA_HIBERNATE_DDL_AUTO=none

    Levanta los contenedores:
    Ejecuta el siguiente comando para construir y desplegar la base de datos, el backend y el frontend:
    Bash

    docker compose up -d --build

    Accede a la aplicación:

        Frontend: http://localhost:8081

        Backend API: http://localhost:8083

### 🤝 Contribución

¡Todas las Pull Requests son bienvenidas! Si deseas contribuir al proyecto:

    Haz un Fork del repositorio.

    Crea una rama para tu nueva característica o corrección (git checkout -b feature/NuevaCaracteristica).

    Genera un Issue describiendo el cambio que deseas realizar para discutirlo con la comunidad.

    Haz Commit de tus cambios (git commit -m 'Añade nueva característica').

    Haz Push a la rama (git push origin feature/NuevaCaracteristica).

    Abre una Pull Request.

### 📄 Licencia

Desarrollado para Metalmod.
(Añade aquí el tipo de licencia de código abierto si aplica, por ejemplo: Distribuido bajo la licencia MIT. Ver LICENSE para más información).

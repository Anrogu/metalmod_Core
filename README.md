🔩 Metalmod Core
Metalmod Core is a fullstack open-source application designed to optimize and digitize the logging of maintenance reports for CNC machines, lathes, and industrial equipment within the plant.

🚀 Features
Maintenance Management: Detailed logging of incidents and preventive/corrective maintenance.

Traceability: Complete history of machinery status.

Scalable Architecture: Containerized deployment for easy implementation in any environment.

🛠️ Technologies (Stack)
The project is built using modern technologies to ensure performance and scalability:

Backend: Java ☕ | Spring Boot 🌿

Database: PostgreSQL 🐘

Frontend: React ⚛️ | Node.js 🇳

Deployment: Docker 🐳

⚙️ Prerequisites
Before starting, make sure you have the following installed:

Git

Docker and Docker Compose

📦 Installation and Execution
Thanks to Docker, setting up the project is a quick process. Follow these steps:

Clone the repository:

Bash
git clone https://github.com/tu-usuario/metalmod-core.git
cd metalmod-core
Configure environment variables:
Create a .env file in the project root (you can base it on a .env.example if it exists) and configure your PostgreSQL credentials:

Fragmento de código
POSTGRES_USER=postgres
POSTGRES_PASSWORD='TuPasswordSeguro$'
POSTGRES_DB=metalmod_core
SERVER_PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/metalmod_core
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD='TuPasswordSeguro$'
Start the containers:
Run the following command to build and deploy the database, backend, and frontend:

Bash
docker compose up -d --build
Access the application:

Frontend: http://localhost:8081

Backend API: Not published to the host; consumed via Nginx at http://localhost:8081/api/v1

🤝 Contributing
All Pull Requests are welcome! If you want to contribute to the project:

Fork the repository.

Create a branch for your new feature or fix (git checkout -b feature/NewFeature).

Generate an Issue describing the change you want to make to discuss it with the community.

Commit your changes (git commit -m 'Add new feature').

Push to the branch (git push origin feature/NewFeature).

Open a Pull Request.

📄 License
Developed for Metalmod.

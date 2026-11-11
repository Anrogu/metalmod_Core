# 🔩 Metalmod Core

Metalmod Core is a fullstack open-source application designed to optimize and digitize the logging of maintenance reports for CNC machines, lathes, and industrial equipment within the plant.

## 🚀 Features

*   **Maintenance Management:** Detailed logging of incidents and preventive/corrective maintenance.
*   **Traceability:** Complete history of machinery status.
*   **Scalable Architecture:** Containerized deployment for easy implementation in any environment.

## 🛠️ Technologies (Stack)

The project is built using modern technologies to ensure performance and scalability:

*   **Backend:** Java ☕ | Spring Boot 🌿
*   **Database:** PostgreSQL 🐘
*   **Frontend:** React ⚛️ | Node.js 🇳
*   **Deployment:** Docker 🐳

## ⚙️ Prerequisites

Before starting, make sure you have the following installed:

*   Git
*   Docker and Docker Compose

## 📦 Installation and Execution

Thanks to Docker, setting up the project is a quick process. Follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/tu-usuario/metalmod-core.git](https://github.com/tu-usuario/metalmod-core.git)
    cd metalmod-core
    ```

2.  **Configure environment variables:**
    Create a `.env` file in the project root (you can base it on a `.env.example` if it exists) and configure your PostgreSQL credentials:
    ```env
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD='TuPasswordSeguro$'
    POSTGRES_DB=metalmod_core
    SERVER_PORT=8080
    SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/metalmod_core
    SPRING_DATASOURCE_USERNAME=postgres
    SPRING_DATASOURCE_PASSWORD='TuPasswordSeguro$'
    ```

3.  **Start the containers:**
    Run the following command to build and deploy the database, backend, and frontend:
    ```bash
    docker compose up -d --build
    ```

4.  **Access the application:**
    *   **Frontend:** http://localhost:8081
    *   **Backend API:** Not published to the host; consumed via Nginx at http://localhost:8081/api/v1

### 💾 Automated backups

`scripts/respaldo.sh` creates a compressed PostgreSQL backup and sends it over SSH to another PC. It is scheduled with `cron` to run **every Friday at 15:00 (local time)**:

```bash
0 15 * * 5 /home/angelroberto/Documentos/ideas/core/scripts/respaldo.sh >/dev/null 2>&1
```

The destination is configured in `.env` (not committed to Git):

```env
RESPALDO_SSH_USUARIO=angelroberto
RESPALDO_SSH_HOST=192.168.1.52
RESPALDO_SSH_DIRECTORIO=/home/angelroberto/respaldos
RESPALDO_SSH_PUERTO=22
RESPALDO_SSH_LLAVE=/home/angelroberto/.ssh/id_ed25519_respaldos
RESPALDO_RETENCION_DIAS=30
RESPALDO_REMOTO_DIAS=90
```

For passwordless operation, the public key of `RESPALDO_SSH_LLAVE` must be authorized in the destination PC's `~/.ssh/authorized_keys`, and that server must accept key authentication (`PubkeyAuthentication yes`).

It can also be run manually at any time:

```bash
./scripts/respaldo.sh
```

Local backups are stored in `respaldos/` and each run is logged to `respaldos/respaldo.log`.

### ♻️ Restoring a backup

`scripts/restaurar.sh` restores a `.sql` or `.sql.gz` dump. Before touching anything it saves and verifies a safety backup of the current state in `respaldos/pre-restauracion-*.sql.gz`.

```bash
# Full restore: drops and recreates the database, then loads schema and data.
# Use this for a fresh deployment or to roll back to an old backup.
bash scripts/restaurar.sh metalmod_core-2026-11-11_191930.sql

# Data-only restore: keeps the existing schema and Flyway history and reloads
# only the rows. Use it when the database is already migrated (e.g. V5).
bash scripts/restaurar.sh --solo-datos respaldos/metalmod_core-2026-11-11_191930.sql.gz
```

Options: `--si` skips the confirmation prompt, `--no-arrancar` does not start the backend/frontend at the end.

The script also checks row counts, verifies there are no broken foreign keys, logs every run to `respaldos/restauracion.log`, and waits until the backend is serving again (`http://localhost:8081`).

### 🤝 Contributing

All Pull Requests are welcome! If you want to contribute to the project:

1.  Fork the repository.
2.  Create a branch for your new feature or fix (`git checkout -b feature/NewFeature`).
3.  Generate an Issue describing the change you want to make to discuss it with the community.
4.  Commit your changes (`git commit -m 'Add new feature'`).
5.  Push to the branch (`git push origin feature/NewFeature`).
6.  Open a Pull Request.

### 📄 License

Developed for Metalmod.

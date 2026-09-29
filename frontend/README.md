# Metalmod Core — Panel de métricas

Frontend en React + Vite que consume el `DashboardController` de metalmod-core
para graficar las métricas del Excel (nube o carga manual).

## Requisitos

- Node.js 18+
- El backend de `metalmod-core` corriendo (por defecto en `http://localhost:8080`)

## Instalación

```bash
npm install
cp .env.example .env
# edita .env si tu backend no corre en localhost:8080
npm run dev
```

Abre `http://localhost:5173`.

## Qué hace

- **Sincronizar desde la nube** → llama a `GET /api/v1/dashboard/metricas-cloud`.
- **Subir archivo** (arrastrar o seleccionar `.xlsx`) → llama a
  `POST /api/v1/dashboard/metricas-upload` con `multipart/form-data`.
- Ambos devuelven `List<DataGraficaDto>` (`etiqueta`, `valor`), que se muestran
  en una gráfica de barras (Recharts) y en un panel de lecturas (total,
  promedio, máximo, número de registros).

## CORS

El backend Spring Boot debe permitir el origen del frontend (`http://localhost:5173`
en desarrollo). Por ejemplo, con `@CrossOrigin` en `DashboardController` o una
`WebMvcConfigurer` global:

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:5173")
        .allowedMethods("GET", "POST");
}
```

## Estructura

```
src/
  api/dashboardApi.js       # llamadas axios a los 2 endpoints
  components/
    SourcePanel.jsx          # botón de nube + dropzone de archivo
    Readouts.jsx              # resumen numérico (total, promedio, máximo)
    MetricsChart.jsx          # gráfica de barras + estados vacío/carga/error
  App.jsx                     # estado y orquestación
```

## Build de producción

```bash
npm run build
```

Genera `dist/`, listo para servir como estático (o detrás de Nginx / el
propio Spring Boot como recurso estático).

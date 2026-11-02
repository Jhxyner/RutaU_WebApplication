# RutaU – Web Application

Interfaz web de RutaU (carpooling universitario), hecha con Angular 22 y Angular Material.
Consume los Web Services de https://github.com/AdrianRMH89/RutaU_Api

## Requisitos
- Node.js LTS y Angular CLI (`npm install -g @angular/cli`)
- RutaU_Api corriendo en http://localhost:8081 (con CORS habilitado para http://localhost:4200)

## Cómo ejecutarla
    npm install
    ng serve
Abrir http://localhost:4200

## Estructura
- `src/app/core/`: modelos, servicios, guard e interceptor
- `src/app/pages/auth/`: login, registro y AuthCard
- `src/app/pages/passenger/`: buscar viajes
- `src/app/pages/driver/`: mi vehículo y publicar viaje

## Flujo de trabajo (GitFlow)
- Ramas permanentes: `main` y `develop`.
- Cada User Story va en `feature/USxx-descripcion` creada desde `develop`.
- Todo se integra con Pull Request revisado por otro integrante.
- Commits con Conventional Commits y versionado SemVer.

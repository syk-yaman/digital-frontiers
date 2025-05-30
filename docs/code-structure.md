# Code Structure

This document provides an overview of the codebase structure for the Digital Frontiers platform, covering both backend and frontend.

---

## Backend (`src/backend/`)

The backend is built with [NestJS](https://nestjs.com/) (a progressive Node.js framework) and uses [TypeORM](https://typeorm.io/) for database access.

**Key folders:**

- **modules/**  
  Contains all main business logic, grouped by domain. Each module typically includes:
  - `controller.ts`: Handles HTTP API endpoints.
  - `service.ts`: Contains business logic and data access.
  - `entity.ts`: TypeORM entity definitions for database tables.
  - `dto.ts`: Data Transfer Objects for validation and typing.
  - Example modules:  
    - `users/`: User management (registration, login, admin actions)
    - `datasets/`: Dataset CRUD, approval, and access control
    - `tags/`: Tag management and approval
    - `showcases/`: Showcase CRUD and approval
    - `access-requests/`: Controlled dataset access requests
    - `settings/`: Platform-wide settings
    - `stats/`: Admin dashboard statistics

- **authentication/**  
  JWT authentication, guards, and role-based access control.

- **authorisation/**  
  User context, permissions, and role decorators.

- **utils/**  
  Utility functions and helpers.

- **main.ts**  
  Application entry point.

**Frameworks & Libraries:**
- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [Swagger](https://swagger.io/) (API docs)
- [JWT](https://jwt.io/) (authentication)

---

## Frontend (`src/frontend/`)

The frontend is built with [React](https://react.dev/) and [Vite](https://vitejs.dev/) for fast development. UI is built using [Mantine](https://mantine.dev/) components and [Tabler Icons](https://tabler.io/icons).

**Key folders:**

- **src/pages/**  
  Main route-based pages (e.g. `AdminUsers.page.tsx`, `AdminDatasets.page.tsx`, `Dataset.page.tsx`).

- **src/components/**  
  Reusable UI components (e.g. `DatasetCard`, `NavbarLinksGroup`, custom modals).

- **src/context/**  
  React context providers for authentication, settings, etc.

- **src/utils/**  
  Utility functions (e.g. `axiosInstance` for API calls, validators).

- **src/style.css**  
  Global styles.

- **src/config.ts**  
  Configuration (API base URL, etc).

**Frameworks & Libraries:**
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Mantine](https://mantine.dev/)
- [Tabler Icons](https://tabler.io/icons)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Deck.gl](https://deck.gl/) and [MapLibre](https://maplibre.org/) (for mapping and geospatial visualisation)

---

## Notes

- Both backend and frontend are TypeScript-based.
- The codebase is modular and follows best practices for separation of concerns.
- For more details, see the README files in the respective `src/backend/` and `src/frontend/` folders.

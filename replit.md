# Rutas Seguras

## Overview

Rutas Seguras is a full-stack web application for transportation business management. It provides comprehensive tools for managing routes, vehicle fleets, drivers, and customer interactions. The application features a public landing page with route search and contact forms, plus an authenticated dashboard for administration, fleet management, and route operations based on user roles (admin, conductor/driver, cliente/client).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Routing**: Wouter for client-side navigation (lightweight alternative to React Router)
- **State Management**: React Context for authentication and theme; TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Typography**: Inter for UI text, Poppins for headings (Google Fonts)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Authentication**: JWT-based with bcryptjs for password hashing
- **Build System**: esbuild for server bundling, Vite for client bundling

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # UI components (shadcn/ui in ui/, layout components)
│       ├── pages/        # Route pages (landing, login, register, dashboard/*)
│       ├── lib/          # Utilities, auth context, theme provider, query client
│       └── hooks/        # Custom React hooks
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations (IStorage interface)
│   ├── db.ts         # Database connection
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared code between client and server
│   └── schema.ts     # Drizzle database schema and Zod validators
└── migrations/       # Drizzle migration files
```

### Authentication & Authorization
- JWT tokens stored in localStorage
- Role-based access control: admin, conductor (driver), cliente (client)
- Middleware functions for route protection (`authenticateToken`, `requireAdmin`, `requireAdminOrDriver`)
- Auth context provides `isAuthenticated`, `isAdmin`, `isDriver` helpers

### Key Design Decisions

1. **Shared Schema**: Database schemas defined once in `shared/schema.ts`, used by both server (database operations) and client (type definitions and validation)

2. **Component Architecture**: Uses shadcn/ui pattern - components are copied into the project in `client/src/components/ui/`, allowing full customization

3. **API Communication**: `apiRequest` helper in `queryClient.ts` handles authentication headers automatically; React Query manages caching and refetching

4. **Development Mode**: Vite dev server runs as middleware in Express during development; production serves static built files

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **pg**: Node.js PostgreSQL client
- **connect-pg-simple**: Session storage (available but JWT is primary auth)

### Authentication
- **jsonwebtoken**: JWT token creation and verification
- **bcryptjs**: Password hashing
- **SESSION_SECRET**: Environment variable for JWT signing

### UI Framework
- **Radix UI**: Headless component primitives (dialog, dropdown, tabs, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **date-fns**: Date formatting utilities

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database migration tooling

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development banner
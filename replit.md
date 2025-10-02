# Overview

This is a full-stack web application built with React, TypeScript, Express, and PostgreSQL. The project implements a Tic-Tac-Toe game with an AI opponent using the minimax algorithm. The architecture follows a monorepo structure with separate client and server directories, using Vite for frontend bundling and Express for the backend API.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management
- Tailwind CSS with shadcn/ui component library for styling

**Key Design Decisions:**
- **Component Library:** Uses shadcn/ui (Radix UI primitives) for accessible, customizable UI components with the "new-york" style variant
- **Routing:** Wouter chosen for minimal bundle size over React Router
- **State Management:** React Query handles server state with custom query functions that include authentication handling (401 responses)
- **Styling:** CSS variables system for theming with light/dark mode support
- **Game Logic:** Client-side minimax algorithm implementation for AI opponent with alpha-beta pruning for optimal performance

## Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript with ESM modules
- Drizzle ORM for database interactions
- PostgreSQL (via Neon serverless driver) for persistent storage

**Key Design Decisions:**
- **API Structure:** RESTful API with `/api` prefix for all routes
- **Storage Layer:** Abstracted storage interface (`IStorage`) allowing pluggable implementations (currently using in-memory `MemStorage`, designed to support database persistence)
- **Middleware:** Custom logging middleware for API requests with response capture and 80-character truncation
- **Development Setup:** Vite integration in middleware mode for HMR during development
- **Build Process:** esbuild for production bundling with ESM output

**Database Schema:**
- Users table with UUID primary keys (generated via `gen_random_uuid()`)
- Drizzle-Zod integration for runtime validation of database operations
- Migration management through drizzle-kit

## External Dependencies

**Database:**
- PostgreSQL via `@neondatabase/serverless` driver
- Drizzle ORM (`drizzle-orm`) for type-safe queries
- Connection pooling configured through `DATABASE_URL` environment variable

**UI Components:**
- Radix UI primitives (@radix-ui/*) for accessible component foundations
- shadcn/ui configuration for consistent component styling
- Lucide React for iconography

**Development Tools:**
- Replit-specific plugins for development environment integration (cartographer, dev banner, runtime error overlay)
- TypeScript path aliases for clean imports (`@/`, `@shared/`, `@assets/`)

**Validation & Forms:**
- Zod for schema validation
- React Hook Form with Zod resolvers (@hookform/resolvers)
- Drizzle-Zod for database schema validation

**Session Management:**
- `connect-pg-simple` for PostgreSQL-backed session store (configured but implementation pending)
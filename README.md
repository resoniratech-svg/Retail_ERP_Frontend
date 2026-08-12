# Qatar Retail ERP & POS Frontend Monorepo

Enterprise-grade frontend monorepo architecture for **Qatar Retail ERP** (Web SPA) and **Retail POS** (Electron Touch App).

## Architecture

- **pnpm + Turborepo**: Monorepo workspace orchestration.
- **Web ERP (`apps/web`)**: React 18.3.x + TypeScript + Vite + React Router + Tailwind CSS + Redux Toolkit + TanStack Query.
- **Retail POS (`apps/pos`)**: React 18.3.x + TypeScript + Vite + Electron + Portable SQLite + Touch Keypad.
- **Shared Packages (`packages/`)**:
  - `@qatar-erp/config`: Roles, permissions, currencies (QAR), 36 ERP module definitions.
  - `@qatar-erp/types`: Domain interfaces for ERP and POS.
  - `@qatar-erp/utils`: QAR formatters, dates, line item calculations, permission checks.
  - `@qatar-erp/i18n`: English and Arabic translation dictionaries with full RTL layout support.
  - `@qatar-erp/api`: Axios instance, API endpoints, mock data engine.
  - `@qatar-erp/ui`: Reusable UI component library.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Web ERP (http://localhost:5173) & POS App (http://localhost:5174)
pnpm dev

# Typecheck workspace
pnpm typecheck

# Build production bundles
pnpm build
```

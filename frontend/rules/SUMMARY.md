# [Summary - Frontend Documentation]()

> Complete index with all frontend guides, sections and topics of the project.

## [📚 Stack and Technologies]()

Documentation about technologies, frameworks and libraries used in the frontend.

### [TypeScript Patterns - `./typescript-patterns-standards.md`]()

- **Rule #1: NEVER use `any`** - Total prohibition of any type
- **Rule #2: strict: true** - Strict mode mandatory
- **Rule #3: Explicit typing** - Interfaces and types with clear types
- **Rule #4: use `unknown`** - Safe alternative for unknown types
- **Type Guards** - Runtime type validation
- **Generics** - Reusable code with type safety
- **Readonly** - Immutability and mutation prevention
- **Naming** - PascalCase conventions for types
- **ESLint Rules** - Mandatory typescript-eslint rules
- **Checklist** - TypeScript quality verification

### [Frontend Stack - `./frontend-technology-stack.md`]()

- **Main Stack** - React, TypeScript, Vite, SWC
- **Styling** - Tailwind CSS v4, @tailwindcss/vite
- **Routing** - React Router DOM
- **HTTP Requests** - Axios
- **Data Visualization** - Chart.js, react-chartjs-2, Tippy.js
- **State Management** - Native Context API
- **Development Tools** - ESLint, typescript-eslint
- **Component Structure** - Reusable common components
- **Form Libraries** - Native HTML5 validation

## [🎨 Frontend - Development]()

Complete guides for React development, API consumption and reusable component creation.

### [Initial Setup - `./how-to-setup-frontend.md`]()

- **Overview** - Configure React + TypeScript + Vite + Tailwind from scratch
- **Prerequisites** - Node.js 18+, npm/yarn/pnpm
- **Step 1: Create Project** - Vite with React + TypeScript template
- **Step 2: Install Tailwind** - Tailwind CSS v4 setup with @tailwindcss/vite
- **Step 3: React Router** - Installation
- **Step 4: Axios** - Installation
- **Step 5: TypeScript** - Path aliases @/*
- **Changes v3 → v4** - Migration guide and differences
- **Step 6: Folder Structure** - components, pages, services, config
- **Step 7: Environment Variables** - .env with VITE_API_URL
- **Step 8: Scripts** - dev, build, preview, lint
- **Step 9: Configure Axios** - Instance with interceptors
- **Step 10: Configure Routes** - routes.config.tsx
- **Step 11: Home Page** - HomePage example
- **Step 12: Test Project** - Execution commands
- **Optional Configurations** - ESLint, Prettier, VS Code
- **Setup Checklist** - Complete verification
- **Next Steps** - References to continue
- **Troubleshooting** - Cannot find module, Tailwind not working, PostCSS Tailwind v4 error, CORS

### [Consume API - `./how-to-consume-api-frontend.md`]()

- **Axios Configuration** - Configured instance (401 interceptor without direct redirect)
- **Environment Variable** - VITE_API_URL
- **Create Services** - Service structure (examples without business logic)
- **useState and useEffect** - List data
- **Create Item** - Form submit
- **Update Item** - Edit form
- **Delete Item** - Confirmation
- **Error Handling** - getErrorMessage helper
- **Custom Hook** - useApi hook
- **Pagination** - Query params
- **File Upload** - FormData
- **Query Params** - Filters and search
- **React Suspense** - Data fetching with Suspense and ErrorBoundary
- **Cancel Requests** - CancelToken
- **Checklist** - Complete verification

### [Common Components - `./how-to-create-common-components-frontend.md`]()

- **Principles** - Reusable, configurable, typed
- **Location** - src/components/common
- **1. Button** - Variants and sizes
- **2. Modal** - Overlay and footer
- **3. Card** - Title and footer
- **4. Input** - Label and error
- **5. Select** - Dropdown with options
- **6. Spinner** - Loading indicator
- **7. Alert** - Success, error, warning
- **8. Badge** - Colored tags
- **Compound Components** - Card.Header, Card.Body
- **Best Practices** - Default props, spread, forwardRef, typing
- **Organization** - index.ts for re-export
- **Checklist** - Component verification

### [React Component Naming Pattern - `./react-component-naming-pattern-frontend.md`]()

- **File Naming** - kebab-case + suffix conventions
- **Component Naming** - PascalCase rules
- **Folder Organization** - components/ structure
- **Index Files** - Re-export patterns
- **Page vs Component** - Distinctions and conventions
- **Hooks Naming** - use* prefix patterns

### [Frontend Routing - `./how-routing-works-frontend.md`]()

- **Overview** - React Router DOM
- **File Structure** - App, config, components, pages
- **Centralized Configuration** - routes.config.tsx
- **App.tsx** - Public and private routes
- **PrivateRoute** - Authentication guard
- **Layout** - Structure with Outlet
- **useNavigate** - Programmatic navigation
- **Link Component** - Declarative links
- **NavLink** - Link with active state
- **useParams** - Route parameters
- **useSearchParams** - Query parameters
- **Nested Routes** - Children and Outlet
- **Redirects** - Navigate component
- **useLocation** - Route information
- **Pass State** - navigate with state
- **Dynamic Menu** - Based on config
- **Lazy Loading** - Code splitting
- **404 Page** - Catch-all route
- **Breadcrumbs** - Hierarchical navigation
- **Best Practices** - Checklist

### [Search Debounce - `./how-to-implement-search-debounce-frontend.md`]()

- **Debounce Pattern** - Prevent API request throttling
- **useDebounce Hook** - Custom React hook implementation
- **Search Input Component** - API integration with debounce
- **AbortController** - Request cancellation and race condition prevention
- **Generic Debounce Utility** - Reusable function for non-React contexts
- **Loading States** - User feedback during search
- **Error Handling** - Manage search failures gracefully
- **Best Practices** - Production-ready search implementation
- **Checklist** - Complete verification

### [Date Handling - `./how-to-handle-dates-backend-frontend.md`]()

- **Golden Rule** - Database UTC, Backend UTC, Frontend converts on display
- **Frontend** - dayjs with utc, timezone, relativeTime plugins
- **Frontend Helper** - UTC ↔ Local timezone conversion
- **DateDisplay Component** - Formatted display with timezone
- **Frontend Forms** - datetime-local and conversion to UTC
- **Common Operations** - Practical examples on the frontend
- **Checklist** - Implementation verification
- **Common Errors** - What not to do vs what to do

## [🤖 Agent System and Review Pipeline]()

Specialized agent system and review pipeline to ensure quality and compliance with project technical rules.

### [Review Pipeline - `./agent-review-pipeline.md`]()

- **Overview** - Two-stage review pipeline
- **Complete Flow** - developer → feature-review → code-review
- **Involved Agents** - developer-fullstack, feature-review, code-reviewer
- **developer-fullstack** - Implement following technical rules (`.rules`)
- **feature-review** - Validate completeness vs task requirements
- **code-reviewer** - Validate compliance vs technical rules (`.rules`)
- **Detailed Pipeline** - Stage 1 (Completeness) and Stage 2 (Quality)
- **Correction Loop** - Flow when there are incompatibilities or violations
- **Best Practices** - For Scrum Master, Developers and Reviewers
- **Output Files** - Reports in ./todo/
- **Summary** - Ensure complete code compliant with rules

## [🏗️ Project Structure]()

### [Project Root Structure - `./project-root-structure.md`]()

- **Root Directory Organization** - Standard folder structure for monorepo
- **Allowed Files and Folders** - Complete whitelist/blacklist at root level
- **Frontend Folder Naming** - Official `frontend/` convention
- **Prohibited Items** - package.json, node_modules, configs at root
- **Keeping Root Clean** - Scripts and automation for verification
- **Best Practices** - Root directory management and maintenance

## [📖 Quick Guides]()

Shortcuts for common frontend tasks with direct links to specific guide sections.

### [Initial frontend setup]()

1. [Frontend Setup](./how-to-setup-frontend.md)

### [Create new frontend page]()

1. [Consume API](./how-to-consume-api-frontend.md)
2. [Create components](./how-to-create-common-components-frontend.md)
3. [Configure routes](./how-routing-works-frontend.md)
4. [Component naming](./react-component-naming-pattern-frontend.md)

### [Build a search feature]()

1. [Consume API](./how-to-consume-api-frontend.md)
2. [Search Debounce](./how-to-implement-search-debounce-frontend.md)

## [🔍 Keyword Search]()

Alphabetical index of technical terms with direct links to corresponding guides.

| Keyword | Main Document |
|---------|---------------|
| Project Structure | [Project Root Structure](./project-root-structure.md) |
| Monorepo | [Project Root Structure](./project-root-structure.md) |
| Agents | [Review Pipeline](./agent-review-pipeline.md) |
| Pipeline | [Review Pipeline](./agent-review-pipeline.md) |
| Code Review | [Review Pipeline](./agent-review-pipeline.md) |
| TypeScript | [TypeScript Patterns](./typescript-patterns-standards.md) |
| any | [TypeScript Patterns](./typescript-patterns-standards.md) |
| unknown | [TypeScript Patterns](./typescript-patterns-standards.md) |
| Generics | [TypeScript Patterns](./typescript-patterns-standards.md) |
| Type Guards | [TypeScript Patterns](./typescript-patterns-standards.md) |
| strict mode | [TypeScript Patterns](./typescript-patterns-standards.md) |
| Frontend Setup | [Initial Setup](./how-to-setup-frontend.md) |
| Vite Setup | [Frontend Setup](./how-to-setup-frontend.md) |
| React Router | [Frontend Routes](./how-routing-works-frontend.md) |
| Axios | [Consume API](./how-to-consume-api-frontend.md) |
| Tailwind | [Frontend Setup](./how-to-setup-frontend.md), [Components](./how-to-create-common-components-frontend.md) |
| Hooks | [Consume API](./how-to-consume-api-frontend.md) |
| Debounce | [Search Debounce](./how-to-implement-search-debounce-frontend.md) |
| Search Input | [Search Debounce](./how-to-implement-search-debounce-frontend.md) |
| AbortController | [Search Debounce](./how-to-implement-search-debounce-frontend.md) |
| Performance Optimization | [Search Debounce](./how-to-implement-search-debounce-frontend.md) |
| Dates | [Date Handling](./how-to-handle-dates-backend-frontend.md) |
| dayjs | [Date Handling](./how-to-handle-dates-backend-frontend.md) |
| UTC | [Date Handling](./how-to-handle-dates-backend-frontend.md) |
| Timezone | [Date Handling](./how-to-handle-dates-backend-frontend.md) |
| Component Naming | [React Component Naming](./react-component-naming-pattern-frontend.md) |
| kebab-case | [React Component Naming](./react-component-naming-pattern-frontend.md) |
| PascalCase | [React Component Naming](./react-component-naming-pattern-frontend.md) |

## [🗺️ Navigation by Level]()

Guides organized by complexity level: beginner, intermediate and advanced.

### [🌱 Beginner]()

1. [Project Root Structure](./project-root-structure.md) - **Start here for new projects**
2. [Frontend Stack](./frontend-technology-stack.md)
3. [Frontend Setup](./how-to-setup-frontend.md)
4. [Consume API](./how-to-consume-api-frontend.md)

### [🌿 Intermediate]()

1. [React Component Naming](./react-component-naming-pattern-frontend.md)
2. [Create Components](./how-to-create-common-components-frontend.md)
3. [Frontend Routes](./how-routing-works-frontend.md)
4. [Date Handling](./how-to-handle-dates-backend-frontend.md)
5. [Search Debounce](./how-to-implement-search-debounce-frontend.md)

### [🌳 Advanced]()

1. [TypeScript Patterns](./typescript-patterns-standards.md)
2. [Agent Review Pipeline](./agent-review-pipeline.md)

## [📁 File Structure]()

Complete directory tree showing organization of all frontend documentation files.

```
rules/
├── SUMMARY.md                                              (this file)
│
├── Agent System
│   └── agent-review-pipeline.md
│
├── Stack and Technologies
│   ├── typescript-patterns-standards.md
│   └── frontend-technology-stack.md
│
├── Project Structure
│   └── project-root-structure.md
│
└── Frontend
    ├── how-to-setup-frontend.md
    ├── how-to-consume-api-frontend.md
    ├── how-to-create-common-components-frontend.md
    ├── react-component-naming-pattern-frontend.md
    ├── how-routing-works-frontend.md
    ├── how-to-implement-search-debounce-frontend.md
    └── how-to-handle-dates-backend-frontend.md
```

## [📊 Statistics]()

- **Total documents**: 11
- **Agent System**: 1 document
- **Frontend**: 7 documents
- **Stack**: 2 documents
- **Project Structure**: 1 document

---

**Last update**: 2026-05-07
**Documentation maintained by**: Claude Code
**Version**: 2.0.0 (frontend-only)

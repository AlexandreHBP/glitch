# [How to Setup Frontend]()

Complete guide to configure a React + TypeScript + Vite + Tailwind CSS project from scratch with all dependencies and folder structure.

## [Project Initialization with Vite and React]()

Complete initial setup for creating a modern frontend project using React v19+, TypeScript, Vite as build tool, and the SWC transpiler for maximum performance and fast development builds.

### When to use?

Use this setup when starting a new frontend project from scratch that requires modern React features, type safety with TypeScript, fast development builds with Vite, and component-based architecture.

### When NOT to use?

Do not use this setup when working with an existing project, when the project requires Next.js for SSR/SSG, or when the team has strict requirements for alternative frameworks like Vue or Angular.

### Example

Create a new React project with Vite and TypeScript template.

```bash
# Create project with React + TypeScript template
npm create vite@latest frontend -- --template react-swc-ts

# Access folder
cd frontend

# Install dependencies
npm install
```

### Checklist

- [ ] Node.js version 18 or higher installed
- [ ] Package manager available (npm, yarn, or pnpm)
- [ ] Code editor ready (VS Code recommended)
- [ ] Project created with Vite using react-swc-ts template
- [ ] Dependencies installed successfully

### Troubleshooting

**Error: Node version too old**
- Solution: Install Node.js 18 or higher from nodejs.org

**Error: npm command not found**
- Solution: Install Node.js which includes npm automatically

### Best Practices

- Always use the SWC template for better build performance
- Keep Node.js and npm updated to latest stable versions
- Use a code editor with TypeScript support for better development experience

## [Tailwind CSS v4 Installation and Configuration]()

Comprehensive instructions for installing and configuring Tailwind CSS v4 using the native Vite plugin, which replaces the traditional PostCSS approach for maximum performance and zero configuration.

### When to use?

Use Tailwind CSS v4 when you need a utility-first CSS framework with Vite integration, want to leverage the latest Tailwind features, or need fast rebuilds during development with native Vite plugin support.

### When NOT to use?

Do not use Tailwind v4 if your project requires compatibility with older build tools without Vite, if the team prefers traditional CSS-in-JS solutions like styled-components, or if Tailwind v3 is mandated by existing project constraints.

### Example

Install Tailwind CSS v4 and configure Vite plugin.

```bash
# Install dependencies
npm install -D tailwindcss @tailwindcss/vite
```

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),  // Must come BEFORE react()
    react(),
  ],
})
```

**File**: `src/index.css`

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-display: "Inter", sans-serif;
}
```

### Checklist

- [ ] `tailwindcss` and `@tailwindcss/vite` packages installed
- [ ] `@tailwindcss/vite` plugin added to `vite.config.ts`
- [ ] Tailwind plugin appears BEFORE React plugin
- [ ] `@import "tailwindcss";` added to `src/index.css`
- [ ] CSS file imported in `src/main.tsx`
- [ ] Dev server restarted after configuration

### Troubleshooting

**Error: Cannot find module '@tailwindcss/vite'**
- Solution: Run `npm install -D tailwindcss @tailwindcss/vite`

**Error: @tailwind directives are deprecated**
- Solution: Replace `@tailwind base/components/utilities` with `@import "tailwindcss";` in index.css

**Tailwind classes not working**
- Solution: Verify plugin order (tailwindcss before react), restart dev server, check CSS import in main.tsx

### Best Practices

- Use the native Vite plugin instead of PostCSS for better performance
- Customize theme using `@theme` directive in CSS instead of config files
- Keep Tailwind plugin before React plugin in vite.config.ts
- Use v4 syntax (`@import "tailwindcss"`) instead of v3 directives

## [React Router and Axios Installation]()

How to install React Router DOM for client-side routing and Axios for HTTP requests, providing the foundation for navigation and backend communication in your application.

### When to use?

Install React Router when you need multiple pages with client-side navigation, protected routes, or URL-based state management. Install Axios when you need to make HTTP requests to backend APIs with interceptors and automatic JSON transformation.

### When NOT to use?

Skip React Router if building a single-page application without multiple routes. Skip Axios if using alternative HTTP clients like fetch API directly, react-query with built-in fetching, or GraphQL clients like Apollo.

### Example

Install routing and HTTP client libraries.

```bash
# Install React Router
npm install react-router-dom

# Install Axios
npm install axios
```

**File**: `src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
```

> **🚨 CRITICAL - API VERSIONING**: The `baseURL` should NOT include the API version. The version (`v1`, `v2`, etc.) must be specified in each service method individually, allowing gradual migration of endpoints. Example: `api.get('/v1/products')` in ProductService. See [how-to-consume-api-frontend.md](./how-to-consume-api-frontend.md) for details.

### Checklist

- [ ] `react-router-dom` installed
- [ ] `axios` installed
- [ ] Axios instance configured with base URL (WITHOUT version)
- [ ] Request interceptor added for authentication
- [ ] Response interceptor added for error handling
- [ ] Environment variable for API URL defined
- [ ] Services will include version in each endpoint path (`/v1/products`, etc.)

### Troubleshooting

**Error: Module not found: Can't resolve 'react-router-dom'**
- Solution: Run `npm install react-router-dom`

**CORS errors when making requests**
- Solution: Configure CORS in backend or use Vite proxy in vite.config.ts

**401 errors not handled**
- Solution: Verify response interceptor is configured correctly in api.ts

### Best Practices

- Create centralized Axios instance for consistent configuration
- Use environment variables for API URLs
- Implement request interceptors for authentication tokens
- Implement response interceptors for global error handling
- Store tokens in localStorage or secure storage

## [TypeScript Configuration with Path Aliases]()

TypeScript compiler configuration including path aliases to improve import statements, development experience, and code organization with cleaner import paths throughout the application.

### When to use?

Configure path aliases when you want cleaner imports (using `@/` instead of `../../`), need consistent import patterns across the project, or want to improve refactoring capabilities with absolute paths.

### When NOT to use?

Skip path aliases if working on a very small project with shallow folder structure, when team members are unfamiliar with TypeScript configurations, or if existing conventions prohibit custom paths.

### Example

Configure TypeScript and Vite for path aliases.

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Checklist

- [ ] `baseUrl` set to "." in tsconfig.json
- [ ] `paths` configured with "@/*" mapping
- [ ] Alias configured in vite.config.ts
- [ ] Path module imported in vite.config.ts
- [ ] Imports tested with @/ syntax

### Troubleshooting

**Error: Cannot find module '@/...'**
- Solution: Verify both tsconfig.json paths and vite.config.ts alias are configured correctly

**Error: Module not found after adding alias**
- Solution: Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P > "Restart TS Server")

### Best Practices

- Use `@/` as the standard prefix for src imports
- Configure aliases in both tsconfig.json and vite.config.ts
- Restart TypeScript server after changing path configurations
- Use absolute imports consistently across the project

## [Project Folder Structure Organization]()

Recommended project folder structure for organizing components, pages, services, utilities, and configuration files to maintain a scalable and maintainable codebase as the application grows.

### When to use?

Implement this folder structure when starting a new project, when organizing an existing codebase for better maintainability, or when establishing conventions for a team working on a React application.

### When NOT to use?

Do not use this exact structure if your project already has an established folder convention that works well, or if specific framework requirements (like Next.js app directory) dictate a different organization.

### Example

Create organized folder structure for scalable React applications.

```
frontend/
  src/
    components/        # Reusable components
      common/          # Common components (Button, Input, etc)
    pages/             # Application pages
    services/          # API services
    config/            # Configurations (routes, api)
    contexts/          # React Contexts
    hooks/             # Custom hooks
    types/             # TypeScript types/interfaces
    utils/             # Utility functions
    App.tsx            # Main component
    main.tsx           # Entry point
    index.css          # Global styles
  public/              # Static files
  index.html           # Base HTML
  package.json
  tsconfig.json
  vite.config.ts
```

Create folders:

```bash
mkdir -p src/components/common
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/config
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/utils
```

**Note**: This structure shows the frontend folder organization. For complete project root structure including where frontend/, backend/, and build/ folders should be located, see [Project Root Structure](./project-root-structure.md).

### Checklist

- [ ] `components/common` folder created
- [ ] `pages` folder created
- [ ] `services` folder created
- [ ] `config` folder created
- [ ] `contexts` folder created
- [ ] `hooks` folder created
- [ ] `types` folder created
- [ ] `utils` folder created

### Troubleshooting

**Folder creation fails**
- Solution: Ensure you are in the project root and use correct path separators for your OS

**Cannot find modules after creating structure**
- Solution: Verify path aliases are configured correctly in tsconfig.json and vite.config.ts

### Best Practices

- Start with minimal structure and expand as project grows (see `.rules/react-component-naming-pattern-frontend.md`)
- Keep related files together (component + styles + tests)
- Use specialized subfolders (forms/, layouts/, guards/) when you have more than 20 components
- Maintain consistent naming conventions across all folders

## [Environment Variables Configuration]()

How to configure environment variables using .env files to store API URLs, feature flags, and environment-specific settings securely without committing sensitive data to version control.

### When to use?

Use environment variables for API URLs, feature flags, third-party API keys, or any configuration that changes between development, staging, and production environments.

### When NOT to use?

Do not use .env files for truly secret values in frontend code (they are exposed to browsers). Do not commit .env files to version control. Do not use for runtime configuration that needs to change without rebuilding.

### Example

Configure environment variables for different environments.

**File**: `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

**File**: `.env.example`

```env
VITE_API_URL=http://localhost:3000/api
```

**File**: `.gitignore`

```
# Environment
.env
.env.local
.env.*.local
```

**Usage in code:**

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Checklist

- [ ] `.env` file created with necessary variables
- [ ] `.env.example` file created as template
- [ ] All environment variables prefixed with `VITE_`
- [ ] `.env` added to `.gitignore`
- [ ] `.env.example` documented with descriptions
- [ ] Team members know to copy `.env.example` to `.env`

### Troubleshooting

**Environment variables are undefined**
- Solution: Ensure variables are prefixed with `VITE_`, restart dev server after adding new variables

**Changes to .env not reflecting**
- Solution: Restart the Vite dev server (`npm run dev`)

### Best Practices

- Always prefix environment variables with `VITE_` for Vite to expose them
- Never commit `.env` files to version control
- Maintain `.env.example` with all required variables documented
- Restart dev server after adding new environment variables
- Use different .env files for different environments (.env.development, .env.production)

## [Route Configuration with React Router]()

How to set up centralized route configuration, implement React Router in the main App component, and organize navigation for clean and maintainable routing management throughout the application.

### When to use?

Use centralized route configuration when you need multiple pages, want to keep routes organized in one place, need to implement protected routes or role-based access, or want easier route management as the application scales.

### When NOT to use?

Skip route configuration for true single-page applications without navigation, when using alternative routing solutions, or when framework conventions (like Next.js file-based routing) dictate different routing approaches.

### Example

Configure centralized routing with React Router.

**File**: `src/config/routes.config.tsx`

```typescript
import { RouteObject } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
];
```

**File**: `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from '@/config/routes.config';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Checklist

- [ ] `routes.config.tsx` created in config folder
- [ ] Routes array exported from config
- [ ] BrowserRouter configured in App.tsx
- [ ] Routes mapped from configuration
- [ ] Test page components created
- [ ] Navigation working between routes

### Troubleshooting

**Blank page when accessing routes**
- Solution: Verify BrowserRouter wraps Routes, check component imports are correct

**Routes not updating**
- Solution: Ensure you are using Link components from react-router-dom for navigation, not anchor tags

### Best Practices

- Centralize all routes in routes.config.tsx
- Use RouteObject type for type safety
- Implement protected routes using guards/wrappers
- Use lazy loading for route components in large applications
- See `.rules/how-routing-works-frontend.md` for advanced patterns

## [Development Scripts and Dependencies]()

All available npm scripts for development server, production builds, preview, linting, type checking, and the complete package.json with all required dependencies and devDependencies.

### When to use?

Reference this section when setting up npm scripts for the first time, updating dependencies to latest versions, troubleshooting build issues, or onboarding new team members to available development commands.

### When NOT to use?

Do not modify these scripts without understanding their purpose. Do not remove dependencies without verifying they are unused. Do not update all dependencies at once without testing thoroughly.

### Example

Complete package.json with all scripts and dependencies.

**File**: `package.json`

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.20.2",
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react-swc": "^4.1.4",
    "eslint": "^9.20.2",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.18",
    "globals": "^15.14.0",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.20.0",
    "vite": "^7.1.7"
  }
}
```

**Commands:**

```bash
# Run in development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Check TypeScript types
npm run type-check

# Run linter
npm run lint
```

### Checklist

- [ ] All dependencies installed
- [ ] Dev script runs development server
- [ ] Build script compiles TypeScript and builds for production
- [ ] Type-check script validates TypeScript without emitting
- [ ] Lint script checks code quality
- [ ] Preview script serves production build locally

### Troubleshooting

**npm run dev fails**
- Solution: Delete node_modules and package-lock.json, run `npm install` again

**Build fails with TypeScript errors**
- Solution: Run `npm run type-check` to see all errors, fix them before building

**Dependencies version conflicts**
- Solution: Use exact versions from package.json example, run `npm install`

### Best Practices

- Run `npm run type-check` before committing code
- Use `npm run build` to verify production build works
- Keep dependencies updated regularly but test thoroughly
- Use `npm ci` in CI/CD pipelines for reproducible builds

## [Testing the Setup]()

Sample HomePage component and testing procedures to verify that the entire frontend setup is working correctly, including React rendering, TypeScript compilation, Tailwind CSS styling, and Vite build process.

### When to use?

Use this test after completing initial setup to verify everything works correctly, when troubleshooting setup issues, or when onboarding new developers to confirm their local environment is configured properly.

### When NOT to use?

Skip this test if you have already created production pages and components. Do not use this minimal HomePage in production applications. Do not rely solely on this test for comprehensive application testing.

### Example

Create test page and verify all setup components work.

**File**: `src/pages/HomePage.tsx`

```typescript
function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Frontend Setup Complete!
        </h1>
        <p className="text-gray-600">
          React + TypeScript + Vite + Tailwind CSS
        </p>
      </div>
    </div>
  );
}

export default HomePage;
```

**Test commands:**

```bash
# Run development server
npm run dev

# Access in browser
http://localhost:5173

# Test production build
npm run build
npm run preview

# Verify TypeScript
npm run type-check
```

### Checklist

- [ ] HomePage component created
- [ ] Development server starts without errors
- [ ] Page displays correctly at localhost:5173
- [ ] Tailwind CSS classes are applied
- [ ] Production build completes successfully
- [ ] Type checking passes without errors
- [ ] Hot module replacement works when editing files

### Troubleshooting

**Page shows but no styles**
- Solution: Verify Tailwind is configured correctly, check CSS import in main.tsx

**Cannot access localhost:5173**
- Solution: Check if port is already in use, verify dev server started without errors

**Build fails**
- Solution: Run `npm run type-check` to identify TypeScript errors, fix them first

### Best Practices

- Always test development and production builds
- Verify hot module replacement works during development
- Check browser console for errors
- Test in multiple browsers if cross-browser compatibility is required

## [Optional Code Quality Tools]()

Optional but recommended configurations for Prettier code formatting, ESLint with Prettier integration, and useful VS Code extensions to enhance development workflow and maintain consistent code style.

### When to use?

Use these tools when working in teams to ensure consistent code formatting, when you want automated code quality checks, or when setting up professional development environments with linting and formatting automation.

### When NOT to use?

Skip these tools for quick prototypes or personal projects where code consistency is not critical. Do not use if your team already has different established tooling or if company policies mandate alternative solutions.

### Example

Configure Prettier and ESLint for code quality.

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

**File**: `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**File**: `.vscode/extensions.json`

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

**File**: `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### Checklist

- [ ] Prettier installed and configured
- [ ] ESLint + Prettier integration working
- [ ] VS Code extensions recommended
- [ ] Format on save enabled
- [ ] Code formatting consistent across team

### Troubleshooting

**Prettier not formatting on save**
- Solution: Install Prettier VS Code extension, verify settings.json configuration

**ESLint and Prettier conflicts**
- Solution: Install eslint-config-prettier to disable conflicting ESLint rules

### Best Practices

- Configure Prettier at project level for team consistency
- Use format on save to maintain consistent formatting
- Share VS Code workspace settings with the team
- Commit .prettierrc and .vscode/settings.json to version control

## [Next Steps After Setup]()

Recommended next steps after completing the basic frontend setup, including implementing authentication, creating component library, setting up protected routes, and integrating with backend APIs.

### When to use?

Follow these next steps after successfully completing the initial setup, when planning feature implementation order, or when establishing development roadmap for a new frontend application.

### When NOT to use?

Do not follow these steps if your project has different priorities or requirements. Do not implement all steps simultaneously. Do not skip planning and architecture discussions before implementation.

### Example

Recommended implementation order for next features.

1. **Authentication System**
   - Implement login/logout functionality
   - Token management and storage
   - See: `./how-to-consume-api-frontend.md`

2. **Common Component Library**
   - Create reusable Button, Input, Modal components
   - Establish component patterns
   - See: `./how-to-create-common-components-frontend.md`

3. **Protected Routes**
   - Implement authentication guards
   - Role-based access control
   - See: `./how-routing-works-frontend.md`

4. **API Integration**
   - Create service layer for backend communication
   - Error handling and loading states
   - See: `./how-to-consume-api-frontend.md`

### Checklist

- [ ] Authentication implementation planned
- [ ] Common components identified
- [ ] Protected routes strategy defined
- [ ] API integration approach documented
- [ ] Team aligned on next steps

### Troubleshooting

**Unclear which step to start**
- Solution: Start with authentication if user management is required, otherwise start with component library

**Multiple developers working simultaneously**
- Solution: Assign different next steps to different developers to avoid conflicts

### Best Practices

- Implement authentication early if the application requires it
- Build component library incrementally as needed
- Test each integration step thoroughly before moving to next
- Refer to specific .rules documentation for detailed implementation guides

## [Migration from Tailwind v3 to v4]()

Key differences between Tailwind CSS v3 and v4 for developers migrating from the previous version, focusing on installation changes, configuration syntax, and performance improvements with the native Vite plugin.

### When to use?

Reference this section when migrating an existing Tailwind v3 project to v4, understanding what changed between versions, troubleshooting v4 migration issues, or explaining differences to team members familiar with v3.

### When NOT to use?

Do not use this section if you are starting fresh with v4 (refer to main setup instead). Do not migrate to v4 if your project has dependencies incompatible with the new version or if using build tools other than Vite.

### Example

Compare v3 and v4 approaches for migration.

**v3 Approach:**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { primary: '#3b82f6' } } },
}
```

**v4 Approach:**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
}
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```

### Checklist

- [ ] Removed PostCSS and autoprefixer dependencies
- [ ] Installed @tailwindcss/vite plugin
- [ ] Updated vite.config.ts with Tailwind plugin
- [ ] Replaced @tailwind directives with @import
- [ ] Migrated theme config to @theme in CSS
- [ ] Verified all styles still work

### Troubleshooting

**Styles stopped working after migration**
- Solution: Ensure @tailwindcss/vite plugin is before react() plugin, use @import syntax, restart dev server

**Cannot find tailwind.config.js**
- Solution: Configuration is now optional in v4, use @theme in CSS instead

### Best Practices

- Migrate during a dedicated sprint to avoid conflicts
- Test thoroughly after migration
- Update documentation and team knowledge
- Use native Vite plugin for better performance
- Leverage @theme for customization instead of config files

# [Frontend Technology Stack]()

Complete documentation of technologies, frameworks, and libraries used in the frontend application including React, TypeScript, Vite, styling, routing, HTTP client, and development tools.

## [Main Stack - React TypeScript Vite SWC]()

Core technologies used in the frontend including React framework, Vite build tool and TypeScript language. React provides component-based UI architecture, TypeScript ensures type safety, Vite delivers ultra-fast development experience with HMR, and SWC handles lightning-fast JavaScript/TypeScript compilation written in Rust.

### When to use?

Use this stack for building modern single-page applications (SPAs), interactive user interfaces with complex state management, projects requiring type safety and maintainability, development workflows demanding fast Hot Module Replacement, and applications needing component reusability and excellent developer experience. Ideal for dashboards, admin panels, and data-rich web applications.

### When NOT to use?

Avoid this stack for simple static websites better served by static site generators, SEO-critical content sites requiring server-side rendering (use Next.js instead), applications with no interactivity, or when team lacks JavaScript/TypeScript expertise. Not suitable for native mobile apps (use React Native) or when bundle size is extremely critical.

### Example

React component with TypeScript and hooks demonstrating state management, API calls, and conditional rendering

```typescript
// React component with TypeScript and hooks
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl">{user.name}</h1>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}
```

### Checklist

- [ ] Node.js >= 18.x and npm/pnpm installed
- [ ] Vite project initialized with React and TypeScript template
- [ ] TypeScript strict mode enabled in tsconfig.json
- [ ] Vite config includes React plugin with SWC
- [ ] ESLint configured for React and TypeScript
- [ ] Development server running with HMR working
- [ ] Environment variables prefixed with VITE_

### Troubleshooting

**Problem**: Vite dev server not starting or showing errors
**Solution**: Check Node version is >= 18.x, delete node_modules and package-lock.json then reinstall, verify no port conflicts on default port 5173, check vite.config.ts syntax

**Problem**: Hot Module Replacement not working
**Solution**: Ensure components are exported as named exports or default exports consistently, check Fast Refresh is enabled in Vite config, avoid anonymous components, restart dev server

**Problem**: TypeScript errors in IDE but builds successfully
**Solution**: Restart TypeScript server in IDE, check tsconfig.json paths match project structure, ensure IDE is using workspace TypeScript version, run `tsc --noEmit` to verify

### Best Practices

- Enable TypeScript strict mode for maximum type safety
- Use functional components with hooks instead of class components
- Leverage Vite's fast HMR for rapid development iteration
- Configure path aliases in vite.config.ts and tsconfig.json
- Split code with React.lazy() and Suspense for better performance
- Use environment variables with VITE_ prefix for configuration
- Keep components small and focused on single responsibility

## [Styling - Tailwind CSS v4 Utility-First Framework]()

Utility-first CSS framework providing pre-defined classes for rapid UI development. Tailwind CSS v4 integrates natively with Vite, supports dark mode by default, uses modern CSS syntax, and eliminates configuration files for zero-setup styling with maximum performance and developer productivity.

### When to use?

Use Tailwind CSS for rapid prototyping and development, consistent design systems with utility classes, responsive layouts with mobile-first approach, dark mode support without custom CSS, projects requiring minimal CSS bundle size, and teams preferring utility-first over component-based CSS. Perfect for dashboards, admin panels, and modern web applications.

### When NOT to use?

Avoid Tailwind for highly customized designs requiring extensive custom CSS, teams unfamiliar with utility-first methodology, projects with strict CSS naming conventions like BEM, legacy codebases with existing CSS frameworks, or when design requires complex animations better handled by CSS-in-JS libraries like styled-components.

### Example

Tailwind utility classes in React components demonstrating variants, responsive design and dark mode

```tsx
// Tailwind utility classes in React components
export function Button({ variant = 'primary', children }) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}

// Responsive design with breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  <Card />
  <Card />
  <Card />
</div>

// Dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content adapts to dark mode
</div>
```

### Checklist

- [ ] Tailwind CSS v4 and @tailwindcss/vite plugin installed
- [ ] Vite plugin configured in vite.config.ts
- [ ] Base styles imported in main CSS file
- [ ] Dark mode configured (class or media strategy)
- [ ] Custom theme colors defined if needed
- [ ] Mobile-first breakpoints understood (sm, md, lg, xl, 2xl)
- [ ] Tailwind IntelliSense extension installed in IDE

### Troubleshooting

**Problem**: Tailwind classes not applying styles
**Solution**: Verify @tailwindcss/vite plugin is added to vite.config.ts, ensure CSS file with Tailwind directives is imported in main.tsx, restart Vite dev server, check browser console for CSS errors

**Problem**: Dark mode not working
**Solution**: Verify dark mode strategy in Tailwind config (class or media), ensure 'dark' class is toggled on root element for class strategy, check system preferences for media strategy

**Problem**: Custom colors not appearing
**Solution**: Define custom colors in CSS using @theme directive, ensure proper CSS variable syntax, check color names match usage in className, restart dev server after theme changes

### Best Practices

- Use mobile-first approach with responsive breakpoints
- Combine utility classes for component variants
- Extract repeated patterns into reusable components
- Use arbitrary values sparingly (e.g., w-[37px])
- Leverage Tailwind IntelliSense for autocomplete and linting
- Keep className strings readable with proper formatting
- Use @apply in CSS files only for complex repeated patterns
- Configure purge properly to remove unused styles in production

## [Routing - React Router DOM Client-Side Navigation]()

Client-side routing system enabling navigation without page reloads, supporting dynamic and nested routes, authentication guards, and centralized route configuration. React Router DOM provides declarative routing for single-page applications with URL synchronization, browser history management, and component-based route definitions.

### When to use?

Use React Router for single-page applications requiring multiple views, client-side navigation without full page reloads, dynamic routing with URL parameters, nested route hierarchies, authentication-protected routes, and programmatic navigation. Essential for applications with complex navigation structures, user dashboards, and multi-step workflows.

### When NOT to use?

Avoid React Router for simple single-page sites without navigation, static websites where anchor tags suffice, server-side rendered applications using Next.js routing, or when all content fits in one view. Not needed for embedded widgets or components that don't control browser URL.

### Example

Router configuration with protected routes, authentication guards and programmatic navigation

```typescript
// Router configuration with protected routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

// PrivateRoute component with authentication guard
function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

// Programmatic navigation
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await authService.login();
    navigate('/dashboard');
  };
}
```

### Checklist

- [ ] react-router-dom package installed
- [ ] BrowserRouter wraps application in main.tsx or App.tsx
- [ ] Routes defined with path and element props
- [ ] Private routes protected with authentication guards
- [ ] 404 catch-all route configured
- [ ] Dynamic routes use URL parameters (:id)
- [ ] Navigation uses Link or useNavigate, not anchor tags

### Troubleshooting

**Problem**: Routes not rendering or showing blank page
**Solution**: Verify BrowserRouter wraps all Routes, check path syntax matches exactly, ensure element prop receives valid React component, check for typos in route paths

**Problem**: Protected routes not redirecting to login
**Solution**: Verify authentication state is correctly checked in PrivateRoute, ensure Outlet is rendered for nested routes, check Navigate component points to correct login path

**Problem**: URL changes but component not updating
**Solution**: Ensure route paths are unique and specific, check for conflicting routes with similar patterns, verify components use useParams or useLocation to detect URL changes

### Best Practices

- Use BrowserRouter for web apps, HashRouter only for static hosting
- Define routes in centralized configuration file for maintainability
- Implement authentication guards with Outlet for nested protected routes
- Use Link component for navigation, not anchor tags
- Leverage useParams for dynamic route parameters
- Use useNavigate for programmatic navigation after actions
- Implement loading states during route transitions
- Add 404 catch-all route at the end of route definitions

## [HTTP Client - Axios Promise-Based API]()

HTTP client for making REST API requests with interceptors for authentication, centralized error handling, and request cancellation support. Axios provides a promise-based API for HTTP operations with automatic JSON transformation, request/response interceptors, and better error handling compared to native fetch.

### When to use?

Use Axios for all API communication in React applications requiring automatic JSON parsing, request/response interceptors for authentication tokens, centralized error handling, request cancellation for cleanup, file uploads with progress tracking, and consistent API across browsers. Essential for SPA applications consuming REST APIs with authentication.

### When NOT to use?

Avoid Axios for simple GET requests where native fetch suffices, applications targeting extremely small bundle sizes (fetch is native), GraphQL clients better served by Apollo Client, or when streaming responses require fetch API. Not needed for server-side rendering where native fetch is preferred.

### Example

Configured Axios instance with interceptors for authentication and error handling

```typescript
// Configured Axios instance
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Usage in service - NOTE: Version included in each endpoint path
export const userService = {
  getAll: () => api.get<User[]>('/v1/users'),
  getById: (id: number) => api.get<User>(`/v1/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/v1/users', data),
  update: (id: number, data: UpdateUserDto) => api.put<User>(`/v1/users/${id}`, data),
  delete: (id: number) => api.delete(`/v1/users/${id}`),
};
```

> **🚨 CRITICAL**: API version must be specified in each service method path, NOT in `baseURL`. This allows gradual migration where different services use different versions. See [how-to-consume-api-frontend.md](./how-to-consume-api-frontend.md) for details.

### Checklist

- [ ] Axios installed and imported
- [ ] Axios instance configured with baseURL (WITHOUT version)
- [ ] Request interceptor adds authentication token
- [ ] Response interceptor handles common errors (401, 403, 500)
- [ ] TypeScript interfaces defined for API responses
- [ ] Timeout configured to prevent hanging requests
- [ ] Error handling implemented in components
- [ ] Services include version in each endpoint path (`/v1/users`, etc.)

### Troubleshooting

**Problem**: Axios requests returning CORS errors
**Solution**: Verify backend CORS configuration allows frontend origin, check request headers are allowed, ensure credentials: true if sending cookies, verify preflight OPTIONS requests succeed

**Problem**: Authentication token not being sent
**Solution**: Check token exists in storage before adding to headers, verify interceptor is configured before any requests, ensure Authorization header format is correct (Bearer <token>)

**Problem**: Requests timing out frequently
**Solution**: Increase timeout value in axios config, check network connectivity, verify backend is responding, implement retry logic for transient failures

### Best Practices

- Create centralized Axios instance with base configuration (WITHOUT version in baseURL)
- Use interceptors for authentication token injection
- Handle authentication errors globally in response interceptor
- Define TypeScript interfaces for all API responses
- Implement request cancellation with AbortController for cleanup
- Use separate service files for different API resources
- Include API version in each service method path for granular control
- Configure appropriate timeout values (5-10 seconds typical)
- Log errors in interceptors for debugging in development

## [Data Visualization - Charts Tooltips Date Formatting]()

Libraries for rendering charts, tooltips and visual date formatting including Chart.js for canvas-based charting, Tippy.js for tooltips and popovers, and timeago.js for relative date formatting. These tools provide performant, customizable data visualization components integrated with React.

### When to use?

Use Chart.js for data-heavy dashboards requiring line, bar, doughnut charts with responsive design, Tippy.js for contextual tooltips and popovers with smart positioning, and timeago.js for displaying relative dates like "5 minutes ago" in feeds and timelines. Essential for financial dashboards, analytics platforms, and data-rich applications.

### When NOT to use?

Avoid Chart.js for extremely complex custom visualizations better served by D3.js, interactive network graphs requiring force-directed layouts, or 3D visualizations. Skip Tippy.js if simple title attributes suffice. Avoid timeago.js when precise timestamps are required instead of relative times.

### Example

Chart.js configuration with React integration and Tippy.js tooltip implementation

```tsx
// Chart.js with react-chartjs-2
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale);

export function LineChart({ data }) {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Revenue',
      data: [12, 19, 3, 5, 2],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }],
  };

  return <Line data={chartData} options={{ responsive: true }} />;
}

// Tippy.js tooltip
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export function InfoButton() {
  return (
    <Tippy content="This is helpful information" placement="top">
      <button className="text-blue-600">ℹ️</button>
    </Tippy>
  );
}

// timeago.js relative dates
import { format } from 'timeago.js';

export function CommentTimestamp({ createdAt }) {
  return <span className="text-gray-500">{format(createdAt)}</span>;
}
```

### Checklist

- [ ] Chart.js and react-chartjs-2 installed for charts
- [ ] Required Chart.js components registered (scales, elements)
- [ ] Tippy.js and @tippyjs/react installed for tooltips
- [ ] Tippy CSS imported in application
- [ ] timeago.js installed for relative dates
- [ ] Chart responsiveness configured
- [ ] Tooltip positioning tested on mobile and desktop

### Troubleshooting

**Problem**: Charts not rendering or showing blank canvas
**Solution**: Verify Chart.js components are registered (CategoryScale, LinearScale, etc.), check data format matches chart type requirements, ensure canvas has proper width/height, inspect console for Chart.js errors

**Problem**: Tooltips not appearing or positioning incorrectly
**Solution**: Verify Tippy CSS is imported, check z-index conflicts with other elements, ensure trigger element is interactive, test different placement options (top, bottom, left, right)

**Problem**: Relative dates showing incorrect times
**Solution**: Check date format passed to timeago.js is valid ISO string or Date object, verify timezone handling, ensure dates are in consistent format

### Best Practices

- Register only required Chart.js components to reduce bundle size
- Use canvas-based Chart.js for performance over SVG libraries
- Implement chart memoization to prevent unnecessary re-renders
- Configure responsive options for charts on mobile devices
- Use Tippy.js interactive mode for tooltips with clickable content
- Implement custom Tippy themes for consistent design
- Use timeago.js with internationalization for multi-language support
- Update relative dates periodically with intervals for accuracy

## [State Management - React Context API]()

Global state management solution using React's native Context API without external libraries. Provides centralized state for authentication, notifications, and page metadata with custom hooks for easy consumption across components.

### When to use?

Use React Context API for global state shared across multiple components, authentication state management, theme preferences, notification systems, and user preferences. Ideal for small to medium applications without complex state synchronization needs. Perfect when avoiding external dependencies like Redux or Zustand.

### When NOT to use?

Avoid Context API for highly complex state with frequent updates causing performance issues, applications requiring time-travel debugging and devtools, state requiring middleware like sagas or thunks, or when server state synchronization needs specialized libraries like React Query or SWR.

### Example

Authentication context implementation with custom hook and localStorage persistence

```tsx
// AuthContext implementation
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
      // Fetch user data
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('access_token', response.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Checklist

- [ ] Context created with createContext and proper TypeScript types
- [ ] Provider component wraps application at appropriate level
- [ ] Custom hook created for context consumption (useAuth, useToast, etc.)
- [ ] Error handling in custom hook for missing provider
- [ ] State persistence with localStorage where appropriate
- [ ] Loading states managed for async operations
- [ ] Context value memoized to prevent unnecessary re-renders

### Troubleshooting

**Problem**: Components not receiving context updates
**Solution**: Verify Provider wraps all consuming components, check context value is not memoized incorrectly, ensure useState is triggering re-renders, inspect React DevTools for provider hierarchy

**Problem**: "useContext must be used within Provider" error
**Solution**: Ensure Provider wraps the component tree, check custom hook is called inside functional component, verify Provider is not conditionally rendered

**Problem**: Performance issues with Context causing too many re-renders
**Solution**: Split contexts by concern (auth, theme, notifications separately), memoize context value with useMemo, implement code splitting to reduce component tree size

### Best Practices

- Create separate contexts for different concerns (auth, theme, notifications)
- Always provide custom hooks for context consumption
- Memoize context values with useMemo when containing objects or functions
- Implement error boundaries around context providers
- Use TypeScript for type-safe context values
- Persist authentication state in localStorage or sessionStorage
- Implement loading states for async context initialization
- Document context structure and available methods

## [Development Tools - TypeScript ESLint Formatting]()

Tools for TypeScript development, linting and code validation including TypeScript compiler, ESLint for static analysis, and plugins for React-specific rules. These tools ensure code quality, catch errors early, and maintain consistent coding standards across the project.

### When to use?

Use TypeScript for all frontend code requiring type safety, ESLint for enforcing coding standards and catching common bugs, typescript-eslint for TypeScript-specific linting rules, and React-specific plugins for enforcing Hooks rules and Fast Refresh compatibility. Essential for maintaining code quality in team environments.

### When NOT to use?

Avoid TypeScript strict mode for rapid prototyping where flexibility is needed, ESLint auto-fix for untrusted code that might introduce bugs, or excessive linting rules that slow down development. Skip TypeScript entirely for simple scripts where type safety provides minimal value.

### Example

ESLint configuration with TypeScript and React plugins

```javascript
// eslint.config.js
import js from '@eslint/js';
import typescript from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
```

### Checklist

- [ ] TypeScript installed with @types packages for React and Node
- [ ] tsconfig.json configured with strict mode enabled
- [ ] ESLint installed with JavaScript and TypeScript configs
- [ ] typescript-eslint plugin configured for TypeScript rules
- [ ] eslint-plugin-react-hooks installed for Hooks validation
- [ ] eslint-plugin-react-refresh for Fast Refresh compatibility
- [ ] npm script configured for linting (npm run lint)

### Troubleshooting

**Problem**: ESLint showing TypeScript errors incorrectly
**Solution**: Verify typescript-eslint parser is configured, check tsconfig.json is properly referenced in ESLint config, ensure TypeScript version matches eslint plugin requirements, restart IDE TypeScript server

**Problem**: React Hooks lint errors not appearing
**Solution**: Verify eslint-plugin-react-hooks is installed and configured, check rules are enabled in ESLint config, ensure plugin version is compatible with React version

**Problem**: ESLint performance issues in large projects
**Solution**: Configure ESLint to ignore node_modules and build directories, use ESLint cache option, disable expensive rules, consider running linting in CI instead of IDE

### Best Practices

- Enable TypeScript strict mode for maximum type safety
- Configure ESLint to run on pre-commit hooks
- Use typescript-eslint recommended config as baseline
- Enable react-hooks/exhaustive-deps rule to catch missing dependencies
- Configure no-unused-vars with ignore patterns for prefixed variables
- Use ESLint auto-fix carefully and review changes
- Document custom ESLint rules in project README
- Keep ESLint and TypeScript versions up to date

## [Component Architecture - Organization and Structure]()

Organization of reusable components categorized by type and functionality including common components, authentication guards, layout components, and complete application pages. This structure promotes reusability, maintainability, and clear separation of concerns.

### When to use?

Use this component structure for organizing medium to large React applications with multiple pages, reusable UI components, layout patterns, and business logic components. Separate common components (buttons, modals, charts) from page-specific components for maximum reusability and maintainability.

### When NOT to use?

Avoid over-structuring simple applications with few components, creating unnecessary folder hierarchies for prototypes, or premature abstraction before patterns emerge. Not suitable for micro-frontends requiring different organization patterns or component libraries with different export structures.

### Example

Component structure demonstrating common components, pages, and services organization

```typescript
// src/components/common/Modal.tsx - Reusable modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// src/pages/UserListPage.tsx - Page component using common components
import { Modal } from '@/components/common/Modal';
import { useUsers } from '@/hooks/useUsers';

export function UserListPage() {
  const { users, loading } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Users</h1>
      <button onClick={() => setModalOpen(true)}>Add User</button>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User">
        <UserForm />
      </Modal>

      <UserTable users={users} loading={loading} />
    </div>
  );
}
```

### Checklist

- [ ] Common components in src/components/common/
- [ ] Page components in src/pages/ with Page suffix
- [ ] Layout components separated from business logic
- [ ] Authentication guards (PrivateRoute) implemented
- [ ] Services separated in src/services/
- [ ] Custom hooks in src/hooks/
- [ ] Types/interfaces in src/types/
- [ ] Utilities in src/utils/

### Troubleshooting

**Problem**: Import path resolution errors
**Solution**: Verify path aliases configured in vite.config.ts and tsconfig.json, check @ alias points to src directory, restart TypeScript server in IDE

**Problem**: Circular dependency warnings
**Solution**: Review import structure to avoid circular references, extract shared types to separate files, use dependency injection or context instead of direct imports

**Problem**: Component naming conflicts
**Solution**: Follow naming conventions with suffixes (Page, Form, Modal), use more specific names for business components, organize by feature instead of type if conflicts persist

### Best Practices

- Use PascalCase for component files (MetricCard.tsx)
- Add suffixes to identify component type (Page, Form, Modal, Provider)
- Separate common/reusable components from page-specific ones
- Keep component files focused and under 300 lines
- Use index.ts files sparingly to avoid barrel file performance issues
- Organize imports: React, external libraries, local components, services, types
- Create custom hooks (useAuth, useUsers) for shared logic
- Document complex components with JSDoc comments

## [Naming Conventions - Component File Patterns]()

Naming conventions and patterns for React components, files, hooks, and services ensuring consistent identification and organization across the codebase. Uses suffixes and prefixes to quickly identify component categories and purposes.

### When to use?

Use these naming conventions for all React components, pages, forms, modals, providers, hooks, and services throughout the application. Apply consistently across team to enable quick file identification, improve code navigation, and maintain organizational clarity in large codebases.

### When NOT to use?

Avoid enforcing strict conventions in experimental prototypes where flexibility speeds development, legacy code migrations where gradual adoption is safer, or when integrating third-party libraries with different conventions. Not applicable to non-React files like utilities or configuration.

### Example

Component naming patterns demonstrating suffixes, prefixes, and file structure conventions

```typescript
// Pages: suffix "Page"
// src/pages/UserListPage.tsx
export function UserListPage() { /* ... */ }

// Forms: suffix "Form"
// src/components/UserForm.tsx
export function UserForm() { /* ... */ }

// Modals: suffix "Modal"
// src/components/common/ConfirmModal.tsx
export function ConfirmModal() { /* ... */ }

// Providers: suffix "Provider"
// src/contexts/AuthProvider.tsx
export function AuthProvider({ children }) { /* ... */ }

// Hooks: prefix "use"
// src/hooks/useAuth.ts
export function useAuth() { /* ... */ }

// Services: kebab-case with .service.ts suffix
// src/services/auth.service.ts
export const authService = { /* ... */ };

// Utilities: kebab-case with .utils.ts suffix
// src/utils/currency.utils.ts
export function formatCurrency(value: number) { /* ... */ }

// Base components: no suffix
// src/components/common/Button.tsx
export function Button({ children }) { /* ... */ }
```

### Checklist

- [ ] Pages use Page suffix (UserListPage.tsx)
- [ ] Forms use Form suffix (LoginForm.tsx)
- [ ] Modals use Modal suffix (ConfirmModal.tsx)
- [ ] Providers use Provider suffix (AuthProvider.tsx)
- [ ] Hooks use use prefix (useAuth.ts, useUsers.ts)
- [ ] Services use kebab-case with .service.ts suffix
- [ ] Utilities use kebab-case with .utils.ts suffix
- [ ] Base components use PascalCase without suffix (Button.tsx)

### Troubleshooting

**Problem**: Inconsistent naming causing confusion in codebase
**Solution**: Document naming conventions in project README, enforce with ESLint custom rules, conduct code review focused on naming, use IDE templates for new files

**Problem**: Difficulty finding specific component types
**Solution**: Use IDE file search with glob patterns (e.g., **/*Page.tsx), organize by feature when type-based structure becomes unwieldy, implement consistent folder structure

**Problem**: Naming conflicts between similar components
**Solution**: Add more context to component names (UserListPage vs AdminUserListPage), organize by feature/module, avoid generic names like Data or Info

### Best Practices

- Component files use PascalCase (MetricCard.tsx, UserForm.tsx)
- Utility files use kebab-case (currency.utils.ts, date.utils.ts)
- Service files use kebab-case with .service.ts suffix
- Prefix hooks with "use" (useAuth, useToast, useDebounce)
- Suffix pages with "Page" for quick identification
- Suffix providers with "Provider" matching context name
- Keep file names descriptive and specific
- Document conventions in .rules directory for reference

## [Configuration - Vite TypeScript Tailwind Setup]()

Project configuration files including Vite for build tooling, TypeScript for type checking, and Tailwind CSS for styling. These configurations define build behavior, type checking rules, styling system, and development environment settings.

### When to use?

Use these configurations as foundation for all React TypeScript Vite projects with Tailwind CSS. Customize baseURL for API endpoints, adjust TypeScript strictness based on project needs, extend Tailwind theme for custom design system, and configure path aliases for cleaner imports.

### When NOT to use?

Avoid modifying Vite config for SSR projects better served by Next.js or Remix, changing TypeScript strict mode off without team consensus, removing Tailwind purge configuration risking bloated CSS bundles, or adding unnecessary plugins degrading build performance.

### Example

Configuration files for Vite, TypeScript, and Tailwind CSS demonstrating standard setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': './src'
    }
  },
  server: {
    port: 5173
  }
});

// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          portifolio: '#3b82f6'
        }
      }
    }
  }
}
```

### Checklist

- [ ] Vite config includes React plugin with SWC
- [ ] Path alias @ configured in both vite.config.ts and tsconfig.json
- [ ] TypeScript strict mode enabled
- [ ] Tailwind content paths include all component files
- [ ] Dark mode strategy configured in Tailwind
- [ ] Custom theme colors defined if needed
- [ ] Environment variables configured with VITE_ prefix

### Troubleshooting

**Problem**: Path alias imports not resolving
**Solution**: Verify @ alias in both vite.config.ts and tsconfig.json, ensure baseUrl is set to ".", restart TypeScript server in IDE, check paths configuration matches directory structure

**Problem**: Tailwind classes not being purged in production
**Solution**: Verify content paths in tailwind.config.js include all component files, check build output for CSS size, ensure glob patterns match file extensions

**Problem**: Vite build failing with TypeScript errors
**Solution**: Run tsc --noEmit to see full type errors, fix type issues before building, ensure all dependencies have proper type definitions, check tsconfig.json targets supported browsers

### Best Practices

- Keep Vite config minimal, only add necessary plugins
- Enable TypeScript strict mode for maximum type safety
- Configure path aliases for cleaner imports (@ for src)
- Define custom Tailwind colors in theme extension
- Use VITE_ prefix for all environment variables
- Document custom configuration in project README
- Version control all config files
- Review Tailwind purge output to minimize CSS bundle size

## [Environment Configuration - Variables and Scripts]()

Environment variable configuration with VITE_ prefix for client-side usage and NPM scripts for development, build, and code verification. Environment variables enable configuration without code changes, while scripts automate common development tasks.

### When to use?

Use environment variables for API URLs, feature flags, public keys, and configuration varying between development, staging, and production. Use NPM scripts for automating development server, production builds, linting, and preview. Essential for maintaining different configurations across environments.

### When NOT to use?

Avoid environment variables for sensitive data exposed to client (use backend instead), configuration that rarely changes better suited as constants, or complex logic requiring code. Don't create excessive NPM scripts for tasks better handled by dedicated tools or CI/CD pipelines.

### Example

Environment variables and NPM scripts configuration for development and production

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_FEATURE_ANALYTICS=false

# .env.production
VITE_API_URL=https://api.production.com
VITE_FEATURE_ANALYTICS=true

# Accessing in code
const apiUrl = import.meta.env.VITE_API_URL;
const analyticsEnabled = import.meta.env.VITE_FEATURE_ANALYTICS === 'true';
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### Checklist

- [ ] Environment variables prefixed with VITE_
- [ ] .env files for different environments (development, production)
- [ ] .env.example committed to version control
- [ ] .env files added to .gitignore
- [ ] Environment variables accessed via import.meta.env
- [ ] NPM scripts for dev, build, lint, and preview configured
- [ ] Type definitions for environment variables if using TypeScript

### Troubleshooting

**Problem**: Environment variables not accessible in code
**Solution**: Verify VITE_ prefix is used, restart Vite dev server after changing .env, check variables are not commented out, ensure .env file is in project root

**Problem**: Different environments using wrong variables
**Solution**: Verify correct .env file is loaded, check Vite mode matches environment (development/production), ensure .env.production overrides are working, inspect import.meta.env in browser console

**Problem**: NPM script not working as expected
**Solution**: Check script syntax in package.json, verify dependencies are installed, ensure proper command chaining with && or ;, test commands individually before combining

### Best Practices

- Always prefix client-side variables with VITE_
- Never commit .env files containing secrets to version control
- Provide .env.example with dummy values for documentation
- Use descriptive variable names (VITE_API_URL not VITE_URL)
- Access environment variables through import.meta.env object
- Keep NPM scripts simple and composable
- Document all environment variables in README
- Validate required environment variables at application startup

## [Responsive Design - Mobile-First Tailwind Breakpoints]()

Patterns and practices for creating layouts that adapt to different screen sizes using Tailwind CSS mobile-first breakpoints. Implements fluid layouts with Grid and Flexbox, responsive spacing, typography, and conditional visibility for optimal user experience across devices.

### When to use?

Use mobile-first responsive design for all web applications accessed from multiple device types, especially dashboards, admin panels, and content-heavy sites. Apply responsive breakpoints when layouts need to reorganize for different screen sizes, navigation requires mobile menus, or content density varies by device.

### When NOT to use?

Avoid responsive design for desktop-only internal tools used exclusively on large screens, print stylesheets requiring fixed layouts, or native mobile apps using React Native. Skip complex responsive patterns for simple landing pages or when progressive enhancement isn't priority.

### Example

Responsive layout patterns demonstrating mobile-first approach with Tailwind breakpoints

```tsx
// Responsive grid layout - mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  <Card />
  <Card />
  <Card />
</div>

// Responsive sidebar with mobile overlay
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile: overlay sidebar, Desktop: always visible */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900
        transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-auto">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MenuIcon />
        </button>

        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Responsive typography and spacing
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl mb-4">
    Responsive Title
  </h1>
  <p className="text-sm md:text-base lg:text-lg">
    Content that scales with viewport
  </p>
</div>

// Conditional visibility by breakpoint
<div>
  {/* Mobile only */}
  <button className="md:hidden">
    <MenuIcon />
  </button>

  {/* Desktop only */}
  <nav className="hidden md:flex gap-4">
    <Link to="/">Home</Link>
    <Link to="/about">About</Link>
  </nav>
</div>
```

### Checklist

- [ ] Mobile-first: base styles target mobile devices
- [ ] Breakpoints applied in order: sm, md, lg, xl, 2xl
- [ ] Fluid layouts use Grid or Flexbox
- [ ] Responsive spacing (padding, margin, gap)
- [ ] Typography scales with viewport size
- [ ] Images use responsive widths and object-fit
- [ ] Navigation transforms between mobile menu and desktop nav
- [ ] Forms reorganize fields for small screens
- [ ] Tables use scroll or card layouts on mobile
- [ ] Tested at breakpoints: 320px, 768px, 1024px, 1920px

### Troubleshooting

**Problem**: Desktop styles applying on mobile devices
**Solution**: Verify mobile-first approach - base classes without breakpoint prefix should target mobile, add breakpoint prefixes (md:, lg:) for larger screens, check viewport meta tag in HTML

**Problem**: Layout breaking at specific screen sizes
**Solution**: Test at exact Tailwind breakpoints (640px, 768px, 1024px, 1280px, 1536px), check for fixed widths conflicting with responsive classes, ensure min-width patterns used correctly

**Problem**: Content overflow on mobile devices
**Solution**: Use overflow-x-auto for tables, set max-width constraints, ensure images use w-full with max-w-*, check for absolute positioning breaking layout

### Best Practices

- Always use mobile-first approach: base class for mobile, prefix for larger
- Test at all standard breakpoints: 320px, 640px, 768px, 1024px, 1280px
- Use Grid for two-dimensional layouts, Flexbox for one-dimensional
- Apply responsive padding and margin (p-4 md:p-6 lg:p-8)
- Scale typography with breakpoints (text-base md:text-lg lg:text-xl)
- Use conditional visibility sparingly to avoid duplicate markup
- Implement responsive images with appropriate object-fit
- Transform navigation patterns between mobile and desktop
- Prefer fluid layouts over fixed widths when possible
- Test touch interactions on actual mobile devices, not just browser resize

## [Project Features - Dark Mode Performance Accessibility]()

Functionalities and design decisions implemented in the frontend including dark mode by default, mobile-first responsive design, semantic HTML accessibility, and performance optimizations with code splitting and lazy loading. These features enhance user experience and application performance.

### When to use?

Implement dark mode for applications used in low-light environments or all-day usage, code splitting for large applications with multiple routes, lazy loading for heavy components not needed on initial load, and accessibility features for compliant, inclusive applications. Apply these patterns to all modern web applications.

### When NOT to use?

Skip dark mode for brand-specific designs requiring fixed color schemes, code splitting for tiny applications where overhead outweighs benefits, lazy loading for above-the-fold critical content, or accessibility features when automatically handled by component libraries (though still verify compliance).

### Example

Dark mode, code splitting, and accessibility implementation patterns

```tsx
// Dark mode with Tailwind classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <h1 className="text-2xl dark:text-gray-100">
    Content adapts to theme
  </h1>
  <div className="bg-gray-100 dark:bg-gray-800 p-4">
    Card background
  </div>
</div>

// Theme toggle component
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle dark mode"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

// Code splitting with React.lazy
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// Accessibility with semantic HTML and ARIA
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<button
  aria-label="Close modal"
  aria-pressed={isOpen}
  onClick={handleClose}
>
  ×
</button>
```

### Checklist

- [ ] Dark mode configured with Tailwind class strategy
- [ ] Dark mode toggle implemented with localStorage persistence
- [ ] Route-based code splitting with React.lazy
- [ ] Heavy components lazy loaded with Suspense boundaries
- [ ] Semantic HTML used (nav, main, section, article)
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation supported
- [ ] Color contrast meets WCAG AA standards

### Troubleshooting

**Problem**: Dark mode not persisting across page reloads
**Solution**: Save theme preference to localStorage, load on app initialization, ensure dark class is applied to html element before first render

**Problem**: Code splitting causing blank page or errors
**Solution**: Verify Suspense wraps lazy components, check fallback is provided, ensure dynamic import paths are correct, test with network throttling

**Problem**: Accessibility violations reported by audits
**Solution**: Run Lighthouse or axe DevTools, add ARIA labels to interactive elements without text, ensure proper heading hierarchy, test keyboard navigation

### Best Practices

- Default to dark mode for developer tools and productivity apps
- Persist theme preference in localStorage
- Use Tailwind dark: variant for all color-related classes
- Implement code splitting at route level first
- Lazy load below-the-fold content and modal components
- Use semantic HTML elements over div soup
- Provide ARIA labels for icon-only buttons
- Ensure minimum 4.5:1 color contrast ratio
- Test keyboard navigation for all interactive features
- Run accessibility audits regularly with Lighthouse

## [Technology Summary - Dependencies and Requirements]()

Complete list of main technologies, system requirements, and official documentation references for the frontend stack including React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Chart.js, and development tools.

### When to use?

Reference this section when onboarding new developers, verifying system requirements before setup, checking compatible versions for updates, or linking to official documentation for deep dives. Use as single source of truth for technology stack decisions.

### When NOT to use?

Avoid treating this as exhaustive implementation guide (use specific sections instead), relying on versions without checking latest compatibility, or using as replacement for official documentation when troubleshooting complex issues.

### Example

Technology stack overview with versions and documentation links

```json
// Main dependencies (package.json excerpt)
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "@tippyjs/react": "^4.2.6",
    "timeago.js": "^4.0.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "vite": "^5.1.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "eslint": "^8.56.0",
    "typescript-eslint": "^7.0.0"
  }
}
```

### Checklist

- [ ] Node.js >= 18.x installed
- [ ] npm >= 9.x or pnpm >= 8.x installed
- [ ] Modern browser (Chrome, Firefox, Safari, Edge latest versions)
- [ ] Git for version control
- [ ] Code editor with TypeScript support (VS Code recommended)
- [ ] All dependencies installed via npm install
- [ ] Development server running on port 5173

### Troubleshooting

**Problem**: Dependency installation failures
**Solution**: Clear npm cache with npm cache clean --force, delete node_modules and package-lock.json, ensure Node version matches requirements (>= 18.x), check network connectivity

**Problem**: Version conflicts between dependencies
**Solution**: Check peer dependencies warnings, update to compatible versions, use npm list to inspect dependency tree, consider npm overrides for resolving conflicts

**Problem**: Browser compatibility issues
**Solution**: Verify browserslist configuration targets appropriate browsers, check Vite build output for transpilation, use polyfills for unsupported features, test in actual target browsers

### Best Practices

- Keep Node.js version up to date (LTS recommended)
- Use package-lock.json or pnpm-lock.yaml for reproducible builds
- Update dependencies regularly but test thoroughly
- Review breaking changes before major version updates
- Document minimum browser versions in README
- Use exact versions for critical dependencies
- Audit dependencies for security vulnerabilities regularly
- Refer to official documentation for version-specific features

## [Documentation References - Official Links]()

Official documentation links for all major technologies used in the frontend stack. These resources provide authoritative information for learning, troubleshooting, and staying updated with latest features and best practices.

### When to use?

Reference official documentation when learning new features, troubleshooting issues beyond this guide, implementing advanced patterns, checking API references, or staying current with framework updates. Use as primary source for version-specific information.

### When NOT to use?

Avoid using documentation as only learning resource without hands-on practice, relying on outdated cached versions, or substituting for project-specific patterns documented in .rules directory. Don't use generic tutorials over official docs for accurate information.

### Example

Documentation link references for quick access

- **React**: https://react.dev - Official React documentation with hooks, components, and best practices
- **Vite**: https://vitejs.dev - Fast build tool documentation and configuration guide
- **TypeScript**: https://www.typescriptlang.org/docs - TypeScript handbook and language reference
- **Tailwind CSS**: https://tailwindcss.com - Utility-first CSS framework documentation
- **React Router**: https://reactrouter.com - Client-side routing documentation and API reference
- **Axios**: https://axios-http.com - HTTP client documentation with examples and interceptors
- **Chart.js**: https://www.chartjs.org - Chart documentation with examples and configuration
- **Tippy.js**: https://atomiks.github.io/tippyjs - Tooltip library documentation

### Checklist

- [ ] Bookmarked relevant documentation sites
- [ ] Subscribed to release notes for major dependencies
- [ ] Familiar with documentation structure for quick lookup
- [ ] Know where to find API references vs guides
- [ ] Aware of version-specific documentation pages
- [ ] Can access documentation offline when needed
- [ ] Follow official blogs and changelogs for updates

### Troubleshooting

**Problem**: Documentation version doesn't match installed package
**Solution**: Check package.json for installed version, navigate to correct documentation version, use version switcher in docs, consider upgrading if using outdated version

**Problem**: Can't find specific feature in documentation
**Solution**: Use documentation search functionality, check API reference section, review migration guides for moved features, search GitHub issues for discussions

**Problem**: Examples in documentation not working in project
**Solution**: Verify versions match between docs and project, check for required peer dependencies, review project-specific configuration differences, test example in isolation

### Best Practices

- Always check documentation version matches installed package version
- Start with Getting Started guides for new technologies
- Bookmark frequently referenced API documentation pages
- Use official examples as starting point for implementation
- Check migration guides before major version upgrades
- Follow official GitHub repositories for issues and discussions
- Subscribe to release notes and changelogs
- Contribute documentation improvements when finding gaps

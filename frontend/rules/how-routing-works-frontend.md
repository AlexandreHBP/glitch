# [How Routing Works in Frontend]()

Complete guide on routing with React Router DOM in the project, including route configuration, navigation patterns, authentication guards, and advanced features for building scalable single-page applications.

**Page Naming**: All pages must follow the `Page` suffix (ex: `LoginPage.tsx`, `AssetListPage.tsx`). For complete naming conventions, see: `.rules/react-component-naming-pattern-frontend.md`

## [Centralized Route Configuration]()

Centralized route configuration organizes all application routes in a single configuration file, making routes manageable, type-safe, and easily accessible throughout the application. This pattern separates public routes from private authenticated routes, providing metadata like icons and visibility flags for automatic menu generation.

### When to use?

Use centralized route configuration when building applications with multiple routes, when you need dynamic menu generation from route metadata, when managing complex routing logic with public and private routes, or when you want type-safe route definitions with additional properties like icons and menu visibility.

### When NOT to use?

Do not use centralized configuration for very simple applications with only 2-3 routes, quick prototypes where routes change frequently during exploration, or when using route-based code splitting with framework-specific conventions that handle routing differently. Start simple and centralize as complexity grows naturally.

### Example

Centralized route configuration with TypeScript interfaces and metadata for menu generation.

**`src/config/routes.config.tsx`**:

```typescript
export interface RouteConfig {
  path: string;
  element: JSX.Element;
  name: string;
  icon?: JSX.Element;
  showInMenu?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: <Login />,
    name: 'Login',
  },
  {
    path: '/signup',
    element: <Signup />,
    name: 'Sign Up',
  },
];

export const privateRoutes: RouteConfig[] = [
  {
    path: '/overview',
    element: <OverviewPage />,
    name: 'Overview',
    icon: <DashboardIcon />,
    showInMenu: true,
  },
  {
    path: '/assets',
    element: <AssetListPage />,
    name: 'Assets',
    icon: <AssetsIcon />,
    showInMenu: true,
  },
  {
    path: '/assets/:id',
    element: <AssetProfilePage />,
    name: 'Asset Profile',
    showInMenu: false, // Doesn't appear in menu
  },
  // ...
];
```

### Checklist

- [ ] Route configuration file created (`routes.config.tsx`)
- [ ] RouteConfig interface defined with TypeScript
- [ ] Public and private routes separated into distinct arrays
- [ ] showInMenu property configured for menu generation
- [ ] Icons included for menu items that require visual indicators
- [ ] All page components imported correctly
- [ ] Path parameters clearly defined with colon syntax (`:id`)

### Troubleshooting

**Routes not found**: Ensure all page components are properly imported in routes.config.tsx and export statements match

**Menu not updating**: Check that showInMenu is set to true for items that should appear in navigation

**Type errors**: Verify RouteConfig interface matches all route properties being used in configuration arrays

**Icons not displaying**: Ensure icon components are imported and wrapped in JSX elements, not passed as component references

### Best Practices

1. Separate public and private routes clearly into different arrays
2. Use TypeScript interfaces for type safety and IDE autocomplete
3. Include metadata (icons, names, descriptions) for UI generation
4. Keep route paths consistent with REST conventions and resource naming
5. Document dynamic parameters in comments above route definitions
6. Use showInMenu to control navigation visibility without removing routes
7. Centralize all routes in one file for easy management and discovery

## [App Component with React Router]()

The App component configures React Router with BrowserRouter, sets up authentication context, and maps route configurations to Route components. This creates the foundation for client-side routing with authentication guards, nested layouts, and proper route organization for both public and private areas of the application.

### When to use?

Use this pattern when setting up the root application component that needs to configure client-side routing, authentication context, and distinguish between public and private routes with different layouts. This is required in every React application using React Router with authentication requirements and shared layouts.

### When NOT to use?

Do not use this exact pattern if you're using a different routing library (like Next.js App Router or Remix), if you don't need authentication guards at all, or if using server-side rendering with different routing requirements. Adapt the pattern based on your specific routing library and authentication architecture needs.

### Example

Root App component configuring BrowserRouter with authentication and route mapping.

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { publicRoutes, privateRoutes } from './config/routes.config';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}

          {/* Private Routes with Layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            {privateRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/overview" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### Checklist

- [ ] BrowserRouter wraps entire application as outermost component
- [ ] AuthProvider configured before routes to provide authentication context
- [ ] Public routes mapped without authentication guards
- [ ] Private routes wrapped with PrivateRoute component
- [ ] Layout component wraps authenticated routes for shared UI
- [ ] Root redirect configured for default landing page
- [ ] 404 catch-all route added at the end
- [ ] All routes have unique keys to prevent React warnings

### Troubleshooting

**Routes not working**: Ensure BrowserRouter is the outermost router component and not nested inside another router

**Authentication not working**: Verify AuthProvider is configured correctly and wraps Routes component before route definitions

**404 not caught**: Check that catch-all route with path="*" is last in Routes and doesn't conflict with other patterns

**Redirects looping**: Verify redirect paths exist in route configuration and don't create circular redirect chains

### Best Practices

1. Use BrowserRouter not HashRouter for clean URLs without hash fragments
2. Wrap routes with appropriate providers (Auth, Theme, etc.) in logical order
3. Use key prop when mapping routes to prevent React reconciliation warnings
4. Configure 404 catch-all as the last route to catch unmatched paths
5. Use replace prop on redirects to prevent history clutter and back button issues
6. Keep App component focused on routing structure, extract complex logic elsewhere
7. Extract complex configuration logic to custom hooks or separate configuration files

## [PrivateRoute Authentication Guard]()

PrivateRoute component protects routes requiring authentication by checking for valid tokens and redirecting unauthenticated users to login. This implements a security-by-default pattern, ensuring sensitive routes are completely inaccessible without proper authentication, preventing unauthorized access to protected application areas.

### When to use?

Use PrivateRoute to protect any route or layout that requires user authentication before access. Wrap individual routes or parent layout components to protect multiple child routes at once. Essential for dashboards, user profiles, settings pages, and any authenticated functionality that should not be publicly accessible.

### When NOT to use?

Do not use PrivateRoute for public pages like login, signup, landing pages, marketing pages, or public documentation. Do not use if authentication is handled differently (API-level only without client guards). Skip for applications without any authentication requirements or proof-of-concept projects.

### Example

Authentication guard component with loading states and automatic login redirect.

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### Checklist

- [ ] PrivateRoute component created in components directory
- [ ] useAuth hook implemented and imported
- [ ] Loading state handled before authentication check
- [ ] Redirect to login on missing or invalid token
- [ ] replace prop used on Navigate to prevent back button issues
- [ ] TypeScript props properly typed with interface
- [ ] Loading spinner or skeleton shown during authentication check

### Troubleshooting

**Infinite redirect loop**: Ensure login page is not wrapped with PrivateRoute, creating circular redirects

**Flash of content**: Add proper loading state handling before checking token to prevent unauthorized content flashing

**Token not detected**: Verify useAuth hook is accessing correct context and storage (localStorage/sessionStorage)

**Not redirecting**: Check that Navigate component has replace prop and correct path, and that Routes are configured properly

### Best Practices

1. Always handle loading state before checking authentication to avoid flashing
2. Use replace prop to avoid back button issues when redirecting to login
3. Show loading spinner or skeleton instead of blank screen for better UX
4. Consider adding return URL parameter for post-login redirect to original destination
5. Validate token expiration and format, not just presence in storage
6. Log authentication failures for debugging without exposing sensitive information
7. Handle expired tokens gracefully with automatic refresh logic when possible

## [Layout with Outlet for Nested Routes]()

Layout component provides shared structure for authenticated pages including sidebar navigation, header, and main content area. The Outlet component from React Router renders the current child route in the designated content area, enabling consistent layouts across multiple pages while maintaining component separation and reusability.

### When to use?

Use Layout with Outlet when you need consistent navigation, header, footer, or sidebar across multiple routes in a section. Ideal for authenticated dashboards, admin panels, user settings areas, or any multi-page section sharing common UI elements. Enables clean separation of layout structure from page content logic.

### When NOT to use?

Do not use shared layout for pages with completely different structures (login page vs dashboard), for single-page applications without navigation between views, or when each page in a section needs unique layout requirements. Use route-specific layouts or conditional rendering instead for varied structures.

### Example

Shared layout component with sidebar navigation and header using Outlet for route content.

```typescript
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto p-6">
          <Outlet /> {/* Renders current route */}
        </main>
      </div>
    </div>
  );
}
```

### Checklist

- [ ] Layout component created in components directory
- [ ] Outlet imported from react-router-dom
- [ ] Sidebar component implemented with navigation
- [ ] Header component implemented with user actions
- [ ] Responsive flexbox or grid layout structure
- [ ] Overflow handling for scrollable content areas
- [ ] Layout wraps private routes correctly in App component

### Troubleshooting

**Outlet not rendering**: Verify Layout is used as parent route with nested children routes configured properly

**Styling issues**: Check flexbox properties and ensure h-screen doesn't conflict with body or parent styling

**Content overflowing**: Add overflow-auto to main content area to enable scrolling when content exceeds viewport

**Sidebar not showing**: Verify Sidebar component is properly imported, rendered, and has defined width

### Best Practices

1. Use Outlet for rendering child routes dynamically in the content area
2. Implement responsive design for mobile, tablet, and desktop breakpoints
3. Add overflow handling for long content to prevent layout breaking
4. Keep Layout focused on structure and positioning, not business logic
5. Use CSS Grid or Flexbox for reliable and maintainable layouts
6. Consider sticky headers and fixed sidebars for better navigation UX
7. Extract layout variations into separate components rather than conditional logic

## [Navigation with useNavigate and Link Components]()

React Router provides multiple navigation methods including programmatic navigation with useNavigate hook and declarative navigation with Link and NavLink components. Each method suits different navigation scenarios: programmatic for post-action redirects, Link for standard navigation, and NavLink for menu items requiring active state styling.

### When to use?

Use useNavigate for programmatic navigation after form submissions, API calls, button clicks, or user actions requiring redirects. Use Link for standard anchor-style navigation in content and UI. Use NavLink when you need active state styling for navigation menus, sidebars, or tabs showing current location.

### When NOT to use?

Do not use useNavigate for simple anchor links that should use Link component instead. Do not use Link for external URLs outside your application (use regular anchor tags). Avoid Navigate component for programmatic redirects in event handlers (use useNavigate hook instead for better control).

### Example

Programmatic navigation with useNavigate hook for button actions.

**useNavigate Hook**:

```typescript
import { useNavigate } from 'react-router-dom';

function ProductList() {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/products/new');
  };

  const handleEdit = (id: number) => {
    navigate(`/products/${id}/edit`);
  };

  const handleBack = () => {
    navigate(-1); // Go back one page
  };

  return (
    <div>
      <button onClick={handleCreate}>New Product</button>
      <button onClick={handleBack}>Back</button>
    </div>
  );
}
```

**Link Component**:

```typescript
import { Link } from 'react-router-dom';

function ProductList() {
  return (
    <div>
      <Link to="/products/new" className="btn">
        New Product
      </Link>

      {products.map(p => (
        <Link to={`/products/${p.id}`} key={p.id}>
          {p.name}
        </Link>
      ))}
    </div>
  );
}
```

**NavLink with Active State**:

```typescript
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <nav>
      <NavLink
        to="/overview"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Overview
      </NavLink>

      <NavLink
        to="/assets"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Assets
      </NavLink>
    </nav>
  );
}
```

### Checklist

- [ ] useNavigate hook used for programmatic navigation in handlers
- [ ] Link component used for declarative anchor navigation
- [ ] NavLink component used for menu items requiring active states
- [ ] Template literals used for dynamic path construction
- [ ] navigate(-1) used for back navigation when appropriate
- [ ] className function used for conditional styling on NavLink
- [ ] Key prop applied on mapped Link components

### Troubleshooting

**Navigation not working**: Ensure routes are properly configured in App.tsx and paths match exactly

**Active state not applying**: Check NavLink className receives function not string for dynamic styling

**Back button issues**: Use replace option on navigate when you don't want history entries created

**Link styling issues**: Apply className prop or use styled-components/CSS modules for consistent styling

### Best Practices

1. Use Link over onClick navigation for better accessibility and SEO
2. Use NavLink for navigation menus to automatically show active routes
3. Use navigate hook for post-action redirects (after save, delete, form submit)
4. Use template literals for cleaner dynamic path construction with parameters
5. Add loading states during navigation if fetching data or processing
6. Use relative paths when possible for better code portability
7. Consider navigation state for passing data between routes when needed

## [Route Parameters with useParams Hook]()

The useParams hook extracts dynamic parameters from the current URL path, enabling pages to load specific resources based on ID or other identifiers. Essential for detail pages, edit forms, profile pages, and any route that displays or manipulates specific entity data based on URL parameters.

### When to use?

Use useParams when routes have dynamic segments like /products/:id, /users/:userId/posts/:postId, or any URL pattern identifying specific resources. Required for detail pages, edit forms, profile pages, or any component that needs to identify which specific resource to load, display, or modify based on URL.

### When NOT to use?

Do not use useParams for optional data that doesn't identify resources (use query parameters with useSearchParams instead). Avoid for data that shouldn't appear in URL path (use query params or component state). Not needed for static routes without dynamic segments or variable parts.

### Example

Extracting route parameters with TypeScript typing for type safety.

**Single Parameter**:

```typescript
import { useParams } from 'react-router-dom';

function AssetProfile() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    loadAsset(Number(id));
  }, [id]);

  return <div>Asset {id}</div>;
}
```

**Multiple Parameters**:

```typescript
// Route: /wallets/:walletId/assets/:assetId

function WalletAssetDetail() {
  const { walletId, assetId } = useParams<{
    walletId: string;
    assetId: string;
  }>();

  return <div>Wallet {walletId}, Asset {assetId}</div>;
}
```

### Checklist

- [ ] useParams hook imported from react-router-dom
- [ ] TypeScript generic types defined for all parameters
- [ ] Parameters destructured from hook return value
- [ ] Parameters converted to correct types (Number, Date, etc.)
- [ ] useEffect dependencies include parameters when used for data fetching
- [ ] Route configuration matches parameter names exactly
- [ ] Handle undefined or invalid parameters gracefully

### Troubleshooting

**Parameters undefined**: Verify route path includes :paramName segments in route configuration

**Type errors**: Add TypeScript generic with parameter names and string types to useParams call

**Stale data when params change**: Include params in useEffect dependency array for proper re-fetching

**Wrong parameter names**: Match destructured variable names with route definition parameter names exactly

### Best Practices

1. Always type useParams with TypeScript generics for type safety
2. Convert string params to appropriate types (Number, Date, etc.) immediately
3. Include params in useEffect dependencies when fetching data
4. Validate params before using (check for undefined, invalid formats)
5. Handle invalid IDs gracefully with 404 pages or error messages
6. Use meaningful parameter names in routes (:userId not :id when nested)
7. Document expected parameter format and validation rules in route config

## [Query Parameters with useSearchParams Hook]()

The useSearchParams hook manages URL query parameters for filtering, pagination, search, sorting, and other optional parameters. Unlike route params, search params don't affect route matching but provide flexible state management in the URL, enabling shareable filtered views, bookmarkable searches, and stateful list pages.

### When to use?

Use useSearchParams for pagination controls (page, limit), filtering options (status, category, date range), search terms, sorting preferences, or any optional parameters that should persist in URL for sharing and bookmarking. Ideal for list pages with filters, search results, or any view with multiple display options.

### When NOT to use?

Do not use for required resource identifiers that define the route (use route params instead). Avoid for sensitive data that shouldn't appear in URLs or browser history. Not ideal for complex nested objects or large data structures (use component state or session storage instead for better performance).

### Example

Managing pagination and search with URL query parameters for shareable state.

```typescript
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), search });
  };

  const handleSearch = (term: string) => {
    setSearchParams({ page: '1', search: term });
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      {/* URL: /products?page=2&search=notebook */}
    </div>
  );
}
```

### Checklist

- [ ] useSearchParams hook imported and destructured
- [ ] Default values provided for missing or undefined params
- [ ] setSearchParams preserves existing params when needed
- [ ] Parameters properly typed and converted from strings
- [ ] Reset to page 1 when filters or search change
- [ ] URL updates properly reflect in component state
- [ ] Parameters validated before use in queries

### Troubleshooting

**Params disappear on update**: Use object spread to preserve existing params when calling setSearchParams

**Infinite loops**: Don't call setSearchParams in render or without proper useEffect dependencies

**Type issues**: Remember get() returns string | null, always provide defaults and convert types

**State not syncing with URL**: Ensure useEffect dependencies include searchParams when deriving state

### Best Practices

1. Provide sensible defaults for missing or invalid parameters
2. Reset page to 1 when changing filters to avoid empty results
3. Preserve unrelated params when updating (spread current params object)
4. Validate and sanitize parameter values before using in queries
5. Use meaningful and descriptive parameter names for clarity
6. Document expected parameter formats and valid values
7. Consider debouncing search param updates to reduce URL changes

## [Nested Routes and Hierarchical Layouts]()

Nested routes enable hierarchical URL structures with parent layouts wrapping child content, creating logical sub-sections with shared UI elements. This pattern organizes complex features into coherent sections while maintaining clean URL structures, component organization, and reusable layout components for related pages.

### When to use?

Use nested routes for sub-sections that share layout elements like tabs or sub-navigation (admin panel sections, user settings categories), for multi-level navigation hierarchies, or when building complex features with consistent sub-navigation. Ideal for settings pages with categories, dashboards with multiple tabs, or feature sections with shared context.

### When NOT to use?

Do not use nested routes when child routes don't share any layout or navigation elements, for simple flat route structures where nesting adds unnecessary complexity, or when url structure doesn't match layout hierarchy. Start with flat routes and introduce nesting only when clear patterns emerge requiring shared layouts.

### Example

Nested route configuration with parent layout containing Outlet for child routes.

```typescript
// Configuration
{
  path: '/assets',
  element: <AssetLayout />,
  children: [
    {
      path: '',                    // /assets
      element: <AssetListPage />,
    },
    {
      path: 'new',                 // /assets/new
      element: <AssetFormPage />,
    },
    {
      path: ':id',                 // /assets/123
      element: <AssetProfilePage />,
    },
    {
      path: ':id/edit',            // /assets/123/edit
      element: <AssetEditPage />,
    },
  ],
}

// AssetLayout.tsx
function AssetLayout() {
  return (
    <div>
      <h1>Assets</h1>
      <Outlet /> {/* Renders child route */}
    </div>
  );
}
```

### Checklist

- [ ] Parent route has element containing Outlet component
- [ ] Child routes configured in children array
- [ ] Empty path ('') configured for index route matching parent
- [ ] Relative paths for children without leading slashes
- [ ] Outlet component properly placed in parent layout
- [ ] Route parameters handled correctly in child routes
- [ ] Index route redirects or shows default content

### Troubleshooting

**Children not rendering**: Ensure parent element contains Outlet component in the correct position

**Wrong paths generated**: Use relative paths without leading slash for children routes

**Index route not working**: Use empty string '' for path that matches parent URL exactly

**Styling conflicts**: Ensure parent layout doesn't interfere with child content dimensions or overflow

### Best Practices

1. Use Outlet in parent layouts for child route rendering area
2. Keep child paths relative without leading slashes for clarity
3. Provide index route for default child content when accessing parent path
4. Share navigation, tabs, or breadcrumbs in parent layout component
5. Limit nesting depth to 2-3 levels max for maintainability
6. Use descriptive parent element components, not generic wrappers
7. Consider breadcrumbs for nested route navigation and context

## [Redirects and Navigate Component]()

The Navigate component provides declarative redirects, enabling automatic route changes based on runtime conditions like authentication state, feature flags, data availability, or application requirements. Essential for conditional access control, enforcing required steps, user flow management, and handling deprecated routes.

### When to use?

Use Navigate for conditional redirects based on authentication status, user permissions, required verification steps, or data availability. Ideal for redirecting unauthenticated users to login, enforcing required onboarding steps like email verification, replacing deprecated routes with new ones, or handling missing resources with fallback routes.

### When NOT to use?

Do not use Navigate for user-initiated navigation actions (use Link or useNavigate hook instead). Avoid for external redirects outside your application (use window.location.href). Not needed for simple clickable links or button handlers where useNavigate is more appropriate and provides better control.

### Example

Conditional redirect based on authentication state with loading handling.

**Simple Redirect**:

```typescript
import { Navigate } from 'react-router-dom';

function OldProductPage() {
  return <Navigate to="/products" replace />;
}
```

**Conditional Redirect**:

```typescript
function Dashboard() {
  const { user } = useAuth();

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return <div>Dashboard</div>;
}
```

### Checklist

- [ ] Navigate component imported from react-router-dom
- [ ] replace prop used for permanent redirects preventing back
- [ ] Conditional logic properly implemented before render
- [ ] Target route exists and is configured correctly
- [ ] Loading states handled before redirect check
- [ ] Redirect loops prevented with proper conditions
- [ ] State passed via state prop if needed for return URLs

### Troubleshooting

**Infinite redirect loops**: Ensure redirect condition eventually becomes false or leads to stable route

**Back button issues**: Use replace prop to prevent adding redirect to history stack

**Redirect not working**: Verify target route is properly configured and path is correct

**Flash of content before redirect**: Add loading state before checking redirect conditions

### Best Practices

1. Always use replace prop for permanent redirects to clean history
2. Handle loading states before conditional redirects to prevent flashing
3. Prevent redirect loops with careful condition logic and testing
4. Pass state for post-redirect navigation or return URL tracking
5. Log redirects in development for debugging complex flows
6. Consider user experience during redirects with loading indicators
7. Document redirect logic clearly in code comments for maintainability

## [Dynamic Menu Generation from Routes]()

Dynamic menu generation creates navigation automatically from centralized route configuration, ensuring menus stay perfectly synchronized with available routes. This DRY approach reduces maintenance overhead, prevents menu-route mismatches, and enables consistent navigation behavior across the entire application with automatic updates.

### When to use?

Use dynamic menu generation when you have centralized route configuration with metadata, when navigation structure closely matches route structure, or when you need consistent menu behavior across application sections. Ideal for applications with many routes, frequent route changes, or when menu visibility depends on route configuration properties.

### When NOT to use?

Do not use when menu structure differs significantly from route hierarchy, when you need complex conditional menu logic beyond simple filtering, or for very simple static menus with 2-3 items. Custom menus may be simpler for complex navigation requirements with special grouping or ordering needs.

### Example

Sidebar component generating navigation items automatically from route configuration.

```typescript
import { NavLink } from 'react-router-dom';
import { privateRoutes } from '@/config/routes.config';

function Sidebar() {
  const menuItems = privateRoutes.filter(route => route.showInMenu);

  return (
    <nav>
      {menuItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

### Checklist

- [ ] Route config includes showInMenu boolean property
- [ ] Filter applied to select only menu-visible items
- [ ] NavLink component used for automatic active state
- [ ] Icons displayed correctly from route config
- [ ] Key prop applied on mapped menu items
- [ ] Conditional styling for active state using className function
- [ ] Menu updates automatically when routes change

### Troubleshooting

**Menu items missing**: Verify showInMenu property is true on route config objects

**Icons not showing**: Ensure icon property contains valid JSX element, not component reference

**Active state styling wrong**: Check NavLink className uses function not string for dynamic classes

**Order incorrect**: Add optional order property to route config for custom menu ordering

### Best Practices

1. Filter routes by showInMenu property for menu inclusion control
2. Use NavLink for automatic active state without manual tracking
3. Include icons and labels in route config for consistency
4. Add optional order property for custom menu ordering when needed
5. Consider nested menus for grouped routes with shared context
6. Handle permissions and role-based visibility in route config
7. Keep menu generation logic simple and readable for maintenance

## [Lazy Loading Routes for Code Splitting]()

Lazy loading splits route components into separate JavaScript bundles loaded on demand, dramatically reducing initial bundle size and improving application startup performance. Critical optimization for large applications with many routes, heavy components, or complex features that most users don't access immediately.

### When to use?

Use lazy loading for heavy routes with large dependencies like chart libraries or editors, for routes users rarely visit like admin panels or settings, in applications with many routes where initial bundle exceeds reasonable size, or when optimizing Core Web Vitals and initial load performance for production applications.

### When NOT to use?

Do not lazy load critical routes that most users visit immediately (like login, home, or landing pages), very small components where code splitting overhead exceeds benefits, or when you need guaranteed synchronous rendering without Suspense fallback delays. Balance load time savings against user experience impact.

### Example

Lazy loaded route components with Suspense fallback for loading states.

```typescript
import { lazy, Suspense } from 'react';

// Lazy load components
const AssetListPage = lazy(() => import('@/pages/assets/AssetListPage'));
const AssetProfilePage = lazy(() => import('@/pages/assets/AssetProfilePage'));

// Usage in routes
<Route
  path="/assets"
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <AssetListPage />
    </Suspense>
  }
/>
```

### Checklist

- [ ] lazy function imported from react
- [ ] Suspense component imported from react
- [ ] Dynamic import syntax with arrow function used
- [ ] Suspense fallback provided with loading indicator
- [ ] Loading indicator styled appropriately for context
- [ ] Bundle sizes verified in production build
- [ ] Critical first-load routes not lazy loaded

### Troubleshooting

**Blank screen during load**: Ensure Suspense wrapper with meaningful fallback is present

**Loading flicker on fast connections**: Add minimum delay or better loading indicator design

**Failed chunk loading errors**: Handle network errors with error boundaries and retry logic

**Build errors**: Verify import paths are correct and modules export default, not named exports

### Best Practices

1. Always wrap lazy components with Suspense providing fallback UI
2. Provide meaningful loading fallbacks matching page context
3. Don't lazy load critical first routes users always visit
4. Group related components in same chunk for efficiency
5. Monitor bundle sizes with webpack-bundle-analyzer or similar tools
6. Test lazy loading behavior in production builds, not development
7. Handle loading errors gracefully with error boundaries and retry mechanisms

## [References]()

- [React Router Documentation](https://reactrouter.com/en/main)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)

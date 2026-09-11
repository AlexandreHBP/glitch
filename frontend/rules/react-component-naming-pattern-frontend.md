# [React Component Naming Pattern in Frontend]()

Naming conventions with suffixes for quick identification of React component categories, improving code organization and search capabilities.

## [Component Naming System - Suffix-Based Pattern for Type Identification]()

Defines a systematic approach to naming React components using suffix patterns that instantly identify component types, improving code organization, searchability, and team collaboration through consistent naming conventions across the entire codebase.

### When to use?

Use these naming conventions for all React components in production applications where code organization, maintainability, and team collaboration are priorities. Apply suffix patterns consistently across pages, forms, modals, cards, and other specialized component categories.

### When NOT to use?

Don't enforce strict suffix patterns for small personal projects with fewer than 10 components, quick prototypes, or learning projects where simplicity is preferred over organization. Also skip for legacy codebases where changing naming would break too many imports.

### Example

```typescript
// Good: Clear suffix-based naming
import { AssetListPage } from '@/pages/assets/AssetListPage';
import { LoginForm } from '@/components/forms/LoginForm';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { MetricCard } from '@/components/common/MetricCard';

// Bad: Ambiguous naming without suffixes
import { AssetList } from '@/pages/AssetList'; // Is this a page or component?
import { Login } from '@/components/Login'; // Is this a form or page?
```

### Checklist

- [ ] All pages have Page suffix
- [ ] All forms have Form suffix
- [ ] All modals have Modal suffix
- [ ] All specialized components use appropriate suffix
- [ ] Base generic components have no suffix
- [ ] Component files use PascalCase naming

### Troubleshooting

**Issue**: Confusion about which suffix to use
**Solution**: Refer to the suffix table and ask: Is this a complete page? Use Page. Is it a form? Use Form. Is it reusable and generic? No suffix needed.

**Issue**: Import paths become too long with suffixes
**Solution**: Use path aliases configured in tsconfig.json to shorten imports. Example: `@/components/common/ConfirmModal` instead of relative paths.

### Best Practices

- Start with suffix patterns from project inception to avoid massive refactoring later
- Use find/grep commands to locate all components of same category quickly
- Keep suffix patterns consistent across team members by documenting in project README

## [Suffix Table by Category - Component Types and Location Mapping]()

Comprehensive mapping table showing all component categories with their corresponding suffix patterns, practical examples, and recommended file system locations in the project structure for proper organization.

| Category | Suffix | Example | Location |
|-----------|--------|---------|-------------|
| **Pages** | `Page` | `AssetListPage.tsx` | `src/pages/` |
| **Layouts** | `Layout` | `MainLayout.tsx` | `src/components/layouts/` |
| **Sections** | `Section` | `HeaderSection.tsx`, `HeroSection.tsx` | `src/components/sections/` |
| **Modals** | `Modal` | `ConfirmModal.tsx` | `src/components/common/` |
| **Forms** | `Form` | `LoginForm.tsx`, `AssetForm.tsx` | `src/components/forms/` |
| **Cards** | `Card` | `MetricCard.tsx` | `src/components/common/` |
| **Charts** | `Chart` | `LineChart.tsx` | `src/components/common/` |
| **Dropdowns** | `Dropdown` | `AlertsDropdown.tsx` | `src/components/common/` |
| **Popovers** | `Popover` | `AssetPopover.tsx` | `src/components/common/` |
| **Custom Buttons** | `Button` | `SubmitButton.tsx` | `src/components/common/` |
| **Custom Inputs** | `Input` | `DateInput.tsx` | `src/components/common/` |
| **Containers** | `Container` | `DataContainer.tsx` | `src/components/containers/` |
| **Providers** | `Provider` | `AuthProvider.tsx` | `src/contexts/` |
| **Hooks** | `use[Name]` | `useAuth.ts`, `useNotifications.ts` | `src/hooks/` |
| **Guards** | `Route` | `PrivateRoute.tsx` | `src/components/guards/` |
| **Base Components** | no suffix | `Button.tsx`, `Input.tsx` | `src/components/common/` |

### When to use?

Reference this table when creating new components to determine the correct suffix based on component type and purpose. Use it during code reviews to ensure consistency across the codebase.

### When NOT to use?

Don't use this table as strict enforcement for components with highly specific names that already clearly indicate their purpose (like Sidebar, Header, Footer, Tooltip).

### Example

```typescript
// Applying suffix table in practice
import { MainLayout } from '@/components/layouts/MainLayout';        // Layout suffix
import { LoginForm } from '@/components/forms/LoginForm';            // Form suffix
import { MetricCard } from '@/components/common/MetricCard';         // Card suffix
import { useAuth } from '@/hooks/useAuth';                           // use prefix
import { AuthProvider } from '@/contexts/AuthProvider';              // Provider suffix
```

### Checklist

- [ ] New component category identified correctly
- [ ] Appropriate suffix applied from table
- [ ] Component placed in correct folder location
- [ ] Naming convention documented if new category added

### Troubleshooting

**Issue**: Component doesn't fit any existing category
**Solution**: If component is truly unique, either extend table with new category or use descriptive name without suffix if highly specific.

**Issue**: Uncertainty between two categories (e.g., Card vs Section)
**Solution**: Ask: Is it reusable across multiple pages (Card) or page-specific visual block (Section)?

### Best Practices

- Keep table updated when introducing new component categories
- Share table with all team members for consistent application
- Use table as reference during onboarding of new developers

## [Section vs Common Component - Distinguishing Page-Specific from Reusable Elements]()

Clarifies the critical distinction between Section components that represent complete page-specific visual blocks used once per page, and Common components that are highly reusable generic elements configurable through props.

### When to use?

Use Section components when building page-specific visual blocks like headers, heroes, features sections, or footers that contain specific structure and layout. Use Common components for highly reusable elements like buttons, inputs, cards, modals that appear multiple times across different pages.

### When NOT to use?

Don't create Section components for small reusable elements that could be Common components. Don't create Common components for highly page-specific layouts that won't be reused elsewhere.

### Example

```typescript
// Section: Page-specific visual block
// src/components/sections/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="hero">
      <h1>Welcome to Our Platform</h1>
      <p>Specific layout and content for homepage hero</p>
    </section>
  );
}

// Common: Reusable generic component
// src/components/common/Button.tsx
export function Button({ children, onClick, variant }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### Checklist

- [ ] Section components are page-specific visual blocks
- [ ] Section components typically used once per page
- [ ] Common components are highly reusable
- [ ] Common components are configurable via props
- [ ] Clear distinction maintained in folder structure

### Troubleshooting

**Issue**: Unclear if component should be Section or Common
**Solution**: Ask: Will this be used on multiple pages with different content? If yes, make it Common. Is it a specific page layout block? Make it Section.

**Issue**: Section becoming too generic and reusable
**Solution**: Refactor into Common component by extracting configurable parts into props.

### Best Practices

- Keep Sections page-specific and layout-focused
- Keep Common components generic and prop-driven
- Refactor Sections into Common when reuse pattern emerges across multiple pages

## [Folder Structure Evolution - From Minimal Setup to Production Architecture]()

Explains the recommended folder organization evolution from a minimal structure suitable for small projects and MVPs to a complete modular structure for production applications with specialized subfolders for different component categories and clear migration path.

### When to use?

Start with minimal structure for new projects and MVPs with fewer than 10 components. Migrate to complete structure when project reaches 20+ components, requires multiple specialized folders, or has team members who need clear organization to find components quickly.

### When NOT to use?

Don't use complete structure with many subfolders for simple projects, prototypes, or single-page applications. Avoid over-organizing small codebases as it adds unnecessary complexity without benefit.

### Example

```
# Minimal structure - good for starting projects
src/
├── components/common/     # All reusable components
├── pages/                 # All pages
├── services/              # API services
└── hooks/                 # Custom hooks

# Complete structure - good for production projects
src/
├── components/
│   ├── common/           # Generic reusable components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   ├── sections/         # Section components
│   └── guards/           # Route guards
├── pages/                # Pages organized by feature
├── services/             # API services
└── hooks/                # Custom hooks
```

### Checklist

- [ ] Folder structure matches project size and complexity
- [ ] Components organized in appropriate subfolders
- [ ] Imports use consistent path aliases
- [ ] Team members can easily locate components
- [ ] Migration plan exists if structure needs to scale

### Troubleshooting

**Issue**: Too many files in components/common folder becoming hard to navigate
**Solution**: Create specialized subfolders like forms/, modals/, cards/ and move related components. Update all import statements.

**Issue**: Unsure when to create new subfolder
**Solution**: Create subfolder when you have 3+ components of same category (3+ forms, 3+ layouts, etc).

### Best Practices

- Start minimal and evolve structure as project grows rather than over-organizing from the start
- Document folder structure conventions in project README for team alignment
- Use automated tools or scripts to help migrate components when restructuring folders

## [Minimal Structure - Initial Setup for Small Projects]()

Simplified folder structure suitable for new projects, small applications with fewer than 10 components, and MVPs where quick iteration and simplicity matter more than extensive organization.

```
src/
├── components/
│   └── common/              # All reusable components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── MetricCard.tsx
├── pages/                   # Application pages
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── HomePage.tsx
├── services/                # API services
│   ├── api.ts              # Axios instance
│   └── auth.service.ts
├── contexts/                # Context providers
│   └── AuthProvider.tsx
├── hooks/                   # Custom hooks
│   └── useAuth.ts
├── types/                   # TypeScript types
└── utils/                   # Utility functions
```

### When to use?

Use minimal structure during initial setup, for small projects with fewer than 10 components, for MVPs requiring rapid development, or when starting a new project where complexity hasn't yet emerged.

### When NOT to use?

Don't use minimal structure for projects with more than 20 components, production applications with multiple feature modules, or teams with more than 3 developers working on frontend simultaneously.

### Example

```typescript
// Minimal structure import example
import { Button } from '@/components/common/Button';
import { LoginPage } from '@/pages/LoginPage';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
```

### Checklist

- [ ] Project has fewer than 10 total components
- [ ] All components fit logically in common/ folder
- [ ] Team size is small (1-3 developers)
- [ ] No specialized component categories needed yet
- [ ] Import paths remain simple and clear

### Troubleshooting

**Issue**: Components/common folder becoming cluttered with many files
**Solution**: Time to migrate to complete structure. Start by moving forms to dedicated forms/ folder.

**Issue**: Difficulty finding specific components
**Solution**: Consider creating specialized subfolders for categories with 3+ components.

### Best Practices

- Keep structure flat and simple until complexity demands organization
- Monitor component count and restructure when approaching 15-20 components
- Document when to migrate to complete structure in project README

**Note**: This shows the internal frontend/src/ folder structure. For the complete project root organization including where frontend/, backend/, and build/ folders should be located, see [Project Root Structure](./project-root-structure.md).

## [Complete Structure - Production-Ready Modular Architecture]()

Comprehensive folder structure with specialized subfolders for different component categories, organized for production applications with 20+ components, multiple feature modules, and teams requiring clear organization and maintainability.

```
src/
├── components/
│   ├── common/              # Reusable base components
│   │   ├── Button.tsx       # Base component without suffix
│   │   ├── Input.tsx        # Base component without suffix
│   │   ├── Modal.tsx        # Base component without suffix
│   │   ├── ConfirmModal.tsx # Specific modal with suffix
│   │   ├── MetricCard.tsx   # Card with suffix
│   │   ├── LineChart.tsx    # Chart with suffix
│   │   └── AlertsDropdown.tsx
│   ├── forms/               # Specific forms
│   │   ├── LoginForm.tsx
│   │   ├── AssetForm.tsx
│   │   └── SearchForm.tsx
│   ├── layouts/             # Page layouts
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── sections/            # Page sections
│   │   ├── HeaderSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   └── FooterSection.tsx
│   ├── containers/          # Logical containers
│   │   ├── DataContainer.tsx
│   │   └── AuthContainer.tsx
│   └── guards/              # Route protection
│       ├── PrivateRoute.tsx
│       └── AdminRoute.tsx
├── pages/                   # Complete pages
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── ChangePasswordPage.tsx
│   ├── assets/
│   │   ├── AssetListPage.tsx
│   │   ├── AssetFormPage.tsx
│   │   └── AssetProfilePage.tsx
│   └── dashboard/
│       ├── OverviewPage.tsx
│       └── PerformancePage.tsx
├── services/                # API services
│   ├── api.ts              # Axios instance
│   ├── auth.service.ts
│   ├── asset.service.ts
│   └── user.service.ts
├── contexts/                # Context providers
│   ├── AuthProvider.tsx
│   ├── ToastProvider.tsx
│   └── ThemeProvider.tsx
├── hooks/                   # Custom hooks
│   ├── useAuth.ts
│   ├── useNotifications.ts
│   └── useDebounce.ts
├── types/                   # TypeScript types/interfaces
│   ├── auth.ts
│   └── models/
│       ├── user.ts
│       └── asset.ts
├── utils/                   # Utility functions
│   ├── currency.utils.ts
│   └── date.utils.ts
└── config/                  # Configurations
    └── routes.config.tsx
```

### When to use?

Use complete structure for production projects with more than 20 components, applications with multiple feature modules, teams with 3+ developers, or when code organization and discoverability become critical for productivity.

### When NOT to use?

Don't use complete structure for small projects, prototypes, or MVPs where the overhead of many folders creates unnecessary complexity without tangible benefits.

### Example

```typescript
// Complete structure import example
import { MainLayout } from '@/components/layouts/MainLayout';
import { LoginForm } from '@/components/forms/LoginForm';
import { HeaderSection } from '@/components/sections/HeaderSection';
import { PrivateRoute } from '@/components/guards/PrivateRoute';
import { MetricCard } from '@/components/common/MetricCard';
```

### Checklist

- [ ] Project has 20+ components
- [ ] Multiple component categories exist (forms, layouts, sections)
- [ ] Team has 3+ developers working on frontend
- [ ] Clear separation of concerns needed
- [ ] Component discoverability is important

### Troubleshooting

**Issue**: Too many folders making navigation complex
**Solution**: Only create folders for categories with 3+ components. Consolidate if some folders have only 1-2 files.

**Issue**: Uncertainty about which folder for new component
**Solution**: Follow suffix table - suffix determines folder. No suffix base components go in common/.

### Best Practices

- Create specialized folders only when you have 3+ components of that category
- Keep folder structure documented in project README
- Use consistent path aliases to simplify imports across deep folder structure

## [Migration Path - From Minimal to Complete Structure]()

Step-by-step migration strategy for evolving folder structure from minimal to complete as project complexity grows, with clear triggers for when to create specialized subfolders and practical commands for reorganization.

**When to create specialized subfolders:**

1. **`forms/`**: When you have 3+ specific forms
2. **`layouts/`**: When you have 2+ different layouts (ex: auth + dashboard)
3. **`sections/`**: When you have large reusable sections in multiple pages
4. **`guards/`**: When implementing access control (ex: PrivateRoute, AdminRoute)
5. **`containers/`**: When you have components with complex state logic

**Migration commands:**
```bash
# Create new folders
mkdir -p src/components/{forms,layouts,sections,guards,containers}

# Move files
mv src/components/common/LoginForm.tsx src/components/forms/
mv src/components/common/MainLayout.tsx src/components/layouts/
mv src/components/common/HeaderSection.tsx src/components/sections/

# Update imports in components (use IDE find-and-replace)
```

### When to use?

Migrate when you have 3+ components in a category, when components/common folder exceeds 15-20 files, or when team members report difficulty finding components.

### When NOT to use?

Don't migrate prematurely before reaching thresholds. Don't create folders for categories with only 1-2 components.

### Example

```bash
# Before migration - all in common/
src/components/common/
├── Button.tsx
├── LoginForm.tsx
├── SignupForm.tsx
├── AssetForm.tsx
├── MainLayout.tsx
└── HeaderSection.tsx

# After migration - organized by category
src/components/
├── common/
│   └── Button.tsx
├── forms/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── AssetForm.tsx
├── layouts/
│   └── MainLayout.tsx
└── sections/
    └── HeaderSection.tsx
```

### Checklist

- [ ] Identified components to migrate based on category count
- [ ] Created new specialized folders
- [ ] Moved component files to new locations
- [ ] Updated all import statements across codebase
- [ ] Verified application still builds and runs
- [ ] Updated documentation to reflect new structure

### Troubleshooting

**Issue**: Many broken imports after moving files
**Solution**: Use IDE refactoring feature to move files and automatically update imports. Or use find-and-replace across project.

**Issue**: Unsure if it's time to migrate
**Solution**: Use "rule of 3" - create subfolder when you have 3+ components of same category.

### Best Practices

- Migrate incrementally by category rather than all at once
- Use version control to track migration and enable easy rollback if needed
- Communicate migration plan with team before making widespread changes

## [PascalCase Naming Convention - Component File and Function Names]()

Mandatory naming convention requiring all React components to use PascalCase for both file names and function names, ensuring exact matching between file name and exported component name for consistency and tooling support.

### When to use?

Apply PascalCase naming consistently for all React component files and their exported function names. Use for all .tsx component files throughout the project.

### When NOT to use?

Don't use PascalCase for non-React files like utility functions (use camelCase), TypeScript type files (types use PascalCase but files can be lowercase), or configuration files (use lowercase with hyphens or dots).

### Example

```typescript
// Good: PascalCase component naming
// File: MetricCard.tsx
export function MetricCard() { /* ... */ }

// File: AssetListPage.tsx
export function AssetListPage() { /* ... */ }

// File: LoginForm.tsx
export function LoginForm() { /* ... */ }

// Bad: Incorrect casing
// File: metricCard.tsx (wrong: camelCase)
export function metricCard() { /* ... */ }

// File: asset-list-page.tsx (wrong: kebab-case)
export function AssetListPage() { /* ... */ }
```

### Checklist

- [ ] All component files use PascalCase
- [ ] Component name matches file name exactly
- [ ] File extensions are .tsx for components
- [ ] No camelCase or kebab-case in component names
- [ ] Exported function name matches file name

### Troubleshooting

**Issue**: ESLint complaining about component naming
**Solution**: Ensure component function name matches file name and uses PascalCase. Configure ESLint rules for React naming conventions.

**Issue**: Import auto-completion not working
**Solution**: Verify component is exported correctly and file name matches export name exactly. Check tsconfig paths are configured properly.

### Best Practices

- Export component with same name as file for better IDE autocomplete and refactoring support
- Use named exports instead of default exports for easier code searching and refactoring
- Keep one component per file with matching names to maintain clear file organization

## [Hook Naming Convention - use Prefix for Custom Hooks]()

Mandatory naming convention requiring all custom React hooks to have "use" prefix in both file name and function name, following React's hook naming rules and enabling React to enforce hook rules correctly.

### When to use?

Apply "use" prefix to all custom hooks that use React hooks internally (useState, useEffect, etc.) or other custom hooks. Use for all hook files in src/hooks/ directory.

### When NOT to use?

Don't use "use" prefix for regular utility functions that don't use React hooks internally. Don't apply to services, helpers, or pure functions that aren't hooks.

### Example

```typescript
// Good: Correct use prefix
// File: useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  return { user };
}

// File: useNotifications.ts
export function useNotifications() { /* ... */ }

// File: useDebounce.ts
export function useDebounce(value: string, delay: number) { /* ... */ }

// Bad: Missing use prefix
// File: auth.ts (wrong: no prefix)
export function auth() { /* ... */ }

// File: notifications.ts (wrong: no prefix)
export function notifications() { /* ... */ }
```

### Checklist

- [ ] All custom hooks have "use" prefix
- [ ] Hook file name matches function name
- [ ] Hooks placed in src/hooks/ directory
- [ ] File extensions are .ts (unless returning JSX, then .tsx)
- [ ] Only functions using React hooks have "use" prefix

### Troubleshooting

**Issue**: ESLint warning about hooks called incorrectly
**Solution**: Ensure hook function starts with "use" prefix. React enforces hook rules only for functions named with "use".

**Issue**: TypeScript errors when importing hook
**Solution**: Verify hook is exported with "use" prefix and file name matches exactly.

### Best Practices

- Always start custom hook names with "use" to follow React conventions
- Place all custom hooks in dedicated src/hooks/ folder
- Export hooks with named exports for better refactoring support

## [Provider Naming Convention - Provider Suffix for Context Providers]()

Naming convention requiring all React Context providers to have "Provider" suffix in both file name and function name, distinguishing providers from contexts and maintaining clarity in component hierarchy.

### When to use?

Apply "Provider" suffix to all React Context provider components that wrap part of the component tree and provide context values. Use for all provider files in src/contexts/ directory.

### When NOT to use?

Don't use "Provider" suffix for the Context itself (use plain name like AuthContext). Don't apply to hooks that consume context (use "use" prefix instead).

### Example

```typescript
// Good: Correct Provider suffix
// File: AuthProvider.tsx
import { createContext } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={/* ... */}>
      {children}
    </AuthContext.Provider>
  );
}

// File: ToastProvider.tsx
export function ToastProvider({ children }) { /* ... */ }

// Bad: Incorrect naming
// File: AuthContext.tsx (wrong: Context instead of Provider)
export function AuthContext() { /* ... */ }

// File: Auth.tsx (wrong: missing Provider suffix)
export function Auth() { /* ... */ }
```

### Checklist

- [ ] All context providers have "Provider" suffix
- [ ] Provider file name matches function name
- [ ] Providers placed in src/contexts/ directory
- [ ] Context object uses separate naming (e.g., AuthContext)
- [ ] File extensions are .tsx

### Troubleshooting

**Issue**: Confusion between Context and Provider naming
**Solution**: Context is the object created with createContext(). Provider is the component that wraps tree. Use "Provider" suffix only for component.

**Issue**: Import conflicts between Context and Provider
**Solution**: Export both from same file but with clear names: AuthContext (object) and AuthProvider (component).

### Best Practices

- Export both Context object and Provider component from same file
- Name Context without suffix (AuthContext) and Provider with suffix (AuthProvider)
- Place all providers in src/contexts/ folder for easy discovery

## [Base Component Naming - No Suffix for Primitive Generic Components]()

Naming exception for primitive base components that are highly generic and reusable, allowing them to omit suffixes since their names alone clearly indicate their purpose and function.

### When to use?

Use no suffix for primitive generic base components like Button, Input, Modal, Card that serve as foundation for more specific variants. Apply to highly reusable components in src/components/common/.

### When NOT to use?

Don't omit suffix for specialized variants of base components (use SubmitButton, not Submit). Don't skip suffix for page-specific or category-specific components.

### Example

```typescript
// Good: Base components without suffix
// File: Button.tsx
export function Button() { /* ... */ }

// File: Input.tsx
export function Input() { /* ... */ }

// File: Modal.tsx
export function Modal() { /* ... */ }

// File: Card.tsx
export function Card() { /* ... */ }

// Good: Specialized variants with suffix
// File: SubmitButton.tsx
export function SubmitButton() { /* ... */ }

// File: ConfirmModal.tsx
export function ConfirmModal() { /* ... */ }

// File: MetricCard.tsx
export function MetricCard() { /* ... */ }
```

### Checklist

- [ ] Base primitive components have no suffix
- [ ] Specialized variants of base components have suffix
- [ ] Base components are truly generic and reusable
- [ ] Clear distinction between base and specialized variants

### Troubleshooting

**Issue**: Confusion about when to omit suffix
**Solution**: Ask: Is this the most basic, generic version? If yes, no suffix. Is it specialized or specific variant? Add suffix.

**Issue**: Base component becoming too specific
**Solution**: Extract specific logic into new specialized component with suffix. Keep base component truly generic.

### Best Practices

- Keep base components minimal and generic
- Create specialized variants with suffixes for specific use cases
- Use base components as foundation for more complex components

## [Practical Naming Examples - Real-World Component Systems]()

Real-world examples showing how naming patterns are applied to common component systems like modals, cards, pages and forms, demonstrating consistency and practical implementation.

### Example 1: Modal System
```
src/components/common/
├── Modal.tsx              # Generic base component
├── ConfirmModal.tsx       # Confirmation modal
├── AlertModal.tsx         # Alert modal
├── CommentModal.tsx       # Comment modal
└── SelectWalletModal.tsx  # Wallet selection modal
```

### Example 2: Card System
```
src/components/common/
├── Card.tsx               # Generic base component
├── MetricCard.tsx         # Metric card
├── StatCard.tsx           # Statistic card
├── AssetCard.tsx          # Asset card
└── ProfileCard.tsx        # Profile card
```

### Example 3: Asset Pages
```
src/pages/assets/
├── AssetListPage.tsx      # Asset listing
├── AssetFormPage.tsx      # Creation/editing form
├── AssetProfilePage.tsx   # Detailed profile
└── AssetDashboardPage.tsx # Asset dashboard
```

### Example 4: Forms
```
src/components/forms/
├── LoginForm.tsx          # Login form
├── SignupForm.tsx         # Signup form
├── AssetForm.tsx          # Asset form
├── SearchForm.tsx         # Search form
└── FilterForm.tsx         # Filter form
```

### When to use?

Use these examples as templates when creating new component systems. Follow the pattern of base component without suffix plus specialized variants with suffixes.

### When NOT to use?

Don't blindly copy patterns without considering your specific needs. Adapt patterns to match your application's domain and component requirements.

### Example

```typescript
// Following modal system pattern for notification system
src/components/common/
├── Notification.tsx         // Base component
├── SuccessNotification.tsx  // Success variant
├── ErrorNotification.tsx    // Error variant
└── WarningNotification.tsx  // Warning variant
```

### Checklist

- [ ] Base component without suffix exists
- [ ] Specialized variants use consistent suffix
- [ ] All variants follow same pattern
- [ ] System is easy to extend with new variants

### Troubleshooting

**Issue**: Too many specialized variants cluttering folder
**Solution**: Consider if all variants are necessary or if some can be consolidated with props configuration.

**Issue**: Unclear naming for new variant
**Solution**: Follow pattern of existing variants and use descriptive prefix with consistent suffix.

### Best Practices

- Start with base component and add specialized variants as needed
- Keep consistent naming pattern across all variants in a system
- Document the pattern when creating new component systems for team reference

## [Advantages of Suffix Pattern - Benefits for Code Organization]()

Explains the key benefits of using suffix patterns in component naming including quick visual identification, easier search capabilities, name collision avoidance, and self-documenting code that improves developer productivity.

### Quick Visual Identification
Suffix allows immediate identification of component type when reading code:
```typescript
import { AssetListPage } from '@/pages/assets/AssetListPage';
import { MetricCard } from '@/components/common/MetricCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { LineChart } from '@/components/common/LineChart';
// Without looking at folder, I already know: Page, Card, Modal, Chart
```

### Easier Search
Search by suffix pattern finds all components of category:
```bash
# Find all pages
find src -name "*Page.tsx"

# Find all modals
find src -name "*Modal.tsx"

# Find all charts
find src -name "*Chart.tsx"
```

### Avoids Name Collision
Suffixes allow related names without conflict:
```
AssetList.tsx          # ❌ Ambiguous: is it page or component?
AssetListPage.tsx      # ✅ Clearly a page
AssetListCard.tsx      # ✅ Clearly a card
```

### Self-documentation
Code becomes self-documented by name:
```typescript
// Self-explanatory code
<AssetListPage>
  <HeaderSection />
  <SearchForm />
  <MetricCard />
  <LineChart />
  <DataContainer>
    <AssetCard />
  </DataContainer>
  <ConfirmModal />
</AssetListPage>
```

### When to use?

Use suffix patterns in all medium to large React projects where multiple developers collaborate, code needs to be maintained long-term, or component categories need to be quickly distinguishable. Apply consistently across the entire codebase for maximum benefit.

### When NOT to use?

Don't enforce suffix patterns in very small projects with fewer than 10 total components where the overhead of suffixes outweighs benefits, or in experimental prototypes where rapid iteration matters more than organization.

### Example

```bash
# Example: Finding all forms in project for audit
find src -name "*Form.tsx"
# Output:
# src/components/forms/LoginForm.tsx
# src/components/forms/SignupForm.tsx
# src/components/forms/AssetForm.tsx

# Example: Self-documenting component tree
<DashboardPage>          {/* Clearly a page */}
  <MainLayout>           {/* Clearly a layout */}
    <SearchForm />       {/* Clearly a form */}
    <MetricCard />       {/* Clearly a card */}
    <ConfirmModal />     {/* Clearly a modal */}
  </MainLayout>
</DashboardPage>
```

### Checklist

- [ ] Suffix patterns documented and shared with team
- [ ] All components follow suffix conventions
- [ ] Team members understand which suffix to use for new components
- [ ] Search scripts or tools leverage suffix patterns
- [ ] Code reviews check for suffix compliance

### Troubleshooting

**Issue**: Team members forget to use suffixes
**Solution**: Add ESLint custom rules or pre-commit hooks to enforce suffix patterns. Document patterns prominently in README.

**Issue**: Refactoring existing code to add suffixes breaks many imports
**Solution**: Use IDE refactoring tools to rename files and automatically update imports. Do it incrementally by folder or feature.

### Best Practices

- Establish suffix patterns at project start to avoid costly refactoring later
- Use tooling to enforce patterns automatically through linting or pre-commit checks
- Document suffix table in project README for easy team reference

## [Import Organization - Standard Import Order Convention]()

Defines the standard import order convention to maintain clean and organized code by grouping imports into categories ordered by dependency level from external libraries to internal application code.

Keep imports organized by category:

```typescript
// 1. React and external libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Pages
import { AssetListPage } from '@/pages/assets/AssetListPage';

// 3. Layouts and Sections
import { MainLayout } from '@/components/layouts/MainLayout';
import { HeaderSection } from '@/components/sections/HeaderSection';

// 4. Forms
import { AssetForm } from '@/components/forms/AssetForm';

// 5. Common components
import { MetricCard } from '@/components/common/MetricCard';
import { LineChart } from '@/components/common/LineChart';
import { ConfirmModal } from '@/components/common/ConfirmModal';

// 6. Hooks
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// 7. Services and utils
import { assetService } from '@/services/asset.service';
import { formatCurrency } from '@/utils/currency.utils';

// 8. Types
import type { Asset } from '@/types/models/asset';

// 9. Styles (if using CSS modules)
import styles from './AssetListPage.module.css';
```

### When to use?

Apply this import order convention to all component files for consistency. Use blank lines to separate import categories and improve readability.

### When NOT to use?

Don't enforce strict import ordering in very small files with only 2-3 imports where organization adds no value.

### Example

```typescript
// Good: Organized imports by category
import { useState } from 'react';

import { MainLayout } from '@/components/layouts/MainLayout';

import { LoginForm } from '@/components/forms/LoginForm';
import { Button } from '@/components/common/Button';

import { useAuth } from '@/hooks/useAuth';

import { authService } from '@/services/auth.service';

import type { User } from '@/types/models/user';

// Bad: Mixed import order
import { authService } from '@/services/auth.service';
import type { User } from '@/types/models/user';
import { useState } from 'react';
import { LoginForm } from '@/components/forms/LoginForm';
import { useAuth } from '@/hooks/useAuth';
```

### Checklist

- [ ] Imports grouped by category
- [ ] Blank lines separate categories
- [ ] React and external libraries first
- [ ] Internal imports ordered by dependency level
- [ ] Types imported with type keyword
- [ ] Styles imported last

### Troubleshooting

**Issue**: Auto-import adding imports in wrong order
**Solution**: Configure IDE/editor to follow import order rules. Use ESLint plugin like eslint-plugin-import to enforce ordering.

**Issue**: Too many imports making file header cluttered
**Solution**: Consider if component is doing too much and should be split. Use barrel exports to group related imports.

### Best Practices

- Use ESLint with import ordering rules to automate organization
- Configure IDE to auto-sort imports on save
- Keep import categories documented for team consistency

## [Component Naming Checklist - Quick Reference for New Components]()

Quick reference checklist to verify that new components follow all naming conventions and organizational standards before committing code, ensuring consistency and catching errors early.

When creating a new component, check:

- [ ] Name is in PascalCase
- [ ] Correct suffix according to category
- [ ] File is in appropriate folder
- [ ] Exported component name matches file name
- [ ] Custom hooks have `use` prefix
- [ ] Providers have `Provider` suffix
- [ ] Primitive base components without suffix
- [ ] Import/export follow project convention

### When to use?

Use this checklist before committing any new component to repository. Apply during code reviews to verify naming conventions are followed.

### When NOT to use?

Don't use checklist for non-component files like utilities, services, or types that have different naming conventions.

### Example

```typescript
// Component creation checklist in practice

// ✅ Checklist passed
// File: LoginForm.tsx (PascalCase ✓)
// Location: src/components/forms/ (appropriate folder ✓)
// Export matches file name ✓
export function LoginForm() { /* ... */ }

// ❌ Checklist failed
// File: loginform.tsx (not PascalCase ✗)
// Location: src/components/common/ (wrong folder, should be forms/ ✗)
export function LoginFormComponent() { /* ... */ } // name mismatch ✗
```

### Checklist

- [ ] All new components reviewed against naming checklist
- [ ] Code reviews include checklist verification
- [ ] Team members familiar with checklist requirements
- [ ] Automated checks where possible (ESLint, pre-commit hooks)

### Troubleshooting

**Issue**: Forgetting to use checklist before committing
**Solution**: Add checklist to pull request template or pre-commit hooks to remind developers.

**Issue**: Checklist items unclear or ambiguous
**Solution**: Reference suffix table and naming rules sections for detailed explanations.

### Best Practices

- Review checklist before every component creation
- Include checklist in code review process
- Automate checklist items where possible with linting tools

## [Complete Implementation Examples - Full Component Code Samples]()

Complete implementation examples showing how naming patterns are applied in real component code with proper TypeScript typing, props interfaces, and export conventions.

### Complete Example: Modal
```typescript
// src/components/common/ConfirmModal.tsx
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </Modal>
  );
}
```

### Complete Example: Page
```typescript
// src/pages/assets/AssetListPage.tsx
import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SearchForm } from '@/components/forms/SearchForm';
import { MetricCard } from '@/components/common/MetricCard';
import { AssetCard } from '@/components/common/AssetCard';
import { useAssets } from '@/hooks/useAssets';

export function AssetListPage() {
  const { assets, loading } = useAssets();
  const [search, setSearch] = useState('');

  return (
    <MainLayout>
      <h1>My Assets</h1>
      <SearchForm onSearch={setSearch} />
      <MetricCard title="Total" value={assets.length} />
      <div className="grid">
        {assets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </MainLayout>
  );
}
```

### Complete Example: Hook
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import type { User } from '@/types/models/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authentication logic
  }, []);

  return { user, loading };
}
```

### When to use?

Use these complete examples as templates when creating new components. Follow the structure of imports, interfaces, and export patterns shown.

### When NOT to use?

Don't copy examples verbatim without adapting to your specific component requirements and business logic.

### Example

```typescript
// Following pattern for new form component
// src/components/forms/SearchForm.tsx
interface SearchFormProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchForm({ onSearch, placeholder = "Search..." }: SearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

### Checklist

- [ ] Component follows naming convention
- [ ] Props interface defined with descriptive name
- [ ] Proper TypeScript typing throughout
- [ ] Named export matches file name
- [ ] Imports organized by convention

### Troubleshooting

**Issue**: TypeScript errors with props interface
**Solution**: Ensure interface name matches component name with "Props" suffix. Export interface if used externally.

**Issue**: Import paths not resolving
**Solution**: Verify tsconfig.json path aliases are configured correctly for @ imports.

### Best Practices

- Define props interface with component name + "Props" suffix
- Use named exports for better refactoring support
- Keep TypeScript typing strict for better type safety

## [References - Related Documentation and Resources]()

Lists related documentation files and external resources for deeper understanding of React naming conventions, TypeScript best practices, and project-specific architecture patterns.

- File: `.rules/frontend-technology-stack.md` - Technology stack
- File: `.rules/how-to-create-common-components-frontend.md` - Component creation
- [React Naming Conventions](https://react.dev/learn/thinking-in-react)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

### When to use?

Reference these resources when you need deeper understanding of concepts mentioned in this document or when facing complex scenarios not covered here.

### When NOT to use?

Don't use external references as primary source of truth for this project. Always follow project-specific conventions documented here first.

### Example

```typescript
// For component creation patterns, reference:
// .rules/how-to-create-common-components-frontend.md

// For TypeScript best practices, reference:
// https://google.github.io/styleguide/tsguide.html

// For React patterns, reference:
// https://react.dev/learn/thinking-in-react
```

### Checklist

- [ ] Team familiar with related documentation files
- [ ] External resources bookmarked for reference
- [ ] Project-specific rules take precedence over external guides
- [ ] References kept up to date as project evolves

### Troubleshooting

**Issue**: Conflicting guidance between project docs and external resources
**Solution**: Always follow project-specific documentation in .rules/ folder. External resources are for general guidance only.

**Issue**: Referenced documentation file not found
**Solution**: Check if file was moved or renamed. Update references to reflect current structure.

### Best Practices

- Keep references section updated as new documentation is added
- Prioritize project-specific documentation over external resources
- Share important external resources with team through this section

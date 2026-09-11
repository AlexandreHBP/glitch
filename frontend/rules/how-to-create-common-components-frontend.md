# [How to Create Common Components in Frontend]()

Comprehensive guide to creating reusable React components with TypeScript and Tailwind CSS following component composition patterns, type safety principles, and project conventions.

## [React Common Component Design Principles]()

Common components serve as foundational UI building blocks that work across different contexts through configurable props, strict TypeScript typing, and self-contained design ensuring consistency, reusability, and maintainability throughout the application.

### When to use?

Create common components for UI elements used in multiple places across the application such as buttons, inputs, modals, cards, and other interface primitives. Common components provide consistency in design, behavior, and accessibility while reducing code duplication and improving maintainability.

### When NOT to use?

Avoid creating common components for feature-specific or domain-specific UI that only appears in one context. Don't over-abstract components that are unlikely to be reused. Simple one-off elements should remain inline in their parent components to reduce unnecessary abstraction layers.

### Example

**Common Component Characteristics**:
- **Reusable**: Work in different contexts without modification
- **Configurable**: Accept props for customization and variants
- **Typed**: Strict TypeScript interfaces for type safety
- **Self-contained**: No dependencies on specific application context
- **Documented**: Clear prop descriptions and usage examples

**File Location**:
```
src/components/common/
  Button.tsx
  Modal.tsx
  Card.tsx
  Input.tsx
  Select.tsx
  Spinner.tsx
  Alert.tsx
  Badge.tsx
  index.ts
```

### Checklist

- [ ] Component is genuinely reusable across contexts
- [ ] Props interface defined with TypeScript
- [ ] Default values provided for optional props
- [ ] Tailwind CSS used for styling
- [ ] Component accepts className for customization
- [ ] Exported through common/index.ts barrel file
- [ ] No hard-coded business logic or context dependencies

### Troubleshooting

**Component too coupled to context**: Extract context-specific logic into parent components and pass data via props to maintain reusability.

**TypeScript errors with props**: Ensure interface extends appropriate HTML element attributes when wrapping native elements for proper type inheritance.

**Styling conflicts**: Use Tailwind utility classes and allow className override for component customization while maintaining base styles.

### Best Practices

- Keep components focused on single UI responsibility
- Extend native HTML element attributes for seamless integration
- Provide sensible defaults for all optional props
- Use forwardRef when components need to expose DOM refs
- Document complex props with JSDoc comments
- Test components in isolation with various prop combinations

## [Button Component - Reusable Action Element with Variants]()

Configurable button component with variant styles (primary, secondary, danger), size options (sm, md, lg), loading state support, and full TypeScript typing extending native HTML button attributes for comprehensive customization and type safety.

### When to use?

Use Button component for all clickable actions throughout the application including form submissions, modal confirmations, navigation triggers, and action buttons ensuring consistent styling, behavior, and accessibility across all user interactions.

### When NOT to use?

Don't use Button for navigation links that should be anchor tags for SEO and accessibility. Avoid using Button when a native HTML button with minimal styling is more appropriate or when building specialized button variants with significantly different behavior.

### Example

```typescript
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

// Usage
<Button variant="primary" size="md" onClick={handleClick}>
  Save
</Button>
<Button variant="danger" loading={isSubmitting}>
  Delete
</Button>
```

### Checklist

- [ ] Extends ButtonHTMLAttributes for type safety
- [ ] Variant prop supports multiple color schemes
- [ ] Size prop provides consistent sizing options
- [ ] Loading state disables button and shows feedback
- [ ] Disabled state handled with visual feedback
- [ ] className prop allows style customization
- [ ] Spread props pass through to native button element

### Troubleshooting

**onClick not firing**: Check if loading or disabled state is preventing interaction. Verify button is not inside a form preventing default behavior.

**Styles not applying**: Verify Tailwind classes are valid and className concatenation includes spaces. Check for CSS specificity conflicts.

**TypeScript errors**: Ensure component extends ButtonHTMLAttributes and all native props are spread correctly to underlying button element.

### Best Practices

- Use semantic button variants that communicate intent
- Provide loading state for asynchronous operations
- Disable button during loading to prevent double submissions
- Allow className override for one-off customizations
- Use transition classes for smooth hover effects
- Handle disabled state with visual and cursor feedback

## [Modal Component - Dialog Overlay with Header, Body, Footer]()

Full-featured modal dialog component with overlay backdrop, header section, scrollable body content, optional footer area, and close functionality providing flexible container for forms, confirmations, and detailed content display with proper focus management.

### When to use?

Use Modal for focused user interactions requiring attention such as confirmations, forms, detailed views, or any content that should temporarily overlay the main interface while maintaining context and providing clear escape mechanisms for user control.

### When NOT to use?

Avoid Modal for simple tooltips, dropdowns, or content that should remain accessible while viewing other parts of the interface. Don't use for critical blocking operations without clear escape paths that might frustrate users.

### Example

```typescript
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Usage
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <div className="flex gap-2 justify-end">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </div>
  }
>
  <p>Are you sure you want to continue with this action?</p>
</Modal>
```

### Checklist

- [ ] isOpen state controls visibility
- [ ] onClose callback provided for closing
- [ ] Overlay backdrop allows click-to-close
- [ ] Close button in header for explicit closing
- [ ] Content scrollable when exceeding viewport height
- [ ] z-index ensures modal appears above content
- [ ] Optional footer for action buttons
- [ ] Responsive sizing with max-width and margins

### Troubleshooting

**Modal not closing**: Verify onClose callback is properly wired to state setter. Check for event propagation issues preventing overlay clicks.

**Content overflow issues**: Check max-h and overflow-auto classes are applied to modal container. Verify content doesn't have fixed heights preventing scrolling.

**Modal behind other content**: Ensure z-50 or higher z-index and verify no parent elements have stacking context issues. Check for conflicting z-index values.

### Best Practices

- Return null when not open for clean rendering
- Use fixed positioning with centered flexbox alignment
- Provide multiple close mechanisms (overlay, button, ESC key)
- Limit modal width for optimal reading and form completion
- Use overflow-auto for scrollable content when needed
- Include semantic ARIA labels for accessibility

## [Form Input Component - Text Field with Label and Validation]()

Versatile input field component with integrated label, error message display, focus states, and validation feedback extending native HTML input attributes while providing consistent styling and user experience across all forms.

### When to use?

Use Input component for all text-based form fields including text, email, password, number, and other input types ensuring consistent styling, label positioning, error display, and validation feedback throughout all forms in the application.

### When NOT to use?

Avoid Input for textarea, select, checkbox, or radio inputs which require specialized components with different interaction patterns. Don't use when building custom input types with significantly different visual requirements or behavior.

### Example

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium mb-1 text-gray-700">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Usage
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Checklist

- [ ] Uses forwardRef for form library compatibility
- [ ] Extends InputHTMLAttributes for type safety
- [ ] Label prop for accessible field labeling
- [ ] Error prop displays validation messages
- [ ] Focus ring provides visual feedback
- [ ] Error state changes border and ring color
- [ ] Disabled state styled appropriately
- [ ] displayName set for debugging

### Troubleshooting

**Ref not working with form libraries**: Ensure forwardRef is implemented and ref parameter is passed to input element. Verify form library is compatible.

**Label not associated**: Consider using htmlFor attribute if label needs explicit association with input id for improved accessibility.

**Error styles not showing**: Verify error prop is being passed and className concatenation includes proper spacing. Check Tailwind configuration includes error colors.

### Best Practices

- Use forwardRef for compatibility with React Hook Form and similar libraries
- Provide visual error feedback through border and ring colors
- Display error messages below input for clear validation feedback
- Handle disabled state with both visual styling and cursor changes
- Set displayName for better debugging in React DevTools
- Allow className override for custom styling needs

## [Select Dropdown Component - Choice Input with Options]()

Dropdown selection component with label support, error display, dynamic option rendering from array, and full native select element functionality providing consistent styling and user experience for choice-based inputs.

### When to use?

Use Select component for dropdown choice inputs where users select from predefined options including status dropdowns, category selection, filter controls, and any scenario requiring single-choice selection from a known set of values.

### When NOT to use?

Avoid Select for large option lists where search/autocomplete is needed, multi-select scenarios, or when building custom dropdown UI with advanced features like icons, images, or complex option rendering requiring custom components.

### Example

```typescript
import { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}

      <select
        className={`
          w-full px-3 py-2 border rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

// Usage
<Select
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  error={errors.status}
/>
```

### Checklist

- [ ] Extends SelectHTMLAttributes for type safety
- [ ] Options prop accepts array of value/label objects
- [ ] Label and error props for consistent form styling
- [ ] Maps options with unique keys
- [ ] Matches Input component styling for consistency
- [ ] Error state changes border and ring colors
- [ ] Disabled state handled appropriately

### Troubleshooting

**Wrong value selected**: Ensure option values match the format expected by controlled state (string vs number). Verify type consistency between state and options.

**Missing options**: Verify options array is populated before rendering and map function has proper key. Check for undefined or null values.

**Styling inconsistencies**: Ensure Select uses same base classes as Input component for visual consistency across form elements.

### Best Practices

- Define SelectOption interface for type-safe option arrays
- Use meaningful value properties that work with backend data
- Keep option labels concise and user-friendly
- Match Input component styling for form consistency
- Include empty/placeholder option when appropriate
- Handle empty options array gracefully

## [Card Container Component - Bordered Content Container]()

Versatile card container component with optional header, scrollable body content, and footer section providing consistent bordered, shadowed containers for grouping related content and creating visual hierarchy throughout the application.

### When to use?

Use Card component to group related content, create visual containers, display summaries, organize dashboard widgets, or wrap forms providing clear visual boundaries and consistent styling for content sections that need visual separation.

### When NOT to use?

Avoid Card for simple div wrappers without visual distinction needs, full-page layouts, or when simpler container elements are sufficient without the visual weight of borders and shadows that might create unnecessary visual complexity.

### Example

```typescript
import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function Card({ title, children, className = '', footer }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      <div className="p-4">{children}</div>

      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}

// Usage
<Card
  title="User Statistics"
  footer={<Button>View Details</Button>}
>
  <div className="space-y-2">
    <p>Total Users: 1,234</p>
    <p>Active Today: 567</p>
  </div>
</Card>
```

### Checklist

- [ ] Optional title prop for header section
- [ ] Children prop for main content
- [ ] Optional footer prop for action area
- [ ] className prop allows customization
- [ ] Consistent padding and spacing
- [ ] Border and shadow for visual separation
- [ ] Conditional rendering for optional sections

### Troubleshooting

**Card not visible**: Ensure parent container has appropriate background color to contrast with white card background. Check for z-index or opacity issues.

**Content overflow**: Add overflow handling classes to card or content sections as needed. Verify content width doesn't exceed card boundaries.

**Spacing issues**: Verify padding classes are consistent and not overridden by custom className. Check for margin collapse issues.

### Best Practices

- Use title for card identification and context
- Keep card content focused on related information
- Use footer for actions related to card content
- Allow className override for layout flexibility
- Maintain consistent padding throughout sections
- Use semantic HTML structure within card content

## [Loading Spinner Component - Animated Progress Indicator]()

Animated loading indicator component with configurable sizes (sm, md, lg) using CSS animations and Tailwind utilities providing visual feedback during asynchronous operations and data loading states with proper accessibility labels.

### When to use?

Use Spinner component to indicate loading states during data fetching, form submission, page transitions, or any asynchronous operation where users should wait for completion providing clear visual feedback that prevents confusion and improves user experience.

### When NOT to use?

Avoid Spinner for very fast operations (under 200ms) where loading indicator would flash creating visual noise, or when more specific progress indicators like progress bars are more appropriate for long-running operations with measurable progress.

### Example

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`
        animate-spin rounded-full
        border-gray-300 border-t-blue-600
        ${sizes[size]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Usage
<Spinner size="lg" />
<Spinner size="sm" className="mr-2" />
```

### Checklist

- [ ] Size variants provide flexible scaling
- [ ] Uses Tailwind animate-spin utility
- [ ] Circular border with colored segment
- [ ] ARIA role and label for accessibility
- [ ] Screen reader text for context
- [ ] className prop for positioning
- [ ] Consistent with application color scheme

### Troubleshooting

**Animation not working**: Verify Tailwind CSS is configured and animate-spin utility is available. Check for conflicting CSS animations.

**Size not matching context**: Use appropriate size variant or custom className for specific use cases. Verify border width scales with size.

**Screen readers not announcing**: Ensure role="status" and aria-label are present. Verify sr-only class hides text visually but keeps it accessible.

### Best Practices

- Use appropriate size for context (sm for buttons, lg for full-page loading)
- Include aria-label and screen reader text for accessibility
- Match spinner colors to application theme
- Center spinner when used as full-page loading indicator
- Combine with Button component for loading button states
- Consider skeleton loaders for content-heavy loading states

## [Alert Message Component - User Feedback Notifications]()

Dismissible alert component with type variants (success, error, warning, info) providing color-coded user feedback messages with optional close functionality for confirmations, errors, warnings, and informational notices ensuring consistent messaging.

### When to use?

Use Alert component to display user feedback messages including success confirmations, error notifications, warnings about actions, or informational notices ensuring consistent styling and behavior across all feedback scenarios throughout the application.

### When NOT to use?

Avoid Alert for validation errors that should appear inline with form fields, toast notifications that should auto-dismiss and float above content, or critical blocking errors that require modal dialog treatment for user acknowledgment.

### Example

```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-300',
    error: 'bg-red-50 text-red-800 border-red-300',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    info: 'bg-blue-50 text-blue-800 border-blue-300',
  };

  return (
    <div className={`p-4 rounded border ${styles[type]} flex items-start justify-between`}>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 font-bold hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// Usage
<Alert type="success" message="Changes saved successfully!" onClose={() => setShowAlert(false)} />
<Alert type="error" message="Failed to save changes. Please try again." />
<Alert type="warning" message="This action cannot be undone." />
```

### Checklist

- [ ] Type variants with distinct colors
- [ ] Message prop for alert content
- [ ] Optional onClose callback for dismissible alerts
- [ ] Color-coded backgrounds and borders
- [ ] Flex layout for message and close button
- [ ] Close button with hover feedback
- [ ] ARIA label on close button
- [ ] Responsive text sizing

### Troubleshooting

**Colors not showing**: Verify Tailwind safelist includes all alert color variants or they're used elsewhere. Check for PurgeCSS configuration issues.

**Close button not aligned**: Ensure flex layout and items-start alignment are applied to parent div. Verify flex-shrink-0 on close button.

**Alert not dismissing**: Check onClose callback is properly wired to state management. Verify button onClick handler is firing.

### Best Practices

- Use semantic type variants that match message intent
- Keep messages concise and actionable
- Provide onClose for non-critical alerts
- Position alerts prominently but not blocking content
- Consider auto-dismiss timeout for success messages
- Use error type for validation and operation failures

## [Badge Label Component - Inline Status Indicator]()

Small inline label component with color variants (default, success, danger, warning) for displaying status indicators, tags, counts, and category labels with consistent sizing and color-coded meaning throughout the application.

### When to use?

Use Badge component for status indicators, tags, counts, labels, or any small inline text that needs visual distinction and color-coded meaning such as active/inactive status, notification counts, or category labels providing quick visual recognition.

### When NOT to use?

Avoid Badge for large text blocks, primary navigation elements, or when full Button component is more appropriate for interactive elements. Don't overuse badges as they can create visual clutter and diminish their effectiveness.

### Example

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-200 text-green-800',
    danger: 'bg-red-200 text-red-800',
    warning: 'bg-yellow-200 text-yellow-800',
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Usage
<Badge variant="success">Active</Badge>
<Badge variant="danger">Expired</Badge>
<Badge variant="warning">Pending</Badge>
<Badge>Draft</Badge>
```

### Checklist

- [ ] Variant prop with color-coded options
- [ ] Small, compact sizing
- [ ] Inline-block display
- [ ] Rounded corners for pill shape
- [ ] Consistent with application color scheme
- [ ] Text size appropriate for inline use
- [ ] Children prop accepts any content

### Troubleshooting

**Badge too large**: Verify text-xs class is applied and padding is minimal. Check for inherited font-size overrides.

**Colors not distinct**: Ensure sufficient contrast between background and text colors. Test with color blindness simulators.

**Layout breaks**: Check parent container can accommodate inline-block elements. Verify no width constraints causing wrapping issues.

### Best Practices

- Use semantic variant colors matching their meaning
- Keep badge content short (single word or small number)
- Use consistent variants across application for same meanings
- Consider icon-only badges for very compact displays
- Pair badges with descriptive text for accessibility
- Don't rely solely on color to convey meaning

## [Component Organization and Barrel Export Strategy]()

Centralized component organization with barrel export pattern enabling clean imports throughout application while maintaining clear file structure and reducing import statement complexity for common components.

### When to use?

Organize all common components in dedicated directory with barrel export file enabling simplified imports throughout application. This pattern should be used for all shared UI components accessed across multiple features and pages.

### When NOT to use?

Avoid barrel exports for very large component libraries where tree-shaking may be impacted negatively. Don't use for feature-specific components that should remain in their feature directories maintaining proper code organization.

### Example

**Directory Structure**:
```
src/components/common/
  Button.tsx
  Input.tsx
  Modal.tsx
  Card.tsx
  Select.tsx
  Alert.tsx
  Badge.tsx
  Spinner.tsx
  index.ts
```

**Barrel Export File** (`index.ts`):
```typescript
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { Card } from './Card';
export { Select } from './Select';
export { Alert } from './Alert';
export { Badge } from './Badge';
export { Spinner } from './Spinner';
```

**Usage in Application**:
```typescript
// Clean single import statement
import { Button, Input, Modal, Card } from '@/components/common';

// Instead of multiple imports
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
```

### Checklist

- [ ] All common components in src/components/common directory
- [ ] Each component in separate file with same name as export
- [ ] index.ts barrel file exports all components
- [ ] Path alias configured for @/components import
- [ ] Component names use PascalCase
- [ ] File names match component names

### Troubleshooting

**Import path not resolving**: Verify tsconfig.json includes path alias for @/components. Check bundler configuration supports path aliases.

**Components not found**: Check barrel export file includes all component exports. Verify file names match exactly.

**Circular dependency warnings**: Ensure components don't import each other creating circular references. Refactor shared logic into separate utilities.

### Best Practices

- Use barrel exports for clean, maintainable imports
- Keep component files focused on single component
- Name files exactly as exported component
- Document component usage in JSDoc comments
- Group related components in subdirectories if needed
- Maintain consistent export pattern across codebase

## [TypeScript Patterns for Component Props]()

TypeScript best practices for component props including extending native HTML attributes, providing default values, using strict type unions, implementing forwardRef, and documenting props with JSDoc ensuring type safety and developer experience.

### When to use?

Apply these TypeScript patterns to all common components ensuring type safety, autocomplete support, proper ref forwarding, and clear documentation making components easier to use and maintain across development team.

### When NOT to use?

These patterns are universally applicable to all common components. However, overly complex generic types should be avoided when simpler interfaces suffice to maintain code readability and reduce cognitive overhead.

### Example

**1. Extending Native HTML Attributes**:
```typescript
// ✅ Good - Inherits all native button props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

// ❌ Bad - Missing native props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void; // Incomplete type
}
```

**2. Providing Default Values**:
```typescript
export function Button({
  variant = 'primary',  // Default value
  size = 'md',          // Default value
  ...props
}: ButtonProps) {
  // Component implementation
}
```

**3. Using Strict Type Unions**:
```typescript
// ✅ Good - Strict union type
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
}

// ❌ Bad - Loose string type
interface ButtonProps {
  variant?: string;
}
```

**4. Implementing forwardRef**:
```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);

Input.displayName = 'Input';
```

**5. Documenting with JSDoc**:
```typescript
interface ButtonProps {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';

  /**
   * Display loading spinner and disable interaction
   */
  loading?: boolean;
}
```

### Checklist

- [ ] Component props extend appropriate HTML element attributes
- [ ] All optional props have default values or are marked optional
- [ ] Use strict union types instead of loose string/number types
- [ ] forwardRef implemented when component wraps native elements
- [ ] displayName set for components using forwardRef
- [ ] Complex props documented with JSDoc comments
- [ ] Prop types exported for reuse if needed

### Troubleshooting

**Type errors with native props**: Ensure interface extends correct HTMLAttributes type for element being wrapped. Verify TypeScript version compatibility.

**Ref not working**: Verify forwardRef is implemented and ref is passed to underlying DOM element. Check form library compatibility.

**Autocomplete not showing**: Check TypeScript server is running and prop types are properly exported. Restart IDE if necessary.

### Best Practices

- Always extend native HTML attributes for wrapped elements
- Use strict union types for better type checking and autocomplete
- Provide sensible defaults for all optional props
- Implement forwardRef for form components and DOM element wrappers
- Set displayName on forwardRef components for debugging
- Document complex or non-obvious props with JSDoc
- Export prop interfaces when they might be reused

## [Common Components Implementation Checklist]()

Comprehensive verification checklist ensuring all common component implementations follow established patterns for type safety, styling consistency, accessibility, reusability, and project conventions.

### Checklist

- [ ] Component accepts className prop for customization
- [ ] Props fully typed with TypeScript interfaces
- [ ] Default values defined for all optional props
- [ ] Native HTML attributes extended when wrapping elements
- [ ] Spread props passed through to underlying elements
- [ ] forwardRef implemented when ref access needed
- [ ] displayName set for forwardRef components
- [ ] Tailwind CSS used for all styling
- [ ] Responsive design with mobile-first approach
- [ ] Accessible with ARIA attributes where needed
- [ ] Component exported through common/index.ts barrel file
- [ ] No hard-coded business logic or context dependencies
- [ ] Variants use semantic naming (primary, success, danger)
- [ ] Size variants consistent across similar components
- [ ] Loading and disabled states handled appropriately
- [ ] Error states styled distinctly with appropriate colors

## [Official Documentation References]()

Official documentation and community resources for React, TypeScript, Tailwind CSS, and component design patterns providing comprehensive guidance beyond this guide's scope for advanced topics and framework-specific features.

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React forwardRef Documentation](https://react.dev/reference/react/forwardRef)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/components)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

# [TypeScript Patterns and Standards]()

Mandatory rules and best practices for TypeScript code ensuring type-safe, maintainable, and high-quality code in both backend (NestJS) and frontend (React) implementations.

## [Rule #1 - Never Use Any Type]()

The use of the `any` type is strictly prohibited throughout the codebase. This rule eliminates type safety, hinders code maintenance, hides runtime errors, and nullifies TypeScript's benefits. Use typed alternatives like interfaces, generics, or `unknown` with type guards instead to maintain full compile-time type checking and IDE autocomplete support.

### When to use?

Never use the `any` type. This section exists to document what NOT to do. There are no valid use cases for `any` in this codebase. Always use properly typed alternatives like interfaces, type aliases, generics, or `unknown` with type guards for type-safe code that maintains compile-time type checking and IDE autocomplete.

### When NOT to use?

Never use `any` in any situation including function parameters, return types, variable declarations, array types, generic constraints, type assertions, DTO properties, API responses, callbacks, React component props, or any other TypeScript type annotation. There are always better typed alternatives for every scenario that maintain type safety and code quality.

### Example

Never use `any` - always use typed alternatives for every scenario to maintain type safety.

```typescript
// ❌ WRONG - Controller
@Post()
create(@Body() data: any) {  // NEVER accept any
  return this.service.create(data);
}

// ✅ CORRECT - Use typed DTOs
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.service.create(createUserDto);
}

// ❌ WRONG - Function
function processData(input: any): any {  // NEVER use any
  return input.someProperty;
}

// ✅ CORRECT - Use generics when type is variable
function processData<T>(input: T): T {
  return input;
}

// ✅ CORRECT - Use unknown when type is truly unknown
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

// Then validate the type
const data = parseJSON(response);
if (isUser(data)) {  // Type guard
  console.log(data.name);  // Now TypeScript knows it's User
}
```

**Alternatives to `any`:**

| Situation | Instead of `any`, use |
|-----------|----------------------|
| Truly unknown type | `unknown` + type guards |
| Generic type | `<T>` generics |
| Multiple possible types | Union types: `string \| number` |
| Any object | `Record<string, unknown>` |
| REST parameters | `...args: T[]` |
| JSON parse | `unknown` + validation |
| Library without types | Create `.d.ts` file |
| API response | Create contract interface |

### Checklist

- [ ] No `any` type in function parameters
- [ ] No `any` type in return types
- [ ] No `any` type in variable declarations
- [ ] No `any[]` array types
- [ ] No `as any` type assertions
- [ ] Use interfaces or types instead of `any`
- [ ] Use generics for reusable type-safe code
- [ ] Use `unknown` with type guards for truly unknown data

### Troubleshooting

**Problem**: TypeScript complains about unknown types from external libraries
**Solution**: Install @types package for the library, create custom .d.ts declaration file, or use `unknown` with proper type guards instead of resorting to `any`

**Problem**: Complex type inference too difficult to express
**Solution**: Break down complex types into smaller interfaces, use utility types like Pick/Omit/Partial, leverage generic constraints, or explicitly define the type structure

### Best Practices

- Use `unknown` instead of `any` when type is truly unknown
- Create interfaces or type aliases for structured data
- Leverage generics for reusable type-safe functions
- Use union types for multiple possible types
- Implement type guards to validate unknown data
- Configure ESLint rule `@typescript-eslint/no-explicit-any: error`

## [Rule #2 - Always Use Strict Mode]()

TypeScript strict mode must be enabled in all projects to enforce the highest level of type safety. This configuration activates critical checks including noImplicitAny, strictNullChecks, strictFunctionTypes, and others that prevent common type-related bugs and ensure code quality through comprehensive compile-time validation.

### When to use?

Always use strict mode in all TypeScript projects without exception. Enable it from project initialization for new projects, and enable it incrementally for legacy projects. Strict mode is mandatory for all backend (NestJS) and frontend (React) code to ensure maximum type safety and catch potential bugs at compile time.

### When NOT to use?

There are no situations where strict mode should be disabled. While migrating legacy JavaScript to TypeScript, you may temporarily disable strict mode during migration, but you must create a migration plan to enable it. Never disable strict mode permanently or for production code as it compromises type safety.

### Example

Configure tsconfig.json with strict mode and all additional strict flags enabled.

```json
// tsconfig.json - Mandatory strict configuration
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Checklist

- [ ] `strict: true` enabled in tsconfig.json
- [ ] `noUnusedLocals: true` configured
- [ ] `noUnusedParameters: true` configured
- [ ] `noImplicitReturns: true` configured
- [ ] `noFallthroughCasesInSwitch: true` configured
- [ ] No compiler errors after enabling strict mode
- [ ] All implicit any errors resolved

### Troubleshooting

**Problem**: Hundreds of errors after enabling strict mode
**Solution**: Enable strict flags incrementally one at a time, start with noImplicitAny, fix all errors before enabling next flag, use TypeScript's incremental compilation to speed up fixes

**Problem**: Third-party library types causing strict mode errors
**Solution**: Install latest @types packages, create custom type declarations in .d.ts files, use module augmentation to extend library types, or wrap library with typed facade

### Best Practices

- Enable strict mode from day one in new projects
- Configure all additional strict flags beyond base strict mode
- Use ESLint TypeScript rules to enforce strict patterns
- Review and fix strict mode violations immediately
- Never use @ts-ignore to bypass strict mode errors
- Document any legitimate @ts-expect-error with explanation
- Understand what strict mode enables (noImplicitAny, strictNullChecks, strictFunctionTypes, etc)

## [Rule #3 - Explicit Typing Required]()

All interfaces, types, function parameters, and return values must have explicit type declarations. Avoid implicit typing and vague types like `string` for values with limited options. Use union types, specific interfaces, and explicit return type annotations for clarity and type safety preventing runtime errors through compile-time validation.

### When to use?

Always use explicit typing for all function parameters, return types, interface properties, type aliases, class properties, and variable declarations when type cannot be clearly inferred. Use union types for limited value sets, explicit return annotations for all functions, and specific interfaces instead of generic object types.

### When NOT to use?

Implicit typing is acceptable only when TypeScript can clearly infer the type from the value assignment such as `const count = 5` which clearly infers number type. Avoid explicit typing for obvious primitives in variable initialization, but always be explicit for function parameters and returns.

### Example

Always declare explicit types for function parameters, returns, and interface properties to maintain clarity.

```typescript
// ❌ WRONG - Implicit or vague types
interface User {
  name;  // Implicit any type
  age;   // Implicit any type
}

interface ButtonProps {
  variant?: string;  // Too vague
  onClick?: Function;  // Never use Function
}

function calculate(a: number, b: number) {  // Inferred return
  return a + b;
}

// ✅ CORRECT - Explicit and specific types
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function calculate(a: number, b: number): number {
  return a + b;
}

async function getUser(id: number): Promise<User> {
  return await api.get(`/users/${id}`);
}
```

### Checklist

- [ ] All function parameters have explicit types
- [ ] All function return types are explicitly declared
- [ ] Interface properties have specific types, not vague types
- [ ] Union types used for limited value sets instead of string
- [ ] Async functions return Promise<T> with explicit type
- [ ] No implicit any from missing type annotations
- [ ] Avoid Function type, use specific function signatures

### Troubleshooting

**Problem**: TypeScript infers wrong type from complex expressions
**Solution**: Add explicit type annotation to variable or return type, break complex expressions into smaller typed steps, use type assertions only when absolutely certain of the type

**Problem**: Union type too complex or hard to maintain
**Solution**: Extract union to named type alias, use enum for related constants, consider using discriminated unions with type field for better type narrowing

### Best Practices

- Always declare return types for functions, especially async functions
- Use union types ('a' | 'b' | 'c') instead of generic string for limited values
- Use specific event types (React.MouseEvent) instead of generic Event
- Prefer interface over type for object shapes (better error messages)
- Use type for unions, intersections, and utility types
- Document complex types with JSDoc comments for better IDE hints

## [Rule #4 - Use Unknown Instead of Any]()

When dealing with truly unknown data types like JSON parsing or external APIs, use the `unknown` type combined with type guards for validation. Unlike `any`, `unknown` forces you to validate the type before use, maintaining type safety while handling unpredictable data sources and preventing runtime errors.

### When to use?

Use `unknown` when receiving data from external sources like JSON.parse(), API responses, user inputs, or third-party libraries where the type is genuinely unknown at compile time. Always pair `unknown` with type guards to validate the data structure before using it to maintain type safety.

### When NOT to use?

Do not use `unknown` when you can define the type upfront using interfaces, generics, or union types. Avoid using `unknown` as a lazy alternative to proper typing. Never use it without type guards for validation as this defeats the purpose of type safety.

### Example

Use unknown with type guards to safely handle data from external sources like JSON parsing.

```typescript
// ✅ Receive unknown data
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

// ✅ Type guard to validate
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// ✅ Usage with validation
const data: unknown = parseJSON(response);

if (isUser(data)) {
  // Here TypeScript knows data is User
  console.log(data.name);
  console.log(data.email);
} else {
  throw new Error('Invalid user data');
}

// Common Type Guards
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
```

**Key Difference:**
- `any`: Disables type checking (NEVER use)
- `unknown`: Safe type that requires validation before use

### Checklist

- [ ] Use `unknown` instead of `any` for truly unknown types
- [ ] Implement type guards for all `unknown` values
- [ ] Validate type before accessing properties
- [ ] Use type guards with `value is Type` return type
- [ ] Handle invalid data cases with errors or fallbacks
- [ ] Never access properties directly on `unknown` values

### Troubleshooting

**Problem**: Cannot access properties on unknown type
**Solution**: Create a type guard function that validates the structure and returns `value is Type`, then use it in an if statement to narrow the type

**Problem**: Type guard becoming too complex
**Solution**: Break down complex type guards into smaller, composable guards, use libraries like zod or io-ts for complex validation, or create utility functions for common patterns

### Best Practices

- Always create type guards with `value is Type` return signature
- Use runtime validation libraries like zod for complex structures
- Combine multiple type guards using logical operators
- Document type guard expectations with JSDoc comments
- Test type guards thoroughly with edge cases
- Use discriminated unions when possible for better type narrowing

## [Rule #5 - Naming Conventions for Types]()

All TypeScript types, interfaces, and enums must follow PascalCase naming convention without prefixes like 'I'. This ensures consistency across the codebase and aligns with modern TypeScript best practices. Interfaces represent object shapes, types handle unions and intersections, and enums define constant sets.

### When to use?

Always use PascalCase for all interfaces, types, and enums throughout the codebase. Use interfaces for object shapes and contracts, type aliases for unions, intersections, and utility types, and enums for related constant values. Follow these conventions from the beginning of every file and component.

### When NOT to use?

Never use prefixes like 'I' for interfaces (outdated convention from C#/Java). Avoid snake_case or camelCase for type names. Do not create unnecessary type aliases for simple primitives unless they add semantic meaning like `type UserId = number` where the alias provides domain context.

### Example

Follow PascalCase naming without prefixes for all TypeScript type definitions.

```typescript
// ✅ CORRECT - Interfaces: PascalCase, no 'I' prefix
interface User {}
interface CreateUserDto {}
interface UserRepository {}

// ✅ CORRECT - Types: PascalCase
type UserId = number;
type UserRole = 'admin' | 'user' | 'guest';
type ApiResponse<T> = { data: T; status: number };

// ✅ CORRECT - Enums: PascalCase
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

// ❌ WRONG - 'I' prefix in interfaces
interface IUser {}  // Don't use 'I' prefix

// ❌ WRONG - snake_case or camelCase
type user_id = number;  // Wrong
type userId = number;   // Wrong (use type alias only when necessary)
```

### Checklist

- [ ] All interfaces use PascalCase naming
- [ ] No 'I' prefix on interface names
- [ ] All type aliases use PascalCase
- [ ] All enums use PascalCase
- [ ] Type aliases only created when adding semantic value
- [ ] Consistent naming across backend and frontend

### Troubleshooting

**Problem**: Legacy code uses 'I' prefix for interfaces
**Solution**: Gradually refactor during code reviews, use find-and-replace carefully with version control, update naming in new code immediately, create linting rules to prevent new violations

**Problem**: Confusion between when to use type vs interface
**Solution**: Use interface for object shapes and contracts (better error messages), use type for unions, intersections, and utility type compositions, prefer interface for extending and declaration merging

### Best Practices

- Prefer interface for object shapes (better error messages in TypeScript)
- Use type for unions, intersections, and complex type compositions
- Create type aliases for domain-specific primitive types (UserId, Email)
- Use enums for related constants that won't change
- Consider const assertions as alternative to enums for literal types
- Follow project-wide naming conventions consistently

## [Rule #6 - Optional Properties Best Practices]()

Use the optional property syntax (`?`) for properties that may be absent, rather than explicitly adding `| undefined`. Reserve `| null` for properties that always exist but can have a null value. This distinction clarifies whether a property might not exist versus explicitly being set to null for better type safety.

### When to use?

Use `?` syntax when a property may or may not be present in the object like optional fields in forms, configuration options, or API responses where certain fields are conditional. Use `| null` when a property always exists in the object but can be explicitly set to null like database nullable columns.

### When NOT to use?

Do not use `| undefined` explicitly as it is redundant with the `?` operator. Avoid mixing `?` with `| undefined` in the same declaration. Do not use `?` for properties that should always exist but can be null - use `| null` instead to maintain clarity about the property's existence.

### Example

Use optional syntax (?) for properties that may be absent, and | null for properties that exist but can be null.

```typescript
// ✅ CORRECT - Optional property
interface User {
  id: number;
  name: string;
  email?: string;  // Can be absent or be string
  phone?: string;
}

// ✅ CORRECT - Optional parameter
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : name;
}

// ❌ WRONG - Don't use | undefined manually
interface User {
  email: string | undefined;  // Use email?: string
}

// ❌ WRONG - Don't mix explicit undefined with optional
interface User {
  email?: string | undefined;  // Redundant
}

// ✅ CORRECT - Use '?' when property may not exist
interface User {
  nickname?: string;  // May be absent
}

// ✅ CORRECT - Use '| null' when property exists but can be null
interface User {
  deletedAt: Date | null;  // Always exists, but can be null
}
```

### Checklist

- [ ] Use `?` for properties that may be absent
- [ ] Use `| null` for properties that always exist but can be null
- [ ] Avoid explicit `| undefined` with optional properties
- [ ] No mixing `?` with `| undefined`
- [ ] Function optional parameters use `?` syntax
- [ ] Database nullable fields use `| null` not `?`

### Troubleshooting

**Problem**: Confusion about when to use ? vs | null
**Solution**: Ask "Does this property always exist in the object?" If no, use `?`. If yes but can be null, use `| null`. Database nullable columns always exist so use `| null`.

**Problem**: TypeScript errors with optional chaining
**Solution**: Use optional chaining operator `?.` for optional properties, check for undefined explicitly when needed, use nullish coalescing `??` for default values

### Best Practices

- Use `?` for truly optional properties that may not be present
- Use `| null` for nullable database columns and API fields
- Be consistent with optional vs nullable across your domain models
- Document the distinction between optional and nullable in your team
- Use optional chaining (`?.`) when accessing optional properties
- Provide defaults with nullish coalescing (`??`) when appropriate

## [Rule #7 - Generics for Reusable Code]()

Leverage TypeScript generics to create reusable, type-safe functions, classes, and interfaces instead of resorting to the `any` type. Generics preserve type information across function boundaries, enabling code reusability while maintaining full type checking and IntelliSense support for different data types without sacrificing type safety.

### When to use?

Use generics when creating reusable functions, classes, or interfaces that work with multiple types while maintaining type safety. Apply generics for repository patterns, API response wrappers, utility functions, data structures, and any code that needs to be type-safe across different data types without duplication.

### When NOT to use?

Do not use generics when the function or class only works with a specific type - use that type directly. Avoid over-engineering with generics when simple, concrete types suffice. Do not use generics just to make code look complex - only when actual type flexibility is needed.

### Example

Use generics to create reusable, type-safe functions and classes that work with multiple types.

```typescript
// ✅ CORRECT - Generic function
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]);    // number | undefined
const str = firstElement(['a', 'b']);    // string | undefined

// ✅ CORRECT - Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = await api.get('/users/1');
const productsResponse: ApiResponse<Product[]> = await api.get('/products');

// ✅ CORRECT - Generic class
class Repository<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }
}

const userRepo = new Repository<User>();
const productRepo = new Repository<Product>();

// ❌ WRONG - Using any instead of generics
function firstElement(arr: any[]): any {
  return arr[0];
}
```

### Checklist

- [ ] Generics used for reusable type-safe functions
- [ ] Generic constraints applied when needed
- [ ] No use of `any` where generics would work
- [ ] Generic type parameters have meaningful names (T, K, V)
- [ ] API response wrappers use generics
- [ ] Repository patterns use generics
- [ ] Utility functions leverage generics appropriately

### Troubleshooting

**Problem**: Generic type inference not working as expected
**Solution**: Add explicit generic constraints with `extends`, provide default types with `= DefaultType`, or explicitly pass type parameters when calling the function

**Problem**: Too many generic type parameters becoming unreadable
**Solution**: Simplify the function design, break into smaller functions, use meaningful generic parameter names beyond T, or consider if generics are truly needed

### Best Practices

- Use meaningful generic parameter names for complex types (TData, TResponse)
- Apply generic constraints with `extends` to limit acceptable types
- Provide default generic types when sensible
- Use generic type inference when possible instead of explicit types
- Combine generics with utility types (Pick, Omit, Partial) for flexibility
- Document complex generic patterns with JSDoc comments

## [Rule #8 - Type Assertions with Care]()

Type assertions using the `as` keyword should be used sparingly and only when you have external knowledge about a type that TypeScript cannot infer. Never use `as any` or double assertions (`as unknown as Type`). Prefer type guards and runtime validation over assertions for better type safety and runtime error prevention.

### When to use?

Use type assertions only when you have certain knowledge about a type that TypeScript cannot infer such as DOM element types, validated API responses, or library types that are incorrectly inferred. Always prefer type guards for unknown data, but assertions are acceptable when you can guarantee the type externally.

### When NOT to use?

Never use `as any` or double assertions `as unknown as Type` as they bypass all type checking. Avoid type assertions when you can use type guards instead. Do not use assertions to force incompatible types - this indicates a design problem that needs refactoring, not forcing through type checking.

### Example

Use type assertions sparingly and only when you have certain external knowledge about the type.

```typescript
// ✅ ACCEPTABLE - DOM element type
const input = document.getElementById('email') as HTMLInputElement;

// ✅ ACCEPTABLE - API response validated externally
const user = response.data as User;  // Only if you're absolutely sure

// ❌ NEVER - Using 'as any'
const data = something as any;  // STRICTLY PROHIBITED

// ❌ NEVER - Double assertion
const user = data as unknown as User;  // Sign of bad design

// ✅ BETTER - Use type guard instead of assertion
function isHTMLInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.tagName === 'INPUT';
}

const element = document.getElementById('email');
if (element && isHTMLInputElement(element)) {
  console.log(element.value);  // TypeScript knows it's input
}

// ✅ BETTER - Use type guard instead of forcing type
if (isUser(data)) {
  // Preferable to using 'as User'
}
```

### Checklist

- [ ] Type assertions used only when absolutely necessary
- [ ] No `as any` assertions anywhere in code
- [ ] No double assertions (`as unknown as Type`)
- [ ] Type guards used instead of assertions when possible
- [ ] DOM type assertions only for specific element types
- [ ] Comments explain why assertion is safe when used

### Troubleshooting

**Problem**: Need to assert type but not sure it's safe
**Solution**: Create a type guard with runtime validation instead of assertion, use unknown with validation, or refactor code to make type obvious to TypeScript

**Problem**: TypeScript won't allow valid type assertion
**Solution**: Check if the types are actually compatible, use type guard with runtime check instead, or investigate if your type definitions need updating

### Best Practices

- Prefer type guards over type assertions whenever possible
- Only use assertions when you have external type guarantees
- Add comments explaining why assertion is safe
- Never use `as any` - there are always better alternatives
- Use const assertions (`as const`) for literal type inference
- Consider using libraries like zod for runtime type validation

## [Rule #9 - Readonly for Immutability]()

Apply the `readonly` modifier to properties and parameters that should not be modified after initialization. This prevents accidental mutations, improves code predictability, and makes your intentions explicit. Use `Readonly<T>` utility type for complete object immutability and readonly arrays to prevent array mutations and ensure data integrity.

### When to use?

Use `readonly` for object properties that should not change after creation like IDs, timestamps, configuration values, and immutable domain objects. Use readonly arrays when functions should not modify input arrays. Apply `Readonly<T>` utility type for complete object immutability in configuration objects and constants.

### When NOT to use?

Do not use `readonly` for properties that legitimately need to be modified during the object's lifetime like user-editable fields, computed properties, or mutable state. Avoid overusing readonly when mutability is a necessary feature of the domain model or when working with external libraries expecting mutable objects.

### Example

Use readonly to prevent accidental mutations and make immutability explicit in your code.

```typescript
// ✅ CORRECT - Readonly property
interface User {
  readonly id: number;  // Cannot be changed after creation
  name: string;
}

const user: User = { id: 1, name: 'John' };
// user.id = 2;  // ❌ Compilation error

// ✅ CORRECT - Readonly array
function sum(numbers: readonly number[]): number {
  // numbers.push(10);  // ❌ Error: cannot modify
  return numbers.reduce((a, b) => a + b, 0);
}

// ✅ CORRECT - Complete readonly object
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

const config: Readonly<Config> = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};
// config.apiUrl = 'other';  // ❌ Error

// ✅ CORRECT - Readonly class property
class Entity {
  readonly id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;  // Can only be set in constructor
    this.name = name;
  }
}
```

### Checklist

- [ ] ID fields marked as readonly
- [ ] Timestamp fields marked as readonly
- [ ] Configuration objects use Readonly<T>
- [ ] Function parameters that shouldn't be modified use readonly
- [ ] Arrays that shouldn't be modified use readonly arrays
- [ ] Immutable domain objects use readonly properties

### Troubleshooting

**Problem**: Need to modify readonly property in specific cases
**Solution**: Redesign to avoid mutation, create new object with updated values, use builder pattern for object construction, or reconsider if readonly is appropriate

**Problem**: Readonly conflicts with library expectations
**Solution**: Create mutable copy for library consumption, use type assertions carefully only at library boundaries, or wrap library with your own typed interface

### Best Practices

- Mark ID fields as readonly in entities
- Use readonly for configuration and constants
- Apply readonly to function parameters that shouldn't be modified
- Use Readonly<T> utility type for entire object immutability
- Combine readonly with const for maximum immutability
- Document mutability intentions with readonly modifier
- Use readonly arrays to prevent accidental array mutations

## [Rule #10 - Avoid Double Type Assertion]()

Double type assertions like `as unknown as Type` are strictly prohibited as they indicate fundamental design problems in your code. This pattern bypasses TypeScript's type system completely and creates a false sense of type safety. Refactor your code structure or use proper type guards instead to maintain type integrity.

### When to use?

Never use double type assertions. This section documents what NOT to do. Double assertions are a code smell indicating poor type design, missing type definitions, or attempting to force incompatible types. There are no legitimate use cases for this pattern - always refactor the underlying issue instead.

### When NOT to use?

Never use double type assertions in any situation. If you find yourself needing `as unknown as Type`, it means your type design has fundamental problems that need refactoring. Do not use it to bypass type errors, force incompatible types, or work around type system limitations - these all indicate deeper issues.

### Example

Never use double assertions - they bypass type safety and indicate design problems requiring refactoring.

```typescript
// ❌ NEVER - Double assertion is a sign of bad design
const user = data as unknown as User;  // VERY WRONG

// ❌ NEVER - If you need this, your code has problems
const element = event.target as unknown as HTMLInputElement;

// ✅ CORRECT - Use type guard instead
if (isUser(data)) {
  // Now data is User with proper validation
}

// ✅ CORRECT - Use runtime validation
function validateUser(data: unknown): User {
  if (!isUser(data)) {
    throw new Error('Invalid user data');
  }
  return data;
}

const user = validateUser(data);

// ✅ CORRECT - Refactor code to not need assertion
// Proper type definitions and guards eliminate the need
```

### Checklist

- [ ] No double type assertions anywhere in codebase
- [ ] Type guards used instead of forcing types
- [ ] Runtime validation for unknown data
- [ ] Proper type definitions prevent need for assertions
- [ ] Code refactored when double assertion seems needed
- [ ] ESLint rules configured to catch double assertions

### Troubleshooting

**Problem**: Feel forced to use double assertion
**Solution**: This always indicates a design problem - refactor your types, create proper type guards, add missing type definitions, or restructure code to make types compatible

**Problem**: External library types incompatible with your types
**Solution**: Create adapter functions with proper validation, define custom type definitions, use module augmentation to extend library types, or wrap library with your own typed facade

### Best Practices

- Never use double type assertions under any circumstances
- Create type guards with runtime validation instead
- Refactor code when double assertion seems necessary
- Use unknown with validation for truly unknown types
- Define proper types for all external data sources
- Configure ESLint to catch and prevent double assertions
- Treat double assertion attempts as design review triggers

## [TypeScript Patterns Master Checklist]()

This comprehensive checklist ensures your TypeScript code follows all mandatory patterns and best practices. Use it before submitting code for review to verify compliance with type safety requirements, naming conventions, and architectural standards for both backend and frontend code reducing code review cycles and maintaining quality.

### Checklist

- [ ] No use of `any` type anywhere in code
- [ ] `strict: true` enabled in tsconfig.json
- [ ] All function parameters have explicit types
- [ ] All function returns have explicit types (especially async)
- [ ] Interfaces and types use PascalCase without 'I' prefix
- [ ] Optional properties use `?` instead of `| undefined`
- [ ] Use `unknown` instead of `any` for unknown types
- [ ] Type guards implemented to validate `unknown`
- [ ] Generics used for reusable type-safe code
- [ ] `readonly` used to prevent mutations where appropriate
- [ ] Avoided use of `as any` and double assertions
- [ ] DTOs created for all API endpoints
- [ ] React component props fully typed
- [ ] No double type assertions anywhere
- [ ] ESLint TypeScript rules configured and passing

## [Tools to Ensure Quality]()

Configure automated tools to enforce TypeScript patterns and catch violations early in the development cycle. ESLint rules and pre-commit hooks prevent non-compliant code from reaching the repository, ensuring consistent quality across all contributions and reducing code review overhead while maintaining high standards.

### When to use?

Use ESLint TypeScript rules in all TypeScript projects from the start. Configure pre-commit hooks to run type checking and linting before every commit. Enable strict mode and TypeScript compiler checks in CI/CD pipelines to catch violations before code review, ensuring automated quality enforcement.

### When NOT to use?

There are no situations where these quality tools should be skipped. Even for rapid prototyping, maintain basic TypeScript checking to prevent bad patterns from becoming habits. Temporarily disabling rules for specific lines with explanatory comments is acceptable only in exceptional cases with clear justification documented in code.

### Example

Configure ESLint rules and pre-commit hooks to automatically enforce TypeScript patterns.

```json
// ESLint Configuration
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}

// package.json scripts
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "pre-commit": "npm run type-check && npm run lint"
  }
}
```

### Checklist

- [ ] ESLint configured with TypeScript rules
- [ ] Pre-commit hooks run type checking
- [ ] Pre-commit hooks run linting
- [ ] CI/CD pipeline includes type checking
- [ ] CI/CD pipeline includes linting
- [ ] All TypeScript errors must be fixed before merge
- [ ] No @ts-ignore without documented justification

### Troubleshooting

**Problem**: ESLint rules too strict for existing codebase
**Solution**: Enable rules gradually starting with most critical, fix violations incrementally, use warning level initially then upgrade to error, create migration plan with deadlines

**Problem**: Pre-commit hooks slowing down development
**Solution**: Optimize TypeScript compilation with incremental builds, run checks only on staged files, use lint-staged for targeted checking, configure faster ESLint rules

### Best Practices

- Enable all recommended TypeScript ESLint rules
- Configure pre-commit hooks to prevent bad commits
- Include type checking in CI/CD pipeline
- Use incremental TypeScript compilation for speed
- Document any ESLint rule exceptions with clear reasoning
- Review and update linting rules regularly
- Make builds fail on TypeScript errors
- Use lint-staged for efficient pre-commit checks

## [Additional Resources]()

For context-specific TypeScript patterns and detailed implementation examples in DTOs, entities, components, and use-cases, refer to these related documentation files that provide practical guidance for applying these typing rules in real-world scenarios and specific architectural layers.

### When to use?

Consult these resources when implementing specific features like data validation, creating React components, designing use-cases, or working with TypeORM entities. These documents provide practical examples of applying TypeScript patterns in context-specific scenarios helping translate these general rules into concrete implementations.

### When NOT to use?

These resources complement but do not replace the fundamental TypeScript patterns defined in this document. Always follow the core typing rules first, then consult specific guides for implementation details. Do not use context-specific patterns that contradict the fundamental rules established in this document.

### Example

Reference these documentation files for context-specific TypeScript implementation patterns.

**Related Documentation:**

- **DTO Validation**: [how-to-use-data-validation-api-backend.md](./how-to-use-data-validation-api-backend.md) - TypeScript typing for data transfer objects
- **React Components**: [how-to-create-common-components-frontend.md](./how-to-create-common-components-frontend.md) - Component props and state typing
- **Use-Cases**: [how-to-create-use-case-backend.md](./how-to-create-use-case-backend.md) - Business logic layer typing patterns
- **TypeORM Entities**: [how-to-create-typeorm-entity-backend.md](./how-to-create-typeorm-entity-backend.md) - Database entity typing and decorators

### Checklist

- [ ] Reviewed DTO validation patterns before creating DTOs
- [ ] Checked React component patterns before creating components
- [ ] Consulted use-case patterns for business logic implementation
- [ ] Referenced entity patterns for database model creation
- [ ] Applied TypeScript patterns from this document in all contexts
- [ ] Verified implementations follow both general and specific patterns

### Troubleshooting

**Problem**: Conflict between general TypeScript rules and specific context patterns
**Solution**: General TypeScript patterns in this document always take precedence, adapt context-specific patterns to comply with fundamental rules, escalate conflicts to team for clarification

**Problem**: Cannot find pattern for specific use case
**Solution**: Start with fundamental TypeScript rules from this document, search related documentation for similar patterns, ask team for guidance, document new patterns for future reference

### Best Practices

- Read this document first for foundational TypeScript patterns
- Consult context-specific guides when implementing features
- Apply fundamental typing rules consistently across all contexts
- Document new patterns discovered in appropriate documentation files
- Keep TypeScript patterns consistent between backend and frontend
- Reference multiple documentation sources for comprehensive understanding

## [Penalties for Violation]()

TypeScript pattern violations are treated seriously as they compromise code quality, maintainability, and type safety across the entire project. Code that does not comply with these mandatory rules will be rejected during review and must be corrected before merging to protect the codebase integrity and prevent technical debt accumulation.

### When to use?

These penalties apply to all code submissions during code review process. Reviewers must enforce these rules consistently across all pull requests. Automated tooling should catch violations before human review. Use this section to understand the consequences of non-compliance and the importance of following TypeScript patterns.

### When NOT to use?

There are no exceptions to these rules. Even for urgent fixes or small features, TypeScript patterns must be followed. Legacy code violations should be fixed when touched, not perpetuated. Prototype code must follow these patterns to prevent bad habits from forming and technical debt from accumulating in the codebase.

### Example

Code violating TypeScript patterns will be rejected and must be corrected before merging to any branch.

**Consequences of Violations:**

1. **Will not pass code review** - Pull requests rejected until compliant
2. **Will not be merged to main branch** - Branch protection enforced
3. **May break the build if ESLint is configured** - CI/CD pipeline fails
4. **Compromises project quality and maintainability** - Technical debt increases

**IMPORTANT**: These rules are **mandatory** and **non-negotiable**. TypeScript only brings benefits when used correctly with strong typing.

### Checklist

- [ ] All code passes TypeScript compiler checks
- [ ] All ESLint TypeScript rules passing
- [ ] No `any` type anywhere in new code
- [ ] No double type assertions in codebase
- [ ] Code review checklist completed
- [ ] Pre-commit hooks passed
- [ ] CI/CD pipeline green

### Troubleshooting

**Problem**: Legacy code has TypeScript violations
**Solution**: Fix violations when touching legacy code, create tickets for systematic cleanup, prevent new violations in new code, use incremental migration strategy with deadlines

**Problem**: Team member not following TypeScript patterns
**Solution**: Provide training on TypeScript best practices, reference this document in code reviews, use automated tooling to catch violations early, pair program to share knowledge

### Best Practices

- Enforce TypeScript patterns consistently in all code reviews
- Configure automated tooling to catch violations before review
- Reject non-compliant code immediately with specific feedback
- Provide education and resources for team members
- Lead by example in following TypeScript patterns
- Make compliance non-negotiable for all team members
- Use TypeScript violations as learning opportunities
- Celebrate improvements in code quality and type safety

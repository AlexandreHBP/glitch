# [How to Consume API in Frontend]()

Complete guide on consuming REST APIs in React applications using Axios, including instance configuration with interceptors, service layer patterns, error handling strategies, and advanced techniques for robust client-server integration.

## [Axios Instance Configuration with Interceptors]()

Centralized Axios configuration creates a reusable HTTP client instance with base URL, default headers, request/response interceptors for authentication, and global error handling. This pattern eliminates code duplication and ensures consistent API communication across the entire application with automatic token injection and version management.

### When to use?

Use centralized Axios configuration in every React application consuming a REST API. Essential for automatically attaching authentication tokens to requests, managing API versioning centrally, handling base URLs across different environments (dev, staging, production), and implementing global error handling with request/response interceptors for consistent behavior.

### When NOT to use?

Do not use centralized Axios configuration if you only make one or two isolated API calls in your entire application (use native fetch API instead), if completely different endpoints require mutually incompatible configurations, or if using GraphQL exclusively (use Apollo Client, urql, or similar GraphQL-specific clients instead). However, most REST API projects benefit significantly from this pattern.

### Example

Axios instance with environment-based configuration and authentication interceptors.

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
      // Invalid/expired token - clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Allow component to handle redirection
      // Don't use window.location.href here
    }

    return Promise.reject(error);
  }
);

export default api;
```

**Environment variable** (`.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

> **🚨 CRITICAL - API VERSIONING**: The API version (`v1`, `v2`, etc.) **MUST** be specified in each service method, NOT in `api.ts` or environment variables.
>
> **NEVER:**
> - ❌ Put version in `api.ts` baseURL
> - ❌ Put version in environment variable (`.env` file)
> - ❌ Centralize version in a single constant
>
> **ALWAYS:**
> - ✅ Include version in each service method path: `api.get('/v1/products')`
> - ✅ Manage version per endpoint/resource individually
> - ✅ Allow gradual migration (some endpoints v1, others v2)
>
> **Why?** When backend introduces v2, you need flexibility to migrate endpoints gradually. For example, `UserService` can use `/v2/users` while `ProductService` still uses `/v1/products`. If version was centralized, ALL endpoints would change at once, breaking the application during migration.
>
> See [How to version API](./how-to-version-api-backend.md#frontend-integration---consuming-versioned-apis-with-axios) for complete versioning strategy.

### Checklist

- [ ] Axios installed via npm/yarn (`npm install axios`)
- [ ] `api.ts` file created with centralized instance
- [ ] Base URL configured using environment variable (WITHOUT version suffix)
- [ ] Request interceptor adds JWT token from localStorage
- [ ] Response interceptor handles 401 unauthorized errors
- [ ] Content-Type header set to `application/json` by default
- [ ] Environment variables properly configured in `.env` file
- [ ] Services include version in each endpoint path (`/v1/products`, `/v2/users`, etc.)

### Troubleshooting

**CORS errors on all requests**: Verify backend CORS configuration allows your frontend origin (protocol, domain, and port must match)

**401 Unauthorized on all requests**: Check that authentication token is stored correctly in localStorage with the exact key name expected

**Base URL incorrect or not found**: Verify `VITE_API_URL` in `.env` file matches backend URL exactly including protocol and port

**Interceptors not firing**: Ensure you're importing and using the configured `api` instance, not the base `axios` object directly

**Token not automatically added**: Verify request interceptor is configured before any requests are made and localStorage key is correct

### Best Practices

1. Use environment variables for base URL configuration across different deployment environments
2. Add authentication token in request interceptor, not in individual service methods
3. Handle 401 errors globally in interceptor but delegate navigation to React components
4. Export single configured instance to ensure consistency across all API calls
5. Keep `api.ts` focused solely on HTTP client configuration, not business logic
6. Include API version in each service method path for granular version control
7. Document interceptor behavior and side effects clearly with comments
8. Consider adding request/response logging interceptors for debugging in development mode

## [Domain-Specific Service Layer Pattern]()

Service layer organizes API calls into domain-specific modules with strongly-typed TypeScript interfaces for compile-time safety. Each service file encapsulates all HTTP operations for a specific resource (users, products, orders), providing clean separation between API communication logic and React UI components with reusable, testable abstractions.

### When to use?

Use service layer pattern for every distinct API resource or domain entity in your application (users, products, orders, categories, etc.). Essential for organizing complex applications with multiple endpoints, enabling code reuse across components, providing consistent API interfaces throughout the codebase, and facilitating unit testing with mock service implementations without touching actual HTTP layer.

### When NOT to use?

Do not create dedicated service files for one-off API calls that will never be reused elsewhere in the application, for extremely simple applications with only 2-3 total API endpoints across the entire project, or when using advanced data-fetching libraries like React Query or SWR that provide their own abstraction patterns. Services add value as application complexity and endpoint count grow beyond trivial levels.

### Example

TypeScript service with complete CRUD operations and type-safe interfaces.

**File**: `src/services/product.service.ts`

```typescript
import api from './api';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  userId: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  stock: number;
}

export const ProductService = {
  // List all products
  async findAll(): Promise<Product[]> {
    const response = await api.get<Product[]>('/v1/products');
    return response.data;
  },

  // Find product by ID
  async findOne(id: number): Promise<Product> {
    const response = await api.get<Product>(`/v1/products/${id}`);
    return response.data;
  },

  // Create new product
  async create(data: CreateProductDto): Promise<Product> {
    const response = await api.post<Product>('/v1/products', data);
    return response.data;
  },

  // Update existing product
  async update(id: number, data: Partial<CreateProductDto>): Promise<Product> {
    const response = await api.patch<Product>(`/v1/products/${id}`, data);
    return response.data;
  },

  // Delete product
  async remove(id: number): Promise<void> {
    await api.delete(`/v1/products/${id}`);
  },
};

// NOTE: Version (v1) is included in each endpoint path.
// If backend migrates to v2, update only the endpoints that changed.
// Example: `/v2/products` for new version, while other services remain `/v1/...`
```

### Checklist

- [ ] Dedicated service file created per domain resource
- [ ] TypeScript interfaces defined for all entity shapes
- [ ] DTOs (Data Transfer Objects) defined for create/update operations
- [ ] All necessary CRUD operations implemented (findAll, findOne, create, update, remove)
- [ ] API version included in each endpoint path (`/v1/products`, `/v1/users`, etc.)
- [ ] Async/await used consistently throughout service methods
- [ ] Response types specified using TypeScript generics (`<Product>`, `<Product[]>`)
- [ ] Service exported as object with methods for easy importing
- [ ] Consistent naming convention followed (findAll, findOne, create, update, remove)

### Troubleshooting

**TypeScript type errors**: Ensure interface properties match backend response structure exactly (case-sensitive field names)

**Response data undefined**: Check that you're returning `response.data`, not the entire `response` object

**Service method not found**: Verify service is exported correctly and imported with proper destructuring syntax

**Stale TypeScript types after backend changes**: Regenerate or update interfaces when backend modifies response structure

**Type inference not working**: Explicitly specify generic types on axios calls for proper IDE autocomplete

### Best Practices

1. Create one service file per distinct resource or bounded domain context
2. Define TypeScript interfaces that accurately mirror backend response schemas
3. Include API version in each endpoint path for granular migration control (`/v1/products`)
4. Use descriptive, conventional method names (findAll, findOne, create, update, remove)
5. Explicitly type all method parameters and return values for compile-time safety
6. Export interfaces alongside services for reuse in components and other services
7. Keep services pure and stateless with no UI logic, navigation, or side effects
8. Document complex operations, business rules, or non-obvious behaviors with comments
9. Group related operations together (e.g., all user profile operations in UserService)

## [Consuming Services in Functional React Components]()

Consuming API services in React functional components involves managing asynchronous data fetching with loading states, error boundaries, and data persistence using built-in hooks like useState and useEffect. This pattern provides consistent user experience through proper state management, loading indicators, error messages, and user feedback during all API operations across the application lifecycle.

### When to use?

Use this pattern when consuming any API service method within functional React components for standard data operations. Essential for list/index pages displaying collections, detail/show views fetching single resources, create/edit forms submitting data, delete confirmations, or any component requiring server data to render properly. Applies to standard CRUD operations without advanced caching needs.

### When NOT to use?

Do not use this basic useState/useEffect pattern when you need advanced features like automatic background refetching, intelligent caching strategies, request deduplication, optimistic updates, or complex cache invalidation (use React Query, SWR, or Apollo Client instead). Also consider extracting reusable custom hooks when identical data-fetching logic repeats across multiple components to reduce duplication.

### Example

Complete examples covering list views, forms, updates, and deletions with proper state management.

**List View with Loading States**:

```typescript
import { useState, useEffect } from 'react';
import { ProductService, Product } from '@/services/product.service';

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.findAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>$ {product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

**Create with Form Submission**:

> **Example**: Demonstrates only the structure. Adapt validation and logic according to your context.

```typescript
function ProductForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      await ProductService.create({
        name,
        price,
        stock: 0,
      });

      // Success
      alert('Product created!');
      setName('');
      setPrice(0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(+e.target.value)}
        placeholder="Price"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

**Update Item**:

> **Example**: Basic edit structure. Adapt as needed.

```typescript
function EditProduct({ id }: { id: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const data = await ProductService.findOne(id);
    setProduct(data);
    setName(data.name);
    setPrice(data.price);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await ProductService.update(id, { name, price });
      alert('Product updated!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating');
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(+e.target.value)}
      />

      <button type="submit">Update</button>
    </form>
  );
}
```

**Delete Item**:

> **Example**: Basic deletion pattern. Adapt confirmation according to project UX.

```typescript
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure?')) return;

  try {
    await ProductService.remove(id);
    // Reload list
    await loadProducts();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error deleting');
  }
};
```

> **IMPORTANT**: All examples above are only structure and pattern demonstrations.
> They don't contain specific business logic. Adapt them according to your project needs.

### Checklist

- [ ] useState hooks declared for data, loading, and error states
- [ ] useEffect hook used for initial data loading on component mount
- [ ] Try/catch blocks wrap all async API calls for error handling
- [ ] Finally block ensures loading state is always reset after operation
- [ ] Loading indicator displayed to user during async operations
- [ ] Error messages rendered and shown to user when errors occur
- [ ] Success feedback provided after successful mutations (create/update/delete)
- [ ] Client-side form validation implemented before API submission

### Troubleshooting

**Infinite render loops**: Ensure useEffect has proper dependency array that doesn't change on every render

**State not updating after API call**: Check that setState is called with new values, not mutated references

**Memory leak warnings in console**: Clean up async operations in useEffect return function, especially when component unmounts

**Stale closure capturing old state**: Include all dependencies that the effect uses in the useEffect dependency array

**Data not refetching after mutations**: Manually call fetch functions after successful create/update/delete operations

### Best Practices

1. Always manage three critical states: loading (boolean), data (typed entity), and error (string/object)
2. Show visual loading indicators (spinners, skeletons) during all asynchronous operations
3. Display clear, actionable error messages to users, not technical stack traces
4. Use try/catch/finally pattern for consistent error handling and cleanup across all async operations
5. Reset form fields to initial values after successful submission for better UX
6. Disable submit buttons during loading state to prevent duplicate submissions
7. Provide clear visual feedback for all user actions (success messages, toasts, confirmations)
8. Extract repeated data-fetching logic into custom hooks for reusability across components

## [Structured Error Handling with User-Friendly Feedback]()

Consistent error handling extracts meaningful, user-friendly messages from various API error response formats and provides clear visual feedback to users. Backend validation errors often return arrays of field-specific messages that require proper parsing, formatting, and display near relevant form inputs for optimal user experience and debugging capabilities.

### When to use?

Use structured error handling in every component that makes API calls or submits forms to the backend. Essential for displaying backend validation error messages near form fields, handling network connectivity errors gracefully, processing and formatting backend error response arrays, providing users with clear actionable information about what went wrong, and maintaining consistent error messaging patterns across the entire application.

### When NOT to use?

Do not skip error handling even for simple operations or internal tools, as errors will occur in production. However, you may simplify error display for rapid prototypes or developer-only tools where detailed user-friendly messages aren't critical for the target audience. Production-facing applications always require robust, user-friendly error handling with proper message extraction and display logic.

### Example

Helper functions for extracting and formatting error messages from various API response structures.

**API Error Structure**:

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

**Helper Function**:

```typescript
export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    const message = error.response.data.message;

    // May be array of errors (validation)
    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message;
  }

  return 'Error processing request';
}

// Usage
try {
  await ProductService.create(data);
} catch (err) {
  const message = getErrorMessage(err);
  alert(message);
}
```

### Checklist

- [ ] Error extraction helper function created and exported
- [ ] Array error messages joined with separators for readable display
- [ ] Default fallback error message provided for unknown error structures
- [ ] Error response interfaces properly typed with TypeScript
- [ ] Network connectivity errors handled separately from API errors
- [ ] User-friendly error messages displayed prominently in UI
- [ ] Technical error details logged to console for developer debugging
- [ ] Field-specific validation errors shown near relevant form inputs

### Troubleshooting

**Undefined error messages displayed**: Check that backend consistently returns error structure with `message` property

**Array errors not joining properly**: Verify `Array.isArray()` check executes before calling `.join()` method

**Generic unhelpful error messages**: Ensure backend provides descriptive, user-facing error messages in responses

**Missing field-specific validation errors**: Check that all validation errors are included in backend response `message` array

**Network errors not caught**: Add specific handling for `error.request` (no response) vs `error.response` (HTTP error)

### Best Practices

1. Create centralized helper function for consistent error message extraction across application
2. Handle both string and array error message formats from backend responses
3. Provide user-friendly fallback messages for unexpected error structures or network failures
4. Log full technical error objects to console in development for debugging purposes
5. Display validation errors near relevant form fields, not just globally at top of form
6. Consider using toast/snackbar notifications for better non-intrusive error UX
7. Handle network errors (offline, timeout) separately from backend API errors with appropriate messaging
8. Include error codes or IDs when available to help support teams diagnose user-reported issues

## [Custom Hooks for Reusable Data Fetching Logic]()

Custom React hooks encapsulate reusable data fetching patterns, eliminating boilerplate code duplication and providing consistent interfaces for loading states, error handling, and asynchronous data management across multiple components. These abstraction layers standardize how components interact with API services while maintaining flexibility through generic typing and configurable execution patterns.

### When to use?

Use custom data fetching hooks when identical or similar API consumption patterns repeat across multiple components throughout the application, when you need standardized loading/error state management without reimplementing useState/useEffect every time, or when building a lightweight data fetching abstraction layer without adopting full libraries. Ideal for reducing component code duplication and enforcing consistent patterns.

### When NOT to use?

Do not create custom hooks for truly one-time, unique use cases that will never be reused elsewhere in the codebase, when already using comprehensive data fetching libraries like React Query or SWR that provide battle-tested hooks with advanced features, or when the abstraction introduces more complexity and cognitive overhead than it eliminates. Start with simple patterns first and extract hooks only when duplication becomes apparent.

### Example

Generic custom hook with loading, error, and data state management for any async API function.

```typescript
import { useState } from 'react';

export function useApi<T>(apiFunction: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Request error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}

// Usage
function ProductList() {
  const { data: products, loading, error, execute } = useApi(
    ProductService.findAll
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products?.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

### Checklist

- [ ] Custom hook function created with "use" prefix following React conventions
- [ ] Generic type parameter `<T>` for flexibility across different data shapes
- [ ] Loading state, data state, and error state managed internally
- [ ] Execute function exposed for manual triggering of API calls
- [ ] Error handling implemented consistently within hook logic
- [ ] TypeScript types properly defined for parameters and return values
- [ ] Hook successfully reused across multiple components
- [ ] Documentation added explaining hook parameters and return interface

### Troubleshooting

**TypeScript type errors**: Ensure generic type parameter `T` matches the actual API response structure

**Stale data persisting**: Reset data state to null when changing the API function reference

**Execute function triggers multiple times**: Use useEffect dependencies correctly to prevent unnecessary calls

**Memory leak warnings**: Clean up pending async operations in useEffect cleanup function when component unmounts

**Hook not triggering refetch**: Ensure dependencies change properly or call execute function manually

### Best Practices

1. Always use "use" prefix for custom hook naming to follow React conventions and enable linting rules
2. Make hooks generic with TypeScript to work with any data type without code duplication
3. Provide manual execute function for on-demand triggering beyond automatic useEffect calls
4. Return consistent, predictable interface (data, loading, error, execute) across all similar hooks
5. Handle errors within the hook but also rethrow for component-level handling when needed
6. Document hook parameters, return values, and usage examples in code comments or docstrings
7. Consider adding additional capabilities like refetch, reset, and manual error clearing functions
8. Keep hooks focused on single responsibility - don't mix multiple unrelated concerns

## [Server-Side Pagination with Navigation Controls]()

Pagination divides large datasets into manageable chunks loaded on demand, dramatically improving application performance and user experience by limiting data transfer and rendering overhead. Query parameters control current page number and items per page, enabling efficient navigation through potentially massive result sets without overwhelming client or server resources with unnecessary data.

### When to use?

Use pagination for any API endpoint returning lists that can realistically grow beyond 20-50 items over time, for search results with potentially hundreds of matches, for data tables displaying user-generated content, or whenever backend provides paginated endpoints with page/limit parameters. Essential for maintaining performance with large datasets while providing users with navigable, digestible chunks of information.

### When NOT to use?

Do not implement pagination for small, fixed-size lists guaranteed to remain under 20 items forever, when infinite scroll UX pattern is more appropriate for continuous content consumption (social feeds), or when specific requirements mandate displaying all data simultaneously in single view. Consider virtual scrolling libraries like react-window for rendering thousands of items without pagination.

### Example

Service method with pagination parameters and component state management for page navigation.

```typescript
export const ProductService = {
  async findAll(page: number = 1, pageSize: number = 10) {
    const response = await api.get('/products', {
      params: { page, pageSize },
    });
    return response.data;
  },
};

// Usage in component
const [page, setPage] = useState(1);
const [products, setProducts] = useState([]);

const loadProducts = async () => {
  const data = await ProductService.findAll(page, 10);
  setProducts(data.data);
};

// Pagination controls
<button onClick={() => setPage(p => p - 1)}>Previous</button>
<button onClick={() => setPage(p => p + 1)}>Next</button>
```

### Checklist

- [ ] Page number and pageSize parameters added to service methods
- [ ] Query params object properly passed to backend via axios config
- [ ] Current page number tracked in component state
- [ ] Previous/Next navigation buttons implemented and functional
- [ ] Previous button disabled when on first page (page === 1)
- [ ] Next button disabled when on last page (calculated from total count)
- [ ] Total item count or total pages displayed if backend provides it
- [ ] Current page number indicator shown to user for context

### Troubleshooting

**Wrong page data loads**: Ensure page state changes properly trigger useEffect with page in dependency array

**Query params not sent to backend**: Verify `params` object is correctly placed in axios request config

**Off-by-one pagination errors**: Check whether backend uses 0-based or 1-based page indexing and adjust accordingly

**Total pages calculation incorrect**: Verify backend returns accurate total count and calculate `Math.ceil(total / pageSize)` correctly

**Navigation buttons don't update**: Ensure page state is actually changing and not being blocked by logic errors

### Best Practices

1. Use query parameters (params object) not route path parameters for pagination configuration
2. Default to reasonable page size between 10-20 items for optimal loading and scrolling balance
3. Display current page number and total available pages for user orientation and context
4. Disable navigation buttons at boundaries (first/last page) to prevent invalid requests
5. Persist pagination state in URL query params for shareable, bookmarkable links
6. Reset to page 1 automatically whenever filters, search terms, or sort order changes
7. Show loading state or skeleton UI during page transitions for responsive feel
8. Consider adding page size selector to let users control items per page density

## [Multipart Form Data for File Upload]()

File uploads require FormData API to construct multipart/form-data requests that browsers send to backend servers. Axios automatically detects FormData instances and sets appropriate Content-Type headers with boundary markers, enabling seamless transmission of binary files (images, documents, videos) alongside optional JSON metadata through standard HTTP POST/PUT requests.

### When to use?

Use file upload implementation for user profile pictures, document attachments in applications, image galleries with user-uploaded content, CSV/Excel file imports for data processing, or any feature requiring users to submit files from their local filesystem. Essential for applications handling user-generated content, document management systems, media platforms, or data import workflows requiring file processing.

### When NOT to use?

Do not implement basic file upload for very large files exceeding 100MB without chunking/resumable upload mechanisms to handle network interruptions, when files can be efficiently provided via direct URL references instead of upload, or without proper backend validation of file types, sizes, and content. Consider specialized cloud upload services (AWS S3, Cloudinary) for large-scale file handling requirements.

### Example

Service method creating FormData and component handling file input change events.

```typescript
export const ProductService = {
  async uploadImage(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

// Usage in component
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    await ProductService.uploadImage(productId, file);
    alert('Image uploaded!');
  } catch (err) {
    alert('Error uploading image');
  }
};
```

### Checklist

- [ ] FormData instance created for file upload request
- [ ] File appended to FormData with correct field name
- [ ] Content-Type header explicitly set to multipart/form-data
- [ ] File input element accepts only correct file types (accept attribute)
- [ ] Client-side file size validation implemented before upload
- [ ] Upload progress indicator shown to user during long uploads
- [ ] Success/error feedback provided after upload completes
- [ ] Image/file preview shown before final upload submission

### Troubleshooting

**File not received by backend**: Verify FormData field name exactly matches backend's expected parameter name

**Invalid file type errors**: Check client-side `accept` attribute and backend MIME type validation match

**Large files failing or timing out**: Implement chunked upload mechanism or increase backend body size limit configuration

**Upload progress not displaying**: Add `onUploadProgress` callback handler to axios request config object

**Multiple files not working**: Use `formData.append('files', file)` multiple times or send array depending on backend expectations

### Best Practices

1. Validate file type and size on client-side before upload to provide immediate feedback
2. Show upload progress bar or percentage for better UX during slow uploads over network
3. Provide image/document preview before final upload submission for user confirmation
4. Handle upload errors gracefully with retry options for network failures
5. Clear file input field after successful upload to allow selecting same file again
6. Limit file sizes appropriately based on use case (profile pics: 5MB, documents: 10MB, videos: 100MB)
7. Support multiple concurrent file uploads when user needs to upload several files at once
8. Implement drag-and-drop file upload interface for enhanced user experience

## [Query Parameters for Filtering and Search]()

Query parameters enable flexible filtering, searching, sorting, and optional configuration without modifying route structure or requiring multiple endpoint variants. Axios params property automatically serializes JavaScript objects into properly URL-encoded query strings, appending them to request URLs with correct formatting and special character handling for robust server-side processing.

### When to use?

Use query parameters for search terms entered by users, filter options (status, category, price range, date range), sorting configuration (field, direction), pagination parameters (page, limit), or any optional parameters that should persist in shareable URLs. Essential for list pages with filtering capabilities, search results pages, data tables with column sorting, and any interface requiring flexible data querying.

### When NOT to use?

Do not use query params for required resource identifiers that define the endpoint itself (use route path parameters like `/products/:id` instead), for sensitive data that shouldn't appear in URLs and browser history (use POST with request body), or for deeply nested complex object structures that create unreadable URLs (consider POST with JSON body). Keep URLs clean, readable, and bookmarkable.

### Example

Service method accepting filter parameters and axios automatically serializing them to query string.

```typescript
export const ProductService = {
  async search(query: string, active?: boolean) {
    const response = await api.get('/products', {
      params: {
        search: query,
        active,
      },
    });
    return response.data;
  },
};

// Generates: /products?search=notebook&active=true
```

### Checklist

- [ ] Params object properly passed to axios request config
- [ ] Optional parameters handled correctly (undefined values excluded)
- [ ] URL query string reflects current active filters
- [ ] Filter state persists on page refresh via URL sync
- [ ] Clear filters button resets all params to defaults
- [ ] Query parameter types defined correctly in TypeScript
- [ ] Default values set for missing/undefined params
- [ ] Parameter validation before sending to prevent invalid requests

### Troubleshooting

**Params not sent to backend**: Ensure `params` object is in second argument (axios config), not request body

**Undefined params sent as strings**: Filter out undefined/null values before passing to axios params object

**URL encoding issues**: Let axios handle encoding automatically, don't manually encode with `encodeURIComponent`

**Type conversion problems**: Backend receives all params as strings, convert to numbers/booleans server-side

**Arrays not serialized correctly**: Use axios `paramsSerializer` config for custom array format (brackets, commas, repeat)

### Best Practices

1. Use descriptive, semantic parameter names that clearly indicate their purpose (search, status, sortBy)
2. Filter out undefined, null, or empty string values before sending to keep URLs clean
3. Provide prominent "Clear filters" button to reset all parameters to default state
4. Synchronize URL query params with component state for shareable, bookmarkable URLs
5. Validate parameter values client-side before sending to prevent invalid backend requests
6. Document expected parameter formats, allowed values, and defaults in service comments
7. Use consistent naming conventions across all endpoints (camelCase or snake_case, not mixed)
8. Consider using URL state management libraries like `use-query-params` for complex filter state

## [References]()

Official documentation and learning resources for technologies covered in this guide.

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React + Axios Best Practices](https://blog.logrocket.com/how-to-make-http-requests-like-a-pro-with-axios/)

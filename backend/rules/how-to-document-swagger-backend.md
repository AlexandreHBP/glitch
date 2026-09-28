# [How to Document with Swagger in Backend]()

Practical guide for documenting REST APIs using Swagger/OpenAPI decorators in NestJS backend, covering controllers, DTOs, responses, and authentication.

## [Swagger and OpenAPI Documentation Overview]()

Swagger (OpenAPI) automatically generates an interactive interface to test and document your REST API, accessible at http://localhost:3000/api/docs. It provides real-time API documentation with request/response examples and built-in testing capabilities directly from decorators in your NestJS code.

### When to use?

Use Swagger documentation for every REST API endpoint in your NestJS backend to provide interactive documentation, enable API testing without external tools, facilitate frontend development, and maintain up-to-date API contracts automatically generated from your code decorators.

### When NOT to use?

Swagger is essential for REST APIs - there's rarely a reason not to use it. However, for GraphQL APIs, use GraphQL Playground instead. For internal-only microservices with no external consumers, lighter documentation might suffice.

### Example

Access Swagger UI at `http://localhost:3000/api/docs` after setup to view interactive API documentation.

### Checklist

- [ ] Swagger installed and configured in main.ts
- [ ] All controllers documented with @ApiTags
- [ ] All endpoints have @ApiOperation
- [ ] All DTOs have @ApiProperty decorators
- [ ] Response types documented with @ApiResponse
- [ ] Authentication documented with @ApiBearerAuth

### Troubleshooting

**Issue**: Swagger UI not accessible
**Solution**: Verify SwaggerModule.setup() is called in main.ts and application is running on correct port.

**Issue**: Endpoints missing from documentation
**Solution**: Ensure controllers are properly registered in modules and have @Controller decorator.

### Best Practices

Document every endpoint as you create it - don't leave documentation for later. Use realistic examples in @ApiProperty that match production data. Document all possible response codes (200, 201, 400, 401, 404, 500). Keep documentation synchronized with implementation changes. Use meaningful descriptions that explain purpose, not just repeat the field name.

## [Initial Swagger Setup Configuration]()

Basic Swagger setup in NestJS project to enable automatic API documentation through configuration in main.ts file, including package installation and DocumentBuilder setup.

### When to use?

Perform initial Swagger setup once when creating a new NestJS project or when adding API documentation to an existing project without Swagger. This is a one-time setup that enables Swagger functionality project-wide.

### When NOT to use?

Skip if Swagger is already configured in your project. Don't reconfigure unless changing documentation settings like title, version, description, or authentication schemes like adding OAuth or API keys.

### Example

See installation and configuration code examples below for installing @nestjs/swagger package and configuring DocumentBuilder in main.ts.

### Checklist

- [ ] @nestjs/swagger package installed via npm
- [ ] DocumentBuilder configuration in main.ts
- [ ] SwaggerModule.setup() called with correct path
- [ ] Bearer auth added if using JWT authentication
- [ ] Swagger accessible at /api/docs endpoint
- [ ] API title, description, and version set appropriately

### Troubleshooting

**Issue**: Package installation fails with dependency errors
**Solution**: Ensure compatible @nestjs/swagger version with your NestJS version. Check npm registry connectivity and clear npm cache if needed.

**Issue**: Swagger UI shows empty documentation
**Solution**: Verify at least one controller with proper decorators exists and is registered in a module. Check browser console for errors.

**Issue**: Bearer auth not appearing in Swagger UI
**Solution**: Verify .addBearerAuth() is called in DocumentBuilder. Ensure controllers use @ApiBearerAuth decorator.

### Best Practices

Configure Swagger early in project setup to establish documentation habits from the start. Use semantic versioning for API version (1.0, 2.0). Include comprehensive description explaining API purpose and scope. Add authentication schemes that match your API security implementation. Use consistent path (/api/docs is standard convention). Keep main.ts configuration minimal and focused.

### [Step 1 - Install Dependencies]()

Install the required Swagger package for NestJS:

```bash
npm install @nestjs/swagger
```

### [Step 2 - Configure in main.ts]()

Add Swagger configuration to your application bootstrap:

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Complete API documentation')
    .setVersion('1.0')
    .addBearerAuth() // JWT support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
```

## [Controller and Endpoint Documentation with Decorators]()

Comprehensive decorators to document REST endpoints including tags for grouping, operation descriptions, parameter definitions, and response specifications using NestJS Swagger decorators at controller and method levels.

### When to use?

Apply controller-level decorators (@ApiTags, @ApiBearerAuth) to every controller class and endpoint-level decorators (@ApiOperation, @ApiResponse, @ApiParam, @ApiQuery) to every route handler method for comprehensive, accurate API documentation.

### When NOT to use?

All controllers and endpoints should be documented without exceptions. Even internal endpoints benefit from documentation for team clarity, onboarding new developers, and maintaining API contracts. There are no valid reasons to skip controller documentation.

### Example

See complete controller example below with all necessary decorators for CRUD operations including POST, GET, PATCH, and DELETE methods with proper documentation.

### Checklist

- [ ] @ApiTags on controller class for logical grouping
- [ ] @ApiBearerAuth if endpoints require authentication
- [ ] @ApiOperation on every endpoint with clear summary
- [ ] @ApiResponse for all possible status codes (200, 201, 400, 401, 404, 500)
- [ ] @ApiParam for route parameters (path variables)
- [ ] @ApiQuery for query string parameters (filtering, pagination)
- [ ] @ApiBody for request body when needed

### Troubleshooting

**Issue**: Decorators not affecting Swagger UI display
**Solution**: Ensure decorators are imported from @nestjs/swagger package, not other packages. Restart development server after adding decorators.

**Issue**: Response types showing as generic Object in Swagger
**Solution**: Specify explicit type in @ApiResponse or @ApiOkResponse decorators using type parameter.

**Issue**: Query parameters not showing in Swagger UI
**Solution**: Add @ApiQuery decorator for each query parameter. Ensure query parameter names match method signature.

### Best Practices

Add @ApiTags to group related endpoints logically by resource or domain. Write clear, concise summaries in @ApiOperation that explain what the endpoint does. Document all response codes including error scenarios. Use @ApiParam for path parameters with type and example. Add meaningful descriptions that help API consumers. Keep decorators close to implementation for easier maintenance. Document optional parameters clearly.

### [Main Decorators Import]()

Import these decorators from @nestjs/swagger:

```typescript
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
```

### [Complete Controller Example]()

Full example of documented controller with CRUD operations:

```typescript
@ApiTags('products') // Groups endpoints
@ApiBearerAuth() // Requires JWT token
@Controller({ path: 'products', version: '1' })
export class ProductController {

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll(+page, +pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find product by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove product' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

## [DTO and Data Schema Documentation with ApiProperty]()

Data Transfer Objects annotation with @ApiProperty decorator to generate accurate documentation of input and output schemas, including validation rules, examples, field descriptions, and data types for comprehensive API contracts.

### When to use?

Add @ApiProperty decorator to every field in every DTO used for request bodies or responses to document field purpose, data types, validation constraints, default values, and provide realistic examples for API consumers and frontend developers.

### When NOT to use?

All DTO properties should be documented without exception. Even internal DTOs and entities benefit from documentation for code clarity, maintenance, and ensuring consistency across the application. Never skip DTO documentation.

### Example

See DTO examples below with @ApiProperty annotations including descriptions, examples, validation constraints, enum types, and PartialType usage for update DTOs.

### Checklist

- [ ] @ApiProperty on every DTO field
- [ ] Description provided for each field explaining purpose
- [ ] Example value included matching production data format
- [ ] Type explicitly specified (string, number, boolean, enum)
- [ ] Validation constraints documented (min, max, length, pattern)
- [ ] Required/optional status clear (required: true/false)
- [ ] Enums properly defined with enum property
- [ ] PartialType used for update DTOs to inherit properties

### Troubleshooting

**Issue**: DTO fields not appearing in Swagger documentation
**Solution**: Ensure @ApiProperty decorator is present on each field. Verify DTO is used in controller method signature.

**Issue**: Examples not showing in Swagger UI
**Solution**: Add example property to @ApiProperty decorator. Use realistic, valid data matching field type and constraints.

**Issue**: Enum values not displaying correctly
**Solution**: Use enum property in @ApiProperty, not type. Ensure enum is defined and exported properly.

### Best Practices

Provide descriptive field descriptions that explain purpose and usage. Use realistic examples matching production data format and business domain. Document all constraints matching class-validator decorators to keep validation synchronized. Use PartialType for update DTOs to inherit properties and maintain DRY principle. Keep validation rules synchronized between @ApiProperty and class-validator decorators. Add default values when applicable.

### [Create DTO Example]()

Example DTO with complete @ApiProperty documentation:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Dell Notebook',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed product description',
    example: 'Dell Inspiron 15 Notebook, Intel i7, 16GB RAM',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price in reais',
    example: 2500.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;
}
```

### [Update DTO with PartialType]()

For update DTOs, use PartialType to inherit all properties as optional:

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// Inherits all properties but makes them optional
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### [DTO with Enum Example]()

Document enum types properly with enum property:

```typescript
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
```

## [Response Types and HTTP Status Code Documentation]()

HTTP response format specification with explicit types, status codes, and data structures using @ApiResponse family decorators to document all possible endpoint outcomes including success, client errors, and server errors.

### When to use?

Document every possible HTTP response for each endpoint including success responses (200, 201, 204), client errors (400, 401, 403, 404), and server errors (500) to provide complete API contract and help consumers handle all scenarios.

### When NOT to use?

All endpoints must document responses without exceptions. Even if endpoint only returns 200 success, document it explicitly for clarity and completeness. Never assume default response documentation is sufficient.

### Example

See response documentation examples below showing @ApiOkResponse, @ApiResponse with multiple status codes, typed responses, and array response types.

### Checklist

- [ ] Success responses documented (200, 201, 204)
- [ ] Client error responses documented (400, 401, 403, 404)
- [ ] Server error responses included when relevant (500)
- [ ] Response types specified with type parameter
- [ ] Array responses indicated with type: [EntityClass]
- [ ] Descriptions provided for each status code
- [ ] @ApiOkResponse used for standard 200 responses

### Troubleshooting

**Issue**: Response structure not showing correctly in Swagger
**Solution**: Specify explicit type parameter in @ApiResponse. Use class entities, not TypeScript interfaces which are removed at runtime.

**Issue**: Array responses showing as object in Swagger UI
**Solution**: Use type: [EntityClass] syntax with array brackets for array responses.

**Issue**: Response body schema not matching actual response
**Solution**: Ensure entity class has @ApiProperty decorators. Verify controller returns correct type.

### Best Practices

Document all realistic response codes your endpoint can return. Use @ApiOkResponse for 200 success responses for clarity. Specify explicit types for better documentation and type safety. Include error responses for both client errors (4xx) and server errors (5xx). Provide meaningful descriptions for each status code explaining when it occurs. Keep response documentation synchronized with actual implementation. Consider edge cases and error scenarios.

### [Response with Type Specification]()

Document responses with explicit entity types:

```typescript
import { ApiResponse, ApiOkResponse } from '@nestjs/swagger';

@ApiOkResponse({
  description: 'Product list',
  type: [ProductEntity], // Array of products
})
@Get()
findAll() {
  return this.service.findAll();
}

@ApiOkResponse({
  description: 'Product found',
  type: ProductEntity, // Single product
})
@Get(':id')
findOne(@Param('id') id: number) {
  return this.service.findOne(id);
}
```

### [Multiple Response Status Codes]()

Document all possible responses for comprehensive API contract:

```typescript
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Invalid data' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Not found' })
@Post()
create(@Body() dto: CreateProductDto) {
  return this.service.create(dto);
}
```

## [Common Swagger Decorators Reference]()

Comprehensive collection of @nestjs/swagger decorators to document different API aspects declaratively including tags, authentication, operations, parameters, queries, and properties.

### When to use?

Reference this section when implementing API documentation to understand which decorator to use for each documentation need. Use appropriate decorators based on what aspect of the API you're documenting.

### When NOT to use?

This is a reference section - use specific decorators as needed for your documentation requirements. Don't apply decorators that don't match your API design.

### Example

See decorator examples below for @ApiTags, @ApiBearerAuth, @ApiOperation, @ApiParam, @ApiQuery, @ApiBody, @ApiProperty, and @ApiPropertyOptional.

### Best Practices

Keep decorator usage consistent across your API. Use meaningful values in decorator parameters. Combine decorators appropriately for comprehensive documentation. Keep decorator values synchronized with implementation. Reference official NestJS Swagger documentation for advanced decorator features.

### [@ApiTags - Group Related Endpoints]()

Groups related endpoints by resource or domain:

```typescript
@ApiTags('products')
@Controller({ path: 'products', version: '1' })
export class ProductController {}

@ApiTags('categories')
@Controller({ path: 'categories', version: '1' })
export class CategoryController {}
```

### [@ApiBearerAuth - JWT Authentication]()

Indicates endpoint requires JWT token authentication:

```typescript
@ApiBearerAuth()
@Controller({ path: 'products', version: '1' })
export class ProductController {}
```

### [@ApiOperation - Endpoint Description]()

Describes what the endpoint does with summary and optional description:

```typescript
@ApiOperation({
  summary: 'Create new product',
  description: 'Endpoint to create a new product in the system',
})
@Post()
create() {}
```

### [@ApiParam - Route Parameters]()

Documents route parameters (path variables):

```typescript
@ApiParam({
  name: 'id',
  type: Number,
  description: 'Unique product ID',
  example: 1,
})
@Get(':id')
findOne(@Param('id') id: number) {}
```

### [@ApiQuery - Query String Parameters]()

Documents query parameters for filtering and pagination:

```typescript
@ApiQuery({
  name: 'search',
  required: false,
  type: String,
  description: 'Search term',
})
@ApiQuery({
  name: 'active',
  required: false,
  type: Boolean,
  description: 'Filter only active',
})
@Get()
findAll(
  @Query('search') search?: string,
  @Query('active') active?: boolean,
) {}
```

### [@ApiBody - Request Body Documentation]()

Documents request body with DTO type:

```typescript
@ApiBody({
  type: CreateProductDto,
  description: 'Product data',
})
@Post()
create(@Body() dto: CreateProductDto) {}
```

### [@ApiProperty - DTO Property Documentation]()

Documents DTO properties with type, validation, and examples:

```typescript
@ApiProperty({
  description: 'Product name',
  example: 'Notebook',
  minLength: 3,
  maxLength: 255,
  required: true,
})
name: string;

@ApiProperty({
  description: 'Price',
  example: 1500.00,
  minimum: 0,
  type: Number,
})
price: number;

@ApiProperty({
  description: 'Product tags',
  type: [String],
  example: ['electronics', 'computer'],
  required: false,
})
tags?: string[];
```

### [@ApiPropertyOptional - Optional Fields]()

Shorthand decorator for optional fields:

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';

@ApiPropertyOptional({
  description: 'Optional description',
  example: 'Detailed description',
})
description?: string;
```

## [Hide Sensitive Properties from Documentation]()

Methods to exclude sensitive properties from Swagger documentation and API responses using @ApiHideProperty and @Exclude decorators to protect sensitive data like passwords and internal fields.

### When to use?

Use @ApiHideProperty to hide fields from Swagger documentation while keeping them in responses. Use @Exclude from class-transformer to remove fields from serialization entirely. Apply to sensitive data like passwords, tokens, and internal implementation details.

### When NOT to use?

Don't hide properties that are necessary for API consumers to understand. Don't use as a substitute for proper authorization checks. Don't hide validation errors or business-relevant data that helps developers integrate with your API.

### Example

See examples below showing @ApiHideProperty to hide from Swagger and @Exclude to remove from responses entirely.

### Checklist

- [ ] Sensitive fields identified (passwords, tokens, internal IDs)
- [ ] @ApiHideProperty applied to fields hidden from docs only
- [ ] @Exclude applied to fields removed from responses
- [ ] ClassSerializerInterceptor enabled for @Exclude to work
- [ ] Validation that sensitive data not exposed in responses

### Troubleshooting

**Issue**: @ApiHideProperty not hiding field from Swagger
**Solution**: Ensure decorator imported from @nestjs/swagger. Restart server after adding decorator.

**Issue**: @Exclude not removing field from response
**Solution**: Verify ClassSerializerInterceptor is applied globally or to controller/method. Import @Exclude from class-transformer.

### Best Practices

Always hide password fields, tokens, and internal implementation details. Use @Exclude for complete removal from responses. Use @ApiHideProperty when field exists in response but shouldn't appear in docs. Apply ClassSerializerInterceptor globally for consistent behavior. Test that sensitive fields don't leak in actual API responses.

### [@ApiHideProperty - Hide from Documentation]()

Hides property from Swagger documentation but keeps in responses:

```typescript
import { ApiHideProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty()
  email: string;

  @ApiHideProperty() // Doesn't appear in Swagger
  passwordHash: string;
}
```

### [@Exclude - Remove from Serialization]()

Excludes field from API responses entirely using class-transformer:

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  @Exclude() // Never returns to client
  passwordHash: string;
}
```

## [Test API Using Swagger UI Interface]()

Instructions to use Swagger's interactive interface to test authenticated and unauthenticated endpoints directly from the browser without external tools like Postman or cURL.

### When to use?

Use Swagger UI to test API endpoints during development, verify documentation accuracy, test authentication flows, and validate request/response schemas. Ideal for quick testing without setting up external API clients.

### When NOT to use?

For automated testing, use Jest or integration tests instead. For load testing, use dedicated tools. For complex multi-step workflows, consider using Postman or automated test scripts.

### Example

Access Swagger UI at http://localhost:3000/api/docs to view interactive documentation and test endpoints.

### Checklist

- [ ] Swagger UI accessible at configured endpoint
- [ ] JWT token obtained from auth endpoint
- [ ] Token added via Authorize button
- [ ] Test endpoint by clicking Try it out
- [ ] Parameters filled correctly
- [ ] Response validated against documentation

### Troubleshooting

**Issue**: Authorize button not visible in Swagger UI
**Solution**: Ensure .addBearerAuth() called in DocumentBuilder and @ApiBearerAuth used on controllers.

**Issue**: Authentication failing with valid token
**Solution**: Verify token format includes "Bearer " prefix. Check token not expired.

### Best Practices

Test endpoints immediately after creating them. Verify all response codes work correctly. Test with invalid data to confirm validation. Use realistic test data matching production scenarios. Test authentication flows completely.

### [Step 1 - Access Documentation]()

Navigate to Swagger UI in your browser:

```
http://localhost:3000/api/docs
```

### [Step 2 - Authenticate with JWT]()

1. Click the "Authorize" button (padlock icon at top right)
2. Paste the JWT token in format: `Bearer your_token_here`
3. Click "Authorize" button
4. Click "Close" to return to documentation

### [Step 3 - Test Endpoints]()

1. Expand the desired endpoint section
2. Click "Try it out" button
3. Fill in the required parameters and request body
4. Click "Execute" button
5. View the response with status code, headers, and body

## [Paginated Response Documentation Pattern]()

Generic DTO example to document paginated responses consistently throughout the API with standard fields for data, total count, page number, page size, and total pages.

### When to use?

Use paginated response DTO for any endpoint that returns lists of resources with pagination support. Apply consistently across all list endpoints to maintain uniform pagination structure.

### When NOT to use?

Don't use for endpoints returning single resources. Skip for endpoints returning complete small datasets that don't require pagination. Avoid for streaming or cursor-based pagination which requires different structure.

### Example

See PaginatedResponseDto example below with generic type support for any entity type.

### Checklist

- [ ] PaginatedResponseDto created with generic type
- [ ] All list endpoints use consistent pagination structure
- [ ] Total count included for UI pagination controls
- [ ] Page and pageSize documented clearly
- [ ] totalPages calculated and included

### Troubleshooting

**Issue**: Generic type not showing correctly in Swagger
**Solution**: Use type: [Object] for generic arrays. Consider creating specific typed DTOs for better Swagger docs.

**Issue**: Pagination metadata inconsistent across endpoints
**Solution**: Centralize pagination DTO and reuse across all endpoints. Create pagination utility function.

### Best Practices

Use consistent field names across all paginated responses. Always include total count for pagination UI. Calculate totalPages on backend for convenience. Document pagination query parameters (@ApiQuery for page, pageSize). Consider adding hasNext/hasPrevious boolean fields for easier navigation.

### [Generic Paginated Response DTO]()

```typescript
export class PaginatedResponseDto<T> {
  @ApiProperty({ type: [Object] })
  data: T[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

// Usage in controller
@ApiOkResponse({
  description: 'Paginated product list',
  type: PaginatedResponseDto,
})
@Get()
findAll() {
  return this.service.findAllPaginated();
}
```

## [Complete Endpoint Documentation Checklist]()

Comprehensive checklist to ensure every API endpoint is fully documented with all required decorators and follows project standards including versioning and security.

### When to use?

Use this checklist for every new endpoint you create and when reviewing existing endpoints for documentation completeness. Ensure all items are checked before considering endpoint documentation complete.

### When NOT to use?

This checklist applies to all REST API endpoints without exception. Never skip checklist items unless they genuinely don't apply to your specific endpoint.

### Checklist

- [ ] **@Controller with versioning (`version: '1'`)**
- [ ] @ApiTags on controller for logical grouping
- [ ] @ApiBearerAuth on controller if protected
- [ ] @ApiOperation with clear summary on method
- [ ] @ApiResponse for each possible status code
- [ ] @ApiParam for all route parameters
- [ ] @ApiQuery for all query parameters
- [ ] @ApiProperty on all DTO fields
- [ ] Realistic examples in @ApiProperty
- [ ] Validation decorators synchronized with documentation
- [ ] Tested in Swagger UI

### Important Note

**IMPORTANT**: All APIs must use versioning. See [How to version API](./how-to-version-api-backend.md) for versioning guidelines.

### Best Practices

Complete this checklist before committing endpoint code. Review checklist during code reviews. Use as template when creating new endpoints. Keep synchronized with project documentation standards.

## [Quick Tips for Effective API Documentation]()

Essential tips and recommendations for creating high-quality, maintainable Swagger documentation that serves both API consumers and development team.

### Best Practices

**Use realistic examples**: Provide examples that match actual production data format and business domain. Helps frontend developers and API consumers understand expected data structure immediately.

**Document all status codes**: Include all possible HTTP response codes (200, 201, 400, 401, 404, 500) with meaningful descriptions explaining when each occurs. Don't assume consumers know HTTP status code meanings in your context.

**Describe fields well**: Explain what each field represents, expected format, and business meaning. Don't just repeat field name - add value explaining purpose and usage.

**Group with @ApiTags**: Organize endpoints into logical groups by resource or domain. Makes documentation easier to navigate and understand API structure.

**Hide sensitive data**: Use @Exclude or @ApiHideProperty to prevent sensitive data like passwords, tokens, and internal IDs from appearing in documentation or responses.

**Document as you code**: Add Swagger decorators while implementing endpoints, not as separate task. Keeps documentation synchronized with implementation and reduces documentation debt.

## [External References and Resources]()

Official documentation and specifications for deeper learning about NestJS Swagger integration and OpenAPI standards.

### Reference Links

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction) - Official NestJS guide for Swagger/OpenAPI integration
- [OpenAPI Specification](https://swagger.io/specification/) - Complete OpenAPI 3.0 specification documentation

# [How to Use Data Validation in the API]()

Complete guide on data validation using class-validator in NestJS with DTOs, automatic validation pipes, custom validators, and error handling.

## [ValidationPipe Global Configuration in NestJS]()

This section explains how to configure NestJS ValidationPipe globally in the main.ts file to automatically validate all incoming HTTP request data using class-validator decorators on DTOs throughout the application.

### When to use?

Configure global ValidationPipe when starting a new NestJS project to ensure all endpoints automatically validate request data, prevent invalid data from reaching controllers and services, and standardize validation behavior across the entire application.

### When NOT to use?

Do not use global ValidationPipe if you need different validation strategies per endpoint. Do not use if the project requires manual validation control. Do not use whitelist options if you intentionally need to accept extra fields.

### Example

**File**: `src/main.ts`

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                    // Remove undeclared properties
      forbidNonWhitelisted: true,         // Error if extra properties
      transform: true,                    // Transform types automatically
      transformOptions: {
        enableImplicitConversion: false,  // Don't convert types implicitly
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

**Configuration Options:**

- **whitelist**: Removes fields not defined in the DTO
- **forbidNonWhitelisted**: Returns 400 error if extra fields are sent
- **transform**: Converts query params and params to the correct type
- **enableImplicitConversion**: false to avoid unexpected conversions

### Checklist

- [ ] ValidationPipe configured in main.ts
- [ ] whitelist enabled to strip extra properties
- [ ] forbidNonWhitelisted enabled for strict validation
- [ ] transform enabled for type conversion
- [ ] enableImplicitConversion set to false

### Troubleshooting

**Extra fields not being removed**
- Solution: Ensure whitelist is set to true in ValidationPipe configuration

**Valid requests returning 400 errors**
- Solution: Check if DTO has all required decorators, verify forbidNonWhitelisted is not too strict

**Type conversion not working**
- Solution: Enable transform option, use @Type() decorator on DTO fields

### Best Practices

- Always configure ValidationPipe globally for consistency
- Use whitelist and forbidNonWhitelisted for security
- Keep enableImplicitConversion false to avoid unexpected behavior
- Validate all DTOs explicitly with decorators
- Document validation requirements in API documentation

## [String Validators - IsString IsNotEmpty MinLength MaxLength IsEmail IsUrl Matches]()

This section covers all class-validator decorators for validating string fields including presence checks, length constraints, format validation for emails and URLs, and pattern matching with regular expressions.

### When to use?

Use string validators when validating text inputs like names, usernames, emails, URLs, phone numbers, or any field that requires string format validation, length constraints, or pattern matching in your DTOs.

### When NOT to use?

Do not use string validators on non-string fields. Do not use @IsString alone without additional constraints. Do not use complex regex when simpler validators like @IsEmail or @IsUrl suffice.

### Example

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEmpty,
  MinLength,
  MaxLength,
  Length,
  Matches,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUrl()
  website: string;

  @Length(11, 11) // Exactly 11 characters
  cpf: string;

  @Matches(/^[0-9]+$/, { message: 'Numbers only' })
  phone: string;

  @IsString()
  @MaxLength(500)
  description: string;
}
```

### Checklist

- [ ] @IsString on all string fields
- [ ] @IsNotEmpty on required fields
- [ ] MinLength/MaxLength for reasonable constraints
- [ ] @IsEmail for email fields
- [ ] @IsUrl for URL fields
- [ ] @Matches for custom patterns
- [ ] Custom messages for user-facing errors

### Troubleshooting

**Email validation accepting invalid emails**
- Solution: Use @IsEmail() instead of custom regex, it handles edge cases

**MaxLength not working**
- Solution: Ensure transform is enabled in ValidationPipe, check field is actually string

**Regex pattern not matching**
- Solution: Test regex separately, escape special characters correctly, use online regex testers

### Best Practices

- Always combine @IsString with length constraints
- Use @IsEmail instead of regex for email validation
- Use @IsUrl for URL validation instead of custom patterns
- Provide meaningful custom error messages
- Keep regex patterns simple and well-documented

## [Numeric Validators - IsNumber IsInt Min Max IsPositive IsNegative IsDivisibleBy]()

This section demonstrates class-validator decorators for validating numeric fields including integer validation, minimum and maximum value constraints, positive and negative number checks, and divisibility requirements.

### When to use?

Use numeric validators when validating prices, quantities, ages, ratings, scores, percentages, or any numeric field that requires range constraints, integer validation, or mathematical property checks in your DTOs.

### When NOT to use?

Do not use @IsNumber for fields that should be strings (like postal codes). Do not use @IsPositive when zero is valid. Do not use @IsInt for fields that require decimal precision.

### Example

```typescript
import {
  IsNumber,
  IsInt,
  Min,
  Max,
  IsPositive,
  IsNegative,
  IsDivisibleBy,
} from 'class-validator';

export class CreateProductDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  stock: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  discount: number;

  @IsPositive()
  weight: number;

  @IsInt()
  @IsDivisibleBy(5)
  packSize: number;
}
```

### Checklist

- [ ] @IsNumber or @IsInt on numeric fields
- [ ] Min/Max constraints for valid ranges
- [ ] @IsPositive for values that must be > 0
- [ ] @IsInt for whole numbers
- [ ] Appropriate precision for decimal numbers

### Troubleshooting

**Decimal numbers failing @IsInt**
- Solution: Use @IsNumber instead of @IsInt for decimal values

**String numbers not converting**
- Solution: Enable transform in ValidationPipe or use @Type(() => Number) decorator

**Negative numbers passing @IsPositive**
- Solution: Verify ValidationPipe is configured correctly, check decorator order

### Best Practices

- Use @IsInt for whole numbers, @IsNumber for decimals
- Always set Min/Max for reasonable business constraints
- Use @IsPositive instead of @Min(0.01) for clarity
- Combine multiple decorators for precise validation
- Consider using @Type(() => Number) for query params

## [Boolean and Date Validators - IsBoolean IsDate MinDate MaxDate with Type Transformation]()

This section covers validation for boolean fields and date fields including date format validation, minimum and maximum date constraints, and proper handling of date objects in DTOs.

### When to use?

Use boolean validators for flags, toggles, and true/false fields. Use date validators for birthdates, start/end dates, deadlines, or any temporal data requiring format validation and range constraints.

### When NOT to use?

Do not use @IsBoolean for fields that can be null/undefined without @IsOptional. Do not use @IsDate without proper type transformation. Do not use MinDate/MaxDate with dynamic values that change.

### Example

```typescript
import { IsBoolean, IsDate, MinDate, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsBoolean()
  active: boolean;

  @IsBoolean()
  published: boolean;

  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @Type(() => Date)
  @IsDate()
  @MinDate(new Date('2024-01-01'))
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date())
  endDate: Date;
}
```

### Checklist

- [ ] @IsBoolean on boolean fields
- [ ] @Type(() => Date) before @IsDate
- [ ] MinDate/MaxDate for date constraints
- [ ] Appropriate date ranges for business logic
- [ ] Consider timezone implications

### Troubleshooting

**Date validation always failing**
- Solution: Add @Type(() => Date) decorator before @IsDate

**Boolean validation accepting strings**
- Solution: Ensure transform is enabled in ValidationPipe

**MinDate/MaxDate not working**
- Solution: Verify dates are actual Date objects, check @Type() decorator present

### Best Practices

- Always use @Type(() => Date) with @IsDate for incoming data
- Set reasonable MinDate/MaxDate constraints for business rules
- Consider timezone implications for date validation
- Use @Type(() => Boolean) for query params
- Document date format expectations in API documentation

## [Array and Enum Validators - IsArray ArrayMinSize ArrayMaxSize IsEnum with Element Validation]()

This section demonstrates validation for array fields and enum fields including array size constraints, element-level validation, and enum value restriction to ensure data consistency and type safety.

### When to use?

Use array validators for lists of tags, categories, items, or any collection fields. Use enum validators when a field must be one of a predefined set of values for status, type, or category fields.

### When NOT to use?

Do not use @IsArray for single-value fields. Do not use @IsEnum for dynamic values that change frequently. Do not validate array elements without @IsString({ each: true }) or @ValidateNested.

### Example

```typescript
import { IsArray, ArrayMinSize, ArrayMaxSize, IsString, IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
```

### Checklist

- [ ] @IsArray on array fields
- [ ] ArrayMinSize/ArrayMaxSize for reasonable limits
- [ ] @IsString({ each: true }) for string arrays
- [ ] @IsEnum on enum fields
- [ ] Enum defined with proper values

### Troubleshooting

**Array validation not validating elements**
- Solution: Add { each: true } option to element validators like @IsString({ each: true })

**Enum validation accepting invalid values**
- Solution: Verify enum is properly defined, check for typos in enum values

**Array size constraints not working**
- Solution: Ensure ValidationPipe transform is enabled, verify array is actually an array

### Best Practices

- Always validate array elements with { each: true }
- Set reasonable ArrayMinSize/ArrayMaxSize constraints
- Define enums with descriptive string values
- Use TypeScript enums for type safety
- Document allowed enum values in API documentation

## [Optional Fields and Conditional Validation - IsOptional ValidateIf Techniques]()

This section explains how to mark fields as optional using @IsOptional, implement conditional validation with @ValidateIf based on other field values, and properly handle nullable or undefined fields in DTOs.

### When to use?

Use @IsOptional for truly optional fields that can be undefined. Use @ValidateIf when field validation depends on another field's value, like conditional required fields based on payment method or user type.

### When NOT to use?

Do not use @IsOptional for fields that should be required. Do not use @ValidateIf for simple optional fields. Do not confuse @IsOptional with nullable fields.

### Example

```typescript
import { IsOptional, IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Required

  @IsString()
  @IsOptional()
  description?: string; // Optional, can be undefined

  @IsString()
  @IsOptional()
  @IsNotEmpty() // If provided, cannot be empty
  notes?: string;
}

export class CreatePaymentDto {
  @IsString()
  paymentMethod: string;

  // Only validates if paymentMethod === 'credit_card'
  @ValidateIf(o => o.paymentMethod === 'credit_card')
  @IsString()
  @IsNotEmpty()
  cardNumber?: string;

  @ValidateIf(o => o.paymentMethod === 'credit_card')
  @IsString()
  @IsNotEmpty()
  cardHolderName?: string;
}
```

### Checklist

- [ ] @IsOptional on truly optional fields
- [ ] Optional fields marked with ? in TypeScript
- [ ] @ValidateIf for conditional validation
- [ ] Validation logic in @ValidateIf is correct
- [ ] Combination of @IsOptional and @IsNotEmpty when appropriate

### Troubleshooting

**Optional field validation failing when undefined**
- Solution: Ensure @IsOptional is first decorator, before other validators

**ValidateIf not working**
- Solution: Check callback function logic, ensure it returns boolean, verify field names match

**Required field accepted as undefined**
- Solution: Remove @IsOptional or ensure @IsNotEmpty is present

### Best Practices

- Place @IsOptional as the first decorator
- Use TypeScript optional (?) for optional fields
- Use @ValidateIf for complex conditional logic
- Combine @IsOptional with @IsNotEmpty for "if provided, not empty" logic
- Document conditional validation logic clearly

## [Nested Object Validation and Type Transformation - ValidateNested with Type Decorators]()

This section demonstrates validating nested DTOs using @ValidateNested and @Type decorators, automatic type transformation with class-transformer, and handling complex object structures in request bodies.

### When to use?

Use @ValidateNested for DTOs containing nested objects like addresses, contact information, or complex structured data. Use @Type() for automatic type conversion from strings to numbers, booleans, or dates.

### When NOT to use?

Do not use @ValidateNested for simple objects without validation rules. Do not use @Type() when transformation is not needed. Do not nest DTOs too deeply (max 2-3 levels).

### Example

```typescript
import { ValidateNested, IsString, IsNotEmpty, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number;

  @Type(() => Boolean)
  @IsBoolean()
  active: boolean;
}
```

### Checklist

- [ ] @ValidateNested for nested objects
- [ ] @Type(() => ClassName) for nested DTOs
- [ ] @Type(() => Number) for numeric conversions
- [ ] @Type(() => Boolean) for boolean conversions
- [ ] @Type(() => Date) for date conversions

### Troubleshooting

**Nested validation not working**
- Solution: Ensure @Type(() => NestedDto) is present with @ValidateNested

**Type transformation failing**
- Solution: Verify transform is enabled in ValidationPipe, add @Type decorator

**Query params not converting**
- Solution: Add @Type(() => Number) or appropriate transformation decorator

### Best Practices

- Always use @Type() with @ValidateNested
- Transform query params and path params explicitly
- Keep nested DTO structures shallow (max 2-3 levels)
- Use @Transform for custom transformation logic
- Validate nested arrays with @ValidateNested({ each: true })

## [Custom Validators and Error Messages - Creating Domain-Specific Validation Rules]()

This section shows how to create custom validation decorators for business-specific rules, customize error messages for better user experience, and implement complex validation logic not covered by built-in validators.

### When to use?

Create custom validators for domain-specific validation like CPF/CNPJ, credit card numbers, complex business rules, or any validation logic not provided by class-validator built-in decorators.

### When NOT to use?

Do not create custom validators for validation already covered by built-in decorators. Do not put complex business logic in validators (use use-cases instead). Do not create validators that depend on external services.

### Example

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCPF', async: false })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: string, args: ValidationArguments) {
    // CPF validation logic
    if (!/^[0-9]{11}$/.test(cpf)) return false;

    // Add actual CPF validation algorithm here
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid CPF format';
  }
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCPFConstraint,
    });
  };
}

// Usage
export class CreateUserDto {
  @IsCPF({ message: 'The CPF provided is invalid' })
  cpf: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  name: string;
}
```

### Checklist

- [ ] Custom validator class created
- [ ] ValidatorConstraintInterface implemented
- [ ] Decorator function exported
- [ ] Custom messages provided
- [ ] Validation logic tested

### Troubleshooting

**Custom validator not being called**
- Solution: Ensure decorator is registered with registerDecorator, verify ValidationPipe is configured

**Error message not customized**
- Solution: Check defaultMessage method in constraint class or pass message option to decorator

### Best Practices

- Implement ValidatorConstraintInterface for custom validators
- Provide clear, user-friendly error messages
- Keep validation logic pure (no external dependencies)
- Test custom validators thoroughly
- Document custom validators for team reference

## [Validation Error Response Structure - Understanding and Customizing Error Formats]()

This section explains the default NestJS validation error response format, how to customize error responses using exception filters, and best practices for providing meaningful validation errors to frontend applications.

### When to use?

Customize error responses when you need specific error format for frontend, when implementing standardized API error responses, or when providing more detailed validation error information to clients.

### When NOT to use?

Do not customize error responses if the default format works for your use case. Do not include sensitive information in error messages. Do not change error format frequently.

### Example

**Default Error Response:**

```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "price must not be less than 0",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

**Custom Exception Filter:**

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      errors: exceptionResponse.message,
      path: ctx.getRequest().url,
    });
  }
}
```

### Checklist

- [ ] Understand default error structure
- [ ] Custom filter implemented if needed
- [ ] Error messages are user-friendly
- [ ] Frontend can parse error responses
- [ ] Consistent error format across API

### Troubleshooting

**Error filter not catching validation errors**
- Solution: Ensure filter is registered globally or on controller, verify @Catch decorator

**Frontend cannot parse errors**
- Solution: Standardize error response format, document error structure

### Best Practices

- Use default error format unless specific requirements exist
- Provide clear, actionable error messages
- Include field names in error messages
- Document error response structure in API docs
- Avoid exposing internal implementation details in errors

## [Complete DTO Example with Swagger Integration - Production-Ready Template]()

This section provides a comprehensive example DTO demonstrating all validation techniques, Swagger documentation integration, proper decorator usage, and real-world patterns for creating production-ready DTOs.

### When to use?

Use this example as a template when creating new DTOs, when reviewing DTO quality, when training team members on validation best practices, or when establishing DTO standards for the project.

### When NOT to use?

Do not copy this example blindly for every DTO. Adapt validation rules to your specific domain. Do not add unnecessary validations. Do not over-complicate simple DTOs.

### Example

```typescript
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsEmail,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
}

class ProductSpecsDto {
  @ApiProperty({ example: '1920x1080' })
  @IsString()
  @IsNotEmpty()
  resolution: string;

  @ApiProperty({ example: 15.6 })
  @IsNumber()
  screenSize: number;
}

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

  @ApiPropertyOptional({
    description: 'Detailed description',
    example: 'High-performance laptop for professionals',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price in BRL',
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
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Product category',
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
  })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({
    description: 'Product tags',
    type: [String],
    example: ['laptop', 'dell', 'professional'],
  })
  @IsString({ each: true })
  @ArrayMinSize(1)
  tags: string[];

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Product specifications',
    type: ProductSpecsDto,
  })
  @ValidateNested()
  @Type(() => ProductSpecsDto)
  specs: ProductSpecsDto;

  @ApiProperty({
    description: 'Contact email',
    example: 'contact@example.com',
  })
  @IsEmail()
  email: string;
}
```

### Checklist

- [ ] All required fields validated
- [ ] @IsOptional on optional fields
- [ ] Min/Max constraints applied
- [ ] @ApiProperty for all fields
- [ ] Enums properly defined and validated
- [ ] Nested objects validated
- [ ] Custom error messages where needed
- [ ] Realistic example values in Swagger

### Troubleshooting

**Swagger not showing DTO properly**
- Solution: Ensure @ApiProperty on all fields, check Swagger setup in main.ts

**Validation too strict/too loose**
- Solution: Review business requirements, adjust Min/Max and other constraints accordingly

### Best Practices

- Document all fields with @ApiProperty for Swagger
- Use realistic example values
- Validate all input comprehensively
- Combine validators appropriately
- Keep DTOs focused and cohesive
- See `./typescript-patterns-standards.md` for typing standards

## [DTO Validation Code Review Checklist - Quality Assurance Guidelines]()

This section provides a comprehensive checklist for reviewing DTOs to ensure all validation requirements are met, proper decorators are used, Swagger documentation is complete, and best practices are followed.

### When to use?

Use this checklist during code reviews when creating or modifying DTOs, before merging pull requests that add new endpoints, or when auditing existing DTOs for quality and completeness.

### When NOT to use?

Do not use this checklist blindly without understanding context. Do not enforce unnecessary validations. Do not block PRs for minor documentation issues if functionality is correct.

### Example

**For each DTO verify:**

- [ ] Validators on all required fields (@IsNotEmpty, @IsString, etc.)
- [ ] @IsOptional on all optional fields
- [ ] Optional fields marked with `?` in TypeScript
- [ ] Min/Max constraints on numbers and strings
- [ ] Format validation (email, URL, etc.) where applicable
- [ ] @ApiProperty or @ApiPropertyOptional on all fields
- [ ] Realistic example values in Swagger decorators
- [ ] Custom error messages for user-facing errors
- [ ] Type transformation decorators (@Type) where needed
- [ ] Nested objects validated with @ValidateNested
- [ ] Arrays validated with array validators
- [ ] Enums defined and validated properly
- [ ] No `any` types used (see `./typescript-patterns-standards.md`)
- [ ] DTO follows naming convention (Create*, Update*, etc.)

### Checklist

- [ ] All required fields have validators
- [ ] Optional fields properly marked
- [ ] Swagger documentation complete
- [ ] Error messages are clear
- [ ] No TypeScript any types used
- [ ] DTO naming follows conventions

### Troubleshooting

**Too many validation failures**
- Solution: Review DTO requirements with product owner, simplify if over-validating

**Inconsistent validation across similar DTOs**
- Solution: Extract common validation patterns to base DTOs or shared validators

### Best Practices

- Use checklist as guide, not rigid rules
- Adapt validation to business requirements
- Balance between too strict and too loose validation
- Ensure consistency across similar DTOs
- Document complex validation logic

## [Official Documentation References - class-validator NestJS Resources]()

This section provides links to official class-validator, class-transformer, and NestJS validation documentation for deeper understanding, advanced techniques, and staying updated with latest features and best practices.

### When to use?

Reference official documentation when implementing advanced validation scenarios, when troubleshooting complex validation issues, when learning new class-validator features, or when clarifying decorator behavior.

### When NOT to use?

Do not skip project-specific documentation in favor of official docs. Do not use outdated documentation versions. Do not implement patterns that conflict with project standards.

### Example

**Official Documentation:**

- [class-validator GitHub](https://github.com/typestack/class-validator) - Complete decorator reference and examples
- [class-transformer GitHub](https://github.com/typestack/class-transformer) - Type transformation documentation
- [NestJS Validation](https://docs.nestjs.com/techniques/validation) - NestJS-specific validation guide
- [NestJS Pipes](https://docs.nestjs.com/pipes) - Understanding ValidationPipe in depth

**Related Project Documentation:**

- TypeScript standards: `./typescript-patterns-standards.md`
- How to create DTOs: `./how-to-create-api-backend.md`
- Swagger documentation: `./how-to-document-swagger-backend.md`

### Checklist

- [ ] class-validator documentation reviewed
- [ ] class-transformer usage understood
- [ ] NestJS validation techniques familiar
- [ ] Project-specific rules followed
- [ ] Latest decorator features known

### Troubleshooting

**Documentation seems outdated**
- Solution: Check package.json for installed versions, consult matching documentation version

**Project patterns differ from official docs**
- Solution: Follow project-specific .rules documentation, consult team for clarification

### Best Practices

- Bookmark official documentation for quick reference
- Follow project .rules before official documentation when conflicts arise
- Stay updated with class-validator changelog
- Share useful patterns discovered with team
- Contribute to internal documentation when finding gaps

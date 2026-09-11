# [How to Handle Dates - Backend and Frontend]()

Complete guide on correct date handling in backend and frontend using ISODate UTC in the database and dayjs for manipulation across distributed systems.

## [UTC-based Date Storage and Manipulation in PostgreSQL and TypeORM]()

Essential concepts for storing dates in PostgreSQL using TIMESTAMPTZ type ensuring UTC storage, TypeORM entity configuration with timestamptz column type, and migration setup for timestamp with timezone support across distributed systems avoiding daylight saving issues.

### When to use?

Use this pattern when storing any date or timestamp data in PostgreSQL database including event dates, user activity timestamps, scheduled tasks, audit logs, or any time-sensitive data requiring consistency across different timezones and servers in distributed environments.

### When NOT to use?

Do not use this pattern for date-only fields without time component where timezone is irrelevant such as birthdate or anniversary where only the calendar date matters regardless of timezone. For these cases use DATE type instead of TIMESTAMPTZ.

### Example

TypeORM entity with TIMESTAMPTZ configuration and PostgreSQL migration for proper UTC storage.

**TypeORM Entity with TIMESTAMPTZ:**

```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@/database/entities/super.entity';

@Entity('events')
export class Event extends SuperEntity {
  @Column({ type: 'timestamptz' })
  event_date: Date;

  @Column({ type: 'timestamptz' })
  start_date: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_date: Date;
}
```

**PostgreSQL Migration:**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_date" TIMESTAMPTZ NOT NULL,
        "start_date" TIMESTAMPTZ NOT NULL,
        "end_date" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_events" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "events";`);
  }
}
```

### Checklist

- [ ] Use `{ type: 'timestamptz' }` in TypeORM entity decorators
- [ ] Use `TIMESTAMPTZ` (uppercase) in SQL migration queries
- [ ] Set `synchronize: false` in TypeORM config to rely on migrations
- [ ] Never use `timestamp` or `timestamp without time zone` types
- [ ] Verify PostgreSQL stores internally in UTC by checking pg_timezone_names

### Troubleshooting

**Problem**: Dates showing incorrect time after retrieval
- **Solution**: Ensure column type is `timestamptz` not `timestamp`, check TypeORM entity decorator has correct type

**Problem**: TypeORM synchronize creates `timestamp` instead of `timestamptz`
- **Solution**: Disable synchronize and always use migrations for production, explicitly set type in Column decorator

**Problem**: Migration fails with "type timestamptz does not exist"
- **Solution**: Use uppercase `TIMESTAMPTZ` in raw SQL queries, ensure PostgreSQL version supports timestamptz (9.1+)

### Best Practices

- Always use `timestamptz` in TypeORM entities and `TIMESTAMPTZ` in SQL migrations
- PostgreSQL stores all timestamptz values internally in UTC regardless of server timezone
- Never rely on synchronize in production, always use migrations for schema changes
- Document expected timezone behavior in API documentation for consumers

## [Backend Date Manipulation with dayjs and UTC Operations]()

Implementation of UTC date manipulation in NestJS backend using dayjs library including DTO validation with ISO8601 format, service layer date conversion from ISO strings to Date objects, and query operations maintaining UTC consistency throughout the application lifecycle.

### When to use?

Use dayjs with UTC plugin for all backend date operations including parsing ISO date strings from frontend, calculating date differences, adding or subtracting time periods, formatting dates for logs, comparing dates, and converting to Date objects before database persistence.

### When NOT to use?

Do not use dayjs for simple current timestamp retrieval where `new Date()` suffices, do not use for timezone conversion in backend as all backend operations must remain in UTC, and avoid using dayjs format for API responses as TypeORM automatically serializes Date to ISO UTC string.

### Example

DTO validation with ISO8601 format and service implementation with dayjs UTC operations.

**DTO with ISO8601 Validation:**

```typescript
import { IsISO8601, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: '2025-11-02T14:30:00Z',
    description: 'Event date and time in ISO 8601 UTC format'
  })
  @IsISO8601()
  event_date: string;

  @ApiProperty({
    example: '2025-11-02T09:00:00Z',
    description: 'Start date and time in ISO 8601 UTC format'
  })
  @IsISO8601()
  start_date: string;

  @ApiProperty({
    example: '2025-11-02T18:00:00Z',
    description: 'End date and time in ISO 8601 UTC format',
    required: false
  })
  @IsISO8601()
  @IsOptional()
  end_date?: string;
}
```

**Service with dayjs UTC Operations:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

dayjs.extend(utc);

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    // Convert ISO string to UTC Date
    const event = this.eventRepository.create({
      ...createEventDto,
      event_date: dayjs.utc(createEventDto.event_date).toDate(),
      start_date: dayjs.utc(createEventDto.start_date).toDate(),
      end_date: createEventDto.end_date
        ? dayjs.utc(createEventDto.end_date).toDate()
        : null,
    });

    return await this.eventRepository.save(event);
  }

  async findEventsNext7Days() {
    // Calculate 7 days from now in UTC
    const now = dayjs.utc();
    const in7Days = now.add(7, 'day');

    return await this.eventRepository
      .createQueryBuilder('event')
      .where('event.event_date >= :now', { now: now.toDate() })
      .andWhere('event.event_date <= :limit', { limit: in7Days.toDate() })
      .orderBy('event.event_date', 'ASC')
      .getMany();
  }

  async calculateEventDuration(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId }
    });

    if (!event || !event.end_date) {
      return null;
    }

    // Calculate difference in UTC
    const start = dayjs.utc(event.start_date);
    const end = dayjs.utc(event.end_date);

    return {
      hours: end.diff(start, 'hour'),
      minutes: end.diff(start, 'minute'),
      days: end.diff(start, 'day'),
    };
  }
}
```

### Checklist

- [ ] Install dayjs and utc plugin: `npm install dayjs`
- [ ] Always extend dayjs with utc plugin before using
- [ ] Use `@IsISO8601()` validator in all DTOs receiving dates
- [ ] Always use `dayjs.utc()` for parsing and manipulation
- [ ] Convert to Date object with `.toDate()` before saving to database
- [ ] Document ISO 8601 UTC format requirement in Swagger decorators
- [ ] Never use `dayjs()` without `.utc()` in backend services

### Troubleshooting

**Problem**: Dates saved with wrong timezone offset
- **Solution**: Ensure using `dayjs.utc()` not `dayjs()`, verify utc plugin is extended before usage

**Problem**: DTO validation fails with valid ISO date string
- **Solution**: Check ISO string includes timezone indicator (Z or +00:00), verify class-validator version supports ISO8601

**Problem**: Date calculations showing unexpected results
- **Solution**: Confirm both dates use `dayjs.utc()` for parsing, check dayjs plugins are loaded correctly

### Best Practices

- Always parse ISO strings from DTOs using `dayjs.utc(string).toDate()` before database operations
- Use dayjs for date arithmetic (add, subtract, diff) instead of native Date methods
- Keep all backend date manipulations in UTC, never convert to local timezone
- Return Date objects from repositories, let TypeORM serialize to ISO UTC strings automatically
- Use descriptive variable names indicating UTC context (e.g., `startDateUtc`)

## [Frontend Date Display and Timezone Conversion with dayjs]()

Converting UTC dates from backend API to user's local timezone for display in React applications using dayjs with timezone plugin, creating reusable formatting utilities, implementing DateDisplay component, and handling datetime-local inputs with proper UTC conversion.

### When to use?

Use this pattern for displaying any date or timestamp from backend API to users including event schedules, creation timestamps, activity logs, deadline displays, or any date requiring user-local timezone presentation while maintaining accurate relative time calculations.

### When NOT to use?

Do not use for dates that should remain timezone-agnostic like birthdates or anniversaries, do not convert to local timezone when sending data back to backend (always send UTC), and avoid timezone conversion for date-only displays where time component is irrelevant.

### Example

Timezone utility functions, reusable DateDisplay component, and form with datetime-local input.

**Timezone Utility Functions:**

```typescript
// src/utils/date.utils.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

// Detect browser timezone
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Format UTC date to user timezone
export const formatToUserTimezone = (
  utcDate: string | Date,
  format: string = 'DD/MM/YYYY HH:mm'
): string => {
  const timezone = getUserTimezone();
  return dayjs.utc(utcDate).tz(timezone).format(format);
};

// Format relative date
export const formatRelative = (utcDate: string | Date): string => {
  const timezone = getUserTimezone();
  return dayjs.utc(utcDate).tz(timezone).fromNow();
};

// Convert user's local date to UTC (to send to backend)
export const convertToUTC = (localDate: Date | string): string => {
  const timezone = getUserTimezone();
  return dayjs.tz(localDate, timezone).utc().toISOString();
};
```

**Reusable DateDisplay Component:**

```typescript
// src/components/common/DateDisplay.tsx
import React from 'react';
import { formatToUserTimezone, formatRelative } from '@/utils/date.utils';

interface DateDisplayProps {
  date: string | Date;
  format?: string;
  showRelative?: boolean;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = 'DD/MM/YYYY HH:mm',
  showRelative = false
}) => {
  if (!date) return null;

  const formatted = formatToUserTimezone(date, format);
  const relative = showRelative ? formatRelative(date) : null;

  return (
    <div>
      <span>{formatted}</span>
      {relative && (
        <span className="text-gray-500 text-sm ml-2">
          ({relative})
        </span>
      )}
    </div>
  );
};
```

**Form with datetime-local Input:**

```typescript
// src/components/EventForm.tsx
import React, { useState } from 'react';
import { convertToUTC } from '@/utils/date.utils';
import api from '@/config/axios.config';

export const EventForm: React.FC = () => {
  const [eventDate, setEventDate] = useState('');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert local dates to UTC before sending
    const payload = {
      event_date: convertToUTC(eventDate),
      start_date: convertToUTC(startDate),
    };

    try {
      await api.post('/v1/events', payload);
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Event Date
        </label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Event
      </button>
    </form>
  );
};
```

### Checklist

- [ ] Install dayjs with plugins: `npm install dayjs`
- [ ] Configure dayjs with utc, timezone, and relativeTime plugins
- [ ] Set locale to pt-br or desired language
- [ ] Create utility functions for timezone conversion and formatting
- [ ] Implement reusable DateDisplay component
- [ ] Use `datetime-local` input type for datetime fields
- [ ] Always convert to UTC before sending to backend API
- [ ] Never display UTC dates directly without timezone conversion

### Troubleshooting

**Problem**: Dates showing wrong time in UI after conversion
- **Solution**: Verify getUserTimezone returns correct browser timezone, check dayjs timezone plugin is loaded

**Problem**: Form submission sends wrong datetime to backend
- **Solution**: Ensure using convertToUTC before API call, verify datetime-local input provides local time string

**Problem**: Relative time showing in wrong language
- **Solution**: Confirm dayjs.locale() is called with correct locale code, check locale import is included

### Best Practices

- Detect user timezone automatically using Intl.DateTimeFormat for accuracy
- Create centralized date utility file to ensure consistent formatting across application
- Use DateDisplay component for all date presentations to maintain consistency
- Always parse UTC dates from API with `dayjs.utc()` before timezone conversion
- Convert local datetime to UTC using `convertToUTC` before sending to backend
- Show relative time (e.g., "2 hours ago") alongside formatted date for better UX
- Handle null or undefined dates gracefully in display components

## [End-to-End Date Flow from User Input to Database and Display]()

Complete data flow demonstrating how dates travel from user input in browser through frontend conversion to UTC, backend validation and storage in PostgreSQL, retrieval from database, and final display back to user in their local timezone maintaining accuracy throughout entire lifecycle.

### When to use?

Reference this flow when implementing any feature involving date input, storage, and display to ensure proper timezone handling at each layer, when debugging date-related issues to identify where timezone conversion fails, or when onboarding new developers to explain date handling architecture.

### When NOT to use?

Do not use this as implementation guide for simple read-only date displays without user input, or for dates that never involve user interaction such as system-generated audit timestamps that remain in UTC throughout their lifecycle.

### Example

Complete flow from user input through database storage to display.

**Create Event Flow:**

1. **Frontend**: User selects `11/02/2025 14:30` in datetime-local input (user in GMT-3 timezone)
2. **Frontend**: Browser provides local datetime string: `2025-11-02T14:30`
3. **Frontend**: `convertToUTC()` converts to UTC: `2025-11-02T17:30:00Z`
4. **Frontend**: Sends HTTP POST with JSON: `{ "event_date": "2025-11-02T17:30:00Z" }`
5. **Backend**: NestJS receives ISO UTC string in DTO
6. **Backend**: `@IsISO8601()` validates format
7. **Backend**: Service converts with `dayjs.utc(dto.event_date).toDate()`
8. **Backend**: TypeORM saves Date object to PostgreSQL
9. **PostgreSQL**: Stores timestamp in UTC: `2025-11-02 17:30:00+00`
10. **Backend**: Returns saved entity, TypeORM serializes Date to ISO UTC string
11. **Frontend**: Receives response: `{ "event_date": "2025-11-02T17:30:00.000Z" }`
12. **Frontend**: `formatToUserTimezone()` converts to GMT-3: `11/02/2025 14:30`
13. **Frontend**: Displays to user: `11/02/2025 14:30` (same as original input)

**Query Events Flow:**

1. **Frontend**: User requests event list
2. **Backend**: TypeORM queries PostgreSQL returning Date objects
3. **PostgreSQL**: Returns timestamps in UTC
4. **Backend**: NestJS serializes Date to ISO UTC strings in JSON response
5. **Frontend**: Receives array of events with ISO UTC date strings
6. **Frontend**: DateDisplay component calls `formatToUserTimezone()` for each date
7. **Frontend**: dayjs converts UTC to user timezone (GMT-3)
8. **Frontend**: Displays formatted dates in user's local time

### Checklist

- [ ] Verify datetime-local input provides local time without timezone
- [ ] Confirm convertToUTC properly detects browser timezone
- [ ] Check backend DTO has @IsISO8601 validation
- [ ] Ensure backend converts ISO string to Date before saving
- [ ] Verify PostgreSQL column is TIMESTAMPTZ type
- [ ] Confirm TypeORM automatically serializes Date to ISO UTC string
- [ ] Test DateDisplay component converts UTC to local timezone
- [ ] Validate end-to-end flow preserves original user input time

### Troubleshooting

**Problem**: User sees different time after creating event
- **Solution**: Check convertToUTC and formatToUserTimezone use same timezone detection, verify no double timezone conversion

**Problem**: Dates off by timezone offset hours
- **Solution**: Ensure frontend sends UTC not local time, verify backend stores as UTC, confirm display converts from UTC

**Problem**: Dates show correctly in some timezones but not others
- **Solution**: Verify getUserTimezone uses Intl.DateTimeFormat, check dayjs timezone data is loaded for all required zones

### Best Practices

- Document complete date flow in API documentation for frontend consumers
- Test date handling with users in different timezones (GMT-8, GMT+0, GMT+8)
- Validate dates remain consistent through create-read cycle in automated tests
- Use browser DevTools to verify JSON payloads contain proper ISO UTC strings
- Log timezone conversions in development mode for debugging
- Never trust client timezone for business logic, always use UTC on backend

## [Common Date Handling Mistakes and Correct Implementations]()

Frequent errors developers make when handling dates including using new Date() directly in backend creating server timezone dependency, saving ISO strings to database instead of Date objects, sending Date objects from frontend instead of ISO UTC strings, and displaying UTC dates directly without timezone conversion.

### When to use?

Reference this section during code review to identify date handling antipatterns, when debugging timezone-related bugs to find common mistakes, or when training developers on proper date handling to show concrete examples of what to avoid.

### When NOT to use?

Do not use incorrect examples in production code, do not copy "Don't Do" code blocks as they demonstrate antipatterns, and do not assume these are the only possible mistakes as date handling has many edge cases.

### Example

Comparison of common mistakes and correct implementations.

**DON'T DO - Common Mistakes:**

```typescript
// Backend - DON'T use new Date() directly
const now = new Date(); // May have server local timezone

// Backend - DON'T save string in database
await this.repository.save({
  event_date: createDto.event_date, // String instead of Date
});

// Frontend - DON'T send Date object
await api.post('/v1/events', {
  event_date: new Date(), // Send ISO string in UTC
});

// Frontend - DON'T display UTC date directly
<span>{event.event_date}</span> // Will show wrong time
```

**DO - Correct Implementations:**

```typescript
// Backend - Use dayjs.utc()
const now = dayjs.utc().toDate();

// Backend - Convert to Date
await this.repository.save({
  event_date: dayjs.utc(createDto.event_date).toDate(),
});

// Frontend - Send ISO string in UTC
await api.post('/v1/events', {
  event_date: convertToUTC(localDate),
});

// Frontend - Display with conversion
<DateDisplay date={event.event_date} />
```

### Checklist

- [ ] Never use `new Date()` in backend, always use `dayjs.utc().toDate()`
- [ ] Never save ISO strings directly to database, convert to Date first
- [ ] Never send Date objects from frontend, always convert to ISO UTC string
- [ ] Never display UTC dates directly, always convert to user timezone
- [ ] Never use `dayjs()` without `.utc()` in backend services
- [ ] Never trust client-provided timezone for business logic
- [ ] Always validate dates with @IsISO8601 in DTOs

### Troubleshooting

**Problem**: Inconsistent date handling across codebase
- **Solution**: Establish linting rules for date operations, create reusable utilities, conduct code review focused on date handling

**Problem**: Developers keep making same mistakes
- **Solution**: Add pre-commit hooks checking for `new Date()` in backend, create template snippets with correct patterns

**Problem**: Hard to identify date bugs in production
- **Solution**: Add comprehensive logging of date conversions, implement monitoring for timezone-related errors

### Best Practices

- Establish team coding standards prohibiting direct Date usage in backend
- Create ESLint rules to detect common date handling antipatterns
- Use TypeScript strict mode to catch type mismatches between string and Date
- Implement automated tests specifically for timezone edge cases
- Require code review approval from developer experienced in timezone handling
- Document date handling standards in team wiki with examples from this section

## [Implementation Verification Checklist]()

Comprehensive verification list covering all aspects of date handling implementation across backend and frontend ensuring UTC consistency, proper timezone conversion, validation, and documentation for production-ready date functionality.

### When to use?

Use this checklist before merging any feature involving date handling, during code review of date-related pull requests, when setting up new backend or frontend project to ensure date infrastructure is correct, or during bug investigation to verify all date handling requirements are met.

### When NOT to use?

Do not use for features without any date handling, do not skip checklist items without documented justification, and do not consider implementation complete until all applicable items are checked.

### Example

Complete verification checklist for backend, frontend, and testing.

**Backend Implementation:**

- [ ] Use `{ type: 'timestamptz' }` in TypeORM entities
- [ ] Use `TIMESTAMPTZ` in SQL migrations
- [ ] Install dayjs and utc plugin: `npm install dayjs`
- [ ] Always use `dayjs.utc()` for date manipulations
- [ ] Validate DTOs with `@IsISO8601()` decorator
- [ ] Convert ISO strings to Date before database operations
- [ ] Document expected ISO 8601 UTC format in Swagger
- [ ] Return dates as Date objects, let TypeORM serialize to ISO UTC
- [ ] Test date operations with different input timezones
- [ ] Never use `new Date()` for business logic

**Frontend Implementation:**

- [ ] Install dayjs with utc, timezone, relativeTime plugins
- [ ] Configure locale to pt-br or desired language
- [ ] Create timezone conversion utility functions
- [ ] Implement reusable DateDisplay component
- [ ] Use `datetime-local` input type for datetime fields
- [ ] Convert to UTC before sending to backend API
- [ ] Convert to local timezone when displaying dates
- [ ] Show relative dates when appropriate for UX
- [ ] Test date display in multiple browser timezones
- [ ] Handle null/undefined dates gracefully

**Testing and Documentation:**

- [ ] Unit tests for backend date conversion functions
- [ ] Integration tests for complete date flow
- [ ] Test with users in GMT-8, GMT+0, GMT+8 timezones
- [ ] Document date format requirements in API documentation
- [ ] Add examples showing ISO 8601 UTC format in Swagger
- [ ] Document timezone handling in README or wiki

### Checklist

- [ ] Review backend checklist and verify all applicable items
- [ ] Review frontend checklist and verify all applicable items
- [ ] Review testing checklist and ensure coverage
- [ ] Document any deviations from standard patterns with justification
- [ ] Obtain code review approval from team member familiar with date handling

### Troubleshooting

**Problem**: Checklist items don't apply to current implementation
- **Solution**: Document why specific items don't apply, ensure alternative approach maintains UTC consistency

**Problem**: Unclear which checklist items are mandatory
- **Solution**: All items are mandatory unless feature genuinely doesn't involve that aspect (e.g., read-only API doesn't need DTO validation)

### Best Practices

- Integrate checklist into pull request template for date-related features
- Require explicit confirmation of checklist completion before merge approval
- Update checklist based on team learnings and new edge cases discovered
- Use automated tools where possible to verify checklist items (e.g., lint rules)

## [References and Further Reading]()

Links to official documentation and resources for dayjs library, PostgreSQL datetime types, ISO 8601 standard, TypeORM date handling, and timezone database information supporting proper implementation of date handling patterns described in this guide.

### When to use?

Reference these links when needing detailed documentation beyond this guide, when troubleshooting edge cases not covered here, when learning advanced dayjs features like custom plugins, or when validating PostgreSQL timezone behavior and configuration.

### When NOT to use?

Do not use as primary implementation guide, always follow patterns in this document first, do not assume external documentation reflects this project's specific standards, and do not spend excessive time reading documentation before attempting implementation.

### Example

Primary documentation references for date handling implementation.

**Primary References:**

- [dayjs Documentation](https://day.js.org/docs/en/installation/installation) - Complete API reference and plugin guide
- [dayjs UTC Plugin](https://day.js.org/docs/en/plugin/utc) - UTC parsing and manipulation methods
- [dayjs Timezone Plugin](https://day.js.org/docs/en/plugin/timezone) - Timezone conversion and detection
- [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html) - TIMESTAMPTZ documentation
- [ISO 8601 Format](https://en.wikipedia.org/wiki/ISO_8601) - International date and time standard
- [TypeORM Date Handling](https://typeorm.io/entities#column-types-for-postgres) - Column types and date operations

### Checklist

- [ ] Bookmark dayjs documentation for quick API reference
- [ ] Review PostgreSQL timezone behavior documentation
- [ ] Understand ISO 8601 format requirements for API design
- [ ] Check TypeORM documentation for database-specific date type mappings

### Troubleshooting

**Problem**: External documentation conflicts with this guide
- **Solution**: This guide takes precedence, external docs provide additional context and edge case handling

**Problem**: Need information not covered in these references
- **Solution**: Consult MDN for JavaScript Date API, check IANA timezone database for timezone data

### Best Practices

- Keep reference links updated with latest documentation versions
- Add new references as team discovers helpful resources
- Share relevant documentation sections during code review for educational purposes
- Contribute back to open source projects when discovering bugs or improvements

---

**Last updated**: January 16, 2025

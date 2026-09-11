# [Agent Review Pipeline]()

Complete guide to the two-stage review pipeline ensuring implementation completeness and code quality compliance with technical standards in the SDD project.

## [Two-Stage Pipeline Architecture]()

The SDD system uses a sequential two-stage review pipeline where every implementation passes through completeness validation (Stage 1) before quality validation (Stage 2), ensuring both functional requirements and technical standards are met before task completion.

### When to use?

Apply this review pipeline for all feature implementations, bug fixes, and code changes before marking tasks as complete. Use Stage 1 (feature-review) to validate completeness against requirements, then Stage 2 (code-review) to validate quality against technical standards.

### When NOT to use?

Skip the formal review pipeline only for trivial documentation updates, configuration changes, or emergency hotfixes that require immediate deployment. However, these should still undergo review asynchronously after deployment to maintain quality standards.

### Example: Complete Pipeline Flow Diagram

```
┌─────────────────────┐
│ developer-fullstack │ ← Implements the feature
│  (implementation)   │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │feature-review│ ← STAGE 1: Validates COMPLETENESS (task requirements)
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ↓             ↓
INCOMPLETE    COMPLETE
    │             │
    │             ↓
    │      ┌────────────┐
    │      │code-review │ ← STAGE 2: Validates QUALITY (technical standards)
    │      └─────┬──────┘
    │            │
    │      ┌─────┴─────┐
    │      │           │
    ↓      ↓           ↓
┌─────────────┐   APPROVED
│  RETURN TO  │       │
│  developer  │       ↓
│   TO FIX    │   ✅ DONE
└─────────────┘
```

### Checklist

- [ ] All implementations go through Stage 1 (feature-review) first
- [ ] Only complete implementations proceed to Stage 2 (code-review)
- [ ] Incomplete or rejected implementations return to developer
- [ ] Both reviews must approve before marking task complete
- [ ] Review reports saved in ./todo/ folder with proper naming

### Troubleshooting

**Problem:** Unclear which stage to start at for bug fixes.
**Solution:** Always start at developer-fullstack, then proceed to Stage 1 (feature-review).

**Problem:** Code-review rejected but feature-review was complete.
**Solution:** Return to developer to fix violations, then restart at Stage 1 to ensure fixes maintain completeness.

### Best Practices

- Never skip stages - both completeness and quality validation are essential
- Keep review reports for audit trail and learning purposes
- Document context clearly when delegating to reviewers
- Use consistent naming for review reports (e.g., feature-review-products-api.md)
- Ensure developers read and understand review feedback before fixing

---

## [Developer-Fullstack Agent: Implementation Specialist]()

Responsible for implementing complete features including both backend and frontend components, following technical standards from .rules documentation, running builds and tests, and validating implementations with database and cache queries before submission.

### When to use?

Use developer-fullstack agent when you need to create new features, fix bugs, complete incomplete implementations identified by feature-review, or fix code quality violations identified by code-reviewer. This agent handles all coding tasks requiring both backend and frontend work.

### When NOT to use?

Don't use developer-fullstack for review tasks, documentation updates, or validation activities. Use feature-review for completeness validation and code-reviewer for quality validation. Developer-fullstack focuses solely on implementation, not review or validation.

### Example: Developer-Fullstack Workflow for Products API

1. Analyzes task requirements in ./todo/task-products.md
2. Searches technical rules using MCP Docs Search for "API patterns", "validation standards"
3. Implements backend (entities, DTOs, use-cases, controllers) and frontend (components, forms)
4. Runs npm build for both backend and frontend
5. Validates with curl commands and PostgreSQL/Redis queries

### Checklist

- [ ] Agent location verified: .claude/agents/developer-fullstack.md
- [ ] Task requirements fully analyzed before implementation
- [ ] Technical rules consulted via MCP Docs Search
- [ ] Both backend and frontend implemented
- [ ] Build executed without errors
- [ ] Database and cache validated with MCP tools
- [ ] Implementation ready for feature-review

### Troubleshooting

**Problem:** Build fails with TypeScript errors after implementation.
**Solution:** Developer must fix all compilation errors before submitting to review. Run npm run build and address each error.

**Problem:** Unclear which technical rules apply to current task.
**Solution:** Use MCP Docs Search with queries like "how to create API", "validation patterns", "component structure" to find relevant rules.

### Best Practices

- Read complete task requirements before starting implementation
- Consult .rules documentation early and often during development
- Validate database/cache state using MCP tools before finishing
- Run builds and tests before marking implementation ready
- Keep files small and focused (under 300 lines)
- Write clear multi-line comments explaining file purpose

**Location:** `.claude/agents/developer-fullstack.md`

**Tools:**
- Read, Grep, Glob, Bash, Write, Edit
- MCP Postgres (validate database)
- MCP Redis (validate cache)
- MCP Docs Search (search technical patterns)

**Workflow:**
1. Analyzes the task requirements
2. Consults project technical rules (`.rules`)
3. Implements code (backend + frontend)
4. Runs build and tests
5. Validates with curl and database/cache queries

---

## [Feature-Review Agent: Completeness Validator]()

Validates whether implementation is complete and meets all task requirements by comparing code against original task specifications, checking for missing endpoints, validations, fields, and integrations to ensure 100% requirement coverage before quality review.

### When to use?

Use feature-review agent immediately after developer-fullstack completes implementation, and again after any fixes are made to incomplete implementations. Always run feature-review before code-review to ensure completeness before checking quality standards.

### When NOT to use?

Don't use feature-review for validating code quality, architecture compliance, or technical standards - that's code-reviewer's responsibility. Feature-review only compares implementation against task requirements, not against .rules documentation.

### Example: Feature-Review Validation for Products CRUD

Task required: GET, POST, PUT, DELETE endpoints with fields (name, description, price, category, stock), validations (name required, price > 0, stock ≥ 0), and Redis caching.

Feature-review checks: All 4 endpoints present? All 5 fields implemented? All 3 validations working? Cache implemented with correct TTL? Generates verdict based on completeness percentage and critical gaps.

### Checklist

- [ ] Agent location verified: .claude/agents/feature-review.md
- [ ] Task file path provided to agent
- [ ] All implemented files listed for review
- [ ] Agent reads original task requirements
- [ ] Agent compares requirements vs implementation
- [ ] Database/cache validation performed if applicable
- [ ] Report written to ./todo/feature-review-<context>.md
- [ ] Verdict clearly stated (Complete/Incomplete)

### Troubleshooting

**Problem:** Feature-review marks implementation complete but some requirements seem missing.
**Solution:** Check if task file was updated after implementation. Feature-review compares against task file provided, so ensure correct version.

**Problem:** Completeness percentage seems incorrect.
**Solution:** Review the detailed findings in report - percentage is calculated from critical, high, and medium priority requirements.

### Best Practices

- Always provide complete task file path when delegating
- List all implemented files clearly to avoid missed reviews
- Read complete report, not just verdict - details matter
- Return to developer immediately if incomplete
- Ensure database/cache validation happens when applicable
- Keep feature-review reports for tracking requirement evolution

**Location:** `.claude/agents/feature-review.md`

**Tools:**
- Read, Grep, Glob, Write
- MCP Postgres (validate data)
- MCP Redis (validate cache)
- MCP Docs Search (search requirements)

**Workflow:**
1. Identifies review scope (reads task file)
2. Identifies implemented files
3. Reads all implemented files
4. Consults technical rules referenced in task (`.rules`)
5. Compares requirements vs implementation
6. Validates technically (database/cache if applicable)
7. Writes report `./todo/feature-review-<context>.md`

**Verdict Criteria:**

| Verdict | Criteria |
|---------|----------|
| ✅ **COMPLETE** | 0 critical, 0-1 high, ≥ 95% completeness |
| ⚠️ **INCOMPLETE - REVIEW NEEDED** | 0 critical, 2-3 high, 80-94% completeness |
| ❌ **INCOMPLETE - MISSING CRITICAL IMPLEMENTATION** | ≥ 1 critical OR > 3 high OR < 80% completeness |

**What it validates:**
- ✅ All mentioned endpoints implemented?
- ✅ All specified validations present?
- ✅ All required fields implemented?
- ✅ Database/cache integrations working?
- ✅ Frontend components implemented?

**Difference from code-review:**
- **feature-review:** Compares code vs task requirements
- **code-review:** Compares code vs project technical standards

---

## [Code-Reviewer Agent: Quality Enforcer]()

Validates code compliance with technical rules, architecture patterns, code style and best practices defined in .rules documentation, identifying critical security issues, high-priority quality violations, and opportunities for improvement to ensure maintainable and standardized code.

### When to use?

Use code-reviewer agent only after feature-review approves with ✅ COMPLETE verdict. Code-review validates quality and compliance with technical standards, so completeness must be verified first. Always run code-review before marking any task as complete.

### When NOT to use?

Don't use code-reviewer before feature-review approves - incomplete implementations will waste review effort. Don't use for validating requirement completeness - that's feature-review's job. Code-reviewer focuses solely on quality, not functional completeness.

### Example: Code-Review Quality Validation

Code-reviewer identifies: missing /v1/ API versioning (CRITICAL), missing userId validation on protected endpoints (CRITICAL), incomplete Swagger documentation (HIGH), N+1 database queries (HIGH), inconsistent naming conventions (MEDIUM), and unnecessary comments (LOW).

### Checklist

- [ ] Agent location verified: .claude/agents/code-reviewer.md
- [ ] Feature-review approved before starting code-review
- [ ] All implemented files listed for review
- [ ] Agent searches .rules for applicable technical standards
- [ ] Code compared against architecture patterns and best practices
- [ ] Database/cache usage validated if applicable
- [ ] Report written to ./todo/code-review-<context>.md
- [ ] Verdict clearly stated (Approved/Rejected)
- [ ] Violations cite specific .rules file paths and line numbers

### Troubleshooting

**Problem:** Code-review keeps rejecting for same violation types.
**Solution:** Developer needs to study relevant .rules sections before implementing. Use MCP Docs Search to find applicable standards early.

**Problem:** Code-review feedback too vague to action.
**Solution:** Reviewers must cite specific .rules paths, provide code examples, and explain exactly what needs to change.

### Best Practices

- Only run after feature-review approves
- Provide complete list of modified files
- Read full report including all severity levels
- Return to developer for critical or excessive high violations
- Always restart at Stage 1 after fixes
- Learn from violations to improve future implementations
- Reference specific .rules documentation when fixing violations

**Location:** `.claude/agents/code-reviewer.md`

**Tools:**
- Read, Grep, Glob, Write
- MCP Postgres (validate data structure)
- MCP Redis (validate cache usage)
- MCP Docs Search (search technical rules)

**Workflow:**
1. Identifies files to be reviewed
2. Reads all files
3. Consults technical rules, architecture patterns and best practices in `.rules`
4. Compares code vs rules
5. Validates technically (database/cache if applicable)
6. Writes report `./todo/code-review-<context>.md`

**Verdict Criteria:**

| Verdict | Criteria |
|---------|----------|
| ✅ **APPROVED** | 0 critical, ≤ 2 high |
| ⚠️ **APPROVED WITH REMARKS** | 0 critical, 3-5 high |
| ❌ **REJECTED** | ≥ 1 critical OR > 5 high |

**Severity Levels:**

**🔴 CRITICAL:**
- API without versioning `/v1/`
- API without `userId` validation
- SQL injection
- Hardcoded secrets
- Dates without UTC
- Missing authentication on protected routes

**🟡 HIGH:**
- Missing validations in DTOs
- Incomplete Swagger
- Inadequate error handling
- N+1 queries

**🟠 MEDIUM:**
- Inconsistent naming
- Files > 300 lines
- Use of `any`
- Duplicated code

**🔵 LOW:**
- Inconsistent formatting
- Unnecessary comments
- Poorly descriptive names

---

## [Stage 1: Feature-Review Process for Completeness]()

First validation stage that ensures implementation includes all required endpoints, fields, validations and integrations specified in task requirements, with feedback loops returning incomplete work to developer until 95%+ completeness achieved before advancing to quality review.

### When to use?

Execute Stage 1 immediately after developer-fullstack completes implementation, and again after developer fixes any incompleteness issues. Always complete Stage 1 before proceeding to Stage 2 (code-review) to ensure efficient use of review resources.

### When NOT to use?

Don't skip Stage 1 even for "small fixes" or "obvious changes" - completeness validation catches missing requirements that aren't obvious. Don't proceed to Stage 2 if Stage 1 shows incomplete - fix incompleteness first.

### Example: Stage 1 Process for Products API Implementation

Scrum Master delegates to feature-review with context "products-api", task file "./todo/task-products.md", and file list. Feature-review executes complete workflow and generates report. Scrum Master reads verdict: if ❌ INCOMPLETE, adds TODO and delegates back to developer; if ✅ COMPLETE, advances to Stage 2.

### Checklist

- [ ] Developer-fullstack finished implementation
- [ ] Context name chosen (descriptive, kebab-case)
- [ ] Task file path ready for delegation
- [ ] Complete list of modified files prepared
- [ ] Feature-review agent delegated with all information
- [ ] Report read at ./todo/feature-review-<context>.md
- [ ] Verdict identified (Complete/Incomplete/Review Needed)
- [ ] Decision made: advance to Stage 2 or return to developer
- [ ] TODO updated with correction task if incomplete

### Troubleshooting

**Problem:** Feature-review reports incomplete but developer believes it's complete.
**Solution:** Review detailed findings in report - often reveals requirement misunderstandings or overlooked task details.

**Problem:** Multiple rounds of incompleteness corrections taking too long.
**Solution:** Developer should read complete task and consult .rules thoroughly before implementing to reduce review rounds.

### Best Practices

- Always provide clear context when delegating
- Include complete task file path for accurate comparison
- List all modified files to ensure complete review
- Read full report details, not just verdict
- Add specific TODO items referencing report for incomplete work
- Inform user of progress after completion
- Advance to Stage 2 only with ✅ COMPLETE verdict

**When:** After developer-fullstack completes implementation.

**Process:**

1. **Scrum Master delegates** to `feature-review`
   - Informs context (e.g. "products-api")
   - Informs task file (e.g. `./todo/task-products.md`)
   - Lists created/modified files

2. **Feature-review executes** complete workflow
   - Reads original task
   - Reads implemented files
   - Compares requirements vs code
   - Validates in database/cache (if applicable)
   - Writes report

3. **Scrum Master reads** `./todo/feature-review-<context>.md`

4. **Decision based on verdict:**

   **If ❌ INCOMPLETE or ⚠️ REVIEW NEEDED:**
   - Adds to TODO: `- [ ] Complete implementation - ./todo/feature-review-<context>.md`
   - Delegates IMMEDIATELY back to `developer-fullstack`
   - Developer fixes incompatibilities
   - **RETURNS to Stage 1 start** (validates completeness again)

   **If ✅ COMPLETE:**
   - Informs user that implementation is complete
   - **ADVANCES to Stage 2** (Code Review)

---

## [Stage 2: Code-Review Process for Quality]()

Second validation stage that ensures implementation follows technical rules, architecture patterns and best practices from .rules documentation, identifying security vulnerabilities, quality violations and improvement opportunities with feedback loops requiring fixes to restart at Stage 1.

### When to use?

Execute Stage 2 only after feature-review approves with ✅ COMPLETE verdict. Code-review validates quality compliance after completeness is confirmed. Always complete Stage 2 before marking task complete in TODO list.

### When NOT to use?

Don't run Stage 2 if feature-review showed incomplete - fix completeness first. Don't skip Stage 2 even if developer is confident about quality - objective validation against .rules catches violations that may not be obvious.

### Example: Stage 2 Process for Products API Quality Check

After Stage 1 approves, Scrum Master delegates to code-reviewer with context "products-api" and file list. Code-reviewer searches .rules, validates code quality, generates report. Scrum Master reads verdict: if ❌ REJECTED, adds TODO and delegates to developer then restarts at Stage 1; if ✅ APPROVED, marks task complete.

### Checklist

- [ ] Feature-review approved with ✅ COMPLETE verdict
- [ ] Context name matches Stage 1 for consistency
- [ ] Complete list of modified files prepared
- [ ] Code-reviewer agent delegated with all information
- [ ] Report read at ./todo/code-review-<context>.md
- [ ] Verdict identified (Approved/Approved with Remarks/Rejected)
- [ ] Decision made: mark complete or return to developer
- [ ] TODO updated with correction task if rejected
- [ ] Task marked complete in TODO list only if approved

### Troubleshooting

**Problem:** Code-review rejected, unclear if should restart at Stage 1.
**Solution:** Always restart at Stage 1 (feature-review) after developer fixes to ensure changes didn't break completeness.

**Problem:** Code-review found violations not caught in previous reviews.
**Solution:** Normal - code-review uses different validation criteria (.rules compliance vs task requirements). Fix violations and restart at Stage 1.

### Best Practices

- Only run after feature-review approval
- Use same context name as Stage 1 for traceability
- Read full report including all severity levels
- Return to developer for critical or excessive high violations
- Always restart at Stage 1 after developer fixes
- Mark task complete only after ✅ APPROVED verdict
- Inform user of final status
- Keep reports for historical reference

**When:** After feature-review approves (✅ COMPLETE).

**Process:**

1. **Scrum Master delegates** to `code-reviewer`
   - Informs context (e.g. "products-api")
   - Lists created/modified files

2. **Code-reviewer executes** complete workflow
   - Reads implemented files
   - Searches technical rules in `.rules`
   - Compares code vs rules
   - Validates in database/cache (if applicable)
   - Writes report

3. **Scrum Master reads** `./todo/code-review-<context>.md`

4. **Decision based on verdict:**

   **If ❌ REJECTED or ⚠️ APPROVED WITH REMARKS:**
   - Adds to TODO: `- [ ] Fix code review - ./todo/code-review-<context>.md`
   - Delegates IMMEDIATELY back to `developer-fullstack`
   - Developer fixes violations
   - **RETURNS to Stage 1** (needs to validate completeness after fixes)

   **If ✅ APPROVED:**
   - Marks original task as completed in TODO List
   - Informs user that code was approved
   - Proceeds with next tasks

---

## [Example: Products CRUD Implementation Journey]()

Real-world walkthrough demonstrating complete pipeline execution through four rounds: initial incomplete implementation, completeness fixes achieving Stage 1 approval, quality violations requiring corrections, and final successful completion passing both review stages.

### When to use?

Reference this example when learning the review pipeline mechanics, training new team members, or clarifying how to handle specific scenarios like incomplete implementations or quality rejections. Use as educational material to understand review feedback patterns.

### When NOT to use?

Don't use this example as a template for actual implementations - each feature has unique requirements and issues. Don't expect your implementation to follow exactly the same number of rounds - complexity varies by task.

### Example: Four-Round Implementation Journey

Round 1: Developer implements 60% (missing PUT/DELETE, fields, validations) → feature-review rejects ❌ INCOMPLETE
Round 2: Developer completes missing items → feature-review approves ✅ COMPLETE → advances to code-review
Round 3: Code-review finds 3 high violations (userId, Swagger, cache) → ⚠️ APPROVED WITH REMARKS → return to developer
Round 4: Developer fixes violations → feature-review ✅ → code-review ✅ APPROVED → task complete

### Checklist

- [ ] Example demonstrates incomplete first implementation
- [ ] Shows feature-review rejection with specific feedback
- [ ] Demonstrates developer fixing incompleteness
- [ ] Shows feature-review approval advancing to Stage 2
- [ ] Demonstrates code-review finding quality violations
- [ ] Shows feedback loop returning to developer
- [ ] Demonstrates restart at Stage 1 after fixes
- [ ] Shows final approval after all corrections

### Troubleshooting

**Problem:** Real implementation requires more rounds than example.
**Solution:** Normal variation - focus on understanding the feedback and improvement patterns, not matching exact round count.

**Problem:** Example violations don't match those found in real implementation.
**Solution:** Expected - this example illustrates process, not exhaustive violation list. Consult .rules for comprehensive standards.

### Best Practices

- Study example to understand pipeline mechanics
- Note how specific, actionable feedback accelerates fixes
- Observe feedback loop pattern: developer → Stage 1 → Stage 2 → developer → Stage 1...
- Learn from progression: thorough preparation reduces review rounds
- Use example to explain pipeline to stakeholders
- Reference when writing clear review reports

### [Round 1: Incomplete First Implementation]()

Initial development attempt showing common incompleteness issues including missing PUT and DELETE endpoints, missing required fields (description, category, stock), and missing price and stock validations, resulting in feature-review rejection at 60% completeness.

**Scenario:** Implement Products CRUD

**Task:** `./todo/task-products.md`

**Requirements:**
- Create complete REST API: GET, POST, PUT, DELETE
- Fields: name, description, price, category, stock
- Validations: name required, price > 0, stock ≥ 0
- Save to PostgreSQL
- List caching in Redis (5 min TTL)

**1. Developer-fullstack implements:**
- ✅ GET /v1/products
- ✅ POST /v1/products
- ❌ PUT /v1/products/:id (MISSING)
- ❌ DELETE /v1/products/:id (MISSING)
- ✅ Entity with fields: name, price
- ❌ Fields description, category, stock (MISSING)
- ✅ Validation: name required
- ❌ Price and stock validations (MISSING)

**2. Feature-review validates:**

Report: `./todo/feature-review-products-api.md`

```
Verdict: ❌ INCOMPLETE - MISSING CRITICAL IMPLEMENTATION
Completeness rate: 60%

Critical Incompatibilities:
- PUT endpoint not implemented
- DELETE endpoint not implemented
- Required fields missing: description, category, stock
- Price and stock validations missing
```

**3. Scrum Master:**
- Adds: `- [ ] Complete implementation - ./todo/feature-review-products-api.md`
- Delegates to developer-fullstack to fix

---

### [Round 2: Completeness Achieved]()

Developer addresses all incompleteness feedback by implementing missing PUT and DELETE endpoints, adding required fields (description, category, stock), and implementing price and stock validations, achieving 100% completeness and advancing to quality review.

**4. Developer-fullstack completes:**
- ✅ PUT /v1/products/:id (ADDED)
- ✅ DELETE /v1/products/:id (ADDED)
- ✅ Fields: description, category, stock (ADDED)
- ✅ Validations price > 0 and stock ≥ 0 (ADDED)

**5. Feature-review validates again:**

Report: `./todo/feature-review-products-api.md` (updated)

```
Verdict: ✅ COMPLETE
Completeness rate: 100%

All requirements implemented!
```

**6. Scrum Master:**
- Informs user: "Implementation complete!"
- **Advances to Code Review**

---

### [Round 3: Quality Violations Identified]()

First code-review identifies quality issues including missing userId validation on protected endpoints (HIGH), incomplete Swagger documentation (HIGH), and missing cache invalidation on mutations (HIGH), resulting in ⚠️ APPROVED WITH REMARKS verdict requiring corrections.

**7. Code-reviewer validates:**

Report: `./todo/code-review-products-api.md`

```
Verdict: ⚠️ APPROVED WITH REMARKS
Critical violations: 0
High violations: 3

High Violations:
- API without userId validation on protected endpoints
- Missing Swagger documentation
- Cache without invalidation on create/update/delete
```

**8. Scrum Master:**
- Adds: `- [ ] Fix code review - ./todo/code-review-products-api.md`
- Delegates to developer-fullstack to fix
- **RETURNS to Stage 1** (feature-review)

---

### [Round 4: Final Approval Success]()

Developer implements all quality improvements (userId validation, Swagger documentation, cache invalidation), passing feature-review validation maintaining completeness, and achieving code-review ✅ APPROVED verdict with zero violations, resulting in task completion.

**9. Developer-fullstack fixes:**
- ✅ Adds userId validation on all endpoints
- ✅ Adds complete Swagger documentation
- ✅ Implements cache invalidation

**10. Feature-review validates:**
- Verdict: ✅ COMPLETE (nothing changed in requirements)

**11. Code-review validates again:**

Report: `./todo/code-review-products-api.md` (updated)

```
Verdict: ✅ APPROVED
Violations: 0 critical, 0 high

Code complies with technical standards!
```

**12. Scrum Master:**
- Marks task as completed: `- [x] Implement products CRUD - ./todo/task-products.md`
- Informs user: "Task completed! Feature Review: ✅ | Code Review: ✅"
- Proceeds to next task

---

## [Scrum Master Best Practices for Pipeline Orchestration]()

Guidelines for Scrum Master role using /execute command to orchestrate review pipeline correctly, including mandatory stage sequencing, correction loop handling, TODO list maintenance, and delegation protocols to ensure consistent quality and completeness validation.

### When to use?

Consult these guidelines before starting any task orchestration, when delegating to agents, when making decisions based on review verdicts, and when updating TODO lists to ensure consistent pipeline execution following established patterns.

### When NOT to use?

Don't use these guidelines when acting as developer or reviewer - see role-specific sections instead. These practices are specifically for the orchestration and management role, not for implementation or validation roles.

### Example: Scrum Master Orchestration Flow

User requests feature → Scrum Master delegates to developer-fullstack → Developer implements → Scrum Master delegates to feature-review → Reads report → If incomplete, adds TODO and delegates back to developer → If complete, delegates to code-reviewer → Reads report → If rejected, adds TODO and delegates to developer → If approved, marks task complete and informs user.

### Checklist

- [ ] Always follow complete pipeline: developer → feature-review → code-review
- [ ] Never skip stages even for "small fixes"
- [ ] Read complete reports before making decisions
- [ ] Add specific TODO items referencing review reports
- [ ] Delegate correction tasks immediately after review rejection
- [ ] Restart at Stage 1 after any code changes
- [ ] Mark task complete only after both reviews approve
- [ ] Keep TODO list updated and accurate
- [ ] Inform user of progress at key milestones

### Troubleshooting

**Problem:** Unclear whether to restart at Stage 1 after code-review rejection.
**Solution:** Always restart at Stage 1 - code changes can break completeness, so revalidation is required.

**Problem:** TODO list getting cluttered with correction tasks.
**Solution:** Update correction tasks as completed, keep review reports for history, archive old reports if needed.

### Best Practices

- Always follow complete pipeline without skipping stages
- Read full review reports, not just verdicts
- Add correction tasks to TODO with report references
- Delegate correction tasks immediately after review rejection
- Ensure correction loops properly restart at Stage 1
- Mark tasks complete only after both reviews approve
- Keep TODO list clean and updated
- Inform user of progress and blockers
- Maintain consistent context naming across stages

**Guidelines:**

1. **Always follow the complete pipeline:**
   - developer → feature-review → code-review

2. **Never skip stages:**
   - Even if it's "just a small fix", validate completeness and quality

3. **Correction loop:**
   - If feature-review rejects: return to developer → feature-review again
   - If code-review rejects: return to developer → feature-review → code-review

4. **Keep TODO updated:**
   - Add correction tasks
   - Mark as completed ONLY after both reviews approve

---

## [Developer Best Practices for First-Pass Success]()

Guidelines for developers to maximize chances of passing both review stages on first attempt through thorough requirement analysis, comprehensive .rules consultation, proactive database and cache validation, and complete build and test execution before submission.

### When to use?

Follow these practices before starting any implementation, during development to stay aligned with standards, and before marking work ready for review to catch issues early and reduce review rounds.

### When NOT to use?

Don't use these practices to replace actual review stages - even with perfect preparation, objective validation is required. These practices improve quality, they don't eliminate the need for formal review.

### Example: Developer Preparation Workflow

Before coding: Read complete task-products.md requirements → Search .rules for "API patterns", "validation standards", "cache usage" → Review example implementations in codebase
During coding: Reference .rules frequently → Keep files small and focused → Add clear comments
Before submission: Run npm run build (backend + frontend) → Test all endpoints with curl → Validate database with MCP Postgres queries → Check cache with MCP Redis queries

### Checklist

- [ ] Complete task file read and understood
- [ ] .rules documentation consulted for applicable standards
- [ ] Backend implementation following architecture patterns
- [ ] Frontend implementation following component standards
- [ ] All validations implemented as specified
- [ ] Database state validated with MCP Postgres queries
- [ ] Cache state validated with MCP Redis queries if applicable
- [ ] Build executed without errors (npm run build)
- [ ] Tests executed successfully
- [ ] Files kept under 300 lines with clear structure

### Troubleshooting

**Problem:** Unclear which .rules apply to current task.
**Solution:** Use MCP Docs Search with queries describing your task: "API creation", "form validation", "data caching", etc.

**Problem:** Build keeps failing with similar errors.
**Solution:** Study common TypeScript patterns in .rules, review existing codebase examples, ensure proper typing throughout.

### Best Practices

- Read complete task requirements before writing any code
- Search .rules early using MCP Docs Search for relevant patterns
- Reference .rules frequently during implementation
- Keep files small, focused, and well-commented
- Validate database and cache state before finishing
- Run builds and tests before marking ready
- Test all endpoints with curl commands
- Review own code against .rules before submission
- Learn from review feedback to improve future work

**Guidelines:**

1. **Read the COMPLETE task before implementing**
2. **Consult `.rules` for technical rules, architecture patterns and best practices**
3. **Validate in database/cache with MCP before finishing**
4. **Run build and tests before marking as ready**

---

## [Reviewer Best Practices for Actionable Feedback]()

Guidelines for feature-review and code-review agents to provide specific, actionable feedback with clear examples, rule references with file paths and line numbers, and concrete fix instructions to enable efficient corrections and learning.

### When to use?

Follow these practices when writing review reports, documenting violations, providing feedback to developers, and creating verdict decisions to ensure reviews are educational, actionable, and drive continuous improvement.

### When NOT to use?

Don't use these practices when implementing code - these are specifically for review activities. Don't apply feature-review criteria to code-review or vice versa - each has distinct validation focus.

### Example: Actionable Review Feedback

Bad feedback: "Missing implementation"
Good feedback: "Missing DELETE /v1/products/:id endpoint - task requires full CRUD including delete operation"

Bad feedback: "Code quality issues"
Good feedback: "Missing userId validation on protected endpoints - violates .rules/how-to-create-api-backend.md:145 - example: add @UseGuards(UserIdGuard) decorator"

### Checklist

- [ ] Feedback is specific, not vague or general
- [ ] Missing items explicitly identified
- [ ] Violated rules cited with .rules file path and line number
- [ ] Code examples provided showing correct implementation
- [ ] Severity levels assigned correctly
- [ ] Verdict matches criteria (completeness % or violation counts)
- [ ] Report written to correct location with proper naming
- [ ] Actionable next steps clear for developer

### Troubleshooting

**Problem:** Developer unclear how to fix review feedback.
**Solution:** Provide specific file paths, line numbers, code examples, and references to .rules documentation showing correct approach.

**Problem:** Same violations appearing across multiple reviews.
**Solution:** Ensure feedback includes educational component explaining why violation matters and referencing .rules for deeper understanding.

### Best Practices

- Be specific: identify exact missing items or violations
- Always cite violated rules with .rules file paths and line numbers
- Provide correct code examples following standards
- Explain why violations matter for developer learning
- Use appropriate severity levels consistently
- Compare code against correct validation scope (task vs .rules)
- Write reports with clear structure and actionable items
- Focus on helping developers improve, not just finding faults

**Feature Review:**
- Compare code vs task (not vs technical rules)
- Be specific: "Missing DELETE endpoint" not "Missing implementation"
- Document exactly what's missing

**Code Review:**
- Compare code vs technical rules in `.rules` (not vs task)
- Always cite the violated rule with path and line (e.g. `.rules/how-to-create-api-backend.md:145`)
- Provide correct code examples following the rules

---

## [Review Report Standards and File Organization]()

Standardized documentation for review reports including mandatory ./todo/ location, naming convention pattern using kebab-case context descriptors, and consistent report structure to maintain organization and traceability across all reviews.

### When to use?

Reference these standards when saving review reports to ensure consistent naming and location, when delegating to reviewers to specify report names using proper context format, and when searching for historical review reports.

### When NOT to use?

Don't use these standards for understanding review content requirements - consult agent-specific documentation for that. This section purely addresses file naming, location, and organizational conventions, not review methodology.

### Example: Report Naming Convention

Context format: descriptive, kebab-case, 2-4 words identifying functionality

Good examples:
- products-api
- user-authentication
- payment-integration
- dashboard-analytics

Bad examples:
- task-123 (not descriptive)
- ProductsAPI (not kebab-case)
- implement-the-complete-products-crud-with-caching (too long)

### Checklist

- [ ] Review reports saved in ./todo/ directory
- [ ] Filenames follow pattern: feature-review-<context>.md or code-review-<context>.md
- [ ] Context uses kebab-case format
- [ ] Context clearly describes functionality (not task numbers)
- [ ] Context concise (2-4 words maximum)
- [ ] Same context used across both review stages for traceability
- [ ] Reports retained for audit trail

### Troubleshooting

**Problem:** Difficulty finding review reports for specific features.
**Solution:** Use descriptive context names identifying the feature (e.g., "payment-integration" not "task-123"), maintain consistent naming.

**Problem:** Report naming inconsistent across team.
**Solution:** Always use kebab-case and follow the pattern: [review-type]-[context].md where context is 2-4 descriptive words.

### Best Practices

- Use descriptive context names identifying the feature, not task numbers
- Keep context concise but clear (2-4 words maximum)
- Maintain consistent kebab-case formatting across all reports
- Save all reports in ./todo/ for centralized access
- Don't delete reports - they serve as audit trail and learning resource
- Use same context across both review stages for traceability
- Reference past reports when implementing similar features

All reports are saved in `./todo/`:

- `./todo/feature-review-<context>.md` - Completeness review
- `./todo/code-review-<context>.md` - Quality review

**Context format:** Use kebab-case, describe the functionality.

**Examples:**
- `products-api`
- `user-authentication`
- `dashboard-analytics`
- `payment-integration`

---

## [Pipeline Summary: Quick Reference Table]()

Quick reference table mapping each pipeline stage to its responsible agent, validation type, possible results, and corresponding next steps for rapid decision-making during review orchestration and workflow management.

### When to use?

Use this summary table as quick reference when making decisions about next steps during pipeline execution, when unsure which stage to proceed to based on review results, or when explaining pipeline flow to stakeholders.

### When NOT to use?

Don't use this summary for learning the detailed review process - read the complete sections first for comprehensive understanding. This is a reference tool for those already familiar with pipeline mechanics.

### Example: Using the Summary Table

Current situation: Code-review returned ❌ REJECTED verdict
Look up in table: Stage 2 → code-review → Quality vs rules → ❌ Rejected → Developer fixes → Stage 1
Action: Return to developer, then restart at feature-review after fixes complete

### Checklist

- [ ] Current stage identified in table
- [ ] Review result/verdict determined from report
- [ ] Next step clearly identified from table
- [ ] Transition logic understood (loop back vs advance)
- [ ] Final goal clear: both reviews must approve

### Troubleshooting

**Problem:** Table shows multiple possible next steps for current situation.
**Solution:** Check the Result column carefully - next step depends on specific verdict (Complete/Incomplete, Approved/Rejected).

**Problem:** Unsure whether to loop back to Stage 1 or continue to Stage 2.
**Solution:** Only advance to Stage 2 if feature-review verdict is "Complete" (✅). All other cases return to developer.

### Best Practices

- Bookmark this summary for quick reference during reviews
- Ensure you understand detailed sections before relying on summary
- Always verify verdict from actual review report, not assumptions
- Remember the final goal: both reviews must approve
- Use summary to explain pipeline flow to stakeholders concisely

| Stage | Agent | Validates | Result | Next Step |
|-------|-------|-----------|--------|-----------|
| Implementation | developer-fullstack | - | Code created | → Feature Review |
| Stage 1 | feature-review | Completeness vs task | ✅ Complete | → Code Review |
| Stage 1 | feature-review | Completeness vs task | ❌ Incomplete | → Developer fixes → Stage 1 |
| Stage 2 | code-review | Quality vs rules (.rules) | ✅ Approved | → Task completed |
| Stage 2 | code-review | Quality vs rules (.rules) | ❌ Rejected | → Developer fixes → Stage 1 |

**Final Goal:** Ensure ALL delivered code is:
1. **Complete** (meets 100% of task requirements)
2. **Compliant** (follows 100% of technical rules, architecture patterns and best practices)

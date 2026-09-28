# [Project Root Structure]()

Standardized root directory organization defining allowed files, folders, and restrictions to maintain a clean and organized monorepo structure with clear separation between backend, frontend, and configuration files.

## [Root Directory Organization]()

Root-level directory structure for the entire project defining where backend, frontend, infrastructure, and configuration files should be located to maintain clear separation of concerns and prevent clutter.

### When to use?

Follow this structure when initializing a new project, adding new applications to the monorepo, organizing Docker files, or setting up CI/CD configurations. Reference this guide to verify correct file placement at the root level.

### When NOT to use?

Do not apply this structure to files inside backend or frontend folders which have their own organization rules. Do not use for third-party dependencies or generated files that should be gitignored.

### Example

Standard root directory structure for the project.

```
SDD/
├── backend/                 # Backend application (NestJS)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── node_modules/
├── frontend/                # Frontend application (React + Vite)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── node_modules/
├── build/                   # Docker and deployment files
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── entrypoint.sh
│   └── migration.sh
├── .rules/                  # Project documentation and standards
│   └── *.md
├── logs/                    # Application logs (gitignored)
│   └── *.log
├── .claude/                 # Claude Code configuration
│   └── commands/
├── .git/                    # Git repository
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
└── .env.example            # Environment variables template (optional)
```

### Checklist

- [ ] Backend code in `backend/` folder
- [ ] Frontend code in `frontend/` folder
- [ ] Docker files in `build/` folder
- [ ] Documentation in `.rules/` folder
- [ ] No package.json or node_modules at root level
- [ ] No dependency lock files at root level
- [ ] Application logs in `logs/` folder and gitignored
- [ ] Claude Code commands in `.claude/` folder

### Troubleshooting

**Problem**: Package files appearing at root level
- **Solution**: Remove them and ensure dependencies are installed only within `backend/` or `frontend/` folders

**Problem**: Multiple node_modules folders consuming disk space
- **Solution**: This is expected behavior for monorepo structure, each application manages its own dependencies

**Problem**: Unclear where to place new configuration files
- **Solution**: Infrastructure files go in `build/`, documentation in `.rules/`, application configs in respective `backend/` or `frontend/` folders

### Best Practices

- Keep root directory minimal and organized
- Never run `npm install` at root level
- Place all backend dependencies in `backend/package.json`
- Place all frontend dependencies in `frontend/package.json`
- Use `build/` folder for all Docker and deployment scripts
- Document new root-level files or folders with clear purpose

## [Allowed Files and Folders at Root]()

Comprehensive list of permitted files and folders at the project root level with their purposes, ensuring consistency and preventing unnecessary clutter from development artifacts or misplaced dependencies.

### When to use?

Reference this section when adding new files to the root directory, during code reviews to verify correct file placement, when cleaning up the project structure, or when onboarding new developers to explain root-level organization.

### When NOT to use?

Do not use this as a restriction for files inside `backend/` or `frontend/` folders which have their own rules. Do not apply to temporary files created by IDEs or operating systems that should be gitignored.

### Example

Complete list of allowed root-level items.

**Allowed Folders:**

```
✅ backend/              # Backend NestJS application
✅ frontend/             # Frontend React application
✅ build/                # Docker and deployment configurations
✅ .rules/               # Project documentation and standards
✅ logs/                 # Application logs (must be gitignored)
✅ .claude/              # Claude Code configuration
✅ .git/                 # Git repository metadata
✅ .vscode/              # VS Code workspace settings (optional)
✅ .github/              # GitHub Actions workflows (if using GitHub)
```

**Allowed Files:**

```
✅ .gitignore            # Git ignore rules
✅ README.md             # Project documentation
✅ .env.example          # Environment variables template (optional)
✅ .prettierrc           # Code formatting config (optional)
✅ .editorconfig         # Editor configuration (optional)
✅ LICENSE               # Project license (optional)
```

**Prohibited Items:**

```
❌ package.json          # Must be in backend/ or frontend/
❌ package-lock.json     # Must be in backend/ or frontend/
❌ yarn.lock             # Must be in backend/ or frontend/
❌ pnpm-lock.yaml        # Must be in backend/ or frontend/
❌ node_modules/         # Must be in backend/ or frontend/
❌ dist/                 # Build outputs stay in respective folders
❌ build/                # Reserved for Docker files, not build outputs
❌ src/                  # Source code goes in backend/src or frontend/src
❌ tsconfig.json         # Must be in backend/ or frontend/
❌ vite.config.ts        # Must be in frontend/
❌ nest-cli.json         # Must be in backend/
❌ .env                  # Must be in backend/ or frontend/
```

### Checklist

- [ ] No package manager files at root (package.json, lock files)
- [ ] No node_modules folder at root
- [ ] No TypeScript config at root (tsconfig.json)
- [ ] No build tool configs at root (vite.config.ts, nest-cli.json)
- [ ] No source code folders at root (src/)
- [ ] No build output folders at root (dist/)
- [ ] No .env files at root (use .env.example only)
- [ ] All application code in backend/ or frontend/
- [ ] All Docker files in build/ folder

### Troubleshooting

**Problem**: Found package.json at root level
- **Solution**: Delete it, install dependencies separately in `backend/` and `frontend/` folders

**Problem**: Found node_modules at root level
- **Solution**: Delete it, run `npm install` inside `backend/` and `frontend/` folders individually

**Problem**: Found multiple .env files scattered
- **Solution**: Keep .env files only in `backend/` and `frontend/`, use `.env.example` at root as template

**Problem**: Build output appearing at root
- **Solution**: Configure build tools to output to `backend/dist` or `frontend/dist`, add to .gitignore

### Best Practices

- Review root directory regularly during code reviews
- Add automated checks in CI/CD to verify root cleanliness
- Document any exceptions to these rules with clear justification
- Keep root directory focused on project-wide configuration only
- Use .gitignore to prevent accidental commits of prohibited files

## [Backend Folder Naming Convention]()

Clarification on the correct naming for the backend application folder, resolving inconsistencies in existing documentation and establishing the standard convention for all project references.

### When to use?

Reference this section when creating new documentation, writing scripts that reference the backend folder, configuring Docker files, or updating existing documentation to maintain naming consistency.

### When NOT to use?

Do not apply this naming to other folders in the project. Do not rename the folder without coordinating with the entire team as it affects imports, Docker configs, and CI/CD pipelines.

### Example

Official backend folder naming standard.

**Standard Naming:**

```
✅ backend/              # Correct: Clear and descriptive
❌ back/                 # Incorrect: Too abbreviated
```

**Rationale:**

1. **Clarity**: `backend/` is self-documenting and immediately understandable
2. **Consistency**: Matches common industry conventions for monorepos
3. **Symmetry**: Both `backend/` and `frontend/` are descriptive multi-character names
4. **Documentation**: Aligns with setup guides and official documentation

**File Path Examples:**

```typescript
// Correct imports referencing backend/ folder
import { User } from '@/modules/user/entities/user.entity';

// Docker volume mounts
volumes:
  - ./backend:/app/backend

// Directory references
backend/src/
backend/dist/
backend/package.json
```

### Checklist

- [ ] Backend application folder named `backend/`
- [ ] All documentation references use `backend/`
- [ ] Docker configurations use `backend/`
- [ ] Scripts reference `backend/` folder
- [ ] README.md uses `backend/` in examples
- [ ] No references to `back/` folder

### Troubleshooting

**Problem**: Documentation shows both `backend/` and `back/`
- **Solution**: Use `backend/` as the standard, update any documentation showing `back/`

**Problem**: Existing folder is named `back/`
- **Solution**: Coordinate with team, rename to `backend/`, update all references in Docker, scripts, and documentation

**Problem**: Docker containers fail after renaming
- **Solution**: Update docker-compose.yml volume mounts and Dockerfile COPY paths to use `backend/`

### Best Practices

- Always use `backend/` in new documentation
- Search and replace `back/` with `backend/` when found in docs
- Update scripts and Docker files to use consistent `backend/` reference
- Communicate naming standard to all team members
- Add pre-commit hooks to catch incorrect references

## [Keeping Root Directory Clean]()

Practical guidelines and automation strategies for maintaining a clean root directory over time, preventing accumulation of development artifacts, temporary files, or misplaced dependencies during active development.

### When to use?

Apply these guidelines continuously during development, before committing changes, during code reviews, and when onboarding new team members. Use automated checks to enforce cleanliness standards.

### When NOT to use?

Do not apply these restrictions so strictly that they prevent legitimate project-wide configuration files. Do not clean files without understanding their purpose first.

### Example

Strategies for maintaining clean root directory.

**Git Ignore Configuration:**

File: `.gitignore`

```gitignore
# Dependencies (must be in backend/ or frontend/)
/node_modules/
/package-lock.json
/yarn.lock
/pnpm-lock.yaml

# Environment (must be in backend/ or frontend/)
/.env
/.env.local
/.env.*.local

# Build outputs (must be in respective folders)
/dist/
/build/
*.tsbuildinfo

# Logs
logs/
*.log
npm-debug.log*

# IDE
.DS_Store
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json

# Temporary files
*.tmp
*.temp
.cache/
```

**Pre-commit Verification Script:**

```bash
#!/bin/bash
# check-root-clean.sh

echo "Checking root directory cleanliness..."

# Check for prohibited files
PROHIBITED_FILES=(
  "package.json"
  "package-lock.json"
  "yarn.lock"
  "pnpm-lock.yaml"
  "tsconfig.json"
  "vite.config.ts"
  "nest-cli.json"
  ".env"
)

FOUND_ISSUES=0

for file in "${PROHIBITED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "❌ Error: Found prohibited file at root: $file"
    echo "   Solution: Move to backend/ or frontend/ folder"
    FOUND_ISSUES=1
  fi
done

# Check for prohibited folders
if [ -d "node_modules" ]; then
  echo "❌ Error: Found node_modules/ at root"
  echo "   Solution: Remove and install in backend/ and frontend/"
  FOUND_ISSUES=1
fi

if [ -d "src" ]; then
  echo "❌ Error: Found src/ at root"
  echo "   Solution: Move to backend/src or frontend/src"
  FOUND_ISSUES=1
fi

if [ "$FOUND_ISSUES" -eq 0 ]; then
  echo "✅ Root directory is clean"
  exit 0
else
  echo ""
  echo "Fix the issues above before committing"
  exit 1
fi
```

**Cleanup Commands:**

```bash
# Remove prohibited items from root
rm -f package.json package-lock.json yarn.lock pnpm-lock.yaml
rm -f tsconfig.json vite.config.ts nest-cli.json
rm -rf node_modules/
rm -rf dist/ build/

# Verify backend dependencies
cd backend/
npm install
cd ..

# Verify frontend dependencies
cd frontend/
npm install
cd ..
```

### Checklist

- [ ] .gitignore configured to prevent prohibited files
- [ ] Pre-commit hook checks root directory cleanliness
- [ ] Team aware of root directory standards
- [ ] Documentation clearly states allowed/prohibited items
- [ ] Regular cleanup performed during development
- [ ] CI/CD pipeline verifies root structure

### Troubleshooting

**Problem**: Developers keep creating files at root
- **Solution**: Implement pre-commit hooks, add CI/CD checks, provide clear documentation and training

**Problem**: Package managers creating files at root
- **Solution**: Always run npm/yarn commands inside `backend/` or `frontend/` folders, never at root

**Problem**: Build tools outputting to root
- **Solution**: Configure build output directories explicitly in tool configs (vite.config.ts, nest-cli.json)

**Problem**: IDE creating config files at root
- **Solution**: Add IDE-specific patterns to .gitignore, configure IDE to use project-specific settings folders

### Best Practices

- Run cleanup verification before every commit
- Automate root directory checks in CI/CD pipeline
- Document exceptions with clear justification in README
- Review root directory during code reviews
- Provide clear error messages explaining how to fix violations
- Make it easy to do the right thing (clear folder structure, good documentation)
- Educate team on why root cleanliness matters (organization, build clarity, dependency management)

## [Migration Guide for Existing Projects]()

Step-by-step instructions for migrating existing projects that may have incorrect root structure to the standardized organization, including handling of misplaced dependencies and configuration files.

### When to use?

Use this migration guide when inheriting a project with incorrect structure, when cleaning up a project that accumulated technical debt, or when standardizing multiple projects to follow the same conventions.

### When NOT to use?

Do not use for new projects starting from scratch - follow the standard structure from the beginning. Do not migrate during active feature development - schedule during a dedicated cleanup sprint.

### Example

Complete migration process from incorrect to correct structure.

**Step 1: Assess Current Structure**

```bash
# Check for prohibited items at root
ls -la | grep -E "package.json|node_modules|tsconfig.json|.env"

# Document what exists
echo "Files to move or remove:" > migration-checklist.txt
find . -maxdepth 1 -type f -name "package*" >> migration-checklist.txt
find . -maxdepth 1 -type f -name "*.json" >> migration-checklist.txt
```

**Step 2: Backup Current State**

```bash
# Create backup branch
git checkout -b migration/root-cleanup
git add .
git commit -m "chore: backup before root directory cleanup"
```

**Step 3: Remove Prohibited Root Files**

```bash
# Remove root-level dependency files
rm -f package.json package-lock.json yarn.lock pnpm-lock.yaml

# Remove root-level node_modules
rm -rf node_modules/

# Remove root-level configs
rm -f tsconfig.json vite.config.ts nest-cli.json

# Remove root-level .env (backup first if needed)
mv .env .env.backup  # Review and split into backend/.env and frontend/.env
```

**Step 4: Verify Backend Structure**

```bash
# Backend folder should be named 'backend/'
# No renaming needed if already correct

# Verify backend has proper structure
cd backend/
ls -la  # Should see: src/, package.json, tsconfig.json, .env

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd ..
```

**Step 5: Verify Frontend Structure**

```bash
# Verify frontend has proper structure
cd frontend/
ls -la  # Should see: src/, package.json, tsconfig.json, .env

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd ..
```

**Step 6: Update Docker Configurations**

```bash
# Verify docker-compose.yml uses backend/ paths
grep -n "backend" build/docker-compose.yml
grep -n "backend" build/Dockerfile

# Update if necessary (should already use backend/)
```

**Step 7: Update Documentation**

```bash
# Verify all documentation uses 'backend/' consistently
grep -r "back/" .rules/ --include="*.md" | grep -v "backend/"

# Update any remaining references to use backend/
```

**Step 8: Test Everything**

```bash
# Test backend
cd backend/
npm run build
npm run start:dev &
sleep 5
curl http://localhost:3000/api
kill %1
cd ..

# Test frontend
cd frontend/
npm run build
npm run dev &
sleep 5
curl http://localhost:5173
kill %1
cd ..

# Test Docker
cd build/
docker-compose up -d
docker-compose ps
docker-compose down
cd ..
```

**Step 9: Commit Changes**

```bash
# Review changes
git status
git diff

# Commit migration
git add .
git commit -m "chore: migrate to standardized root directory structure

- Standardize backend folder naming to backend/
- Remove root-level package.json and node_modules
- Remove root-level config files (tsconfig.json, etc)
- Update Docker configurations to use backend/ folder
- Update all documentation references
- Verify both applications build and run correctly"

# Push changes
git push origin migration/root-cleanup
```

### Checklist

- [ ] Current structure documented and assessed
- [ ] Backup branch created
- [ ] Root-level prohibited files removed
- [ ] Backend folder named `backend/` (rename if needed)
- [ ] Backend dependencies reinstalled successfully
- [ ] Frontend dependencies reinstalled successfully
- [ ] Docker configurations updated
- [ ] Documentation updated with correct paths
- [ ] Both applications tested and working
- [ ] Changes committed with clear message
- [ ] Team notified about structure changes

### Troubleshooting

**Problem**: Applications fail to build after migration
- **Solution**: Verify all dependencies reinstalled, check import paths are correct, ensure Docker volumes reference new paths

**Problem**: Docker containers can't find files
- **Solution**: Update all volume mounts in docker-compose.yml to use `backend/` path correctly

**Problem**: Import paths broken after renaming
- **Solution**: Path aliases should still work, verify tsconfig.json baseUrl and paths are correct in respective folders

**Problem**: CI/CD pipeline fails
- **Solution**: Update CI/CD scripts to use new folder names and structure

### Best Practices

- Perform migration during low-activity period to minimize disruption
- Create detailed migration checklist specific to your project
- Test thoroughly before merging migration changes
- Communicate migration plan to entire team beforehand
- Document any project-specific adjustments needed
- Consider pairing migration with dependency updates for efficiency
- Keep migration commit separate from feature work for clear history

## [References]()

Related documentation and guides for deeper understanding of project structure, backend organization, frontend setup, and Docker configuration conventions used throughout the project.

### When to use?

Reference these documents when you need detailed information about specific folder contents, when setting up new applications, or when understanding the rationale behind organizational decisions.

### When NOT to use?

Do not use as primary reference for root structure - this document is authoritative. Do not follow contradicting information from other sources without updating this document first.

### Example

Essential related documentation.

**Backend Structure:**
- [Backend Module Folder Structure](./backend-module-folder-structure.md) - Internal organization of `backend/src/modules`
- [How to Setup Backend](./how-to-setup-backend.md) - Complete backend initialization guide
- [How Main File Works](./how-main-file-works-backend.md) - Backend entry point and path resolution

**Frontend Structure:**
- [How to Setup Frontend](./how-to-setup-frontend.md) - Complete frontend initialization guide
- [React Component Naming Pattern](./react-component-naming-pattern-frontend.md) - Frontend component organization

**Project Documentation:**
- [SUMMARY.md](./SUMMARY.md) - Complete documentation index
- Project README.md - Overall project overview and setup

### Checklist

- [ ] Reviewed backend module structure documentation
- [ ] Reviewed frontend setup documentation
- [ ] Understand separation between root and application folders
- [ ] Know where to find specific organizational rules

### Troubleshooting

**Problem**: Conflicting information between documents
- **Solution**: This document (project-root-structure.md) takes precedence for root-level organization, defer to specific guides for internal folder structure

**Problem**: Documentation not updated after structure changes
- **Solution**: Update all related documentation when making structural changes, maintain consistency

### Best Practices

- Keep this document as single source of truth for root structure
- Update related documentation when root structure changes
- Cross-reference related guides for complete understanding
- Maintain documentation consistency across all guides

---

**Last updated**: 2025-01-16

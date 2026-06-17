```markdown
# Remedys.ai Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns and workflows used in the Remedys.ai JavaScript codebase. It covers coding conventions, file organization, commit styles, and the main collaborative workflows for design documentation, schema upgrades, site page management, and documentation alignment. By following these patterns, contributors can maintain consistency and efficiency across the project.

## Coding Conventions

**File Naming:**
- Use camelCase for JavaScript files.
  - Example: `verifyRemedysIntake.js`
- HTML files are typically named by route: `about/index.html`, `consulting/index.html`.

**Import Style:**
- Use relative imports.
  ```js
  import { someFunction } from './utils/someHelper.js';
  ```

**Export Style:**
- Use named exports.
  ```js
  // In utils/someHelper.js
  export function someFunction() { ... }
  ```

**Commit Messages:**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with these prefixes:
  - `feat`: New features
  - `fix`: Bug fixes
  - `test`: Test-related changes
  - `docs`: Documentation updates
- Keep commit messages concise (average: ~43 characters).
  - Example: `feat: add new diagnostic intake schema`

## Workflows

### Design Spec Documentation Workflow
**Trigger:** When proposing, updating, or finalizing a design spec or guideline  
**Command:** `/add-design-spec`

1. Create or update a markdown file in `docs/superpowers/specs/` with a dated filename (e.g., `2024-06-10-new-feature-guidelines.md`).
2. Optionally update related spec files to reflect new decisions or guidelines.

**Example:**
```bash
touch docs/superpowers/specs/2024-06-10-new-feature-guidelines.md
# Edit the file with the proposed spec
```

---

### Diagnostic Intake Schema and API Workflow
**Trigger:** When adding or upgrading a diagnostic intake version  
**Command:** `/upgrade-diagnostic-intake`

1. Add a new migration SQL file in `supabase/migrations/` for the diagnostic schema.
   - Example: `supabase/migrations/20240610_add_new_diagnostic_version.sql`
2. Update the backend function at `netlify/functions/remedys-intake.js` to handle the new payload.
   - Example:
     ```js
     export function handleIntake(payload) {
       // Add logic for new schema version
     }
     ```
3. Add or update test/verification scripts in `scripts/verify-remedys-intake.js`.

---

### Site Page Addition or Redesign Workflow
**Trigger:** When launching a new page, redesigning a section, or migrating to a new design system  
**Command:** `/add-site-page`

1. Add or update route HTML files (e.g., `about/index.html`, `consulting/index.html`).
2. Update shared CSS and JS assets (`assets/site.css`, `assets/site.js`) to reflect design or functionality changes.
3. Optionally add new assets (images, favicon, etc.) or update documentation/readme.

**Example:**
```bash
cp template.html about/index.html
# Edit about/index.html as needed
```

---

### Documentation Restructuring or Alignment Workflow
**Trigger:** When reorganizing docs to reflect the current product or operational reality  
**Command:** `/restructure-docs`

1. Move or rename documentation files to new locations or folders.
2. Update or create `README.md` and topic index files.
3. Correct outdated information and add new reference docs.

**Example:**
```bash
mv docs/old-section.md docs/new-structure/section.md
# Update docs/README.md to reflect changes
```

## Testing Patterns

- Test files follow the pattern: `*.test.*` (e.g., `verifyRemedysIntake.test.js`).
- Testing framework is not explicitly defined; check test files for context.
- Place test scripts in the `scripts/` directory or alongside the code being tested.

**Example:**
```js
// scripts/verifyRemedysIntake.test.js
import { handleIntake } from '../netlify/functions/remedys-intake.js';

test('should process new intake payload', () => {
  // test logic here
});
```

## Commands

| Command                | Purpose                                                        |
|------------------------|----------------------------------------------------------------|
| /add-design-spec       | Start or update a design specification in documentation        |
| /upgrade-diagnostic-intake | Add or upgrade a diagnostic intake schema and backend logic |
| /add-site-page         | Add a new site page or redesign an existing one                |
| /restructure-docs      | Restructure or align documentation with current operations     |
```
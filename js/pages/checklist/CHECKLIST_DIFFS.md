# Checklist Differences Documentation

This document tracks differences between `checklist.html` and `checklist-1.html`.

## Purpose

Both pages share the same modular JavaScript codebase but may have:
- Different HTML structure/layout
- Different feature sets
- Different default configurations
- Page-specific customizations

## Known Differences

### HTML Structure Differences

#### Hero Section and Header
- **checklist.html**: 
  - Has a `<section class="hero">` with navbar injection comment (`<!-- Navbar is injected by js/navbar.js -->`)
  - Uses standard page header structure with hero section
  - Hero section contains: `<h1 class="glow-text">Business Checklist</h1>` and description
- **checklist-1.html**: 
  - Does NOT have a hero section
  - Does NOT have navbar injection comment
  - Uses a centered `<div class="text-center mb-5">` with `<h1 class="glow-text">📋 Business Checklist</h1>` and description
  - Header is embedded directly in the main content area
- **Impact**: Different visual layout and structure. checklist.html follows the standard site template with hero section, while checklist-1.html uses a simpler inline header.

### CSS Differences

#### Stylesheet Loading
- **checklist.html**: 
  - Loads: `checklist-base.css`, `checklist.css`
- **checklist-1.html**: 
  - Loads: `checklist-base.css`, `checklist.css`, `checklist-1.css` (additional variant stylesheet)
- **Impact**: checklist-1.html can have page-specific style overrides via `checklist-1.css`

### Feature Differences

#### Tier Color Options
- **checklist.html**: 
  - Has 18 color options in the tier color select dropdown
  - Includes all opacity variants (75%, 50%)
- **checklist-1.html**: 
  - Has fewer color options (missing some opacity variants)
  - Specifically missing: `bg-primary bg-opacity-50 text-white` and `bg-success bg-opacity-50 text-white` options
- **Impact**: Users on checklist-1.html have fewer color customization options for tiers

### Layout Differences

#### All Business Summary Position
- **checklist.html**: All Business Summary is positioned above Configuration Management
- **checklist-1.html**: All Business Summary is positioned above Configuration Management (same as checklist.html)
- **Impact**: Both pages have the same layout order for these sections

## How to Add New Differences

1. When you discover a difference between the two pages:
   - Document it in this file
   - Add a check in `checklist-diff-tracker.js` if it can be automatically detected
   - Add comments in the code marking the difference (e.g., `// CHECKLIST-1-ONLY: ...`)

2. Format for documenting differences:
   ```markdown
   ### [Feature Name]
   - **checklist.html**: [Description]
   - **checklist-1.html**: [Description]
   - **Impact**: [What this difference affects]
   ```

## Code Markers

When code differs between pages, use these markers:

- `// CHECKLIST-1-ONLY: [description]` - Code only in checklist-1.html
- `// CHECKLIST-ONLY: [description]` - Code only in checklist.html
- `// DIFFERENCE: [description]` - Code exists in both but behaves differently

## Usage

The `checklist-diff-tracker.js` utility can be used to:
- Detect which page is loaded
- Generate difference reports
- Log differences for debugging

Example:
```javascript
// Detect current page
const page = window.checklistDiffTracker.detectPage();

// Generate difference report
const report = window.checklistDiffTracker.generateReport();
console.log(report);
```

## Summary of Differences

| Category | checklist.html | checklist-1.html |
|----------|---------------|------------------|
| Hero Section | ✅ Has hero section | ❌ No hero section |
| Navbar Comment | ✅ Has navbar injection comment | ❌ No navbar comment |
| Header Structure | Standard hero section | Inline centered div |
| CSS Files | checklist-base.css, checklist.css | checklist-base.css, checklist.css, checklist-1.css |
| Tier Colors | 18 options (full set) | Fewer options (missing some opacity variants) |
| JavaScript | Same modular scripts | Same modular scripts |

## Last Updated

2026-01-12 - Initial documentation created
2026-01-12 - Added comprehensive difference documentation based on file analysis
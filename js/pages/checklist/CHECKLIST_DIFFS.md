# Checklist Differences Documentation

This document tracks differences between `checklist.html` and `checklist-1.html`.

## Purpose

Both pages share the same modular JavaScript codebase but may have:
- Different HTML structure/layout
- Different feature sets
- Different default configurations
- Page-specific customizations

## Known Differences

### Layout Differences

#### All Business Summary Position
- **checklist.html**: All Business Summary is positioned above Configuration Management
- **checklist-1.html**: All Business Summary is positioned above Configuration Management (same as checklist.html)

### Feature Differences

*To be documented as differences are discovered*

### Configuration Differences

*To be documented as differences are discovered*

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

## Last Updated

2026-01-12 - Initial documentation created

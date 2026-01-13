# Checklist Module Extraction Notes

## Overview
The checklist.html file contains ~3300 lines of inline JavaScript that needs to be extracted into modular files.

## Module Structure

### checklist-shared.js (COMPLETED)
- Configuration management (initializeConfig, saveConfigToLocalStorage, loadConfigFromLocalStorage, getDefaultConfig)
- DebugManager integration
- Utility functions (escapeHtml, formatTimeForTimezone, getEasternTimeZone)
- Global state accessors

### checklist-core.js (TO CREATE)
- Business loading (loadAllBusinesses, buildChecklist)
- Progress management (saveProgress, loadProgress, clearProgress)
- UI building functions
- Checkbox management (checkAll, uncheckAll)
- Summary updates (updateSummary)

### checklist-ui.js (TO CREATE)
- Visibility toggles (toggleBusinessVisibility, toggleTierVisibility)
- Tier checkbox state management (updateTierCheckboxState, toggleTierCheckAll)
- Tier toggle button updates (updateTierToggleButton)
- Stock calculation (calculateStockNeededChecklist)

### checklist-summary.js (TO CREATE)
- Tier summary calculations (calculateTierSummary, toggleTierSummary)
- All business summary (calculateAllBusinessSummary)

### checklist-modals.js (TO CREATE)
- Tier management (openAddTierModal, openEditTierModal, saveTier, deleteTier)
- Business management (openAddBusinessModal, openEditBusinessModal, saveBusiness, deleteBusiness)
- Product management (openAddProductModal, openEditProductModal, saveProduct, deleteProduct)
- Product order management (openProductOrderModal, moveProductUp, moveProductDown, saveProductOrder, sortProductsByTier, resetProductOrder)
- Import/Export (exportConfiguration, openImportModal, loadTemplate, importConfiguration, generatePersonTableString, copyToClipboard)
- Emoji picker (toggleEmojiPicker, initializeEmojiSearch, filterEmojis, selectEmoji)

### checklist-init.js (TO CREATE)
- DOMContentLoaded initialization
- Event listeners setup
- Collapse state initialization (initHowToUseCollapse, initAllBusinessSummaryCollapse, initSummaryCollapse)
- Time updates (updateTimes, updateRebootCountdown)

### checklist-diff-tracker.js (TO CREATE)
- Utility to track differences between checklist.html and checklist-1.html
- Generate diff reports

## Key Adaptations Needed

1. Replace all `debugLog()`, `debugError()`, `debugWarn()` calls with `window.checklistDebugManager.log()`, `window.checklistDebugManager.error()`, `window.checklistDebugManager.warn()`

2. Replace all `checklistConfigData` variable access with `window.checklistConfigData()` function call

3. Replace all `checklistConfigData =` assignments with `window.setChecklistConfigData()`

4. Access `tierSummaryVisible` via `window.tierSummaryVisible`

5. Wrap each module in IIFE and export functions to global scope

6. Ensure proper load order: shared -> core -> ui -> summary -> modals -> init

## Functions That Need Global Access

All functions called from HTML (onclick, onchange, oninput handlers) need to be exported to window object.

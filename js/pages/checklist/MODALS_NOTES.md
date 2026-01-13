# Checklist Modals Module Notes

## Functions to Include in checklist-modals.js

### Tier Management
- openAddTierModal()
- openEditTierModal()
- saveTier()
- deleteTier()

### Business Management
- openAddBusinessModal()
- openEditBusinessModal()
- saveBusiness()
- deleteBusiness()

### Product Management
- openAddProductModal()
- openEditProductModal()
- saveProduct()
- deleteProduct()
- getProductsForTier(tierId)
- populateProductSelectorsForTier(tierName)
- handleProductSelection(tierName, businessCode)

### Product Order Management
- openProductOrderModal()
- moveProductUp(productId)
- moveProductDown(productId)
- updateProductOrderButtons()
- saveProductOrder()
- sortProductsByTier()
- resetProductOrder()

### Import/Export
- exportConfiguration()
- openImportModal()
- loadTemplate()
- importConfiguration()
- generatePersonTableString()
- copyToClipboard(textareaId)

### Emoji Picker
- toggleEmojiPicker()
- initializeEmojiSearch()
- filterEmojis()
- selectEmoji(emoji)

## Adaptations Needed
- Replace `checklistConfigData` with `window.checklistConfigData()`
- Replace `debugLog()` with `debugManager.log()`
- Replace `debugError()` with `debugManager.error()`
- Replace `debugWarn()` with `debugManager.warn()`
- Replace `saveConfigToLocalStorage()` with `window.saveConfigToLocalStorage()`
- Replace `loadAllBusinesses()` with `window.loadAllBusinesses()`
- Replace `getBusinessTiers()` with `window.getBusinessTiers()`
- Replace `escapeHtml()` with `window.escapeHtml()`
- Replace `calculateTierSummary()` with `window.calculateTierSummary()`
- Replace `calculateAllBusinessSummary()` with `window.calculateAllBusinessSummary()`

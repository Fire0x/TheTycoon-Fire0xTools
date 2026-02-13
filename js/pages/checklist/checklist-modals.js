/**
 * Checklist Modals Module
 * Contains all modal management functions: tier, business, product, import/export, emoji picker
 */
(function () {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.checklistDebugManager === 'undefined') {
        console.error('checklist-shared.js must be loaded before checklist-modals.js');
        return;
    }

    const debugManager = window.checklistDebugManager;

    // ============================================================================
    // TIER MANAGEMENT FUNCTIONS
    // ============================================================================

    function openAddTierModal() {
        document.getElementById('tierModalLabel').textContent = 'Add Tier';
        document.getElementById('tierForm').reset();
        document.getElementById('tierId').value = '';
        document.getElementById('deleteTierBtn').style.display = 'none';
        const modalElement = document.getElementById('tierModal');
        const modal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('shown.bs.modal', function () {
            modalElement.setAttribute('aria-hidden', 'false');
        }, { once: true });

        modal.show();
    }

    function openEditTierModal() {
        const configData = window.checklistConfigData();
        const tiers = configData.tiers || [];
        if (tiers.length === 0) {
            alert('No tiers available to edit. Please add a tier first.');
            return;
        }

        const tierOptions = tiers.map(t => `${t.id}: ${t.name}`).join('\n');
        const tierId = prompt(`Enter Tier ID to edit:\n\n${tierOptions}`);
        if (!tierId) return;

        const tier = tiers.find(t => t.id === parseInt(tierId));
        if (!tier) {
            alert('Tier not found');
            return;
        }

        document.getElementById('tierModalLabel').textContent = 'Edit Tier';
        document.getElementById('tierId').value = tier.id;
        document.getElementById('tierName').value = tier.name;
        document.getElementById('tierIcon').value = tier.icon || '';
        document.getElementById('tierColor').value = tier.color || 'bg-secondary';
        document.getElementById('deleteTierBtn').style.display = 'inline-block';

        const modalElement = document.getElementById('tierModal');
        const modal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('shown.bs.modal', function () {
            modalElement.setAttribute('aria-hidden', 'false');
        }, { once: true });

        modal.show();
    }

    function saveTier() {
        const id = document.getElementById('tierId').value;
        const name = document.getElementById('tierName').value;
        const icon = document.getElementById('tierIcon').value;
        const color = document.getElementById('tierColor').value;

        if (!name.trim()) {
            alert('Tier name is required');
            return;
        }

        const configData = window.checklistConfigData();
        if (!configData.tiers) {
            window.setChecklistConfigData({ ...configData, tiers: [] });
        }

        const updatedConfig = window.checklistConfigData();

        if (id) {
            // Edit existing tier
            const tierIndex = updatedConfig.tiers.findIndex(t => t.id === parseInt(id));
            if (tierIndex !== -1) {
                const originalTier = updatedConfig.tiers[tierIndex];
                const trimmedName = name.trim();

                if (trimmedName !== originalTier.name) {
                    const conflictingTier = updatedConfig.tiers.find(
                        t => t.name.toLowerCase() === trimmedName.toLowerCase() && t.id !== parseInt(id)
                    );
                    if (conflictingTier) {
                        alert('Tier name already exists');
                        return;
                    }
                }

                updatedConfig.tiers[tierIndex] = {
                    id: parseInt(id),
                    name: trimmedName,
                    icon: icon.trim(),
                    color: color,
                    visible: true
                };
            }
        } else {
            // Add new tier
            const trimmedName = name.trim();
            const existingTier = updatedConfig.tiers.find(
                t => t.name.toLowerCase() === trimmedName.toLowerCase()
            );
            if (existingTier) {
                alert('Tier name already exists');
                return;
            }

            const maxId = updatedConfig.tiers.length > 0
                ? Math.max(...updatedConfig.tiers.map(t => t.id))
                : 0;
            updatedConfig.tiers.push({
                id: maxId + 1,
                name: trimmedName,
                icon: icon.trim(),
                color: color,
                visible: true
            });
        }

        window.setChecklistConfigData(updatedConfig);
        window.saveConfigToLocalStorage();

        const tierModal = bootstrap.Modal.getInstance(document.getElementById('tierModal'));
        if (tierModal) {
            const focusedElement = document.activeElement;
            if (focusedElement && tierModal._element.contains(focusedElement)) {
                focusedElement.blur();
            }
            tierModal.hide();
        }
        requestAnimationFrame(() => {
            if (typeof window.loadAllBusinesses === 'function') {
                window.loadAllBusinesses();
            }
        });
    }

    function deleteTier() {
        const id = document.getElementById('tierId').value;
        if (!id) return;

        const configData = window.checklistConfigData();
        const tier = configData.tiers.find(t => t.id === parseInt(id));
        const tierName = tier ? tier.name : 'this tier';
        const businessesInTier = (configData.businesses || []).filter(b => b.tierId === parseInt(id));
        const businessCount = businessesInTier.length;

        if (!confirm(`⚠️ WARNING: You are about to delete "${tierName}".\n\nThis will PERMANENTLY delete:\n- The tier itself\n- ${businessCount} business${businessCount !== 1 ? 'es' : ''} in this tier\n\nThis action CANNOT be undone!\n\nAre you sure you want to continue?`)) {
            return;
        }

        if (!confirm(`🚨 FINAL CONFIRMATION 🚨\n\nYou are about to PERMANENTLY DELETE:\n- Tier: "${tierName}"\n- ${businessCount} business${businessCount !== 1 ? 'es' : ''}\n\nThis will remove ALL data associated with this tier.\n\nClick OK to proceed to the final confirmation step.`)) {
            return;
        }

        const confirmationPhrase = "I want to remove";
        const userInput = prompt(`🚨 TYPE TO CONFIRM DELETION 🚨\n\nTo confirm deletion of:\n- Tier: "${tierName}"\n- ${businessCount} business${businessCount !== 1 ? 'es' : ''}\n\nPlease type exactly: "${confirmationPhrase}"\n\n(Click Cancel to abort)`);

        if (userInput === null) {
            return;
        }

        if (userInput.trim() !== confirmationPhrase) {
            alert(`❌ Confirmation failed!\n\nYou typed: "${userInput}"\n\nExpected: "${confirmationPhrase}"\n\nDeletion cancelled.`);
            return;
        }

        const updatedConfig = { ...configData };
        updatedConfig.tiers = updatedConfig.tiers.filter(t => t.id !== parseInt(id));
        updatedConfig.businesses = (updatedConfig.businesses || []).filter(b => b.tierId !== parseInt(id));
        updatedConfig.products = (updatedConfig.products || []).filter(p => p.tierId !== parseInt(id));

        window.setChecklistConfigData(updatedConfig);
        window.saveConfigToLocalStorage();

        const tierModal = bootstrap.Modal.getInstance(document.getElementById('tierModal'));
        if (tierModal) {
            const focusedElement = document.activeElement;
            if (focusedElement && tierModal._element.contains(focusedElement)) {
                focusedElement.blur();
            }
            tierModal.hide();
        }
        setTimeout(() => {
            if (typeof window.loadAllBusinesses === 'function') {
                window.loadAllBusinesses();
            }
        }, 0);

        alert(`✅ Tier "${tierName}" and ${businessCount} business${businessCount !== 1 ? 'es' : ''} have been deleted.`);
    }

    // ============================================================================
    // BUSINESS MANAGEMENT FUNCTIONS
    // ============================================================================

    function openAddBusinessModal() {
        document.getElementById('businessModalLabel').textContent = 'Add Business';
        document.getElementById('businessForm').reset();
        document.getElementById('businessCodeOriginal').value = '';
        document.getElementById('deleteBusinessBtn').style.display = 'none';

        document.getElementById('businessMaxStock').value = '0';
        document.getElementById('businessCollectionStorage').value = '0';
        document.getElementById('businessNotes').value = '';

        const tierSelect = document.getElementById('businessTierId');
        tierSelect.innerHTML = '<option value="">Select a tier...</option>';
        const configData = window.checklistConfigData();
        (configData.tiers || []).forEach(tier => {
            const option = document.createElement('option');
            option.value = tier.id;
            option.textContent = tier.name;
            tierSelect.appendChild(option);
        });

        const modalElement = document.getElementById('businessModal');
        const modal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('shown.bs.modal', function () {
            if (typeof initNumberFormatting === 'function') {
                initNumberFormatting({ allowDecimals: false, selector: '#businessMaxStock, #businessCollectionStorage' });
            }
            const tooltipTriggerList = modalElement.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        }, { once: true });

        modal.show();
    }

    function openEditBusinessModal() {
        const configData = window.checklistConfigData();
        const businesses = configData.businesses || [];
        if (businesses.length === 0) {
            alert('No businesses available to edit. Please add a business first.');
            return;
        }

        setTimeout(() => {
            const maxDisplay = 50;
            const displayBusinesses = businesses.slice(0, maxDisplay);
            const remainingCount = businesses.length - maxDisplay;

            let businessOptions = displayBusinesses.map(b => `${b.businessCode}: ${b.businessName}`).join('\n');
            if (remainingCount > 0) {
                businessOptions += `\n\n... and ${remainingCount} more business${remainingCount !== 1 ? 'es' : ''}`;
            }

            const businessCode = prompt(`Enter Business Code to edit:\n\n${businessOptions}`);
            if (!businessCode) return;

            const business = businesses.find(b => b.businessCode === businessCode.trim());
            if (!business) {
                alert('Business not found');
                return;
            }

            document.getElementById('businessModalLabel').textContent = 'Edit Business';
            document.getElementById('businessCodeOriginal').value = business.businessCode;
            document.getElementById('businessCode').value = business.businessCode;
            document.getElementById('businessName').value = business.businessName || '';
            document.getElementById('businessStatus').value = business.status || 'Open';

            const maxStock = business.maxStock || 0;
            const collectionStorage = business.collectionStorage || 0;
            document.getElementById('businessMaxStock').value = typeof formatNumber === 'function' ? formatNumber(maxStock, false) : maxStock.toString();
            document.getElementById('businessCollectionStorage').value = typeof formatNumber === 'function' ? formatNumber(collectionStorage, false) : collectionStorage.toString();

            document.getElementById('businessCanCollectItems').checked = business.canCollectItems === true;
            document.getElementById('businessNotes').value = business.notes || '';
            document.getElementById('deleteBusinessBtn').style.display = 'inline-block';

            const tierSelect = document.getElementById('businessTierId');
            const tiers = configData.tiers || [];

            const fragment = document.createDocumentFragment();
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a tier...';
            fragment.appendChild(defaultOption);

            tiers.forEach(tier => {
                const option = document.createElement('option');
                option.value = tier.id;
                option.textContent = tier.name;
                if (tier.id === business.tierId) {
                    option.selected = true;
                }
                fragment.appendChild(option);
            });

            tierSelect.innerHTML = '';
            tierSelect.appendChild(fragment);

            const modalElement = document.getElementById('businessModal');
            const modal = new bootstrap.Modal(modalElement);

            modalElement.addEventListener('shown.bs.modal', function () {
                document.getElementById('businessNotes').value = business.notes || '';
                if (typeof initNumberFormatting === 'function') {
                    initNumberFormatting({ allowDecimals: false, selector: '#businessMaxStock, #businessCollectionStorage' });
                }
                const tooltipTriggerList = modalElement.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            }, { once: true });

            modal.show();
        }, 0);
    }

    function saveBusiness() {
        const originalCode = document.getElementById('businessCodeOriginal').value;
        const code = document.getElementById('businessCode').value.trim();
        const name = document.getElementById('businessName').value.trim();
        const tierId = document.getElementById('businessTierId').value;
        const status = document.getElementById('businessStatus').value;

        const maxStockValue = document.getElementById('businessMaxStock').value;
        const collectionStorageValue = document.getElementById('businessCollectionStorage').value;
        const maxStock = typeof parseFormattedNumber === 'function'
            ? parseFormattedNumber(maxStockValue)
            : parseInt(maxStockValue.replace(/,/g, '')) || 0;
        const collectionStorage = typeof parseFormattedNumber === 'function'
            ? parseFormattedNumber(collectionStorageValue)
            : parseInt(collectionStorageValue.replace(/,/g, '')) || 0;

        const canCollectItems = document.getElementById('businessCanCollectItems').checked;
        const notes = document.getElementById('businessNotes').value.trim();

        if (!code || !name || !tierId) {
            alert('Business code, name, and tier are required');
            return;
        }

        const configData = window.checklistConfigData();
        const updatedConfig = { ...configData };
        if (!updatedConfig.businesses) {
            updatedConfig.businesses = [];
        }

        if (originalCode) {
            const businessIndex = updatedConfig.businesses.findIndex(b => b.businessCode === originalCode);
            if (businessIndex !== -1) {
                if (code !== originalCode) {
                    const conflictingBusiness = updatedConfig.businesses.find(
                        b => b.businessCode === code && b.businessCode !== originalCode
                    );
                    if (conflictingBusiness) {
                        alert('Business code already exists');
                        return;
                    }
                }

                updatedConfig.businesses[businessIndex] = {
                    businessCode: code,
                    businessName: name,
                    tierId: parseInt(tierId),
                    status: status,
                    maxStock: maxStock,
                    collectionStorage: collectionStorage,
                    canCollectItems: canCollectItems,
                    notes: notes
                };
            }
        } else {
            if (updatedConfig.businesses.find(b => b.businessCode === code)) {
                alert('Business code already exists');
                return;
            }

            updatedConfig.businesses.push({
                businessCode: code,
                businessName: name,
                tierId: parseInt(tierId),
                status: status,
                maxStock: maxStock,
                collectionStorage: collectionStorage,
                canCollectItems: canCollectItems
            });
        }

        window.setChecklistConfigData(updatedConfig);
        window.saveConfigToLocalStorage();

        const businessModal = bootstrap.Modal.getInstance(document.getElementById('businessModal'));
        if (businessModal) {
            const focusedElement = document.activeElement;
            if (focusedElement && businessModal._element.contains(focusedElement)) {
                focusedElement.blur();
            }
            businessModal.hide();
        }
        requestAnimationFrame(() => {
            if (typeof window.loadAllBusinesses === 'function') {
                window.loadAllBusinesses();
            }
        });
    }

    function deleteBusiness() {
        const code = document.getElementById('businessCodeOriginal').value;
        if (!code) return;

        const configData = window.checklistConfigData();
        const business = configData.businesses.find(b => b.businessCode === code);
        const businessName = business ? business.businessName : code;

        if (!confirm(`⚠️ WARNING: You are about to delete business "${businessName}" (${code}).\n\nThis will PERMANENTLY delete:\n- Business code: ${code}\n- Business name: ${businessName}\n- All associated data\n\nThis action CANNOT be undone!\n\nAre you sure you want to continue?`)) {
            return;
        }

        if (!confirm(`🚨 FINAL CONFIRMATION 🚨\n\nYou are about to PERMANENTLY DELETE:\n- Business Code: ${code}\n- Business Name: ${businessName}\n\nThis will remove ALL data for this business.\n\nClick OK to proceed to the final confirmation step.`)) {
            return;
        }

        const confirmationPhrase = "I want to remove";
        const userInput = prompt(`🚨 TYPE TO CONFIRM DELETION 🚨\n\nTo confirm deletion of:\n- Business Code: ${code}\n- Business Name: ${businessName}\n\nPlease type exactly: "${confirmationPhrase}"\n\n(Click Cancel to abort)`);

        if (userInput === null) {
            return;
        }

        if (userInput.trim() !== confirmationPhrase) {
            alert(`❌ Confirmation failed!\n\nYou typed: "${userInput}"\n\nExpected: "${confirmationPhrase}"\n\nDeletion cancelled.`);
            return;
        }

        const updatedConfig = { ...configData };
        updatedConfig.businesses = (updatedConfig.businesses || []).filter(b => b.businessCode !== code);

        window.setChecklistConfigData(updatedConfig);
        window.saveConfigToLocalStorage();

        const businessModal = bootstrap.Modal.getInstance(document.getElementById('businessModal'));
        if (businessModal) {
            const focusedElement = document.activeElement;
            if (focusedElement && businessModal._element.contains(focusedElement)) {
                focusedElement.blur();
            }
            businessModal.hide();
        }
        requestAnimationFrame(() => {
            if (typeof window.loadAllBusinesses === 'function') {
                window.loadAllBusinesses();
            }
        });

        alert(`✅ Business "${businessName}" (${code}) has been deleted.`);
    }

    // ============================================================================
    // PRODUCT MANAGEMENT FUNCTIONS
    // ============================================================================

    function getProductsForTier(tierId) {
        const configData = window.checklistConfigData();
        if (!configData || !configData.products) {
            debugManager.log(`No products config found for tier ${tierId}`);
            return [];
        }
        const products = configData.products.filter(p => p.tierId === tierId);
        debugManager.log(`Found ${products.length} products for tier ${tierId}`);
        return products;
    }

    function populateProductSelectorsForTier(tierName) {
        debugManager.log(`Populating product selectors for tier: ${tierName}`);
        const configData = window.checklistConfigData();
        const tier = (configData.tiers || []).find(t => t.name === tierName);
        if (!tier) {
            debugManager.warn(`Tier not found: ${tierName}`);
            return;
        }

        const products = getProductsForTier(tier.id);
        const selectors = document.querySelectorAll(`.product-selector[data-tier="${tierName}"]`);
        debugManager.log(`Found ${selectors.length} selectors for tier ${tierName}, populating with ${products.length} products`);

        selectors.forEach((selector, index) => {
            selector.innerHTML = '<option value="">-- Select Product --</option>';

            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.productName;
                option.dataset.productName = product.productName;
                selector.appendChild(option);
            });
            debugManager.log(`Populated selector ${index + 1}/${selectors.length} for business: ${selector.dataset.businessCode}`);
        });
    }

    function handleProductSelection(tierName, businessCode) {
        const selector = document.querySelector(`.product-selector[data-tier="${tierName}"][data-business-code="${businessCode}"]`);
        if (!selector) {
            debugManager.warn(`Product selector not found for ${businessCode} in ${tierName}`);
            return;
        }

        const productId = selector.value ? parseInt(selector.value) : null;
        const selectedProduct = selector.options[selector.selectedIndex].text;
        debugManager.log(`Product selection changed:`, { tierName, businessCode, productId, productName: selectedProduct });

        const configData = window.checklistConfigData();
        const business = (configData.businesses || []).find(b => b.businessCode === businessCode);
        if (business) {
            const oldProductId = business.productId;
            business.productId = productId;
            debugManager.log(`Updated business product selection:`, { businessCode, oldProductId, newProductId: productId });
            window.setChecklistConfigData(configData);
            window.saveConfigToLocalStorage();
        } else {
            debugManager.warn(`Business not found: ${businessCode}`);
        }

        debugManager.log(`Triggering tier summary recalculation for ${tierName}`);
        if (typeof window.calculateTierSummary === 'function') {
            window.calculateTierSummary(tierName);
        }
    }

    function openAddProductModal() {
        debugManager.log('Opening Add Product Modal');
        document.getElementById('productModalLabel').textContent = 'Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('deleteProductBtn').style.display = 'none';

        const tierSelect = document.getElementById('productTierId');
        tierSelect.innerHTML = '<option value="">Select a tier...</option>';
        const configData = window.checklistConfigData();
        const tiers = configData.tiers || [];
        tiers.forEach(tier => {
            const option = document.createElement('option');
            option.value = tier.id;
            option.textContent = tier.name;
            tierSelect.appendChild(option);
        });
        debugManager.log(`Populated ${tiers.length} tiers in product modal`);

        const modalElement = document.getElementById('productModal');
        const modal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('shown.bs.modal', function () {
            modalElement.setAttribute('aria-hidden', 'false');
        }, { once: true });

        modal.show();
    }

    function openEditProductModal() {
        const configData = window.checklistConfigData();
        const products = configData.products || [];
        debugManager.log(`Opening Edit Product Modal, ${products.length} products available`);
        if (products.length === 0) {
            alert('No products available to edit. Please add a product first.');
            return;
        }

        setTimeout(() => {
            const maxDisplay = 50;
            const displayProducts = products.slice(0, maxDisplay);
            const remainingCount = products.length - maxDisplay;

            let productOptions = displayProducts.map(p => {
                const tier = (configData.tiers || []).find(t => t.id === p.tierId);
                const tierName = tier ? tier.name : 'Unknown';
                return `${p.id}: ${p.productName} (${tierName})`;
            }).join('\n');

            if (remainingCount > 0) {
                productOptions += `\n\n... and ${remainingCount} more product${remainingCount !== 1 ? 's' : ''}`;
            }

            const productId = prompt(`Enter Product ID to edit:\n\n${productOptions}`);
            if (!productId) {
                debugManager.log('Product edit cancelled by user');
                return;
            }

            const product = products.find(p => p.id === parseInt(productId));
            if (!product) {
                debugManager.warn(`Product not found: ${productId}`);
                alert('Product not found');
                return;
            }

            debugManager.log(`Editing product:`, { id: product.id, name: product.productName, tierId: product.tierId });
            document.getElementById('productModalLabel').textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.productName || '';
            document.getElementById('deleteProductBtn').style.display = 'inline-block';

            const tierSelect = document.getElementById('productTierId');
            const tiers = configData.tiers || [];

            const fragment = document.createDocumentFragment();
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a tier...';
            fragment.appendChild(defaultOption);

            tiers.forEach(tier => {
                const option = document.createElement('option');
                option.value = tier.id;
                option.textContent = tier.name;
                if (tier.id === product.tierId) {
                    option.selected = true;
                }
                fragment.appendChild(option);
            });

            tierSelect.innerHTML = '';
            tierSelect.appendChild(fragment);

            const modalElement = document.getElementById('productModal');
            const modal = new bootstrap.Modal(modalElement);

            modalElement.addEventListener('shown.bs.modal', function () {
                modalElement.setAttribute('aria-hidden', 'false');
            }, { once: true });

            modal.show();
        }, 0);
    }

    function saveProduct() {
        const id = document.getElementById('productId').value;
        const tierId = document.getElementById('productTierId').value;
        const productName = document.getElementById('productName').value.trim();

        debugManager.log('Saving product:', { id, tierId, productName });

        if (!tierId || !productName) {
            debugManager.warn('Product save failed: Tier and product name are required');
            alert('Tier and product name are required');
            return;
        }

        const configData = window.checklistConfigData();
        const updatedConfig = { ...configData };
        if (!updatedConfig.products) {
            updatedConfig.products = [];
        }

        if (id) {
            debugManager.log(`Updating existing product ID: ${id}`);
            const productIndex = updatedConfig.products.findIndex(p => p.id === parseInt(id));
            if (productIndex !== -1) {
                const oldProduct = updatedConfig.products[productIndex];
                const conflictingProduct = updatedConfig.products.find(
                    p => p.productName.toLowerCase() === productName.toLowerCase() &&
                        p.tierId === parseInt(tierId) &&
                        p.id !== parseInt(id)
                );
                if (conflictingProduct) {
                    debugManager.warn(`Product name conflict: "${productName}" already exists for tier ${tierId}`);
                    alert('Product name already exists for this tier');
                    return;
                }

                updatedConfig.products[productIndex] = {
                    id: parseInt(id),
                    tierId: parseInt(tierId),
                    productName: productName
                };
                debugManager.log(`✅ Updated product:`, {
                    id: parseInt(id),
                    oldName: oldProduct.productName,
                    newName: productName,
                    oldTierId: oldProduct.tierId,
                    newTierId: parseInt(tierId)
                });
            } else {
                debugManager.warn(`Product index not found for ID: ${id}`);
            }
        } else {
            debugManager.log('Creating new product');
            const existingProduct = updatedConfig.products.find(
                p => p.productName.toLowerCase() === productName.toLowerCase() &&
                    p.tierId === parseInt(tierId)
            );
            if (existingProduct) {
                debugManager.warn(`Product name already exists for tier ${tierId}: "${productName}"`);
                alert('Product name already exists for this tier');
                return;
            }

            const maxId = updatedConfig.products.length > 0
                ? Math.max(...updatedConfig.products.map(p => p.id))
                : 0;
            const newProductId = maxId + 1;
            updatedConfig.products.push({
                id: newProductId,
                tierId: parseInt(tierId),
                productName: productName
            });
            debugManager.log(`✅ Created product with ID: ${newProductId}`, { id: newProductId, tierId: parseInt(tierId), productName });
        }

        window.setChecklistConfigData(updatedConfig);
        window.saveConfigToLocalStorage();
        debugManager.log(`✅ Saved ${updatedConfig.products.length} products to config`);

        const productModal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        if (productModal) {
            const focusedElement = document.activeElement;
            if (focusedElement && productModal._element.contains(focusedElement)) {
                focusedElement.blur();
            }
            productModal.hide();
        }
        requestAnimationFrame(() => {
            if (typeof window.loadAllBusinesses === 'function') {
                window.loadAllBusinesses();
            }
        });
    }

    function deleteProduct() {
        const id = document.getElementById('productId').value;
        if (!id) {
            debugManager.warn('Delete product called but no ID provided');
            return;
        }

        debugManager.log('Deleting product:', id);
        const configData = window.checklistConfigData();
        const product = configData.products.find(p => p.id === parseInt(id));
        debugManager.log('Product to delete:', product);

        const productName = product ? product.productName : 'this product';
        const tier = product ? (configData.tiers || []).find(t => t.id === product.tierId) : null;
        const tierName = tier ? tier.name : 'Unknown';

        const businessesUsingProduct = (configData.businesses || []).filter(b => b.productId === parseInt(id));
        const businessCount = businessesUsingProduct.length;
        debugManager.log(`Found ${businessCount} businesses using this product`);

        if (businessCount > 0) {
            debugManager.warn(`Cannot delete product ${id}: ${businessCount} businesses are using it`, businessesUsingProduct.map(b => b.businessCode));
            if (!confirm(`⚠️ WARNING: You cannot delete "${productName}" because ${businessCount} business${businessCount !== 1 ? 'es are' : ' is'} using it.\n\nPlease remove the product selection from those businesses first.`)) {
                return;
            }
            return;
        }

        if (!confirm(`⚠️ WARNING: You are about to delete product "${productName}" from ${tierName}.\n\nThis will PERMANENTLY delete this product.\n\nThis action CANNOT be undone!\n\nAre you sure you want to continue?`)) {
            return;
        }

        if (!confirm(`🚨 FINAL CONFIRMATION 🚨\n\nYou are about to PERMANENTLY DELETE:\n- Product: "${productName}"\n- Tier: ${tierName}\n\nClick OK to proceed to the final confirmation step.`)) {
            return;
        }

        const confirmationPhrase = "I want to remove";
        const userInput = prompt(`🚨 TYPE TO CONFIRM DELETION 🚨\n\nTo confirm deletion of:\n- Product: "${productName}"\n- Tier: ${tierName}\n\nPlease type exactly: "${confirmationPhrase}"\n\n(Click Cancel to abort)`);

        if (userInput === null) {
            return;
        }

        if (userInput.trim() !== confirmationPhrase) {
            alert(`❌ Confirmation failed!\n\nYou typed: "${userInput}"\n\nExpected: "${confirmationPhrase}"\n\nDeletion cancelled.`);
            return;
        }

        const productsBefore = configData.products.length;
        const updatedConfig = { ...configData };
        updatedConfig.products = (updatedConfig.products || []).filter(p => p.id !== parseInt(id));
        const productsAfter = updatedConfig.products.length;

        window.setChecklistConfigData(updatedConfig);
        window.saveConfigToLocalStorage();
        debugManager.log(`✅ Deleted product ID ${id}, ${productsBefore} -> ${productsAfter} products remaining`);

        const productModal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        if (productModal) {
            const focusedElement = document.activeElement;
            if (focusedElement && productModal._element.contains(focusedElement)) {
                focusedElement.blur();
            }
            productModal.hide();
        }
        requestAnimationFrame(() => {
            if (typeof window.loadAllBusinesses === 'function') {
                window.loadAllBusinesses();
            }
        });

        alert(`✅ Product "${productName}" has been deleted.`);
    }

    // ============================================================================
    // PRODUCT ORDER MANAGEMENT FUNCTIONS
    // ============================================================================

    function openProductOrderModal() {
        debugManager.log('=== openProductOrderModal START ===');
        const startTime = performance.now();
        const configData = window.checklistConfigData();
        const products = configData.products || [];
        debugManager.log(`Found ${products.length} total products`);

        if (products.length === 0) {
            debugManager.warn('No products available for ordering');
            alert('No products available. Please add products first.');
            debugManager.log('=== openProductOrderModal END (no products) ===');
            return;
        }

        const productOrderList = document.getElementById('productOrderList');
        if (!productOrderList) {
            debugManager.error('Product order list element not found');
            return;
        }
        productOrderList.innerHTML = '';
        debugManager.log('Cleared product order list');

        const productOrder = configData.productOrder || [];
        debugManager.log(`Current product order:`, productOrder);
        const orderedProducts = [];
        const unorderedProducts = [];
        const tiers = configData.tiers || [];
        debugManager.log(`Found ${tiers.length} tiers for product lookup`);

        productOrder.forEach((productId, idx) => {
            const product = products.find(p => p.id === productId);
            if (product) {
                const tier = tiers.find(t => t.id === product.tierId);
                const tierName = tier ? tier.name : 'Unknown';
                orderedProducts.push({
                    ...product,
                    tierName: tierName
                });
                debugManager.log(`[${idx + 1}/${productOrder.length}] Added ordered product: ${product.productName} (ID: ${productId}, Tier: ${tierName})`);
            } else {
                debugManager.warn(`Product ID ${productId} in order but not found in products list`);
            }
        });

        debugManager.log(`Processing ${products.length} total products for unordered items`);
        products.forEach((product, idx) => {
            if (!productOrder.includes(product.id)) {
                const tier = tiers.find(t => t.id === product.tierId);
                const tierName = tier ? tier.name : 'Unknown';
                unorderedProducts.push({
                    ...product,
                    tierName: tierName
                });
                debugManager.log(`[${idx + 1}/${products.length}] Added unordered product: ${product.productName} (ID: ${product.id}, Tier: ${tierName})`);
            }
        });

        const sortStartTime = performance.now();
        unorderedProducts.sort((a, b) => a.productName.localeCompare(b.productName));
        debugManager.log(`Found ${unorderedProducts.length} unordered products (sorted alphabetically in ${(performance.now() - sortStartTime).toFixed(2)}ms)`);

        const allProducts = [...orderedProducts, ...unorderedProducts];
        debugManager.log(`Total products to display: ${allProducts.length}`, {
            ordered: orderedProducts.length,
            unordered: unorderedProducts.length,
            orderedProducts: orderedProducts.map(p => p.productName),
            unorderedProducts: unorderedProducts.map(p => p.productName)
        });

        requestAnimationFrame(() => {
            const renderStartTime = performance.now();
            debugManager.log(`Starting DOM rendering for ${allProducts.length} products`);

            const fragment = document.createDocumentFragment();

            allProducts.forEach((product, index) => {
                const item = document.createElement('div');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                item.dataset.productId = product.id;
                item.innerHTML = `
                    <div class="flex-grow-1">
                        <strong>${window.escapeHtml(product.productName)}</strong>
                        <small class="text-muted d-block">Tier: ${window.escapeHtml(product.tierName)}</small>
                    </div>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="moveProductUp(${product.id})" ${index === 0 ? 'disabled' : ''} title="Move up">
                            ⬆️
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="moveProductDown(${product.id})" ${index === allProducts.length - 1 ? 'disabled' : ''} title="Move down">
                            ⬇️
                        </button>
                    </div>
                `;
                fragment.appendChild(item);
            });

            productOrderList.appendChild(fragment);
            const renderTime = performance.now() - renderStartTime;
            debugManager.log(`Rendered ${allProducts.length} product items in modal (took ${renderTime.toFixed(2)}ms)`);

            setTimeout(() => {
                const modalElement = document.getElementById('productOrderModal');
                if (!modalElement) {
                    debugManager.error('Product order modal element not found');
                    return;
                }

                let modal = bootstrap.Modal.getInstance(modalElement);
                if (!modal) {
                    debugManager.log('Creating new Bootstrap Modal instance');
                    modal = new bootstrap.Modal(modalElement);
                } else {
                    debugManager.log('Reusing existing Bootstrap Modal instance');
                }

                modalElement.addEventListener('shown.bs.modal', function () {
                    modalElement.setAttribute('aria-hidden', 'false');
                    const totalTime = performance.now() - startTime;
                    debugManager.log(`Modal shown successfully (total time: ${totalTime.toFixed(2)}ms)`);
                }, { once: true });

                modal.show();
                const totalTime = performance.now() - startTime;
                debugManager.log(`=== openProductOrderModal END (total time: ${totalTime.toFixed(2)}ms) ===`);
            }, 0);
        });
    }

    function moveProductUp(productId) {
        debugManager.log(`=== moveProductUp START ===`);
        debugManager.log(`Moving product ID ${productId} up`);
        const items = Array.from(document.querySelectorAll('#productOrderList .list-group-item'));
        const currentIndex = items.findIndex(item => parseInt(item.dataset.productId) === productId);
        debugManager.log(`Current index: ${currentIndex}, Total items: ${items.length}`);

        if (currentIndex > 0) {
            const productOrderList = document.getElementById('productOrderList');
            const item = items[currentIndex];
            const previousItem = items[currentIndex - 1];
            const productName = item.querySelector('strong')?.textContent || 'Unknown';

            productOrderList.insertBefore(item, previousItem);
            debugManager.log(`Moved product "${productName}" from index ${currentIndex} to ${currentIndex - 1}`);

            updateProductOrderButtons();
        } else {
            debugManager.log(`Product ${productId} is already at the top, cannot move up`);
        }
        debugManager.log(`=== moveProductUp END ===`);
    }

    function moveProductDown(productId) {
        debugManager.log(`=== moveProductDown START ===`);
        debugManager.log(`Moving product ID ${productId} down`);
        const items = Array.from(document.querySelectorAll('#productOrderList .list-group-item'));
        const currentIndex = items.findIndex(item => parseInt(item.dataset.productId) === productId);
        debugManager.log(`Current index: ${currentIndex}, Total items: ${items.length}`);

        if (currentIndex < items.length - 1) {
            const productOrderList = document.getElementById('productOrderList');
            const item = items[currentIndex];
            const nextItem = items[currentIndex + 1];
            const productName = item.querySelector('strong')?.textContent || 'Unknown';

            productOrderList.insertBefore(item, nextItem.nextSibling);
            debugManager.log(`Moved product "${productName}" from index ${currentIndex} to ${currentIndex + 1}`);

            updateProductOrderButtons();
        } else {
            debugManager.log(`Product ${productId} is already at the bottom, cannot move down`);
        }
        debugManager.log(`=== moveProductDown END ===`);
    }

    function updateProductOrderButtons() {
        debugManager.log(`=== updateProductOrderButtons START ===`);
        const items = Array.from(document.querySelectorAll('#productOrderList .list-group-item'));
        debugManager.log(`Updating buttons for ${items.length} items`);

        let disabledUpCount = 0;
        let disabledDownCount = 0;

        items.forEach((item, index) => {
            const buttons = item.querySelectorAll('button');
            if (buttons.length >= 2) {
                const wasUpDisabled = buttons[0].disabled;
                const wasDownDisabled = buttons[1].disabled;

                buttons[0].disabled = index === 0;
                buttons[1].disabled = index === items.length - 1;

                if (buttons[0].disabled) disabledUpCount++;
                if (buttons[1].disabled) disabledDownCount++;

                if (wasUpDisabled !== buttons[0].disabled || wasDownDisabled !== buttons[1].disabled) {
                    const productName = item.querySelector('strong')?.textContent || 'Unknown';
                    debugManager.log(`Updated buttons for "${productName}" at index ${index}: Up=${buttons[0].disabled}, Down=${buttons[1].disabled}`);
                }
            }
        });

        debugManager.log(`Button update complete: ${disabledUpCount} up buttons disabled, ${disabledDownCount} down buttons disabled`);
        debugManager.log(`=== updateProductOrderButtons END ===`);
    }

    function saveProductOrder() {
        debugManager.log(`=== saveProductOrder START ===`);
        const items = Array.from(document.querySelectorAll('#productOrderList .list-group-item'));
        debugManager.log(`Found ${items.length} product items to save`);

        const productOrder = items.map(item => parseInt(item.dataset.productId));

        const configData = window.checklistConfigData();
        const productNamesInOrder = items.map(item => {
            const productId = parseInt(item.dataset.productId);
            const product = (configData.products || []).find(p => p.id === productId);
            return product ? product.productName : `Unknown (ID: ${productId})`;
        });
        debugManager.log(`Product order (by name):`, productNamesInOrder);
        debugManager.log(`Product order (by ID):`, productOrder);

        const oldOrder = configData.productOrder || [];
        const updatedConfig = { ...configData };
        updatedConfig.productOrder = productOrder;

        window.setChecklistConfigData(updatedConfig);
        window.saveConfigToLocalStorage();
        debugManager.log(`✅ Saved product order:`, {
            oldOrder: oldOrder,
            newOrder: productOrder,
            changed: JSON.stringify(oldOrder) !== JSON.stringify(productOrder)
        });

        const productOrderModal = bootstrap.Modal.getInstance(document.getElementById('productOrderModal'));
        if (productOrderModal) {
            debugManager.log('Closing product order modal');
            const focusedElement = document.activeElement;
            if (focusedElement && productOrderModal._element.contains(focusedElement)) {
                focusedElement.blur();
            }

            const modalElement = document.getElementById('productOrderModal');
            modalElement.removeAttribute('aria-hidden');
            productOrderModal.hide();

            modalElement.addEventListener('hidden.bs.modal', function cleanup() {
                modalElement.removeEventListener('hidden.bs.modal', cleanup);
                debugManager.log('Product order modal fully closed, proceeding with updates');

                debugManager.log(`Recalculating summaries for ${window.getBusinessTiers().length} tiers`);
                const tiers = window.getBusinessTiers();
                tiers.forEach(tier => {
                    // Only calculate summary if tier has businesses
                    const businesses = document.querySelectorAll(`.business-item[data-tier="${tier.name}"]`);
                    if (businesses.length > 0) {
                        debugManager.log(`Recalculating summary for tier: ${tier.name}`);
                        if (typeof window.calculateTierSummary === 'function') {
                            window.calculateTierSummary(tier.name);
                        }
                    } else {
                        debugManager.log(`Skipping summary recalculation for tier: ${tier.name} (no businesses)`);
                    }
                });

                debugManager.log('Recalculating all business summary');
                if (typeof window.calculateAllBusinessSummary === 'function') {
                    window.calculateAllBusinessSummary();
                }

                debugManager.log(`=== saveProductOrder END ===`);

                setTimeout(() => {
                    alert('Product order saved! Summaries will update automatically.');
                }, 100);
            }, { once: true });
        } else {
            debugManager.warn('Product order modal instance not found, proceeding without closing');

            debugManager.log(`Recalculating summaries for ${window.getBusinessTiers().length} tiers`);
            const tiers = window.getBusinessTiers();
            tiers.forEach(tier => {
                // Only calculate summary if tier has businesses
                const businesses = document.querySelectorAll(`.business-item[data-tier="${tier.name}"]`);
                if (businesses.length > 0) {
                    debugManager.log(`Recalculating summary for tier: ${tier.name}`);
                    if (typeof window.calculateTierSummary === 'function') {
                        window.calculateTierSummary(tier.name);
                    }
                } else {
                    debugManager.log(`Skipping summary recalculation for tier: ${tier.name} (no businesses)`);
                }
            });
            if (typeof window.calculateAllBusinessSummary === 'function') {
                window.calculateAllBusinessSummary();
            }

            debugManager.log(`=== saveProductOrder END ===`);
            alert('Product order saved! Summaries will update automatically.');
        }
    }

    function sortProductsByTier() {
        debugManager.log(`=== sortProductsByTier START ===`);
        const productOrderList = document.getElementById('productOrderList');
        const items = Array.from(document.querySelectorAll('#productOrderList .list-group-item'));
        debugManager.log(`Found ${items.length} product items to sort`);

        if (items.length === 0) {
            debugManager.warn('No products to sort');
            return;
        }

        const tiers = window.getBusinessTiers();
        debugManager.log(`Found ${tiers.length} tiers:`, tiers.map(t => t.name));

        const tierOrderMap = {};
        tiers.forEach((tier, index) => {
            tierOrderMap[tier.name] = index;
            debugManager.log(`Tier "${tier.name}" at index ${index}`);
        });

        const configData = window.checklistConfigData();
        const products = configData.products || [];
        const productsWithData = items.map(item => {
            const productId = parseInt(item.dataset.productId);
            const product = products.find(p => p.id === productId);
            const tier = tiers.find(t => t.id === product?.tierId);
            const tierName = tier ? tier.name : 'Unknown';
            const tierIndex = tierOrderMap[tierName] !== undefined ? tierOrderMap[tierName] : 999;

            return {
                item: item,
                productId: productId,
                productName: product ? product.productName : 'Unknown',
                tierName: tierName,
                tierIndex: tierIndex
            };
        });

        debugManager.log(`Products before sorting:`, productsWithData.map(p => ({
            name: p.productName,
            tier: p.tierName,
            tierIndex: p.tierIndex
        })));

        productsWithData.sort((a, b) => {
            if (a.tierIndex !== b.tierIndex) {
                return a.tierIndex - b.tierIndex;
            }
            return a.productName.localeCompare(b.productName);
        });

        debugManager.log(`Products after sorting:`, productsWithData.map(p => ({
            name: p.productName,
            tier: p.tierName,
            tierIndex: p.tierIndex
        })));

        productOrderList.innerHTML = '';

        const productsByTier = {};
        productsWithData.forEach(p => {
            if (!productsByTier[p.tierName]) {
                productsByTier[p.tierName] = [];
            }
            productsByTier[p.tierName].push(p.productName);
        });
        debugManager.log(`Products grouped by tier:`, productsByTier);

        productsWithData.forEach((productData, index) => {
            const item = productData.item;
            const product = products.find(p => p.id === productData.productId);
            const tier = tiers.find(t => t.id === product?.tierId);
            const tierName = tier ? tier.name : 'Unknown';

            const buttons = item.querySelectorAll('button');
            if (buttons.length >= 2) {
                buttons[0].disabled = index === 0;
                buttons[1].disabled = index === productsWithData.length - 1;
            }

            productOrderList.appendChild(item);
            debugManager.log(`Appended product "${productData.productName}" (Tier: ${tierName}) at index ${index}`);
        });

        debugManager.log(`✅ Sorted ${items.length} products by tier`);
        debugManager.log(`=== sortProductsByTier END ===`);
    }

    function resetProductOrder() {
        debugManager.log(`=== resetProductOrder START ===`);
        const configData = window.checklistConfigData();
        const oldOrder = configData.productOrder || [];
        debugManager.log(`Current product order:`, oldOrder);

        if (!confirm('Reset product order to alphabetical? This will remove your custom ordering.')) {
            debugManager.log('Reset cancelled by user');
            return;
        }

        const updatedConfig = { ...configData };
        updatedConfig.productOrder = [];

        window.setChecklistConfigData(updatedConfig);
        window.saveConfigToLocalStorage();
        debugManager.log('✅ Reset product order to alphabetical', {
            oldOrder: oldOrder,
            newOrder: []
        });

        debugManager.log(`Recalculating summaries for ${window.getBusinessTiers().length} tiers`);
        const tiers = window.getBusinessTiers();
        tiers.forEach(tier => {
            // Only calculate summary if tier has businesses
            const businesses = document.querySelectorAll(`.business-item[data-tier="${tier.name}"]`);
            if (businesses.length > 0) {
                debugManager.log(`Recalculating summary for tier: ${tier.name}`);
                if (typeof window.calculateTierSummary === 'function') {
                    window.calculateTierSummary(tier.name);
                }
            } else {
                debugManager.log(`Skipping summary recalculation for tier: ${tier.name} (no businesses)`);
            }
        });

        debugManager.log('Refreshing product order modal');
        openProductOrderModal();
        debugManager.log(`=== resetProductOrder END ===`);
    }

    // ============================================================================
    // IMPORT/EXPORT FUNCTIONS
    // ============================================================================

    function exportConfiguration() {
        const configData = window.checklistConfigData();
        if (!configData) {
            debugManager.warn('No configuration to export');
            alert('No configuration to export');
            return;
        }

        debugManager.log('Exporting configuration:', {
            tiers: configData.tiers?.length || 0,
            businesses: configData.businesses?.length || 0,
            products: configData.products?.length || 0
        });

        const exportData = JSON.stringify(configData, null, 2);
        document.getElementById('exportTextarea').value = exportData;
        document.getElementById('exportModalLabel').textContent = 'Export Configuration';
        const modal = new bootstrap.Modal(document.getElementById('exportModal'));
        modal.show();
    }

    function openImportModal() {
        document.getElementById('importTextarea').value = '';
        const modal = new bootstrap.Modal(document.getElementById('importModal'));
        modal.show();
    }

    function loadTemplate() {
        debugManager.log('=== loadTemplate START ===');
        debugManager.log('Loading template from window.ChecklistTemplateData');

        const importTextarea = document.getElementById('importTextarea');
        if (importTextarea) {
            importTextarea.value = 'Loading template...';
        }

        const modal = new bootstrap.Modal(document.getElementById('importModal'));
        modal.show();

        if (window.ChecklistTemplateData) {
            debugManager.log('Found window.ChecklistTemplateData');
            try {
                const template = window.ChecklistTemplateData;
                debugManager.log('Template structure:', {
                    tiers: template.tiers?.length || 0,
                    businesses: template.businesses?.length || 0,
                    products: template.products?.length || 0,
                    hasInstructions: !!template._instructions,
                    version: template.version
                });

                const cleanTemplate = { ...template };
                if (cleanTemplate._instructions) {
                    delete cleanTemplate._instructions;
                    debugManager.log('Removed _instructions field from template');
                }

                const formattedTemplate = JSON.stringify(cleanTemplate, null, 2);

                if (importTextarea) {
                    importTextarea.value = formattedTemplate;
                    debugManager.log('Template loaded into import modal');
                } else {
                    debugManager.error('Import textarea not found');
                    throw new Error('Import textarea element not found');
                }

                debugManager.log('=== loadTemplate END (success) ===');
            } catch (error) {
                debugManager.error('Template processing error:', error);
                if (importTextarea) importTextarea.value = '';
                alert(`Failed to process template data.\n\nError: ${error.message}`);
                debugManager.log('=== loadTemplate END (error) ===');
            }
        } else {
            // Fallback to fetch for backward compatibility if needed, 
            // though the script tag should ensure the variable exists.
            debugManager.warn('window.ChecklistTemplateData not found, falling back to fetch');

            fetch('checklist-template.json')
                .then(response => {
                    // ... existing fetch logic ...
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.json();
                })
                .then(template => {
                    // Reuse the processing logic or just copy/paste relevant parts if needed.
                    // For now, let's keep it simple and just alert if the fallback also fails or isn't fully implemented here
                    // because the primary fix is the JS file.
                    // Actually, let's fully implement a simple fallback just in case.

                    const cleanTemplate = { ...template };
                    if (cleanTemplate._instructions) delete cleanTemplate._instructions;
                    const formattedTemplate = JSON.stringify(cleanTemplate, null, 2);
                    if (importTextarea) importTextarea.value = formattedTemplate;
                })
                .catch(error => {
                    debugManager.error('Template loading error:', error);
                    if (importTextarea) importTextarea.value = '';
                    alert('Failed to load template. Please ensure checklist-template-data.js is loaded or checklist-template.json is accessible.');
                });
        }
    }

    function importConfiguration() {
        debugManager.log('Starting configuration import');
        const importText = document.getElementById('importTextarea').value.trim();
        if (!importText) {
            debugManager.warn('Import cancelled: No text provided');
            alert('Please paste a configuration JSON string');
            return;
        }

        if (importText.startsWith('Business Code') || importText.includes(',') && !importText.trim().startsWith('{') && !importText.trim().startsWith('[')) {
            debugManager.warn('Import failed: CSV detected instead of JSON');
            alert('Error: This looks like a CSV (Person Table String), not JSON.\n\nPlease use "Export Configuration" to get the JSON format, or paste a valid JSON configuration.');
            return;
        }

        try {
            const imported = JSON.parse(importText);
            debugManager.log('Parsed import data:', {
                tiers: imported.tiers?.length || 0,
                businesses: imported.businesses?.length || 0,
                products: imported.products?.length || 0
            });

            if (!imported.tiers || !Array.isArray(imported.tiers)) {
                throw new Error('Invalid structure: tiers array is required');
            }
            if (!imported.businesses || !Array.isArray(imported.businesses)) {
                throw new Error('Invalid structure: businesses array is required');
            }

            imported.tiers.forEach((tier, index) => {
                if (!tier.id || !tier.name) {
                    throw new Error(`Invalid tier at index ${index}: id and name are required`);
                }
            });

            imported.businesses.forEach((biz, index) => {
                if (!biz.businessCode || !biz.businessName || biz.tierId === undefined) {
                    throw new Error(`Invalid business at index ${index}: businessCode, businessName, and tierId are required`);
                }
            });

            if (imported.products && Array.isArray(imported.products)) {
                debugManager.log(`Validating ${imported.products.length} products`);
                imported.products.forEach((prod, index) => {
                    if (!prod.id || !prod.tierId || !prod.productName) {
                        throw new Error(`Invalid product at index ${index}: id, tierId, and productName are required`);
                    }
                });
                debugManager.log(`✅ Validated ${imported.products.length} products`);
            } else if (!imported.products) {
                debugManager.log('No products array found, initializing empty array');
                imported.products = [];
            }

            if (!imported.productOrder || !Array.isArray(imported.productOrder)) {
                debugManager.log('No productOrder array found, initializing empty array');
                imported.productOrder = [];
            }

            window.setChecklistConfigData(imported);
            window.saveConfigToLocalStorage();
            debugManager.log(`✅ Imported configuration:`, {
                tiers: imported.tiers.length,
                businesses: imported.businesses.length,
                products: imported.products.length
            });

            const importModal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
            if (importModal) {
                const focusedElement = document.activeElement;
                if (focusedElement && importModal._element.contains(focusedElement)) {
                    focusedElement.blur();
                }
                importModal.hide();
            }
            alert('Configuration imported successfully!');
            requestAnimationFrame(() => {
                if (typeof window.loadAllBusinesses === 'function') {
                    window.loadAllBusinesses();
                }
            });
        } catch (error) {
            if (error instanceof SyntaxError) {
                alert(`Import failed: Invalid JSON format.\n\nError: ${error.message}\n\nMake sure you are importing a JSON configuration, not a CSV (Person Table String).`);
            } else {
                alert(`Import failed: ${error.message}`);
            }
            debugManager.error('Import error:', error);
        }
    }

    function generatePersonTableString() {
        const configData = window.checklistConfigData();
        if (!configData || !configData.businesses) {
            alert('No businesses available');
            return;
        }

        let csv = 'Business Code,Business Name,Tier,Status,Max Stock,Collection Storage,Can Collect Items,Product,Notes\n';

        configData.businesses.forEach(biz => {
            const tier = (configData.tiers || []).find(t => t.id === biz.tierId);
            const tierName = tier ? tier.name : 'Unknown';
            const product = biz.productId ? (configData.products || []).find(p => p.id === biz.productId) : null;
            const productName = product ? product.productName : '';

            const escapeCSV = (value) => {
                if (value === null || value === undefined) return '';
                const str = String(value);
                if (str.includes('"') || str.includes(',') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            csv += `${escapeCSV(biz.businessCode)},${escapeCSV(biz.businessName)},${escapeCSV(tierName)},${escapeCSV(biz.status || 'Open')},${biz.maxStock || 0},${biz.collectionStorage || 0},${escapeCSV(biz.canCollectItems ? 'Yes' : 'No')},${escapeCSV(productName)},${escapeCSV(biz.notes || '')}\n`;
        });

        document.getElementById('exportTextarea').value = csv;
        document.getElementById('exportModalLabel').textContent = 'Generate Checklist (CSV)';
        const modal = new bootstrap.Modal(document.getElementById('exportModal'));
        modal.show();
    }

    function copyToClipboard(elementId) {
        const textarea = document.getElementById(elementId);
        textarea.select();
        document.execCommand('copy');
        alert('Copied to clipboard!');
    }

    // ============================================================================
    // EMOJI PICKER FUNCTIONS
    // ============================================================================

    function toggleEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        if (picker.style.display === 'none') {
            picker.style.display = 'block';
            initializeEmojiSearch();
        } else {
            picker.style.display = 'none';
            const searchInput = document.getElementById('emojiSearchInput');
            if (searchInput) {
                searchInput.value = '';
                filterEmojis();
            }
        }
    }

    function initializeEmojiSearch() {
        const emojiButtons = document.querySelectorAll('.emoji-btn');
        emojiButtons.forEach(btn => {
            if (!btn.hasAttribute('data-search')) {
                const title = btn.getAttribute('title') || '';
                const emoji = btn.textContent.trim();
                const searchText = title.toLowerCase() + ' ' + emoji;
                btn.setAttribute('data-search', searchText);
            }
        });
    }

    function filterEmojis() {
        const searchInput = document.getElementById('emojiSearchInput');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        const emojiButtons = document.querySelectorAll('.emoji-btn');
        const categories = document.querySelectorAll('.emoji-category');
        const emojiGrids = document.querySelectorAll('.emoji-grid');

        if (searchTerm === '') {
            emojiButtons.forEach(btn => btn.classList.remove('hidden'));
            categories.forEach(cat => cat.classList.remove('hidden'));
            emojiGrids.forEach(grid => grid.classList.remove('hidden'));
            return;
        }

        let visibleCount = 0;
        emojiButtons.forEach(btn => {
            const searchText = btn.getAttribute('data-search') || btn.getAttribute('title') || '';
            if (searchText.toLowerCase().includes(searchTerm)) {
                btn.classList.remove('hidden');
                visibleCount++;
            } else {
                btn.classList.add('hidden');
            }
        });

        categories.forEach(category => {
            const categoryName = category.getAttribute('data-category');
            const categoryGrid = document.querySelector(`.emoji-grid[data-category="${categoryName}"]`);
            if (categoryGrid) {
                const hasVisibleEmojis = Array.from(categoryGrid.querySelectorAll('.emoji-btn')).some(
                    btn => !btn.classList.contains('hidden')
                );
                if (hasVisibleEmojis) {
                    category.classList.remove('hidden');
                    categoryGrid.classList.remove('hidden');
                } else {
                    category.classList.add('hidden');
                    categoryGrid.classList.add('hidden');
                }
            }
        });
    }

    function selectEmoji(emoji) {
        document.getElementById('tierIcon').value = emoji;
    }

    // ============================================================================
    // EXPORT FUNCTIONS TO GLOBAL SCOPE
    // ============================================================================

    window.openAddTierModal = openAddTierModal;
    window.openEditTierModal = openEditTierModal;
    window.saveTier = saveTier;
    window.deleteTier = deleteTier;
    window.openAddBusinessModal = openAddBusinessModal;
    window.openEditBusinessModal = openEditBusinessModal;
    window.saveBusiness = saveBusiness;
    window.deleteBusiness = deleteBusiness;
    window.openAddProductModal = openAddProductModal;
    window.openEditProductModal = openEditProductModal;
    window.saveProduct = saveProduct;
    window.deleteProduct = deleteProduct;
    window.getProductsForTier = getProductsForTier;
    window.populateProductSelectorsForTier = populateProductSelectorsForTier;
    window.handleProductSelection = handleProductSelection;
    window.openProductOrderModal = openProductOrderModal;
    window.moveProductUp = moveProductUp;
    window.moveProductDown = moveProductDown;
    window.updateProductOrderButtons = updateProductOrderButtons;
    window.saveProductOrder = saveProductOrder;
    window.sortProductsByTier = sortProductsByTier;
    window.resetProductOrder = resetProductOrder;
    window.exportConfiguration = exportConfiguration;
    window.openImportModal = openImportModal;
    window.loadTemplate = loadTemplate;
    window.importConfiguration = importConfiguration;
    window.generatePersonTableString = generatePersonTableString;
    window.copyToClipboard = copyToClipboard;
    window.toggleEmojiPicker = toggleEmojiPicker;
    window.initializeEmojiSearch = initializeEmojiSearch;
    window.filterEmojis = filterEmojis;
    window.selectEmoji = selectEmoji;

})();

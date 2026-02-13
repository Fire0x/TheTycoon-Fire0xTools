/**
 * Mining Config UI - Handles Configuration Panel and Import/Export Modals
 */
(function () {
    'use strict';

    // Export mining configuration to JSON
    window.exportMiningConfiguration = function () {
        if (!window.getMaterials || !window.getRecipes) {
            console.error('Mining data not loaded');
            return;
        }

        const data = {
            materials: window.getMaterials(),
            recipes: window.getRecipes(),
            config: window.MiningConfig ? {
                enabledCalculations: window.MiningConfig.enabledCalculations,
                materialsSortBy: window.MiningConfig.materialsSortBy,
                materialsTypeOrder: window.MiningConfig.materialsTypeOrder
            } : {}
        };

        const json = JSON.stringify(data, null, 2);

        // Show in Export Modal
        const textarea = document.getElementById('exportTextarea');
        if (textarea) {
            textarea.value = json;
        }

        const modal = new bootstrap.Modal(document.getElementById('exportModal'));
        modal.show();
    };

    // Open Import Modal
    window.openImportMiningModal = function () {
        const textarea = document.getElementById('importTextarea');
        if (textarea) {
            textarea.value = '';
        }
        const modal = new bootstrap.Modal(document.getElementById('importModal'));
        modal.show();
    };

    // Import Mining Configuration
    window.importMiningConfiguration = async function () {
        const textarea = document.getElementById('importTextarea');
        if (!textarea) return;

        try {
            const json = textarea.value.trim();
            if (!json) {
                alert('Please paste valid JSON configuration.');
                return;
            }

            const data = JSON.parse(json);

            if (confirm('Warning: This will REPLACE all current materials, recipes, and settings. Continue?')) {

                // Import Materials
                if (Array.isArray(data.materials)) {
                    window.setMaterials(data.materials);
                }

                // Import Recipes
                if (Array.isArray(data.recipes)) {
                    window.setRecipes(data.recipes);
                }

                // Import Config
                if (data.config && window.MiningConfig) {
                    if (data.config.enabledCalculations) window.MiningConfig.enabledCalculations = data.config.enabledCalculations;
                    if (data.config.materialsSortBy) window.MiningConfig.materialsSortBy = data.config.materialsSortBy;
                    if (data.config.materialsTypeOrder) window.MiningConfig.materialsTypeOrder = data.config.materialsTypeOrder;
                    window.MiningConfig.save();
                }

                // Close modal and reload
                const modalEl = document.getElementById('importModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();

                // Refresh UI
                if (window.renderMaterials) window.renderMaterials();
                if (window.renderRecipes) window.renderRecipes();
                if (window.renderProfitAnalysis) window.renderProfitAnalysis();

                alert('Configuration inherited successfully!');
            }
        } catch (e) {
            console.error('Import error:', e);
            alert('Error importing configuration: ' + e.message);
        }
    };

    // Copy to clipboard helper
    window.copyToClipboard = function (elementId) {
        const copyText = document.getElementById(elementId);
        if (!copyText) return;

        copyText.select();
        copyText.setSelectionRange(0, 99999); /* For mobile devices */

        try {
            document.execCommand("copy");
            alert("Copied to clipboard!");
        } catch (err) {
            console.error('Failed to copy', err);
            alert("Failed to copy to clipboard");
        }
    };

    // Legacy support for "Parse & Save" from old Import card (if we keep it or adapt it)
    // The previous logic for parsing raw TIER/xQty text is in mining-parser.js.
    // We should expose a way to use that from the Config Panel or a specific modal.
    // For now, the implementation plan says "Import Mining Data" card -> Import Modal.
    // But there are TWO types of import: 1. Full Config (JSON), 2. Paste Data (Text).
    // The user's original "Import Mining Data" was "Paste data in format...".
    // I should probably keep the "Import Paste" functionality but maybe inside the Config Panel or as a separate "Tools" modal.
    // I will add a "Parse Mining Data" modal distinct from "Import Config".

    window.openParseDataModal = function () {
        const textarea = document.getElementById('miningPasteInput');
        if (textarea) textarea.value = '';
        const modal = new bootstrap.Modal(document.getElementById('parseDataModal'));
        modal.show();
    };

    window.runParseAndSave = function () {
        // This function calls the existing logic from mining-ui.js / mining-parser.js
        // We'll assume those functions are available or we move them here.
        // mining-parser.js has `parseMiningData`. mining-ui.js likely had the click handler.

        const input = document.getElementById('miningPasteInput').value;
        if (!input.trim()) {
            alert('Please paste data first.');
            return;
        }

        if (window.parseMiningPaste) {
            const results = window.parseMiningPaste(input);
            if (results && results.length > 0) {
                // Save logic is usually in the UI handler, likely:
                // For each result, addMaterial or update.
                let added = 0;
                let updated = 0;
                const materials = window.getMaterials();

                results.forEach(m => {
                    // Check if exists
                    const existing = materials.find(ex => ex.name === m.name && ex.type === m.type && ex.tier === m.tier);
                    if (existing) {
                        // Update price/weight if changed?
                        // mining-ui.js logic was: if exists, update; else add.
                        // Let's rely on window.updateMaterial / window.addMaterial
                        // But wait, the parser returns objects.

                        // We need the update logic.
                        // Implemented inline for now to ensure it works in the modal context.

                        // normalize
                        m.id = existing.id; // preserve ID
                        window.updateMaterial(existing.id, m);
                        updated++;
                    } else {
                        window.addMaterial(m);
                        added++;
                    }
                });

                // Refresh
                if (window.renderMaterials) window.renderMaterials();
                if (window.renderRecipes) window.renderRecipes(); // Names might change?

                alert(`Processed data: ${added} added, ${updated} updated.`);

                const modalEl = document.getElementById('parseDataModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            } else {
                alert('No valid data found. Check format.');
            }
        } else {
            alert('Parser not loaded.');
        }
    };

    window.loadTemplate = function () {
        if (!confirm('This will load the template configuration into the Import box. You will still need to click "Import" to apply it.\n\nCurrent unsaved data in the Import box will be lost. Continue?')) {
            return;
        }

        // Use embedded data to avoid CORS issues with file:// protocol
        if (window.MiningTemplateData) {
            const textarea = document.getElementById('importTextarea');
            if (textarea) {
                // Pretty-print the JSON
                textarea.value = JSON.stringify(window.MiningTemplateData, null, 2);
                const modal = new bootstrap.Modal(document.getElementById('importModal'));
                modal.show();
                alert('Template loaded! Click "Import" to apply.');
            }
        } else {
            console.error('MiningTemplateData not found');
            alert('Failed to load template data. Script might be missing.');
        }
    };

})();

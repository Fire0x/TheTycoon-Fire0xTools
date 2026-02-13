/**
 * Mining materials UI – render materials table, add/edit/remove, Parse & Save
 * Columns: Type | Tier | Name | Weight | Value | Actions. Ore/Ingot/Sheet: Tier then alphabetical by name. Customisable sort and type order.
 */
(function () {
    function fmtNum(n) {
        if (window.NumberFormatter && window.NumberFormatter.formatNumberDisplay) {
            return window.NumberFormatter.formatNumberDisplay(n);
        }
        return n == null ? '' : Number(n);
    }

    function parseNum(val) {
        if (window.NumberFormatter && window.NumberFormatter.parseFormattedNumber) {
            return window.NumberFormatter.parseFormattedNumber(val);
        }
        const n = parseFloat(String(val).replace(/,/g, ''));
        return isNaN(n) ? 0 : n;
    }

    function sortMaterials(list, sortBy) {
        if (!list || !list.length) return list;
        var key = sortBy || (window.MiningConfig && window.MiningConfig.materialsSortBy) || 'tierName';
        return list.slice().sort(function (a, b) {
            var tierA = parseInt(a.tier, 10) || 0;
            var tierB = parseInt(b.tier, 10) || 0;
            var nameA = (a.name || '').toLowerCase();
            var nameB = (b.name || '').toLowerCase();
            if (key === 'tierName') {
                if (tierA !== tierB) return tierA - tierB;
                return nameA.localeCompare(nameB);
            }
            if (key === 'nameTier') {
                var nc = nameA.localeCompare(nameB);
                if (nc !== 0) return nc;
                return tierA - tierB;
            }
            if (key === 'nameOnly') return nameA.localeCompare(nameB);
            if (key === 'tierOnly') {
                if (tierA !== tierB) return tierA - tierB;
                return nameA.localeCompare(nameB);
            }
            return (tierA - tierB) || nameA.localeCompare(nameB);
        });
    }

    function getTypeOrder() {
        var order = window.MiningConfig && window.MiningConfig.materialsTypeOrder;
        if (Array.isArray(order) && order.length) return order;
        return ['ore', 'ingot', 'sheet'];
    }

    window.renderMaterials = function () {
        const container = document.getElementById('materialsContainer');
        const emptyEl = document.getElementById('materialsEmptyState');
        if (!container) return;
        let materials = window.getMaterials ? window.getMaterials() : [];

        // Apply advanced filters
        if (window.getMaterialFilters) {
            const f = window.getMaterialFilters();
            if (f) {
                if (f.name) {
                    const term = f.name.toLowerCase();
                    materials = materials.filter(m => (m.name || '').toLowerCase().includes(term));
                }
                if (f.type && f.type.length > 0) {
                    materials = materials.filter(m => f.type.includes((m.type || '').toLowerCase()));
                }

                const hasTierFilter = (f.tier && f.tier.length > 0);
                // Check if '5' was selected which implies 5+
                const showTier5Plus = f.tier && f.tier.includes(5);

                if (hasTierFilter) {
                    materials = materials.filter(m => {
                        const t = parseInt(m.tier, 10) || 0;
                        if (showTier5Plus && t >= 5) return true;
                        if (f.tier.includes(t)) return true;
                        return false;
                    });
                }
            }
        }
        if (materials.length === 0) {
            container.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            var customEl = document.getElementById('materialsCustomiseContainer');
            if (customEl) customEl.style.display = 'none';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';
        var customEl = document.getElementById('materialsCustomiseContainer');
        if (customEl) customEl.style.display = 'block';

        const byType = { ore: [], ingot: [], sheet: [] };
        materials.forEach(function (m) {
            var t = (m.type || 'ore').toLowerCase();
            if (t !== 'ore' && t !== 'ingot' && t !== 'sheet') t = 'ore';
            if (byType[t]) byType[t].push(m);
        });

        var sortBy = window.MiningConfig && window.MiningConfig.materialsSortBy || 'tierName';
        var typeOrder = getTypeOrder();

        var html = '<div class="mb-2" id="materialsCustomiseContainer"><label class="form-label small mb-1">Customise table</label><div class="d-flex flex-wrap align-items-center gap-2">';
        html += '<label class="small">Sort:</label><select id="materialsSortBySelect" class="form-select form-select-sm" style="width:auto">';
        html += '<option value="tierName"' + (sortBy === 'tierName' ? ' selected' : '') + '>Tier, then Name (A–Z)</option>';
        html += '<option value="nameTier"' + (sortBy === 'nameTier' ? ' selected' : '') + '>Name (A–Z), then Tier</option>';
        html += '<option value="tierNameGrouped"' + (sortBy === 'tierNameGrouped' ? ' selected' : '') + '>Tier, Name Grouped (Ore→Ingot→Sheet)</option>';
        html += '<option value="nameGrouped"' + (sortBy === 'nameGrouped' ? ' selected' : '') + '>Name Grouped (Ore→Ingot→Sheet)</option>';
        html += '<option value="nameOnly"' + (sortBy === 'nameOnly' ? ' selected' : '') + '>Name only (A–Z)</option>';
        html += '<option value="tierOnly"' + (sortBy === 'tierOnly' ? ' selected' : '') + '>Tier only</option>';
        html += '</select>';
        html += '<label class="small ms-2">Section order:</label><select id="materialsTypeOrderSelect" class="form-select form-select-sm" style="width:auto">';
        html += '<option value="ore,ingot,sheet"' + (typeOrder.join(',') === 'ore,ingot,sheet' ? ' selected' : '') + '>Ore → Ingot → Sheet</option>';
        html += '<option value="sheet,ingot,ore"' + (typeOrder.join(',') === 'sheet,ingot,ore' ? ' selected' : '') + '>Sheet → Ingot → Ore</option>';
        html += '<option value="ingot,ore,sheet"' + (typeOrder.join(',') === 'ingot,ore,sheet' ? ' selected' : '') + '>Ingot → Ore → Sheet</option>';
        html += '</select></div></div>';
        html += '<div class="table-responsive"><table class="table table-striped table-hover mining-table"><thead><tr><th>Type</th><th>Tier</th><th>Name</th><th>Weight/unit (kg)</th><th>Value/unit ($)</th><th>Actions</th></tr></thead><tbody>';

        if (sortBy === 'tierNameGrouped') {
            // Group by tier first, then by name, then show Ore > Ingot > Sheet for each name
            var byTier = {};
            materials.forEach(function (m) {
                var tier = parseInt(m.tier, 10) || 0;
                if (!byTier[tier]) {
                    byTier[tier] = {};
                }
                var name = (m.name || '').toLowerCase();
                if (!byTier[tier][name]) {
                    byTier[tier][name] = { name: m.name, materials: [] };
                }
                byTier[tier][name].materials.push(m);
            });

            // Sort tiers
            var sortedTiers = Object.keys(byTier).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); });

            sortedTiers.forEach(function (tierKey, tierIndex) {
                var tierGroup = byTier[tierKey];
                var tierNum = parseInt(tierKey, 10);

                // Sort names within this tier
                var sortedNames = Object.keys(tierGroup).sort();

                sortedNames.forEach(function (nameKey, nameIndex) {
                    var nameGroup = tierGroup[nameKey];
                    var nameMaterials = nameGroup.materials;

                    // Sort by type order (Ore > Ingot > Sheet)
                    nameMaterials.sort(function (a, b) {
                        var typeOrderMap = { ore: 0, ingot: 1, sheet: 2 };
                        var typeA = typeOrderMap[(a.type || 'ore').toLowerCase()] || 0;
                        var typeB = typeOrderMap[(b.type || 'ore').toLowerCase()] || 0;
                        return typeA - typeB;
                    });

                    // Render materials for this name group
                    nameMaterials.forEach(function (m, matIndex) {
                        var type = (m.type || 'ore').toLowerCase();
                        var isFirstInTier = tierIndex === 0 && nameIndex === 0 && matIndex === 0;
                        var isFirstInNameGroup = matIndex === 0;
                        var tierGroupClass = isFirstInTier ? '' : (isFirstInNameGroup && (tierIndex > 0 || nameIndex > 0) ? ' tier-group-start' : '');
                        var nameGroupClass = isFirstInNameGroup && nameIndex > 0 ? ' name-group-start' : '';
                        html += '<tr data-material-id="' + m.id + '" data-material-tier="' + tierNum + '" data-material-name="' + (m.name || '').toLowerCase() + '" class="tier-name-grouped-row' + tierGroupClass + nameGroupClass + '">';
                        html += '<td><span class="material-type-badge badge-' + type + '">' + (type.toUpperCase()) + '</span></td>';
                        html += '<td><span class="tier-badge">TIER ' + (m.tier != null ? m.tier : '') + '</span></td>';
                        html += '<td class="material-name-cell">' + (m.name || '') + '</td>';
                        html += '<td><input type="text" class="form-control form-control-sm material-weight" data-id="' + m.id + '" value="' + (m.weightPerUnit != null && m.weightPerUnit !== 0 ? m.weightPerUnit : '') + '" style="width:6em" /></td>';
                        html += '<td><input type="text" class="form-control form-control-sm material-value" data-id="' + m.id + '" value="' + (m.valuePerUnit != null && m.valuePerUnit !== 0 ? m.valuePerUnit : '') + '" style="width:6em" /></td>';
                        html += '<td>';
                        if (type === 'ore') {
                            const existingIngot = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName('ingot', m.name);
                            const existingSheet = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName('sheet', m.name);
                            if (!existingIngot || !existingSheet) {
                                var buttonText = '⚡ ';
                                var missing = [];
                                if (!existingIngot) missing.push('Ingot');
                                if (!existingSheet) missing.push('Sheet');
                                buttonText += missing.join('+');
                                html += '<button type="button" class="btn btn-sm btn-primary btn-create-variants me-1" data-id="' + m.id + '" data-name="' + (m.name || '') + '" data-tier="' + (m.tier != null ? m.tier : '') + '" title="Create ' + missing.join(' & ') + ' versions">' + buttonText + '</button>';
                            }
                        }
                        html += '<button type="button" class="btn btn-sm btn-danger btn-remove-material" data-id="' + m.id + '">Remove</button>';
                        html += '</td>';
                        html += '</tr>';
                    });
                });
            });
        } else if (sortBy === 'nameGrouped') {
            // Group by name, then show Ore > Ingot > Sheet for each name
            var byName = {};
            materials.forEach(function (m) {
                var name = (m.name || '').toLowerCase();
                if (!byName[name]) {
                    byName[name] = { name: m.name, materials: [] };
                }
                byName[name].materials.push(m);
            });

            // Sort names alphabetically
            var sortedNames = Object.keys(byName).sort();

            sortedNames.forEach(function (nameKey, nameIndex) {
                var nameGroup = byName[nameKey];
                var nameMaterials = nameGroup.materials;

                // Sort by tier first, then by type order (Ore > Ingot > Sheet)
                nameMaterials.sort(function (a, b) {
                    var tierA = parseInt(a.tier, 10) || 0;
                    var tierB = parseInt(b.tier, 10) || 0;
                    if (tierA !== tierB) return tierA - tierB;

                    var typeOrderMap = { ore: 0, ingot: 1, sheet: 2 };
                    var typeA = typeOrderMap[(a.type || 'ore').toLowerCase()] || 0;
                    var typeB = typeOrderMap[(b.type || 'ore').toLowerCase()] || 0;
                    return typeA - typeB;
                });

                // Render materials for this name group
                nameMaterials.forEach(function (m, matIndex) {
                    var type = (m.type || 'ore').toLowerCase();
                    var isFirstInGroup = matIndex === 0;
                    var nameGroupClass = isFirstInGroup && nameIndex > 0 ? ' name-group-start' : '';
                    html += '<tr data-material-id="' + m.id + '" data-material-name="' + (m.name || '').toLowerCase() + '" class="name-grouped-row' + nameGroupClass + '">';
                    html += '<td><span class="material-type-badge badge-' + type + '">' + (type.toUpperCase()) + '</span></td>';
                    html += '<td><span class="tier-badge">TIER ' + (m.tier != null ? m.tier : '') + '</span></td>';
                    html += '<td class="material-name-cell">' + (m.name || '') + '</td>';
                    html += '<td><input type="text" class="form-control form-control-sm material-weight" data-id="' + m.id + '" value="' + (m.weightPerUnit != null && m.weightPerUnit !== 0 ? m.weightPerUnit : '') + '" style="width:6em" /></td>';
                    html += '<td><input type="text" class="form-control form-control-sm material-value" data-id="' + m.id + '" value="' + (m.valuePerUnit != null && m.valuePerUnit !== 0 ? m.valuePerUnit : '') + '" style="width:6em" /></td>';
                    html += '<td>';
                    if (type === 'ore') {
                        const existingIngot = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName('ingot', m.name);
                        const existingSheet = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName('sheet', m.name);
                        if (!existingIngot || !existingSheet) {
                            var buttonText = '⚡ ';
                            var missing = [];
                            if (!existingIngot) missing.push('Ingot');
                            if (!existingSheet) missing.push('Sheet');
                            buttonText += missing.join('+');
                            html += '<button type="button" class="btn btn-sm btn-primary btn-create-variants me-1" data-id="' + m.id + '" data-name="' + (m.name || '') + '" data-tier="' + (m.tier != null ? m.tier : '') + '" title="Create ' + missing.join(' & ') + ' versions">' + buttonText + '</button>';
                        }
                    }
                    html += '<button type="button" class="btn btn-sm btn-danger btn-remove-material" data-id="' + m.id + '">Remove</button>';
                    html += '</td>';
                    html += '</tr>';
                });
            });
        } else {
            // Original rendering by type
            typeOrder.forEach(function (type) {
                var list = byType[type] || [];
                list = sortMaterials(list, sortBy);
                list.forEach(function (m) {
                    html += '<tr data-material-id="' + m.id + '">';
                    html += '<td><span class="material-type-badge badge-' + type.toLowerCase() + '">' + (type.toUpperCase()) + '</span></td>';
                    html += '<td><span class="tier-badge">TIER ' + (m.tier != null ? m.tier : '') + '</span></td>';
                    html += '<td class="material-name-cell">' + (m.name || '') + '</td>';
                    html += '<td><input type="text" class="form-control form-control-sm material-weight" data-id="' + m.id + '" value="' + (m.weightPerUnit != null && m.weightPerUnit !== 0 ? m.weightPerUnit : '') + '" style="width:6em" /></td>';
                    html += '<td><input type="text" class="form-control form-control-sm material-value" data-id="' + m.id + '" value="' + (m.valuePerUnit != null && m.valuePerUnit !== 0 ? m.valuePerUnit : '') + '" style="width:6em" /></td>';
                    html += '<td>';
                    if (type.toLowerCase() === 'ore') {
                        const existingIngot = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName('ingot', m.name);
                        const existingSheet = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName('sheet', m.name);
                        if (!existingIngot || !existingSheet) {
                            var buttonText = '⚡ ';
                            var missing = [];
                            if (!existingIngot) missing.push('Ingot');
                            if (!existingSheet) missing.push('Sheet');
                            buttonText += missing.join('+');
                            html += '<button type="button" class="btn btn-sm btn-primary btn-create-variants me-1" data-id="' + m.id + '" data-name="' + (m.name || '') + '" data-tier="' + (m.tier != null ? m.tier : '') + '" title="Create ' + missing.join(' & ') + ' versions">' + buttonText + '</button>';
                        }
                    }
                    html += '<button type="button" class="btn btn-sm btn-danger btn-remove-material" data-id="' + m.id + '">Remove</button>';
                    html += '</td>';
                    html += '</tr>';
                });
            });
        }

        html += '</tbody></table></div>';
        container.innerHTML = html;

        var sortSelect = document.getElementById('materialsSortBySelect');
        var typeOrderSelect = document.getElementById('materialsTypeOrderSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                var val = this.value;
                if (window.MiningConfig) {
                    window.MiningConfig.materialsSortBy = val;
                    window.MiningConfig.save();
                    window.renderMaterials();
                }
            });
        }
        if (typeOrderSelect) {
            typeOrderSelect.addEventListener('change', function () {
                var val = this.value;
                var order = val ? val.split(',') : ['ore', 'ingot', 'sheet'];
                if (window.MiningConfig) {
                    window.MiningConfig.materialsTypeOrder = order;
                    window.MiningConfig.save();
                    window.renderMaterials();
                }
            });
        }

        container.querySelectorAll('.material-weight, .material-value').forEach(input => {
            input.addEventListener('change', function () {
                const id = this.dataset.id;
                const isWeight = this.classList.contains('material-weight');
                const num = parseNum(this.value);
                const mat = window.getMaterialById && window.getMaterialById(id);
                if (!mat) return;
                const payload = isWeight ? { weightPerUnit: num } : { valuePerUnit: num };
                window.updateMaterial(id, payload);
                if (window.MiningAPI && typeof window.MiningAPI.updateMaterial === 'function') {
                    window.MiningAPI.updateMaterial(id, payload).then(function (res) {
                        if (res.ok && res.data && window.loadMiningData) window.loadMiningData();
                    });
                }
            });
        });

        container.querySelectorAll('.btn-create-variants').forEach(btn => {
            btn.addEventListener('click', function () {
                const name = this.dataset.name;
                const tier = parseInt(this.dataset.tier, 10) || 1;
                window.createIngotAndSheetFromOre(name, tier);
            });
        });

        container.querySelectorAll('.btn-remove-material').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.dataset.id;
                if (!confirm('Remove this material?')) return;
                window.removeMaterial(id);
                if (window.MiningAPI && typeof window.MiningAPI.deleteMaterial === 'function') {
                    window.MiningAPI.deleteMaterial(id).then(function (res) {
                        if (res.ok && window.loadMiningData) window.loadMiningData().then(function () { window.renderMaterials(); window.renderProfitAnalysis && window.renderProfitAnalysis(); });
                    });
                }
                window.renderMaterials();
                if (window.renderProfitAnalysis) window.renderProfitAnalysis();
            });
        });
    };

    window.parseAndSaveMining = async function () {
        const ta = document.getElementById('miningPasteInput');
        const text = ta && ta.value;
        if (!text || !window.parseMiningPaste) return;
        const items = window.parseMiningPaste(text);
        if (items.length === 0) {
            if (window.ToastManager) {
                window.ToastManager.show('Parse Failed', 'No valid blocks parsed. Check format.', 'warning');
            } else {
                alert('No valid blocks parsed. Use format: TIER N, xQty, Ore/Ingot/Sheet Name, X.X kg, $price');
            }
            return;
        }

        let addedCount = 0;
        let updatedCount = 0;

        for (const item of items) {
            const existing = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName(item.type, item.name);
            const payload = {
                type: item.type,
                name: item.name,
                tier: item.tier,
                weightPerUnit: item.weightPerUnit,
                valuePerUnit: item.valuePerUnit
            };
            if (existing && window.MiningAPI && window.MiningAPI.updateMaterial) {
                const res = await window.MiningAPI.updateMaterial(existing.id, payload);
                if (res.ok && res.data) window.updateMaterial(existing.id, payload);
                else window.updateMaterial(existing.id, payload);
                updatedCount++;
            } else if (window.MiningAPI && window.MiningAPI.createMaterial) {
                const res = await window.MiningAPI.createMaterial(payload);
                if (res.ok && res.data) {
                    window.addMaterial({ ...payload, id: res.data.id });
                } else {
                    window.addMaterial(payload);
                }
                addedCount++;
            } else {
                window.addMaterial(payload);
                addedCount++;
            }
        }
        await window.loadMiningData();
        window.renderMaterials();
        if (window.renderProfitAnalysis) window.renderProfitAnalysis();
        if (ta) ta.value = '';

        if (window.ToastManager) {
            window.ToastManager.show('Mining Data Parsed', `Added: ${addedCount} item(s)<br>Updated: ${updatedCount} item(s)`, 'success');
        }
    };

    function collectMaterialFromModal() {
        var typeEl = document.getElementById('materialTypeInput');
        var nameEl = document.getElementById('materialNameInput');
        var tierEl = document.getElementById('materialTierInput');
        var weightEl = document.getElementById('materialWeightInput');
        var valueEl = document.getElementById('materialValueInput');

        var type = typeEl ? typeEl.value.trim().toLowerCase() : '';
        if (type !== 'ore' && type !== 'ingot' && type !== 'sheet') type = 'ore';

        var name = nameEl ? nameEl.value.trim() : '';
        var tier = tierEl ? parseInt(tierEl.value, 10) || 1 : 1;
        var weight = weightEl ? parseFloat(weightEl.value) || 0 : 0;
        var value = valueEl ? parseFloat(valueEl.value) || 0 : 0;

        return { type: type, name: name, tier: tier, weightPerUnit: weight, valuePerUnit: value };
    }

    function showMaterialError(msg) {
        var el = document.getElementById('addMaterialError');
        if (el) {
            el.textContent = msg || '';
            el.style.display = msg ? 'block' : 'none';
        }
    }

    window.openAddMaterialModal = function () {
        var typeEl = document.getElementById('materialTypeInput');
        var nameEl = document.getElementById('materialNameInput');
        var tierEl = document.getElementById('materialTierInput');
        var weightEl = document.getElementById('materialWeightInput');
        var valueEl = document.getElementById('materialValueInput');

        if (typeEl) typeEl.value = 'ore';
        if (nameEl) nameEl.value = '';
        if (tierEl) tierEl.value = '1';
        if (weightEl) weightEl.value = '0';
        if (valueEl) valueEl.value = '0';

        showMaterialError('');
        var modal = document.getElementById('addMaterialModal');
        if (modal && window.bootstrap) {
            var bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    };

    function wireAddMaterialModal() {
        var saveBtn = document.getElementById('saveMaterialBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                var data = collectMaterialFromModal();
                if (!data.name || data.name.length === 0) {
                    showMaterialError('Material name is required.');
                    return;
                }
                showMaterialError('');

                function closeModalAndRefresh() {
                    var modal = document.getElementById('addMaterialModal');
                    if (modal && window.bootstrap) {
                        var m = bootstrap.Modal.getInstance(modal);
                        if (m) m.hide();
                    }
                    window.renderMaterials();
                    if (window.renderProfitAnalysis) window.renderProfitAnalysis();
                }

                if (window.MiningAPI && window.MiningAPI.createMaterial) {
                    window.MiningAPI.createMaterial(data).then(function (res) {
                        if (res.ok && res.data && window.loadMiningData) {
                            window.loadMiningData().then(closeModalAndRefresh);
                        } else {
                            window.addMaterial(data);
                            closeModalAndRefresh();
                        }
                    });
                } else {
                    window.addMaterial(data);
                    closeModalAndRefresh();
                }
            });
        }
    }

    window.createIngotAndSheetFromOre = async function (oreName, tier) {
        if (!oreName || !oreName.trim()) {
            alert('Invalid ore name');
            return;
        }

        const name = oreName.trim();
        const tierNum = parseInt(tier, 10) || 1;
        const created = [];
        const skipped = [];

        // Create Ingot
        const existingIngot = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName('ingot', name);
        if (existingIngot) {
            skipped.push('Ingot');
        } else {
            const ingotPayload = {
                type: 'ingot',
                name: name,
                tier: tierNum,
                weightPerUnit: null,
                valuePerUnit: null
            };
            if (window.MiningAPI && window.MiningAPI.createMaterial) {
                const res = await window.MiningAPI.createMaterial(ingotPayload);
                if (res.ok && res.data) {
                    window.addMaterial({ ...ingotPayload, id: res.data.id });
                    created.push('Ingot');
                } else {
                    window.addMaterial(ingotPayload);
                    created.push('Ingot');
                }
            } else {
                window.addMaterial(ingotPayload);
                created.push('Ingot');
            }
        }

        // Create Sheet
        const existingSheet = window.getMaterialByTypeAndName && window.getMaterialByTypeAndName('sheet', name);
        if (existingSheet) {
            skipped.push('Sheet');
        } else {
            const sheetPayload = {
                type: 'sheet',
                name: name,
                tier: tierNum,
                weightPerUnit: null,
                valuePerUnit: null
            };
            if (window.MiningAPI && window.MiningAPI.createMaterial) {
                const res = await window.MiningAPI.createMaterial(sheetPayload);
                if (res.ok && res.data) {
                    window.addMaterial({ ...sheetPayload, id: res.data.id });
                    created.push('Sheet');
                } else {
                    window.addMaterial(sheetPayload);
                    created.push('Sheet');
                }
            } else {
                window.addMaterial(sheetPayload);
                created.push('Sheet');
            }
        }

        // Refresh data and UI
        await window.loadMiningData();
        window.renderMaterials();
        if (window.renderProfitAnalysis) window.renderProfitAnalysis();

        // Show feedback
        let message = '';
        if (created.length > 0) {
            message = 'Created: ' + created.join(', ');
        }
        if (skipped.length > 0) {
            if (message) message += '\n';
            message += 'Skipped (already exist): ' + skipped.join(', ');
        }
        if (message) {
            alert(message);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireAddMaterialModal);
    } else {
        setTimeout(wireAddMaterialModal, 0);
    }
})();

/**
 * Mining Storage Module
 * Provides unified localStorage-backed storage for mining materials and recipes.
 * Replaces the previous API-based mining-api.js.
 */
(function () {
    const MATERIALS_KEY = 'mining_materials';
    const RECIPES_KEY = 'mining_recipes';

    /* Unified Debug Manager Support */
    const debug = window.debugManager || {
        log: console.log,
        warn: console.warn,
        error: console.error
    };

    window.MiningStorage = {
        /**
         * Load materials from localStorage
         * @returns {Object} { ok: boolean, data: Array, fromStorage: boolean }
         */
        async loadMaterials() {
            try {
                const raw = localStorage.getItem(MATERIALS_KEY);
                const data = raw ? JSON.parse(raw) : [];
                return { ok: true, data, fromStorage: true };
            } catch (e) {
                debug.error('MiningStorage: loadMaterials failed', e);
                return { ok: false, data: [] };
            }
        },

        /**
         * Load recipes from localStorage
         * @returns {Object} { ok: boolean, data: Array, fromStorage: boolean }
         */
        async loadRecipes() {
            try {
                const raw = localStorage.getItem(RECIPES_KEY);
                const data = raw ? JSON.parse(raw) : [];
                return { ok: true, data, fromStorage: true };
            } catch (e) {
                debug.error('MiningStorage: loadRecipes failed', e);
                return { ok: false, data: [] };
            }
        },

        /**
         * Save a new material (simulates API creation by adding to storage)
         * @param {Object} payload 
         * @returns {Object} { ok: boolean, data: Object }
         */
        async createMaterial(payload) {
            try {
                const { data: materials } = await this.loadMaterials();
                // Assign a pseudo-ID if not present
                if (!payload.id) {
                    payload.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                }
                materials.push(payload);
                this.saveMaterialsToStorage(materials);
                return { ok: true, data: payload };
            } catch (e) {
                debug.error('MiningStorage: createMaterial failed', e);
                return { ok: false, data: null };
            }
        },

        /**
         * Update an existing material
         * @param {string|number} id 
         * @param {Object} payload 
         * @returns {Object} { ok: boolean, data: Object }
         */
        async updateMaterial(id, payload) {
            try {
                const { data: materials } = await this.loadMaterials();
                const index = materials.findIndex(m => m.id == id);
                if (index !== -1) {
                    materials[index] = { ...materials[index], ...payload };
                    this.saveMaterialsToStorage(materials);
                    return { ok: true, data: materials[index] };
                }
                return { ok: false, message: 'Material not found' };
            } catch (e) {
                debug.error('MiningStorage: updateMaterial failed', e);
                return { ok: false, data: null };
            }
        },

        /**
         * Delete a material
         * @param {string|number} id 
         * @returns {Object} { ok: boolean }
         */
        async deleteMaterial(id) {
            try {
                const { data: materials } = await this.loadMaterials();
                const newMaterials = materials.filter(m => m.id != id);
                this.saveMaterialsToStorage(newMaterials);
                return { ok: true };
            } catch (e) {
                debug.error('MiningStorage: deleteMaterial failed', e);
                return { ok: false };
            }
        },

        /**
         * Save a new recipe
         * @param {Object} payload 
         * @returns {Object} { ok: boolean, data: Object }
         */
        async createRecipe(payload) {
            try {
                const { data: recipes } = await this.loadRecipes();
                if (!payload.id) {
                    payload.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                }
                recipes.push(payload);
                this.saveRecipesToStorage(recipes);
                return { ok: true, data: payload };
            } catch (e) {
                debug.error('MiningStorage: createRecipe failed', e);
                return { ok: false, data: null };
            }
        },

        /**
         * Update an existing recipe
         * @param {string|number} id 
         * @param {Object} payload 
         * @returns {Object} { ok: boolean, data: Object }
         */
        async updateRecipe(id, payload) {
            try {
                const { data: recipes } = await this.loadRecipes();
                const index = recipes.findIndex(r => r.id == id);
                if (index !== -1) {
                    recipes[index] = { ...recipes[index], ...payload };
                    this.saveRecipesToStorage(recipes);
                    return { ok: true, data: recipes[index] };
                }
                return { ok: false, message: 'Recipe not found' };
            } catch (e) {
                debug.error('MiningStorage: updateRecipe failed', e);
                return { ok: false, data: null };
            }
        },

        /**
         * Delete a recipe
         * @param {string|number} id 
         * @returns {Object} { ok: boolean }
         */
        async deleteRecipe(id) {
            try {
                const { data: recipes } = await this.loadRecipes();
                const newRecipes = recipes.filter(r => r.id != id);
                this.saveRecipesToStorage(newRecipes);
                return { ok: true };
            } catch (e) {
                debug.error('MiningStorage: deleteRecipe failed', e);
                return { ok: false };
            }
        },

        /**
         * Internal: Save materials array to localStorage
         * @param {Array} materials 
         */
        saveMaterialsToStorage(materials) {
            try {
                localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
            } catch (e) {
                debug.error('MiningStorage: saveMaterialsToStorage failed', e);
            }
        },

        /**
         * Internal: Save recipes array to localStorage
         * @param {Array} recipes 
         */
        saveRecipesToStorage(recipes) {
            try {
                localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
            } catch (e) {
                debug.error('MiningStorage: saveRecipesToStorage failed', e);
            }
        },

        /**
         * Export data as JSON string
         */
        async exportData() {
            const { data: materials } = await this.loadMaterials();
            const { data: recipes } = await this.loadRecipes();
            return JSON.stringify({ materials, recipes }, null, 2);
        },

        /**
         * Import data from JSON string
         * @param {string} jsonString 
         * @param {boolean} merge - if true, merge with existing; else replace
         */
        async importData(jsonString, merge = false) {
            try {
                const data = JSON.parse(jsonString);
                if (!data.materials && !data.recipes) {
                    return { ok: false, message: 'Invalid data format' };
                }

                if (merge) {
                    const { data: currentMaterials } = await this.loadMaterials();
                    const { data: currentRecipes } = await this.loadRecipes();

                    // Simple merge: append new ones. 
                    // a robust merge might check IDs or names to avoid duplicates, 
                    // but for now we'll just concat and let user manage cleanup if needed
                    // or maybe key by ID if IDs are preserved.
                    // Let's rely on ID uniqueness.

                    const mergedMaterials = [...currentMaterials];
                    if (data.materials) {
                        data.materials.forEach(m => {
                            if (!mergedMaterials.find(cm => cm.id === m.id)) {
                                mergedMaterials.push(m);
                            }
                        });
                    }

                    const mergedRecipes = [...currentRecipes];
                    if (data.recipes) {
                        data.recipes.forEach(r => {
                            if (!mergedRecipes.find(cr => cr.id === r.id)) {
                                mergedRecipes.push(r);
                            }
                        });
                    }

                    this.saveMaterialsToStorage(mergedMaterials);
                    this.saveRecipesToStorage(mergedRecipes);

                } else {
                    // Replace
                    if (data.materials) this.saveMaterialsToStorage(data.materials);
                    if (data.recipes) this.saveRecipesToStorage(data.recipes);
                }

                return { ok: true };
            } catch (e) {
                debug.error('MiningStorage: importData failed', e);
                return { ok: false, message: e.message };
            }
        }
    };

    // For backward compatibility with modules expecting MiningAPI
    window.MiningAPI = window.MiningStorage;

})();

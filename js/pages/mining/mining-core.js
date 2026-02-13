/**
 * Mining core – in-memory materials and recipes, load from API or localStorage
 */
(function () {
    let materials = [];
    let recipes = [];

    function normalizeMaterial(m) {
        var rawType = m.type !== undefined && m.type !== null ? m.type : (m.Type !== undefined ? m.Type : '');
        var t = String(rawType).toLowerCase().trim();
        if (t !== 'ore' && t !== 'ingot' && t !== 'sheet') t = 'ore';

        // Handle weightPerUnit - parse value, use 0 if null/undefined/empty (database stores 0, not null)
        var weightVal = m.weightPerUnit !== undefined ? m.weightPerUnit : (m.weight_per_unit !== undefined ? m.weight_per_unit : 0);
        var weightPerUnit = (weightVal === null || weightVal === undefined || weightVal === '') ? 0 : parseFloat(weightVal);
        if (isNaN(weightPerUnit)) weightPerUnit = 0;

        // Handle valuePerUnit - parse value, use 0 if null/undefined/empty (database stores 0, not null)
        var valueVal = m.valuePerUnit !== undefined ? m.valuePerUnit : (m.value_per_unit !== undefined ? m.value_per_unit : 0);
        var valuePerUnit = (valueVal === null || valueVal === undefined || valueVal === '') ? 0 : parseFloat(valueVal);
        if (isNaN(valuePerUnit)) valuePerUnit = 0;

        return {
            id: m.id,
            type: t,
            name: (m.name != null ? m.name : (m.Name != null ? m.Name : '')).trim(),
            tier: parseInt(m.tier != null ? m.tier : m.Tier, 10) || 1,
            weightPerUnit: weightPerUnit,
            valuePerUnit: valuePerUnit,
            createdAt: m.createdAt || m.created_at || null,
            updatedAt: m.updatedAt || m.updated_at || null
        };
    }

    function normalizeRecipe(r) {
        return {
            id: r.id,
            name: r.name || '',
            inputs: Array.isArray(r.inputs) ? r.inputs.map(i => ({ materialId: i.materialId, quantity: parseFloat(i.quantity) || 0 })) : [],
            outputs: Array.isArray(r.outputs) ? r.outputs.map(o => ({ materialId: o.materialId, quantity: parseFloat(o.quantity) || 0 })) : [],
            createdAt: r.createdAt || null,
            updatedAt: r.updatedAt || null
        };
    }

    window.loadMiningData = async function () {
        const matRes = await window.MiningAPI.loadMaterials();
        const recRes = await window.MiningAPI.loadRecipes();
        materials = (matRes.data || []).map(normalizeMaterial);
        recipes = (recRes.data || []).map(normalizeRecipe);
        if (matRes.fromStorage) window.MiningAPI.saveMaterialsToStorage(materials);
        if (recRes.fromStorage) window.MiningAPI.saveRecipesToStorage(recipes);
        if (window.debug) window.debug.log('Loaded materials:', materials.length, 'recipes:', recipes.length);
        return { materials, recipes };
    };

    window.getMaterials = function () { return materials; };
    window.getRecipes = function () { return recipes; };

    window.getMaterialById = function (id) {
        const numId = parseInt(id, 10);
        return materials.find(m => m.id === numId || m.id === id) || null;
    };

    window.getMaterialByTypeAndName = function (type, name) {
        const t = (type || '').toLowerCase();
        return materials.find(m => m.type === t && (m.name || '').toLowerCase() === (name || '').toLowerCase()) || null;
    };

    window.addMaterial = function (data) {
        const m = normalizeMaterial({
            id: data.id || 'local_' + Date.now(),
            type: data.type,
            name: data.name,
            tier: data.tier,
            weightPerUnit: data.weightPerUnit,
            valuePerUnit: data.valuePerUnit
        });
        materials.push(m);
        window.MiningAPI.saveMaterialsToStorage(materials);
        return m;
    };

    window.updateMaterial = function (id, data) {
        const idx = materials.findIndex(m => m.id == id);
        if (idx === -1) return null;
        const m = materials[idx];
        if (data.type !== undefined) m.type = (data.type || '').toLowerCase();
        if (data.name !== undefined) m.name = data.name;
        if (data.tier !== undefined) m.tier = parseInt(data.tier, 10) || 1;
        if (data.weightPerUnit !== undefined) m.weightPerUnit = parseFloat(data.weightPerUnit) || 0;
        if (data.valuePerUnit !== undefined) m.valuePerUnit = parseFloat(data.valuePerUnit) || 0;
        window.MiningAPI.saveMaterialsToStorage(materials);
        return m;
    };

    window.removeMaterial = function (id) {
        const idx = materials.findIndex(m => m.id == id);
        if (idx === -1) return false;
        materials.splice(idx, 1);
        window.MiningAPI.saveMaterialsToStorage(materials);
        return true;
    };

    window.addRecipe = function (data) {
        const r = normalizeRecipe({
            id: data.id || 'rec_' + Date.now(),
            name: data.name,
            inputs: data.inputs || [],
            outputs: data.outputs || []
        });
        recipes.push(r);
        window.MiningAPI.saveRecipesToStorage(recipes);
        return r;
    };

    window.updateRecipe = function (id, data) {
        const idx = recipes.findIndex(r => r.id == id);
        if (idx === -1) return null;
        const r = recipes[idx];
        if (data.name !== undefined) r.name = data.name;
        if (data.inputs !== undefined) r.inputs = data.inputs.map(i => ({ materialId: parseInt(i.materialId, 10), quantity: parseFloat(i.quantity) || 0 }));
        if (data.outputs !== undefined) r.outputs = data.outputs.map(o => ({ materialId: parseInt(o.materialId, 10), quantity: parseFloat(o.quantity) || 0 }));
        window.MiningAPI.saveRecipesToStorage(recipes);
        return r;
    };

    window.removeRecipe = function (id) {
        const idx = recipes.findIndex(r => r.id == id);
        if (idx === -1) return false;
        recipes.splice(idx, 1);
        window.MiningAPI.saveRecipesToStorage(recipes);
        return true;
    };

    window.setMaterials = function (arr) {
        materials = (arr || []).map(normalizeMaterial);
        window.MiningAPI.saveMaterialsToStorage(materials);
    };

    window.setRecipes = function (arr) {
        recipes = (arr || []).map(normalizeRecipe);
        window.MiningAPI.saveRecipesToStorage(recipes);
    };
})();

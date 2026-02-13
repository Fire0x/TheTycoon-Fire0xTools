/**
 * Mining calculations – profit, margin, price diff per recipe (ore → ingot → sheet)
 */
(function () {
    window.computeMiningProfitAnalysis = function () {
        const materials = window.getMaterials ? window.getMaterials() : [];
        const recipes = window.getRecipes ? window.getRecipes() : [];
        const getMat = function (id) { return materials.find(m => m.id == id) || null; };

        const rows = [];
        const missing = [];

        recipes.forEach(recipe => {
            let inputCost = 0;
            let outputValue = 0;
            let inputWeight = 0;
            let outputWeight = 0;
            (recipe.inputs || []).forEach(i => {
                const m = getMat(i.materialId);
                if (!m) missing.push({ recipeId: recipe.id, materialId: i.materialId });
                else {
                    inputCost += (i.quantity * (m.valuePerUnit || 0));
                    inputWeight += (i.quantity * (m.weightPerUnit || 0));
                }
            });
            (recipe.outputs || []).forEach(o => {
                const m = getMat(o.materialId);
                if (!m) missing.push({ recipeId: recipe.id, materialId: o.materialId });
                else {
                    outputValue += (o.quantity * (m.valuePerUnit || 0));
                    outputWeight += (o.quantity * (m.weightPerUnit || 0));
                }
            });

            const profit = outputValue - inputCost;
            const margin = outputValue > 0 ? (profit / outputValue) * 100 : 0;
            const priceDiff = outputValue - inputCost;

            rows.push({
                recipeId: recipe.id,
                name: recipe.name || 'Recipe #' + recipe.id,
                inputCost,
                outputValue,
                profit,
                margin,
                priceDiff,
                inputWeight,
                outputWeight,
                hasMissing: missing.some(x => x.recipeId === recipe.id)
            });
        });

        return {
            rows,
            missing,
            allMaterialsPresent: missing.length === 0
        };
    };
})();

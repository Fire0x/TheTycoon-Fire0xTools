/**
 * Parse pasted mining data: TIER N, xQty, Ore/Ingot/Sheet Name, X.X kg, $unitPrice ($total)
 * Uses first $ value only; weight per unit = total weight / qty when qty present.
 */
window.parseMiningPaste = function (text) {
    if (window.debug) window.debug.log('parseMiningPaste', text ? text.length : 0);
    const results = [];
    const lines = (text || '').split('\n').map(l => l.trim()).filter(l => l);
    let currentTier = 1;
    let currentQty = 1;
    let currentType = '';
    let currentName = '';
    let currentWeightTotal = null;
    let currentUnitPrice = null;

    function flush() {
        if (currentType && currentName && currentUnitPrice !== null) {
            const weightPerUnit = currentWeightTotal != null && currentQty > 0
                ? currentWeightTotal / currentQty
                : (currentWeightTotal != null ? currentWeightTotal : 0);
            results.push({
                tier: currentTier,
                type: currentType.toLowerCase(),
                name: currentName.trim(),
                quantity: currentQty,
                weightPerUnit: weightPerUnit,
                valuePerUnit: currentUnitPrice
            });
        }
        currentQty = 1;
        currentType = '';
        currentName = '';
        currentWeightTotal = null;
        currentUnitPrice = null;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const tierMatch = line.match(/^TIER\s*(\d+)$/i);
        const qtyMatch = line.match(/^x(\d+)$/i);
        const typeNameMatch = line.match(/^(Ore|Ingot|Sheet)\s+(.+)$/i);
        const kgMatch = line.match(/^([\d.]+)\s*kg$/i);
        const priceMatch = line.match(/\$([\d,]+)/);

        if (tierMatch) {
            flush();
            currentTier = parseInt(tierMatch[1], 10) || 1;
            continue;
        }
        if (qtyMatch) {
            currentQty = parseInt(qtyMatch[1], 10) || 1;
            continue;
        }
        if (typeNameMatch) {
            currentType = typeNameMatch[1];
            currentName = typeNameMatch[2].trim();
            continue;
        }
        if (kgMatch) {
            currentWeightTotal = parseFloat(kgMatch[1]) || 0;
            continue;
        }
        if (priceMatch) {
            currentUnitPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10) || 0;
            flush();
        }
    }
    flush();
    if (window.debug) window.debug.log('Parsed items:', results.length);
    return results;
};

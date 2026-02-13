/**
 * Mining Template Data
 * Embedded to avoid CORS issues with file:// protocol
 */
window.MiningTemplateData = {
    "_instructions": "Template configuration for Mining. Import this to start with a standard set of materials and recipes.",
    "materials": [
        { "id": 1, "name": "Copper Ore", "type": "ore", "tier": 1, "weight": 2.2, "value": 0 },
        { "id": 2, "name": "Copper Ingot", "type": "ingot", "tier": 1, "weight": 0.5, "value": 0 },
        { "id": 3, "name": "Copper Sheet", "type": "sheet", "tier": 1, "weight": 1.4, "value": 0 },
        { "id": 4, "name": "Aluminum Ore", "type": "ore", "tier": 2, "weight": 4.0, "value": 0 },
        { "id": 5, "name": "Aluminum Ingot", "type": "ingot", "tier": 2, "weight": 0.9, "value": 0 },
        { "id": 6, "name": "Aluminum Sheet", "type": "sheet", "tier": 2, "weight": 2.5, "value": 0 },
        { "id": 7, "name": "Iron Ore", "type": "ore", "tier": 3, "weight": 8.0, "value": 0 },
        { "id": 8, "name": "Iron Ingot", "type": "ingot", "tier": 3, "weight": 1.9, "value": 0 },
        { "id": 9, "name": "Iron Sheet", "type": "sheet", "tier": 3, "weight": 5.0, "value": 0 },
        { "id": 10, "name": "Lead Ore", "type": "ore", "tier": 4, "weight": 12.0, "value": 0 },
        { "id": 11, "name": "Lead Ingot", "type": "ingot", "tier": 4, "weight": 2.9, "value": 0 },
        { "id": 12, "name": "Lead Sheet", "type": "sheet", "tier": 4, "weight": 8.1, "value": 0 }
    ],
    "recipes": [
        {
            "id": 1,
            "name": "Copper Ore to Ingot",
            "inputs": [{ "materialId": 1, "quantity": 5 }],
            "outputs": [{ "materialId": 2, "quantity": 1 }]
        },
        {
            "id": 2,
            "name": "Copper Ingot to Sheet",
            "inputs": [{ "materialId": 2, "quantity": 3 }],
            "outputs": [{ "materialId": 3, "quantity": 1 }]
        },
        {
            "id": 3,
            "name": "Aluminum Ore to Ingot",
            "inputs": [{ "materialId": 4, "quantity": 5 }],
            "outputs": [{ "materialId": 5, "quantity": 1 }]
        },
        {
            "id": 4,
            "name": "Aluminum Ingot to Sheet",
            "inputs": [{ "materialId": 5, "quantity": 3 }],
            "outputs": [{ "materialId": 6, "quantity": 1 }]
        },
        {
            "id": 5,
            "name": "Iron Ore to Ingot",
            "inputs": [{ "materialId": 7, "quantity": 5 }],
            "outputs": [{ "materialId": 8, "quantity": 1 }]
        },
        {
            "id": 6,
            "name": "Iron Ingot to Sheet",
            "inputs": [{ "materialId": 8, "quantity": 3 }],
            "outputs": [{ "materialId": 9, "quantity": 1 }]
        },
        {
            "id": 7,
            "name": "Lead Ore to Ingot",
            "inputs": [{ "materialId": 10, "quantity": 5 }],
            "outputs": [{ "materialId": 11, "quantity": 1 }]
        },
        {
            "id": 8,
            "name": "Lead Ingot to Sheet",
            "inputs": [{ "materialId": 11, "quantity": 3 }],
            "outputs": [{ "materialId": 12, "quantity": 1 }]
        }
    ],
    "config": {
        "enabledCalculations": ["profit", "margin", "priceDiff"],
        "materialsSortBy": "tier"
    }
};

/**
 * Checklist Template Data
 * Embedded to avoid CORS issues with file:// protocol
 */
window.ChecklistTemplateData = {
    "_instructions": "This is an example template configuration file. You can edit this file to customize your starting configuration. The _instructions field will be ignored when importing. Remove this field or modify the structure as needed.",
    "tiers": [
        {
            "id": 1,
            "name": "Tier 1: Fruit Stand",
            "icon": "🍎",
            "color": "bg-primary",
            "visible": true
        },
        {
            "id": 2,
            "name": "Tier 2: Toll Booths",
            "icon": "📄",
            "color": "bg-success",
            "visible": true
        },
        {
            "id": 3,
            "name": "Tier 3: Coffee Shop",
            "icon": "☕",
            "color": "bg-warning text-dark",
            "visible": true
        },
        {
            "id": 4,
            "name": "Tier 4: Fishery",
            "icon": "🐟",
            "color": "bg-info",
            "visible": true
        },
        {
            "id": 5,
            "name": "Tier 5: Alcohol",
            "icon": "🍻",
            "color": "bg-secondary",
            "visible": true
        },
        {
            "id": 6,
            "name": "Tier 6: Vineyard",
            "icon": "🍷",
            "color": "bg-danger",
            "visible": true
        }
    ],
    "businesses": [
        {
            "businessCode": "TIER1-BIZ01",
            "businessName": "FruitstandBusinessName",
            "tierId": 1,
            "status": "Open",
            "maxStock": 5100,
            "notes": "Example: Managed by Fire0x",
            "collectionStorage": 0,
            "canCollectItems": false
        },
        {
            "businessCode": "TIER2-BIZ01",
            "businessName": "TollBooth #1",
            "tierId": 2,
            "status": "Open",
            "maxStock": 5000,
            "collectionStorage": 0,
            "canCollectItems": false
        },
        {
            "businessCode": "Coffee Shop #",
            "businessName": "Coffee Shop #1",
            "tierId": 3,
            "status": "Open",
            "maxStock": 5000,
            "collectionStorage": 0,
            "canCollectItems": false
        },
        {
            "businessCode": "TIER4-BIZ01",
            "businessName": "Fishery #1",
            "tierId": 4,
            "status": "Open",
            "maxStock": 5000,
            "collectionStorage": 0,
            "canCollectItems": false
        },
        {
            "businessCode": "TIER4-BIZ02",
            "businessName": "Clam Production Facility #1",
            "tierId": 4,
            "status": "Open",
            "maxStock": 5000,
            "collectionStorage": 5000,
            "canCollectItems": true
        },
        {
            "businessCode": "TIER5-BIZ01",
            "businessName": "Yellow Jacket #1",
            "tierId": 5,
            "status": "Open",
            "maxStock": 5000,
            "collectionStorage": 0,
            "canCollectItems": false
        },
        {
            "businessCode": "TIER5-BIZ02",
            "businessName": "Cocktail Production Facility #2",
            "tierId": 5,
            "status": "Open",
            "maxStock": 5000,
            "collectionStorage": 5000,
            "canCollectItems": true
        },
        {
            "businessCode": "TIER6-BIZ01",
            "businessName": "Vineyard #1",
            "tierId": 6,
            "status": "Open",
            "maxStock": 5000,
            "collectionStorage": 5000,
            "canCollectItems": false
        },
        {
            "businessCode": "TIER6-BIZ02",
            "businessName": "Vineyard Offsite #2",
            "tierId": 6,
            "status": "Open",
            "maxStock": 5000,
            "collectionStorage": 5000,
            "canCollectItems": true
        }
    ],
    "products": [
        {
            "id": 1,
            "tierId": 1,
            "productName": "Apple 🍎"
        },
        {
            "id": 2,
            "tierId": 1,
            "productName": "Bananas 🍌"
        },
        {
            "id": 3,
            "tierId": 1,
            "productName": "Grapes 🍇"
        },
        {
            "id": 4,
            "tierId": 1,
            "productName": "Oranges 🍊"
        },
        {
            "id": 5,
            "tierId": 1,
            "productName": "Strawberries 🍓"
        },
        {
            "id": 6,
            "tierId": 1,
            "productName": "Watermelons 🍉"
        },
        {
            "id": 7,
            "tierId": 2,
            "productName": "Paper 📄"
        },
        {
            "id": 8,
            "tierId": 3,
            "productName": "Coffee ☕"
        },
        {
            "id": 9,
            "tierId": 4,
            "productName": "Sushi 🍣"
        },
        {
            "id": 10,
            "tierId": 4,
            "productName": "Pearls ⚪"
        },
        {
            "id": 11,
            "tierId": 4,
            "productName": "Bait 🐟"
        },
        {
            "id": 12,
            "tierId": 5,
            "productName": "Case of Beer 🍺"
        },
        {
            "id": 13,
            "tierId": 5,
            "productName": "Cocktails 🍸"
        },
        {
            "id": 14,
            "tierId": 5,
            "productName": "Hops Seeds 🌱"
        },
        {
            "id": 15,
            "tierId": 6,
            "productName": "Cabernet Sauvignon 🍷"
        },
        {
            "id": 16,
            "tierId": 6,
            "productName": "Chardonnay 🍹"
        },
        {
            "id": 17,
            "tierId": 6,
            "productName": "Wine Grape Seeds 🍇"
        }
    ],
    "checklistRunList": [
        "TIER1-BIZ01"
    ],
    "checklistTracking": {
        "AllBusinessSummaryProductOrder": [],
        "Tier 1: Fruit Stand": {
            "TIER1-BIZ01": 1
        }
    },
    "version": "1.0.3"
};

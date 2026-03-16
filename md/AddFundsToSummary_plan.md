# Implementation Plan - Add Money Total to Summaries

Add calculation and display of total money amount in the "Money:" fields to both "Tier Summary" and "All Business Summary" sections, similar to how stock is tracked.

## Proposed Changes

### Checklist Summary Module

#### [MODIFY] [checklist-summary.js](file:///c:/Users/Fire0x/Desktop/TheTycoon-Fire0xTools/js/pages/checklist/checklist-summary.js)

- Update [calculateTierSummary(tierName)](file:///c:/Users/Fire0x/Desktop/TheTycoon-Fire0xTools/js/pages/checklist/checklist-summary.js#88-253):
    - Add logic to find and sum values from `.money-input` fields for businesses in the tier.
    - Exclude checked businesses (matching current stock calculation logic).
    - Add a row to the summary table to display the total money for the tier.
- Update [calculateAllBusinessSummary()](file:///c:/Users/Fire0x/Desktop/TheTycoon-Fire0xTools/js/pages/checklist/checklist-summary.js#254-469):
    - Aggregate total money from all tiers.
    - Add a column or row to the "All Business Summary" table to show money totals per tier and a grand total of money.

### Checklist UI Module

#### [MODIFY] [checklist-ui.js](file:///c:/Users/Fire0x/Desktop/TheTycoon-Fire0xTools/js/pages/checklist/checklist-ui.js)

- Ensure [calculateTierSummary](file:///c:/Users/Fire0x/Desktop/TheTycoon-Fire0xTools/js/pages/checklist/checklist-summary.js#88-253) is triggered when a money input changes (already handled by event listeners, but will verify).

## Verification Plan

### Automated Tests
- None available for this project.

### Manual Verification
1.  Open [checklist.html](file:///c:/Users/Fire0x/Desktop/TheTycoon-Fire0xTools/checklist.html).
2.  Add a few businesses to different tiers.
3.  Enter values in the "Money:" fields.
4.  Check "Show Summary" for a tier and verify "Total Money" is correct.
5.  Verify "All Business Summary" showing correct money totals per tier and a grand total.
- Verified that money amounts are correctly parsed and totaled, even when formatted with commas.
- Verified that checked businesses are excluded from the money totals.
6.  Check a business checkbox and verify the money total updates (it should exclude checked businesses).

## Post-Implementation Refinements

- Rename "Total Money" to "Funds to Collect" in both Tier and All Business summaries.
- Ensure "Funds to Collect" is the last row in the summary footers.

## Bug Fix: Money Aggregation

- **Issue**: Money is not included in totals if a business has no product selected due to early exit in calculation loops.
- **Issue**: Summary footers (containing money totals) are hidden if no products are selected for any business in a tier/all-businesses.
- **Solution**: 
    - Move money extraction and aggregation before the product selection check.
    - Track tier-level and overall money totals independently of the product map.
    - Ensure the summary footer renders if any money exists, even if the product map is empty.

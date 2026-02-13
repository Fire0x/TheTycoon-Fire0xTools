/**
 * Mining UI – render profit analysis section
 */
(function () {
    function fmtNum(n) {
        if (window.NumberFormatter && window.NumberFormatter.formatNumberDisplay) {
            return window.NumberFormatter.formatNumberDisplay(n);
        }
        return n == null ? '' : Number(n);
    }

    window.renderProfitAnalysis = function () {
        const container = document.getElementById('profitAnalysisContainer');
        if (!container) return;
        const result = window.computeMiningProfitAnalysis ? window.computeMiningProfitAnalysis() : { rows: [], missing: [], allMaterialsPresent: true };
        const { rows, missing, allMaterialsPresent } = result;

        if (rows.length === 0) {
            container.innerHTML = '<p class="text-muted">Add recipes to see profit analysis (ore → ingot → sheet).</p>';
            return;
        }

        if (!allMaterialsPresent) {
            container.innerHTML = '<div class="alert alert-warning">Some recipe materials are missing weight/value. Add or edit materials.</div>';
        }

        let html = '<div class="table-responsive"><table class="table table-striped mining-table"><thead><tr><th>Recipe</th><th>Input cost</th><th>Output value</th><th>Profit</th><th>Margin %</th><th>Price diff</th></tr></thead><tbody>';
        rows.forEach(r => {
            html += '<tr>';
            html += '<td>' + (r.name || '') + '</td>';
            html += '<td>$' + fmtNum(r.inputCost) + '</td>';
            html += '<td>$' + fmtNum(r.outputValue) + '</td>';
            html += '<td>$' + fmtNum(r.profit) + '</td>';
            html += '<td>' + (r.margin != null ? r.margin.toFixed(1) + '%' : '—') + '</td>';
            html += '<td>$' + fmtNum(r.priceDiff) + '</td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        if (!allMaterialsPresent) {
            container.innerHTML = '<div class="alert alert-warning">Some recipe materials are missing weight/value. Add or edit materials.</div>' + html;
        } else {
            container.innerHTML = html;
        }
    };
})();

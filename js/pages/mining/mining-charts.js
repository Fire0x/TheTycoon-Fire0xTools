/**
 * Mining Charts - Visual Analytics using Chart.js
 */
(function () {
    let profitChartInstance = null;
    let valueChainChartInstance = null;

    // Helper to get color based on value/index
    const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];

    window.renderCharts = function () {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }

        renderProfitChart();
        renderValueChainChart();
    };

    function getThemeColors() {
        const style = getComputedStyle(document.body);
        const textColor = style.getPropertyValue('--text-color').trim() || '#666';
        const borderColor = style.getPropertyValue('--card-border').trim() || '#ddd';
        return { textColor, borderColor };
    }

    function renderProfitChart() {
        const ctx = document.getElementById('profitChart');
        if (!ctx) return;

        // Get data from calculation module
        const analysis = window.computeMiningProfitAnalysis ? window.computeMiningProfitAnalysis() : { rows: [] };
        let rows = analysis.rows || [];

        // Sort by margin desc and take top 10
        rows.sort((a, b) => b.margin - a.margin);
        rows = rows.slice(0, 10);

        const labels = rows.map(r => r.name);
        const margins = rows.map(r => r.margin);
        const profits = rows.map(r => r.profit);

        if (profitChartInstance) {
            profitChartInstance.destroy();
        }

        const { textColor, borderColor } = getThemeColors();

        profitChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Margin %',
                        data: margins,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Profit ($)',
                        data: profits,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1',
                        type: 'line'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor },
                        grid: { color: borderColor }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Margin %', color: textColor },
                        ticks: { color: textColor },
                        grid: { color: borderColor }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Profit ($)', color: textColor },
                        ticks: { color: textColor },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                }
            }
        });
    }

    function renderValueChainChart() {
        const ctx = document.getElementById('valueChainChart');
        if (!ctx) return;

        const materials = window.getMaterials ? window.getMaterials() : [];
        // Group by name (Aluminum, Copper, etc.)
        const groups = {};

        materials.forEach(m => {
            const name = (m.name || '').trim();
            if (!groups[name]) groups[name] = { ore: 0, ingot: 0, sheet: 0 };

            const type = (m.type || '').toLowerCase();
            if (type === 'ore') groups[name].ore = m.valuePerUnit || 0;
            if (type === 'ingot') groups[name].ingot = m.valuePerUnit || 0;
            if (type === 'sheet') groups[name].sheet = m.valuePerUnit || 0;
        });

        // Filter out incomplete groups or groups with no value
        const labels = Object.keys(groups).filter(name => {
            const g = groups[name];
            return g.ore > 0 || g.ingot > 0 || g.sheet > 0;
        }).sort();

        const oreValues = labels.map(name => groups[name].ore);
        const ingotValues = labels.map(name => groups[name].ingot);
        const sheetValues = labels.map(name => groups[name].sheet);

        if (valueChainChartInstance) {
            valueChainChartInstance.destroy();
        }

        const { textColor, borderColor } = getThemeColors();

        valueChainChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ore Value',
                        data: oreValues,
                        backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    },
                    {
                        label: 'Ingot Value',
                        data: ingotValues,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    },
                    {
                        label: 'Sheet Value',
                        data: sheetValues,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                },
                scales: {
                    x: {
                        stacked: false, // Side-by-side
                        ticks: { color: textColor },
                        grid: { color: borderColor }
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Value per Unit ($)', color: textColor },
                        ticks: { color: textColor },
                        grid: { color: borderColor }
                    }
                }
            }
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

    function init() {
        const btn = document.getElementById('refreshChartsBtn');
        if (btn) btn.addEventListener('click', window.renderCharts);

        const collapse = document.getElementById('chartsCollapse');
        if (collapse) {
            collapse.addEventListener('shown.bs.collapse', function () {
                window.renderCharts();
            });
        }
    }

})();

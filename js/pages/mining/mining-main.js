/**
 * Mining page init – debug, local time, load data, render, wire buttons and number formatting
 */
(function () {
    const debug = new DebugManager({
        prefix: '[Mining]',
        storageKey: 'miningDebug',
        buttonId: 'debugToggleBtn',
        textId: 'debugStatus'
    });
    debug.init();
    window.debug = debug;

    window.updateLocalTime = function () {
        const now = new Date();
        const opts = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const str = now.toLocaleString(navigator.language || 'en-US', opts);
        const el = document.getElementById('localTime');
        if (el) el.textContent = str;
    };

    function initNumberFormatting() {
        if (typeof window.NumberFormatter !== 'undefined' && typeof window.NumberFormatter.initNumberFormatting === 'function') {
            window.NumberFormatter.initNumberFormatting({
                selector: '.material-weight',
                allowDecimals: true
            });
            window.NumberFormatter.initNumberFormatting({
                selector: '.material-value, .money-input',
                allowDecimals: false
            });
        }
    }

    function wireButtons() {
        const parseBtn = document.getElementById('parseAndSaveMiningBtn');
        if (parseBtn) parseBtn.addEventListener('click', function () { window.parseAndSaveMining && window.parseAndSaveMining(); });

        const addMatBtn = document.getElementById('addMaterialBtn');
        if (addMatBtn) addMatBtn.addEventListener('click', function () {
            if (window.openAddMaterialModal) window.openAddMaterialModal();
        });

        const addRecBtn = document.getElementById('addRecipeBtn');
        if (addRecBtn) addRecBtn.addEventListener('click', function () {
            if (window.openAddRecipeModal) window.openAddRecipeModal();
        });

        const autoRecipesBtn = document.getElementById('autoGenerateRecipesBtn');
        if (autoRecipesBtn) autoRecipesBtn.addEventListener('click', function () {
            if (window.autoGenerateMissingRecipes) window.autoGenerateMissingRecipes();
        });

        const updateRatiosBtn = document.getElementById('updateRecipeRatiosBtn');
        if (updateRatiosBtn) updateRatiosBtn.addEventListener('click', function () {
            if (window.updateAllRecipeRatios) window.updateAllRecipeRatios();
        });
    }

    function init() {
        if (window.debug) window.debug.log('Initializing mining page...');
        window.loadMiningData()
            .then(function () {
                if (window.renderMaterials) window.renderMaterials();
                if (window.renderRecipes) window.renderRecipes();
                if (window.renderProfitAnalysis) window.renderProfitAnalysis();
            })
            .catch(function (e) {
                if (window.debug) window.debug.error('Load mining data failed', e);
                if (window.renderMaterials) window.renderMaterials();
                if (window.renderRecipes) window.renderRecipes();
                if (window.renderProfitAnalysis) window.renderProfitAnalysis();
            });

        wireButtons();
        window.updateLocalTime();
        setInterval(window.updateLocalTime, 1000);
        initNumberFormatting();
        if (window.debug) window.debug.log('Mining page initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
})();

/* =================================================================
   GŁÓWNA APLIKACJA - Orkiestracja i Stan
   ================================================================= */

import { ALL_BASES, magicSumColorMap } from './config.js';
import { analyzeDates } from './analyzer.js';
import { 
    updateSubtitles, 
    drawMainChart, 
    drawCorrelationChart, 
    drawMagicChart 
} from './charts.js';
import { 
    openSettingsModal, 
    closeSettingsModal, 
    openExplanationModal, 
    closeExplanationModal, 
    closeDetailsModal,
    openDetailsModal,
    toggleAllBases, 
    getSelectedBases,
    setupModalCloseHandlers
} from './modals.js';

// Stan aplikacji
let activeBases = [...ALL_BASES];
let allResults = {};
let dailyCorrelationData = {};
let dateLabels = [];

/**
 * Ustawia domyślne daty (aktualny rok)
 */
function setDefaultDates() {
    const now = new Date();
    const year = now.getFullYear();
    
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    document.getElementById('dateFrom').value = startDate;
    document.getElementById('dateTo').value = endDate;
}

/**
 * Uruchamia analizę i rysuje wszystkie wykresy
 */
function runAnalysis() {
    let dateFrom = document.getElementById('dateFrom').value;
    let dateTo = document.getElementById('dateTo').value;

    if (activeBases.length === 0) {
        alert("Wybierz BaseX w Ustawieniach (2-40) przed uruchomieniem analizy.");
        return;
    }

    updateSubtitles(activeBases);
    
    // Wyczyść mapę kolorów liczb mistrzowskich
    Object.keys(magicSumColorMap).forEach(key => delete magicSumColorMap[key]);

    const analysisResult = analyzeDates(dateFrom, dateTo, activeBases);
    allResults = analysisResult.results;
    dateLabels = analysisResult.dateLabels;
    dailyCorrelationData = analysisResult.dailyCorrelationData;

    drawMainChart(allResults, dateLabels, activeBases, handleChartClick);
    drawCorrelationChart(dateLabels, dailyCorrelationData, activeBases, handleChartClick);
    drawMagicChart(allResults, dateLabels, dailyCorrelationData, activeBases, handleChartClick);
}

/**
 * Obsługuje kliknięcia w wykresy
 * @param {Event} e - Event kliknięcia
 * @param {Chart} chartInstance - Instancja wykresu Chart.js
 * @param {Array<string>} labels - Etykiety dat
 */
function handleChartClick(e, chartInstance, labels) {
    const points = chartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);

    if (points.length) {
        const firstPoint = points[0];
        const index = firstPoint.index;
        const date = labels[index];
        openDetailsModal(date, allResults, activeBases);
    }
}

/**
 * Zastosowuje ustawienia BaseX i uruchamia analizę
 */
function applySettings() {
    activeBases = getSelectedBases();
    closeSettingsModal();
    runAnalysis();
}

/**
 * Eksportuje funkcje do window (dla inline onclick w HTML)
 */
function exportToWindow() {
    window.runAnalysis = runAnalysis;
    window.openSettingsModal = () => openSettingsModal(activeBases);
    window.closeSettingsModal = closeSettingsModal;
    window.openExplanationModal = openExplanationModal;
    window.closeExplanationModal = closeExplanationModal;
    window.closeDetailsModal = closeDetailsModal;
    window.toggleAllBases = toggleAllBases;
    window.applySettings = applySettings;
}

/**
 * Inicjalizacja aplikacji
 */
function init() {
    setDefaultDates();
    exportToWindow();
    setupModalCloseHandlers();
    runAnalysis();
}

// Uruchomienie po załadowaniu DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
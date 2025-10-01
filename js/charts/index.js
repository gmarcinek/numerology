/* =================================================================
   CHARTS - Główny plik eksportu wszystkich wykresów
   ================================================================= */

import { drawMainChart } from './main-chart.js';
import { drawCorrelationChart } from './correlation-chart.js';
import { drawMagicChart } from './magic-chart.js';
import { CHART_DESCRIPTIONS } from '../data/chart-descriptions.js';
import { drawBase10CorrelationChart } from './base10-correlation-chart.js';
import { drawArchetypeChart } from './archetypeChart.js';

/**
 * Aktualizuje tytuły i podtytuły wykresów
 * @param {Array<number>} activeBases - Aktywne bazy
 */
export function updateSubtitles(activeBases) {
    const activeCount = activeBases.length;
    const baseRange = activeBases.length > 0 ? 
        `${activeBases[0]} do ${activeBases[activeBases.length - 1]}` : 'brak';

    document.getElementById('main-chart-title').textContent = CHART_DESCRIPTIONS.main.title;
    document.getElementById('main-chart-subtitle').textContent = 
        CHART_DESCRIPTIONS.main.subtitle(activeCount, baseRange);

    document.getElementById('correlation-chart-title').textContent = 
        CHART_DESCRIPTIONS.correlation.title;
    document.getElementById('correlation-chart-subtitle').textContent = 
        CHART_DESCRIPTIONS.correlation.subtitle(activeCount);

    document.getElementById('magic-chart-title').textContent = CHART_DESCRIPTIONS.magic.title;
    document.getElementById('magic-chart-subtitle').textContent = 
        CHART_DESCRIPTIONS.magic.subtitle(activeCount);

    document.getElementById('base10-correlation-chart-title').textContent = 
        CHART_DESCRIPTIONS.base10Correlation.title;
    document.getElementById('base10-correlation-chart-subtitle').textContent = 
        CHART_DESCRIPTIONS.base10Correlation.subtitle(activeCount);

    document.getElementById('archetype-chart-title').textContent = 
        CHART_DESCRIPTIONS.archetype.title;
    document.getElementById('archetype-chart-subtitle').textContent = 
        CHART_DESCRIPTIONS.archetype.subtitle(activeCount);
}

// Re-eksport funkcji rysujących wykresy
export { 
    drawMainChart, 
    drawCorrelationChart, 
    drawMagicChart, 
    drawBase10CorrelationChart,
    drawArchetypeChart
};

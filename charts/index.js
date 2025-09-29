/* =================================================================
   CHARTS - Główny plik eksportu wszystkich wykresów
   ================================================================= */

import { drawMainChart } from './main-chart.js';
import { drawCorrelationChart } from './correlation-chart.js';
import { drawMagicChart } from './magic-chart.js';
import { CHART_DESCRIPTIONS } from '../config.js';

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
        'Korelacja vs Niekorelacja Sum Base10';
    document.getElementById('correlation-chart-subtitle').textContent = 
        `Wykres pokazuje zarówno korelację (ile BaseX daje tę samą sumę - niebieski) jak i niekorelację (ile BaseX daje unikalną sumę - czerwony). Maksymalna wartość to ${activeCount} aktywnych systemów.`;

    document.getElementById('magic-chart-title').textContent = CHART_DESCRIPTIONS.magic.title;
    document.getElementById('magic-chart-subtitle').textContent = 
        CHART_DESCRIPTIONS.magic.subtitle(activeCount);
}

// Re-eksport funkcji rysujących wykresy
export { drawMainChart, drawCorrelationChart, drawMagicChart };
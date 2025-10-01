// js/charts/base10-correlation-chart.js
/* =================================================================
   WYKRES KORELACJI ARCHETYPÓW Z BASE10
   ================================================================= */

import { reduceToArchetype } from '../numerology.js';
import { baseColorMap } from '../config.js';

let chartInstanceBase10Correlation = null;

/**
 * Rysuje wykres korelacji archetypów z Base10
 * @param {Object} results - Wyniki analizy
 * @param {Array<string>} labels - Etykiety dat
 * @param {Object} dailyCorrelationData - (nieużywane tutaj, zostaje dla zgodności)
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawBase10CorrelationChart(results, labels, dailyCorrelationData, activeBases, onClickCallback) {
    const ctx = document.getElementById('base10CorrelationChart').getContext('2d');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth < 768;

    if (!activeBases.includes(10)) {
        console.warn('Base10 nie jest aktywna - wykres korelacji archetypów wymaga Base10');
        if (chartInstanceBase10Correlation) chartInstanceBase10Correlation.destroy();
        return;
    }

    const maxBases = activeBases.length;
    const otherBases = activeBases.filter(b => b !== 10);

    // Precompute archetyp Base10 dla każdej daty
    const base10ArchetypeByDate = new Map(
        labels.map(date => {
            const rec10 = results[10].find(r => r.date === date);
            const arche10 = reduceToArchetype(rec10?.sumBase10 ?? NaN);
            return [date, arche10];
        })
    );

    // Dataset dla każdej BaseX (X ≠ 10): 1 gdy archetyp(BaseX) == archetyp(Base10), inaczej 0
    const datasets = otherBases.map(base => {
        const data = labels.map(date => {
            const recX = results[base].find(r => r.date === date);
            const archeX = reduceToArchetype(recX?.sumBase10 ?? NaN);
            const arche10 = base10ArchetypeByDate.get(date);
            return (String(archeX) === String(arche10)) ? 1 : 0;
        });

        return {
            label: `Base ${base}`,
            data,
            backgroundColor: baseColorMap[base] || '#999',
            borderWidth: 0,
            stack: 'stack1'
        };
    });

    // Szary dataset: ile baz ma inny archetyp niż Base10 w danym dniu
    const nonCorrelatingData = labels.map((date, idx) => {
        let same = 0;
        for (let d of datasets) same += (d.data[idx] === 1) ? 1 : 0;
        return (maxBases - 1) - same; // wszystkie aktywne bazy bez Base10 minus dopasowane archetypy
    });

    datasets.push({
        label: 'Inny archetyp niż Base10',
        data: nonCorrelatingData,
        backgroundColor: '#cccccc',
        borderWidth: 0,
        stack: 'stack1'
    });

    if (chartInstanceBase10Correlation) chartInstanceBase10Correlation.destroy();

    chartInstanceBase10Correlation = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: !isMobile,
                    position: 'top',
                    labels: { boxWidth: 15 }
                },
                title: { display: false },
                tooltip: {
                    mode: 'index',
                    callbacks: {
                        title: (context) => `Data: ${context[0].label}`,
                        label: (context) => {
                            const v = context.parsed.y;
                            if (v === 0) return null;
                            if (context.dataset.label === 'Inny archetyp niż Base10') {
                                return `Inny archetyp: ${v}`;
                            }
                            return `${context.dataset.label}: archetyp = jak w Base10`;
                        },
                        footer: (context) => {
                            const date = context[0].label;
                            const arche10 = base10ArchetypeByDate.get(date);
                            // pokaż zestawienie archetypów per baza dla tej daty
                            const lines = [`Archetyp Base10: ${arche10}`, '—'];
                            for (const base of otherBases) {
                                const recX = results[base].find(r => r.date === date);
                                const archeX = reduceToArchetype(recX?.sumBase10 ?? NaN);
                                lines.push(`Base ${base}: ${archeX} ${String(archeX)===String(arche10)?'(=)': '(≠)'}`);
                            }
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    display: true,
                    title: { display: true, text: 'Data' },
                    ticks: { display: true },
                    stacked: true
                },
                y: {
                    beginAtZero: true,
                    max: maxBases,
                    ticks: { stepSize: 1 },
                    title: { display: true, text: `Liczba BaseX (max: ${maxBases})` },
                    stacked: true
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceBase10Correlation, labels)
        }
    });
}

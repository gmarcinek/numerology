/* =================================================================
   WYKRES ARCHETYPÓW - Redukcja sum BaseX do archetypu (1–9 lub master)
   ================================================================= */

import { reduceToArchetype } from '../numerology.js';
import { baseColorMap } from '../config.js';

let chartInstanceArchetype = null;

/**
 * Rysuje wykres archetypów (Base10 redukcja)
 * @param {Object} results - Wyniki analizy
 * @param {Array<string>} labels - Etykiety dat
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawArchetypeChart(results, labels, activeBases, onClickCallback) {
    const ctx = document.getElementById('archetypeChart').getContext('2d');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth < 768;

    // przygotuj dane – archetypy z redukcji sumBase10
    const datasets = activeBases.map(base => {
        const data = results[base].map(r => reduceToArchetype(r.sumBase10));
        return {
            label: `Base ${base}`,
            data: data,
            borderColor: baseColorMap[base] || '#000',
            backgroundColor: baseColorMap[base] || '#000',
            fill: false,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 1
        };
    });

    if (chartInstanceArchetype) chartInstanceArchetype.destroy();

    chartInstanceArchetype = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
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
                    mode: 'nearest',
                    intersect: false,
                    callbacks: {
                        title: function (context) {
                            return `Data: ${context[0].label}`;
                        },
                        label: function (context) {
                            return `${context.dataset.label}: Archetyp ${context.parsed.y}`;
                        }
                    }
                }
            },
            interaction: { mode: 'nearest', intersect: false },
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: 'Data' },
                    ticks: { display: true }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Archetyp' },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceArchetype, labels)
        }
    });
}

/* =================================================================
   WYKRES KORELACJI - Ile BaseX daje powtórzoną sumę
   ================================================================= */

import { getCorrelationDetails } from '../analyzer.js';
import { baseColorMap } from '../config.js';

let chartInstanceCorrelation = null;

/**
 * Generuje kolor HSL dla systemu BaseX
 * @param {number} base - Numer bazy
 * @returns {string} - Kolor w formacie HSL
 */
function getBaseColor(base) {
    if (baseColorMap[base]) return baseColorMap[base];
    const MIN_BASE = 2;
    const index = base - MIN_BASE;
    const hue = (index * 137.5) % 360;
    const saturation = 65;
    const lightness = 45;
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    baseColorMap[base] = color;
    return color;
}

/**
 * Rysuje wykres korelacji - ile BaseX uczestniczy w powtórzeniach sum
 * @param {Array<string>} labels - Etykiety dat
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawCorrelationChart(labels, dailyCorrelationData, activeBases, onClickCallback) {
    let ctx = document.getElementById('correlationChart').getContext('2d');
    const maxBases = activeBases.length;

    // Dla każdej BaseX tworzymy osobny dataset (stacked bar)
    const datasets = activeBases.map(base => {
        const data = labels.map(date => {
            const counts = dailyCorrelationData[date].sumCounts;
            let isCorrelating = false;
            
            Object.entries(counts).forEach(([sum, bases]) => {
                const activeBasesForSum = bases.filter(b => activeBases.includes(b));
                if (activeBasesForSum.length > 1 && activeBasesForSum.includes(base)) {
                    isCorrelating = true;
                }
            });
            
            return isCorrelating ? 1 : 0;
        });

        return {
            label: `Base ${base}`,
            data: data,
            backgroundColor: getBaseColor(base),
            borderWidth: 0,
            stack: 'stack1'
        };
    });

    if (chartInstanceCorrelation) chartInstanceCorrelation.destroy();

    chartInstanceCorrelation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top'
                },
                title: { display: false },
                tooltip: {
                    mode: 'index',
                    callbacks: {
                        title: function (context) { 
                            return `Data: ${context[0].label}`; 
                        },
                        label: function (context) {
                            return context.dataset.label;
                        },
                        footer: function(context) {
                            const date = context[0].label;
                            const total = context.reduce((sum, item) => sum + item.parsed.y, 0);
                            const details = getCorrelationDetails(date, dailyCorrelationData, activeBases);
                            return [`\nRazem korelujących: ${total} / ${maxBases}`, '', ...details];
                        }
                    }
                }
            },
            scales: {
                x: { 
                    display: true, 
                    title: { display: true, text: 'Data' },
                    ticks: { display: false },
                    stacked: true
                },
                y: {
                    beginAtZero: true,
                    max: maxBases,
                    stepSize: 1,
                    title: { display: true, text: `Liczba BaseX korelujących (max: ${maxBases})` },
                    stacked: true
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceCorrelation, labels)
        }
    });
}
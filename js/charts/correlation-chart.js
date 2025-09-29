/* =================================================================
   WYKRES KORELACJI - Ile BaseX daje powtórzoną sumę
   ================================================================= */

import { getCorrelationDetails } from '../analyzer.js';

let chartInstanceCorrelation = null;

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

    // Ile BaseX uczestniczy w korelacji (ma sumę powtórzoną z inną BaseX)
    const correlatingData = labels.map(date => {
        const counts = dailyCorrelationData[date].sumCounts;
        let correlatingBases = new Set();
        
        Object.entries(counts).forEach(([sum, bases]) => {
            const activeBasesForSum = bases.filter(b => activeBases.includes(b));
            if (activeBasesForSum.length > 1) {
                activeBasesForSum.forEach(b => correlatingBases.add(b));
            }
        });
        
        return correlatingBases.size;
    });

    if (chartInstanceCorrelation) chartInstanceCorrelation.destroy();

    chartInstanceCorrelation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Liczba BaseX korelujących',
                data: correlatingData,
                backgroundColor: '#377eb8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        title: function (context) { 
                            return `Data: ${context[0].label}`; 
                        },
                        label: function (context) {
                            const value = context.parsed.y;
                            return `BaseX korelujących: ${value} / ${maxBases}`;
                        },
                        afterBody: function (context) {
                            const date = context[0].label;
                            return getCorrelationDetails(date, dailyCorrelationData, activeBases);
                        }
                    }
                }
            },
            scales: {
                x: { 
                    display: true, 
                    title: { display: true, text: 'Data' },
                    ticks: { display: false }
                },
                y: {
                    beginAtZero: true,
                    max: maxBases,
                    stepSize: 1,
                    title: { display: true, text: `Liczba BaseX korelujących (max: ${maxBases})` }
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceCorrelation, labels)
        }
    });
}
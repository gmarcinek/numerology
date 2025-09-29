/* =================================================================
   WYKRES KORELACJI - Maksymalna korelacja (największa grupa)
   ================================================================= */

import { getCorrelationDetails } from '../analyzer.js';

let chartInstanceCorrelation = null;

/**
 * Rysuje wykres korelacji - maksymalna wielkość grupy korelującej
 * @param {Array<string>} labels - Etykiety dat
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawCorrelationChart(labels, dailyCorrelationData, activeBases, onClickCallback) {
    let ctx = document.getElementById('correlationChart').getContext('2d');
    const maxBases = activeBases.length;

    // Dla każdego dnia znajdź maksymalną wielkość grupy korelacji
    const maxCorrelationData = labels.map(date => {
        const counts = dailyCorrelationData[date].sumCounts;
        let maxGroupSize = 0;
        
        Object.entries(counts).forEach(([sum, bases]) => {
            const activeBasesForSum = bases.filter(b => activeBases.includes(b));
            if (activeBasesForSum.length > 1 && activeBasesForSum.length > maxGroupSize) {
                maxGroupSize = activeBasesForSum.length;
            }
        });
        
        return maxGroupSize;
    });

    if (chartInstanceCorrelation) chartInstanceCorrelation.destroy();

    chartInstanceCorrelation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Maksymalna korelacja',
                data: maxCorrelationData,
                backgroundColor: '#377eb8',
                borderColor: '#2c5f8d',
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 1.0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: false
                },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        title: function (context) { 
                            return `Data: ${context[0].label}`; 
                        },
                        label: function (context) {
                            const value = context.parsed.y;
                            return value > 0 
                                ? `Maksymalna korelacja: ${value} BaseX daje tę samą sumę`
                                : 'Brak korelacji';
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
                    title: { display: true, text: `Maksymalna korelacja (max: ${maxBases} BaseX)` }
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceCorrelation, labels)
        }
    });
}
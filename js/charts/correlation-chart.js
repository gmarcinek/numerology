/* =================================================================
   WYKRES KORELACJI I NIEKORELACJI - Połączony
   ================================================================= */

import { getCorrelationDetails, getNonCorrelationDetails } from '../analyzer.js';

let chartInstanceCorrelation = null;

/**
 * Rysuje połączony wykres korelacji i niekorelacji
 * @param {Array<string>} labels - Etykiety dat
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawCorrelationChart(labels, dailyCorrelationData, activeBases, onClickCallback) {
    let ctx = document.getElementById('correlationChart').getContext('2d');
    const maxBases = activeBases.length;

    const correlationData = labels.map(date => {
        const counts = dailyCorrelationData[date].sumCounts;
        const maxCount = Object.values(counts).length > 0 ?
            Math.max(...Object.values(counts).map(arr => arr.filter(b => activeBases.includes(b)).length)) : 1;
        return maxCount > 1 ? maxCount : 0;
    });

    const nonCorrelationData = labels.map(date => dailyCorrelationData[date].nonCorrelatingCount);

    if (chartInstanceCorrelation) chartInstanceCorrelation.destroy();

    chartInstanceCorrelation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Korelacja (max powtórzeń sumy Base10)',
                    data: correlationData,
                    backgroundColor: '#377eb8',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Niekorelacja (unikalne sumy Base10)',
                    data: nonCorrelationData,
                    backgroundColor: '#e41a1c',
                    borderWidth: 1,
                    yAxisID: 'y'
                }
            ]
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
                    callbacks: {
                        title: function (context) { 
                            return `Data: ${context[0].label}`; 
                        },
                        label: function (context) {
                            const value = context.parsed.y;
                            const datasetLabel = context.dataset.label;
                            
                            if (datasetLabel.includes('Korelacja')) {
                                return value === 0 
                                    ? 'Brak korelacji' 
                                    : `Max. Powtórzeń: ${value}x`;
                            } else {
                                return `Unikalne sumy: ${value}`;
                            }
                        },
                        afterBody: function (context) {
                            const date = context[0].label;
                            const datasetLabel = context[0].dataset.label;
                            
                            if (datasetLabel.includes('Korelacja')) {
                                return getCorrelationDetails(date, dailyCorrelationData, activeBases);
                            } else {
                                return getNonCorrelationDetails(date, dailyCorrelationData);
                            }
                        },
                        footer: function(context) {
                            return `Maksymalna wartość: ${maxBases} BaseX`;
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
                    title: { display: true, text: `Liczba BaseX (max: ${maxBases})` }
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceCorrelation, labels)
        }
    });
}
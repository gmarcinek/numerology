/* =================================================================
   WYKRES KORELACJI - Ile BaseX daje powtórzoną sumę
   ================================================================= */

import { getCorrelationDetails } from '../analyzer.js';

let chartInstanceCorrelation = null;

// Paleta kolorów dla różnych grup korelacji (od najciemniejszych do najjaśniejszych)
const CORRELATION_COLORS = [
    '#e41a1c', // czerwony
    '#377eb8', // niebieski
    '#4daf4a', // zielony
    '#984ea3', // fioletowy
    '#ff7f00', // pomarańczowy
    '#ffff33', // żółty
    '#a65628', // brązowy
    '#f781bf', // różowy
];

/**
 * Rysuje wykres korelacji - nachodzące słupki pokazujące maksymalną korelację
 * @param {Array<string>} labels - Etykiety dat
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawCorrelationChart(labels, dailyCorrelationData, activeBases, onClickCallback) {
    let ctx = document.getElementById('correlationChart').getContext('2d');
    const maxBases = activeBases.length;

    // Dla każdego dnia, znajdź wszystkie grupy korelacji i posortuj po wielkości
    const dailyCorrelations = labels.map(date => {
        const counts = dailyCorrelationData[date].sumCounts;
        const groups = [];
        
        Object.entries(counts).forEach(([sum, bases]) => {
            const activeBasesForSum = bases.filter(b => activeBases.includes(b));
            if (activeBasesForSum.length > 1) {
                groups.push({
                    sum: parseInt(sum),
                    count: activeBasesForSum.length,
                    bases: activeBasesForSum
                });
            }
        });
        
        // Sortuj po count malejąco (największe grupy jako pierwsze)
        return groups.sort((a, b) => b.count - a.count);
    });

    // Znajdź maksymalną liczbę grup w dowolnym dniu
    const maxGroups = Math.max(...dailyCorrelations.map(d => d.length), 1);

    // Utwórz datasety - od największych (z tyłu) do najmniejszych (z przodu)
    const datasets = [];
    for (let i = 0; i < maxGroups; i++) {
        const data = dailyCorrelations.map(groups => {
            return groups[i] ? groups[i].count : 0;
        });

        datasets.push({
            label: `Grupa korelacji ${i + 1}`,
            data: data,
            backgroundColor: CORRELATION_COLORS[i % CORRELATION_COLORS.length] + 'DD', // Przezroczystość
            borderColor: CORRELATION_COLORS[i % CORRELATION_COLORS.length],
            borderWidth: 2,
            order: maxGroups - i // Większy order = z tyłu, mniejszy = z przodu
        });
    }

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
                    position: 'top',
                    labels: {
                        boxWidth: 15,
                        generateLabels: function(chart) {
                            return chart.data.datasets.map((dataset, i) => ({
                                text: `Grupa ${i + 1} (od największej)`,
                                fillStyle: dataset.backgroundColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: dataset.borderWidth,
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                title: { display: false },
                tooltip: {
                    mode: 'index',
                    callbacks: {
                        title: function (context) { 
                            return `Data: ${context[0].label}`; 
                        },
                        label: function (context) {
                            const value = context.parsed.y;
                            if (value === 0) return null;
                            const dateIdx = context.dataIndex;
                            const groupIdx = context.datasetIndex;
                            const group = dailyCorrelations[dateIdx][groupIdx];
                            if (group) {
                                return `Suma ${group.sum}: ${group.count} BaseX (${group.bases.join(', ')})`;
                            }
                            return null;
                        },
                        footer: function(context) {
                            const date = context[0].label;
                            const details = getCorrelationDetails(date, dailyCorrelationData, activeBases);
                            return ['\nWszystkie korelacje:', ...details];
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
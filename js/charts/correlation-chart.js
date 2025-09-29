/* =================================================================
   WYKRES KORELACJI - Ile BaseX daje powtórzoną sumę
   ================================================================= */

import { getCorrelationDetails } from '../analyzer.js';

let chartInstanceCorrelation = null;

// Paleta kolorów dla różnych grup korelacji
const CORRELATION_COLORS = [
    '#e41a1c', // czerwony
    '#377eb8', // niebieski
    '#4daf4a', // zielony
    '#984ea3', // fioletowy
    '#ff7f00', // pomarańczowy
    '#ffff33', // żółty
    '#a65628', // brązowy
    '#f781bf', // różowy
    '#999999'  // szary
];

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

    // Zbierz wszystkie unikalne grupy korelacji
    let allCorrelationGroups = new Set();
    labels.forEach(date => {
        const counts = dailyCorrelationData[date].sumCounts;
        Object.entries(counts).forEach(([sum, bases]) => {
            const activeBasesForSum = bases.filter(b => activeBases.includes(b));
            if (activeBasesForSum.length > 1) {
                allCorrelationGroups.add(sum);
            }
        });
    });

    const correlationGroupsArray = Array.from(allCorrelationGroups).sort((a, b) => a - b);

    // Dataset dla każdej grupy korelacji
    const datasets = correlationGroupsArray.map((sum, idx) => {
        const data = labels.map(date => {
            const counts = dailyCorrelationData[date].sumCounts;
            if (counts[sum]) {
                const activeBasesForSum = counts[sum].filter(b => activeBases.includes(b));
                return activeBasesForSum.length > 1 ? activeBasesForSum.length : 0;
            }
            return 0;
        });

        return {
            label: `Korelacja na sumie ${sum}`,
            data: data,
            backgroundColor: CORRELATION_COLORS[idx % CORRELATION_COLORS.length],
            borderWidth: 0,
            stack: 'stack1'
        };
    });

    // Dataset dla niekorelujących BaseX (szary)
    const nonCorrelatingData = labels.map(date => {
        const counts = dailyCorrelationData[date].sumCounts;
        let correlatingCount = 0;
        
        Object.entries(counts).forEach(([sum, bases]) => {
            const activeBasesForSum = bases.filter(b => activeBases.includes(b));
            if (activeBasesForSum.length > 1) {
                correlatingCount += activeBasesForSum.length;
            }
        });
        
        return maxBases - correlatingCount;
    });

    datasets.push({
        label: 'Niekorelujące',
        data: nonCorrelatingData,
        backgroundColor: '#cccccc',
        borderWidth: 0,
        stack: 'stack1'
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
                    position: 'top',
                    labels: {
                        boxWidth: 15
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
                            return `${context.dataset.label}: ${value} BaseX`;
                        },
                        footer: function(context) {
                            const date = context[0].label;
                            const details = getCorrelationDetails(date, dailyCorrelationData, activeBases);
                            return ['\nSzczegóły:', ...details];
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
                    title: { display: true, text: `Liczba BaseX (max: ${maxBases})` },
                    stacked: true
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceCorrelation, labels)
        }
    });
}
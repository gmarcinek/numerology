/* =================================================================
   WYKRES LICZB MISTRZOWSKICH
   ================================================================= */

import { getMagicDetails } from '../analyzer.js';

let chartInstanceMagic = null;

/**
 * Rysuje wykres słupkowy liczb mistrzowskich
 * @param {Object} results - Wyniki analizy
 * @param {Array<string>} labels - Etykiety dat
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawMagicChart(results, labels, dailyCorrelationData, activeBases, onClickCallback) {
    let ctx = document.getElementById('magicChart').getContext('2d');
    const magicCounts = labels.map(date => Object.keys(dailyCorrelationData[date].magicSums).length);

    if (chartInstanceMagic) chartInstanceMagic.destroy();

    chartInstanceMagic = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Liczba BaseX z Liczbą Mistrzowską',
                data: magicCounts,
                backgroundColor: magicCounts.map(val => val > 0 ? '#ff7f00' : '#cccccc'),
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
                            const count = context.parsed.y;
                            return `Liczba BaseX z Liczbą Mistrzowską: ${count}`;
                        },
                        afterBody: function (context) {
                            const date = context[0].label;
                            return getMagicDetails(date, dailyCorrelationData, activeBases);
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
                    stepSize: 1,
                    title: { display: true, text: 'Liczba BaseX (Mistrzowskie)' }
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceMagic, labels)
        }
    });
}
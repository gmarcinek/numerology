// js/charts/base10-correlation-chart.js
/* =================================================================
   WYKRES KORELACJI Z BASE10 - Ile BaseX daje tę samą sumę co Base10
   ================================================================= */

import { getBase10CorrelationDetails } from '../analyzer.js';
import { baseColorMap } from '../config.js';

let chartInstanceBase10Correlation = null;

/**
 * Rysuje wykres korelacji z Base10
 * @param {Object} results - Wyniki analizy
 * @param {Array<string>} labels - Etykiety dat
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawBase10CorrelationChart(results, labels, dailyCorrelationData, activeBases, onClickCallback) {
    let ctx = document.getElementById('base10CorrelationChart').getContext('2d');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth < 768;
    // Sprawdź czy Base10 jest aktywna
    if (!activeBases.includes(10)) {
        console.warn('Base10 nie jest aktywna - wykres korelacji z Base10 wymaga Base10');
        if (chartInstanceBase10Correlation) chartInstanceBase10Correlation.destroy();
        return;
    }

    const maxBases = activeBases.length;
    const otherBases = activeBases.filter(b => b !== 10);

    // Dataset dla każdej BaseX (oprócz Base10)
    const datasets = otherBases.map(base => {
        const data = labels.map(date => {
            const base10Sum = results[10].find(r => r.date === date)?.sumBase10;
            const baseSum = results[base].find(r => r.date === date)?.sumBase10;
            return base10Sum === baseSum ? 1 : 0;
        });

        return {
            label: `Base ${base}`,
            data: data,
            backgroundColor: baseColorMap[base] || '#999',
            borderWidth: 0,
            stack: 'stack1'
        };
    });

    // Dataset dla niekorelujących (szary wypełniacz)
    const nonCorrelatingData = labels.map(date => {
        const base10Sum = results[10].find(r => r.date === date)?.sumBase10;
        let correlatingCount = 0;
        
        otherBases.forEach(base => {
            const baseSum = results[base].find(r => r.date === date)?.sumBase10;
            if (base10Sum === baseSum) {
                correlatingCount++;
            }
        });
        
        // Zwracamy różnicę: wszystkie bazy minus Base10 minus korelujące
        return maxBases - 1 - correlatingCount;
    });

    datasets.push({
        label: 'Niekorelujące z Base10',
        data: nonCorrelatingData,
        backgroundColor: '#cccccc',
        borderWidth: 0,
        stack: 'stack1'
    });

    if (chartInstanceBase10Correlation) chartInstanceBase10Correlation.destroy();

    chartInstanceBase10Correlation = new Chart(ctx, {
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
                    display: !isMobile,
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
                            return `${context.dataset.label}: ${value > 0 ? 'Koreluje' : ''}`;
                        },
                        footer: function(context) {
                            const date = context[0].label;
                            const details = getBase10CorrelationDetails(date, results, activeBases);
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
            onClick: (e) => onClickCallback(e, chartInstanceBase10Correlation, labels)
        }
    });
}
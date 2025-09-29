/* =================================================================
   WYKRESY - Renderowanie i Obsługa Chart.js
   ================================================================= */

import { CHART_DESCRIPTIONS, baseColorMap, magicSumColorMap } from './config.js';
import { MIN_BASE } from './config.js';
import { getCorrelationDetails, getNonCorrelationDetails, getMagicDetails } from './analyzer.js';

// Instancje wykresów (do niszczenia przy odświeżaniu)
let chartInstanceMain = null;
let chartInstanceMagic = null;
let chartInstanceCorrelation = null;

/**
 * Generuje kolor HSL dla systemu BaseX
 * @param {number} base - Numer bazy
 * @returns {string} - Kolor w formacie HSL
 */
function getBaseColor(base) {
    if (baseColorMap[base]) return baseColorMap[base];
    const index = base - MIN_BASE;
    const hue = (index * 137.5) % 360;
    const saturation = 65;
    const lightness = 45;
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    baseColorMap[base] = color;
    return color;
}

/**
 * Generuje kontrastujący kolor dla indeksu
 * @param {number} index - Indeks koloru
 * @returns {string} - Kolor w formacie HSL
 */
function getContrastingColor(index) {
    const hueStep = 26;
    const hue = (index * hueStep) % 360;
    const saturation = 70;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Pobiera/generuje kolor dla liczby mistrzowskiej
 * @param {string} sumStr - Reprezentacja sumy
 * @returns {string} - Kolor w formacie HSL
 */
function getColorForMagicSum(sumStr) {
    if (magicSumColorMap[sumStr]) {
        return magicSumColorMap[sumStr];
    }
    const newIndex = Object.keys(magicSumColorMap).length;
    const newColor = getContrastingColor(newIndex);
    magicSumColorMap[sumStr] = newColor;
    return newColor;
}

/**
 * Aktualizuje tytuły i podtytuły wykresów
 * @param {Array<number>} activeBases - Aktywne bazy
 */
export function updateSubtitles(activeBases) {
    const activeCount = activeBases.length;
    const baseRange = activeBases.length > 0 ? 
        `${activeBases[0]} do ${activeBases[activeBases.length - 1]}` : 'brak';

    document.getElementById('main-chart-title').textContent = CHART_DESCRIPTIONS.main.title;
    document.getElementById('main-chart-subtitle').textContent = 
        CHART_DESCRIPTIONS.main.subtitle(activeCount, baseRange);

    document.getElementById('correlation-chart-title').textContent = 
        'Korelacja vs Niekorelacja Sum Base10';
    document.getElementById('correlation-chart-subtitle').textContent = 
        `Wykres pokazuje zarówno korelację (ile BaseX daje tę samą sumę - niebieski) jak i niekorelację (ile BaseX daje unikalną sumę - czerwony). Maksymalna wartość to ${activeCount} aktywnych systemów.`;

    document.getElementById('magic-chart-title').textContent = CHART_DESCRIPTIONS.magic.title;
    document.getElementById('magic-chart-subtitle').textContent = 
        CHART_DESCRIPTIONS.magic.subtitle(activeCount);
}

/**
 * Rysuje główny wykres liniowy sum numerologicznych
 * @param {Object} results - Wyniki analizy
 * @param {Array<string>} labels - Etykiety dat
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawMainChart(results, labels, activeBases, onClickCallback) {
    let ctx = document.getElementById('mainChart').getContext('2d');
    let datasets = [];

    activeBases.forEach((base) => {
        let data = results[base].map(r => r.sumBase10);
        let pointRadius = results[base].map(r => r.magic ? 6 : 3);
        let pointBorderWidth = results[base].map(r => r.magic ? 2 : 0);
        let color = getBaseColor(base);

        datasets.push({
            label: `Base ${base}`,
            data: data,
            borderColor: color,
            backgroundColor: color,
            pointRadius: pointRadius,
            pointHoverRadius: 8,
            pointBackgroundColor: color,
            pointBorderColor: '#000',
            pointBorderWidth: pointBorderWidth,
            showLine: true,
            fill: false,
            tension: 0.1,
            hidden: false
        });
    });

    if (chartInstanceMain) chartInstanceMain.destroy();

    chartInstanceMain = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        title: function (context) { 
                            return `Data: ${context[0].label}`; 
                        },
                        label: function (context) {
                            let base = parseInt(context.dataset.label.replace('Base ', ''));
                            let idx = context.dataIndex;
                            let meta = results[base]?.[idx];
                            if (!meta) return '';

                            return [
                                `Base ${base} (Suma Base10): ${meta.sumBase10}`,
                                `Suma Base${base}: ${meta.sumStr}`,
                                meta.magic ? 'Liczba Mistrzowska! 🎉' : ''
                            ].filter(Boolean);
                        },
                        afterLabel: function (context) {
                            let base = parseInt(context.dataset.label.replace('Base ', ''));
                            let idx = context.dataIndex;
                            let meta = results[base]?.[idx];
                            if (!meta) return '';
                            return `Zapis daty Base${base}: ${meta.fullDateStr}`;
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
                    title: { display: true, text: 'Suma Wartości Cyfr (Base10)' } 
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceMain, labels)
        }
    });
}

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

// Eksport funkcji dla drawNonCorrelationChart (teraz nieużywana, ale zostawiam dla kompatybilności)
export function drawNonCorrelationChart() {
    // Ta funkcja jest teraz nieużywana - korelacja i niekorelacja są w jednym wykresie
}
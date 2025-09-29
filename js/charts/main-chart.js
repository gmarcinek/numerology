/* =================================================================
   GŁÓWNY WYKRES - Sumy Numerologiczne dla BaseX
   ================================================================= */

import { baseColorMap } from '../config.js';
import { MIN_BASE } from '../config.js';

let chartInstanceMain = null;

/**
 * Generuje kolor HSL dla systemu BaseX
 * @param {number} base - Numer bazy
 * @returns {string} - Kolor w formacie HSL
 */
function getBaseColor(base) {
    if (baseColorMap[base]) return baseColorMap[base];
    
    const index = base - MIN_BASE;
    
    // Użyj predefiniowanych kolorów, jeśli są dostępne
    if (index < BASE_COLORS.length) {
        const color = BASE_COLORS[index];
        baseColorMap[base] = color;
        return color;
    }
    
    // Fallback dla baz powyżej 16
    const hue = (index * 137.5) % 360;
    const saturation = 65;
    const lightness = 45;
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    baseColorMap[base] = color;
    return color;
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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth < 768;

    activeBases.forEach((base) => {
        let data = results[base].map(r => r.sumBase10);
        let pointRadius = results[base].map(r => r.magic ? 6 : 1);
        let pointBorderWidth = results[base].map(r => r.magic ? 1 : 0);
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
                legend: { 
                    position: 'top',
                    display: !isMobile,
                },
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
/* =================================================================
   WYKRES KORELACJI ARCHETYPÓW - Ile BaseX współdzieli ten sam archetyp
   ================================================================= */

import { reduceToArchetype } from '../numerology.js';

let chartInstanceCorrelation = null;

// Paleta kolorów dla różnych grup korelacji
const CORRELATION_COLORS = [
    '#ff171bff', // czerwony
    '#ff008cff', // niebieski
    '#e8ee26ff', // zielony
    '#2d6240ff', // fioletowy
    '#ff8800ff', // pomarańczowy
    '#33ffc2ff', // żółty
    '#a65628', // brązowy
    '#b77af4ff', // różowy
    '#999999'  // szary
];

/**
 * Rysuje wykres korelacji archetypów - ile BaseX uczestniczy we wspólnym archetypie
 * @param {Array<string>} labels - Etykiety dat
 * @param {Object} dailyCorrelationData - Dane korelacji (z polami .sumCounts)
 * @param {Array<number>} activeBases - Aktywne bazy
 * @param {Function} onClickCallback - Callback po kliknięciu w wykres
 */
export function drawCorrelationChart(labels, dailyCorrelationData, activeBases, onClickCallback) {
    const ctx = document.getElementById('correlationChart').getContext('2d');
    const maxBases = activeBases.length;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth < 768;

    // Zbierz wszystkie unikalne archetypy, które kiedykolwiek mają grupę >= 2 aktywnych baz
    const allArchetypeGroups = new Set();

    // Per-data: z sumCounts -> archetypeCounts (archetyp -> [bazy])
    const archetypeCountsByDate = {};
    for (const date of labels) {
        const counts = dailyCorrelationData[date]?.sumCounts || {};
        const archetypeCounts = {}; // { archetyp: number[] (bazy) }

        for (const [sumStr, bases] of Object.entries(counts)) {
            // sumStr to klucz obliczeń sum (w Base10). Zredukuj do archetypu (digital root z masterami).
            const sumNum = Number(sumStr);
            const arche = String(reduceToArchetype(sumNum));

            // uwzględnij tylko aktywne bazy
            const activeForThisSum = bases.filter(b => activeBases.includes(b));
            if (activeForThisSum.length === 0) continue;

            if (!archetypeCounts[arche]) archetypeCounts[arche] = [];
            archetypeCounts[arche].push(...activeForThisSum);
        }

        // deduplikacja baz w ramach archetypu
        for (const k of Object.keys(archetypeCounts)) {
            archetypeCounts[k] = [...new Set(archetypeCounts[k])];
            if (archetypeCounts[k].length > 1) {
                allArchetypeGroups.add(k);
            }
        }

        archetypeCountsByDate[date] = archetypeCounts;
    }

    // Posortuj archetypy: najpierw liczby mistrzowskie (11,22,33...), potem 1–9
    const correlationGroupsArray = Array.from(allArchetypeGroups).sort((a, b) => {
        const aNum = Number(a), bNum = Number(b);
        const aIsMaster = Number.isInteger(aNum) && aNum > 9;
        const bIsMaster = Number.isInteger(bNum) && bNum > 9;
        if (aIsMaster && !bIsMaster) return -1;
        if (!aIsMaster && bIsMaster) return 1;
        // w pozostałych przypadkach sortuj numerycznie / leksykalnie
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return String(a).localeCompare(String(b));
    });

    // Dataset dla każdej grupy archetypu
    const datasets = correlationGroupsArray.map((arche, idx) => {
        const data = labels.map(date => {
            const group = archetypeCountsByDate[date]?.[arche] || [];
            return group.length > 1 ? group.length : 0;
        });

        return {
            label: `Korelacja na archetypie ${arche}`,
            data,
            backgroundColor: CORRELATION_COLORS[idx % CORRELATION_COLORS.length],
            borderWidth: 0,
            stack: 'stack1'
        };
    });

    // Dataset dla niekorelujących (bazy, które nie należą do żadnej grupy archetypu >= 2)
    const nonCorrelatingData = labels.map(date => {
        let correlatingCount = 0;
        const archeCounts = archetypeCountsByDate[date] || {};
        for (const bases of Object.values(archeCounts)) {
            if (bases.length > 1) correlatingCount += bases.length;
        }
        return maxBases - correlatingCount;
    });

    datasets.push({
        label: 'Niekorelujące (inne archetypy lub singlety)',
        data: nonCorrelatingData,
        backgroundColor: '#cccccc',
        borderWidth: 0,
        stack: 'stack1'
    });

    if (chartInstanceCorrelation) chartInstanceCorrelation.destroy();

    chartInstanceCorrelation = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: !isMobile,
                    position: 'top',
                    labels: { boxWidth: 15 }
                },
                title: { display: false },
                tooltip: {
                    mode: 'index',
                    callbacks: {
                        title: (context) => `Data: ${context[0].label}`,
                        label: (context) => {
                            const v = context.parsed.y;
                            if (v === 0) return null;
                            return `${context.dataset.label}: ${v} BaseX`;
                        },
                        footer: (context) => {
                            const date = context[0].label;
                            const archeCounts = archetypeCountsByDate[date] || {};
                            const lines = ['\nSzczegóły:'];
                            for (const arche of correlationGroupsArray) {
                                const group = archeCounts[arche] || [];
                                if (group.length > 1) {
                                    lines.push(`Archetyp ${arche}: Base ${group.join(', ')}`);
                                }
                            }
                            if (lines.length === 1) lines.push('(brak grup > 1)');
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    display: true,
                    title: { display: true, text: 'Data' },
                    ticks: { display: true },
                    stacked: true
                },
                y: {
                    beginAtZero: true,
                    max: maxBases,
                    ticks: { stepSize: 1 },
                    title: { display: true, text: `Liczba BaseX (max: ${maxBases})` },
                    stacked: true
                }
            },
            onClick: (e) => onClickCallback(e, chartInstanceCorrelation, labels)
        }
    });
}

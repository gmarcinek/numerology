/* =================================================================
   ANALIZA DAT - Obliczenia Numerologiczne i Korelacje
   ================================================================= */

import { toBaseStr, sumDigitsBase, isMagicNumber, getDatesInRange } from './numerology.js';

/**
 * Analizuje daty w zakresie dla wszystkich aktywnych systemów BaseX
 * @param {string} dateFrom - Data początkowa (YYYY-MM-DD)
 * @param {string} dateTo - Data końcowa (YYYY-MM-DD)
 * @param {Array<number>} activeBases - Tablica aktywnych baz (np. [2, 10, 16])
 * @returns {Object} - { results, dateLabels, dailyCorrelationData }
 */
export function analyzeDates(dateFrom, dateTo, activeBases) {
    const dateLabels = getDatesInRange(dateFrom, dateTo);
    let results = {};
    let dailyCorrelationData = {};

    for (let base of activeBases) {
        let baseResults = [];
        
        for (let dateStr of dateLabels) {
            let d = new Date(dateStr + 'T00:00:00');
            let year = d.getFullYear();
            let month = d.getMonth() + 1;
            let day = d.getDate();

            let dayStr = toBaseStr(day, base);
            let monthStr = toBaseStr(month, base);
            let yearStr = toBaseStr(year, base);

            let baseDate = `${dayStr.padStart(2, '0')}.${monthStr.padStart(2, '0')}.${yearStr.padStart(4, '0')}`;
            let fullDateStr = dayStr.padStart(2, '0') + monthStr.padStart(2, '0') + yearStr.padStart(4, '0');

            let sumBase10 = sumDigitsBase(fullDateStr, base);
            let sumStr = toBaseStr(sumBase10, base);
            let magic = isMagicNumber(sumStr);

            // Inicjalizacja struktury dla dnia
            if (!dailyCorrelationData[dateStr]) {
                dailyCorrelationData[dateStr] = {
                    sumCounts: {},
                    magicSums: {},
                    uniqueSums: new Set(),
                    nonCorrelatingCount: 0,
                    nonCorrelatingBases: []
                };
            }

            // Korelacja - zliczanie sum Base10
            if (!dailyCorrelationData[dateStr].sumCounts[sumBase10]) {
                dailyCorrelationData[dateStr].sumCounts[sumBase10] = [];
            }
            dailyCorrelationData[dateStr].sumCounts[sumBase10].push(base);

            // Liczby Mistrzowskie
            if (magic) {
                if (!dailyCorrelationData[dateStr].magicSums[sumStr]) {
                    dailyCorrelationData[dateStr].magicSums[sumStr] = {};
                }
                dailyCorrelationData[dateStr].magicSums[sumStr][base] = 1;
            }

            baseResults.push({
                date: dateStr,
                baseDate,
                fullDateStr,
                sumBase10,
                sumStr,
                magic
            });
        }
        results[base] = baseResults;
    }

    return { results, dateLabels, dailyCorrelationData };
}

/**
 * Pobiera szczegóły korelacji dla konkretnej daty
 * @param {string} dateStr - Data (YYYY-MM-DD)
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @param {Array<number>} activeBases - Aktywne bazy
 * @returns {Array<string>} - Tablica opisów korelacji
 */
export function getCorrelationDetails(dateStr, dailyCorrelationData, activeBases) {
    const sumCounts = dailyCorrelationData[dateStr].sumCounts;
    let details = [];

    const correlatedSums = Object.entries(sumCounts)
        .filter(([, bases]) => bases.filter(b => activeBases.includes(b)).length > 1)
        .map(([sum, bases]) => ({ sum: parseInt(sum), bases }));

    correlatedSums.sort((a, b) => a.sum - b.sum);

    if (correlatedSums.length === 0) {
        return ['Brak korelacji sum Base10 w aktywnych bazach.'];
    }

    details.push('Szczegóły Korelacji Sum Base10:');
    let foundCorrelation = false;
    
    correlatedSums.forEach(item => {
        const activeCorrelatedBases = item.bases.filter(b => activeBases.includes(b));
        if (activeCorrelatedBases.length > 1) {
            details.push(` - Suma ${item.sum} (Powtórzenie ${activeCorrelatedBases.length}x)`);
            details.push(`   w Base: ${activeCorrelatedBases.join(', ')}`);
            foundCorrelation = true;
        }
    });

    if (!foundCorrelation) return ['Brak korelacji sum Base10 w aktywnych bazach.'];
    return details;
}

/**
 * Pobiera szczegóły niekorelacji dla konkretnej daty
 * @param {string} dateStr - Data (YYYY-MM-DD)
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @returns {Array<string>} - Tablica opisów niekorelacji
 */
export function getNonCorrelationDetails(dateStr, dailyCorrelationData) {
    const data = dailyCorrelationData[dateStr];
    const sumCounts = data.sumCounts;
    
    const nonCorrelatingBases = [];
    Object.entries(sumCounts).forEach(([sum, bases]) => {
        if (bases.length === 1) {
            nonCorrelatingBases.push(bases[0]);
        }
    });

    if (nonCorrelatingBases.length === 0) {
        return ['Brak BaseX z unikalną sumą Base10 (wszystkie korelują z inną aktywną BaseX).'];
    }

    return [
        'Bazy z unikalną sumą Base10 (nie korelują z innymi aktywnymi bazami):',
        `  ${nonCorrelatingBases.sort((a, b) => a - b).join(', ')}`
    ];
}

/**
 * Pobiera szczegóły liczb mistrzowskich dla konkretnej daty
 * @param {string} dateStr - Data (YYYY-MM-DD)
 * @param {Object} dailyCorrelationData - Dane korelacji
 * @param {Array<number>} activeBases - Aktywne bazy
 * @returns {Array<string>} - Tablica opisów liczb mistrzowskich
 */
export function getMagicDetails(dateStr, dailyCorrelationData, activeBases) {
    const data = dailyCorrelationData[dateStr];
    let details = [];

    const magicSums = Object.entries(data.magicSums);

    if (magicSums.length === 0) {
        return ['Brak Liczb Mistrzowskich w aktywnych BaseX.'];
    }

    details.push('Liczby Mistrzowskie w aktywnych BaseX:');
    magicSums.forEach(([sumStr, bases]) => {
        const activeBasesList = Object.keys(bases).map(Number).filter(b => activeBases.includes(b));
        if (activeBasesList.length > 0) {
            details.push(` - ${sumStr} (Base${sumStr.length * 11 === parseInt(sumStr, 10) ? '11/22' : 'X'}): w Base ${activeBasesList.join(', ')}`);
        }
    });
    return details;
}

/**
 * Pobiera szczegóły korelacji z Base10 dla konkretnej daty
 * @param {string} dateStr - Data (YYYY-MM-DD)
 * @param {Object} results - Wyniki analizy
 * @param {Array<number>} activeBases - Aktywne bazy
 * @returns {Array<string>} - Tablica opisów korelacji z Base10
 */
export function getBase10CorrelationDetails(dateStr, results, activeBases) {
    if (!activeBases.includes(10)) {
        return ['Base10 nie jest aktywna.'];
    }

    const base10Sum = results[10].find(r => r.date === dateStr)?.sumBase10;
    const correlatingBases = [];

    activeBases.forEach(base => {
        if (base === 10) return;
        const baseSum = results[base].find(r => r.date === dateStr)?.sumBase10;
        if (baseSum === base10Sum) {
            correlatingBases.push(base);
        }
    });

    if (correlatingBases.length === 0) {
        return ['Brak korelacji z Base10.', `Suma Base10: ${base10Sum}`];
    }

    return [
        `Suma Base10: ${base10Sum}`,
        `Korelujące BaseX (${correlatingBases.length}):`,
        `  ${correlatingBases.join(', ')}`
    ];
}
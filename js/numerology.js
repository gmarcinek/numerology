/* =================================================================
   LOGIKA NUMEROLOGICZNA - Konwersje BaseX i Operacje
   ================================================================= */

import { MIN_BASE, MAX_BASE, CUSTOM_DIGITS } from './config.js';

/**
 * Konwertuje liczbę dziesiętną na reprezentację w systemie BaseX
 * @param {number} num - Liczba do konwersji
 * @param {number} base - Docelowy system liczbowy (2-16)
 * @returns {string} - Reprezentacja liczby w systemie BaseX
 */
export function toBaseStr(num, base) {
    if (base < 2 || base > MAX_BASE) {
        throw new Error(`Baza ${base} jest poza wspieranym zakresem (2-${MAX_BASE}).`);
    }

    if (base <= 36) {
        return num.toString(base).toUpperCase();
    }

    let result = '';
    let n = num;

    if (n === 0) return '0';

    while (n > 0) {
        result = CUSTOM_DIGITS[n % base] + result;
        n = Math.floor(n / base);
    }
    return result;
}

/**
 * Sumuje cyfry liczby zapisanej w systemie BaseX, zwracając wartość dziesiętną
 * @param {string} str - Reprezentacja liczby w BaseX
 * @param {number} base - System liczbowy
 * @returns {number} - Suma cyfr jako liczba dziesiętna
 */
export function sumDigitsBase(str, base) {
    if (base < 2 || base > MAX_BASE) return 0;

    let sum = 0;

    for (const char of str) {
        const val = CUSTOM_DIGITS.indexOf(char);
        if (val === -1) {
            sum += parseInt(char, base) || 0;
        } else {
            sum += val;
        }
    }
    return sum;
}

/**
 * Sprawdza czy string składa się tylko z jednego powtarzanego znaku
 * (np. "11", "222", "AAA", "@@@")
 * @param {string} str - reprezentacja liczby
 * @returns {boolean}
 */
export function isMasterPattern(str) {
    const uniqueChars = new Set(str.split(''));
    return uniqueChars.size === 1 && str.length > 1;
}

/**
 * Redukuje liczbę do archetypu:
 * - jeśli master pattern (np. 11, 22, 333, AAA, BBB, @@@) → zostaje
 * - w przeciwnym razie redukujemy sumę cyfr aż do 1–9
 * @param {number} num - suma w Base10
 * @returns {number|string} - archetyp (np. 1–9 lub master number)
 */
export function reduceToArchetype(num) {
    let n = num;

    while (true) {
        const str = n.toString();
        if (isMasterPattern(str)) {
            return str; // np. "11", "111", "AAA"
        }
        if (n < 10) {
            return n; // 1–9
        }
        n = str.split('').reduce((a, b) => a + parseInt(b, 10), 0);
    }
}

/**
 * Generuje tablicę dat w formacie YYYY-MM-DD w zakresie
 * @param {string} start - Data początkowa (YYYY-MM-DD)
 * @param {string} end - Data końcowa (YYYY-MM-DD)
 * @returns {Array<string>} - Tablica dat
 */
export function getDatesInRange(start, end) {
    let dates = [];
    let d = new Date(start + 'T00:00:00');
    let endDate = new Date(end + 'T00:00:00');
    
    while (d <= endDate) {
        dates.push(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
    }
    return dates;
}

/**
 * Redukuje zapis sumy w systemie BaseX do archetypu.
 * - jeśli master pattern (np. "AA", "111", "@@@") → zostaje
 * - w przeciwnym razie sumuje znaki (wg wartości w danej bazie) aż do 1-cyfrowej
 * @param {string} str - reprezentacja sumy w BaseX
 * @param {number} base - system liczbowy
 * @returns {string|number} - archetyp w danej bazie
 */
export function reduceToArchetypeBaseX(str, base) {
    let current = str;

    while (true) {
        if (isMasterPattern(current)) {
            return current; // master w bazie (np. "AA", "111")
        }

        // zamień każdy znak na wartość liczbową w tej bazie i zsumuj
        let sum = 0;
        for (const char of current) {
            const val = CUSTOM_DIGITS.indexOf(char);
            if (val >= 0 && val < base) {
                sum += val;
            }
        }

        // jeśli pojedyncza cyfra → zwracamy w danej bazie
        if (sum < base) {
            return toBaseStr(sum, base);
        }

        // inaczej konwertujemy sum z powrotem do baseX i redukujemy dalej
        current = toBaseStr(sum, base);
    }
}
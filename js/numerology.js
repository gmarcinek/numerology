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
 * Sprawdza czy liczba jest "Liczbą Mistrzowską" (wszystkie cyfry identyczne)
 * @param {string} str - Reprezentacja liczby
 * @returns {boolean} - True jeśli to liczba mistrzowska
 */
export function isMagicNumber(str) {
    return str.length > 1 && new RegExp(`^([${CUSTOM_DIGITS.slice(0, 40)}])\\1+$`).test(str);
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
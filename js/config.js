/* =================================================================
   KONFIGURACJA GLOBALNA - Stałe i Słowniki
   ================================================================= */

// Zakres obsługiwanych systemów liczbowych
export const MIN_BASE = 2;
export const MAX_BASE = 16;

// Tablica wszystkich dostępnych baz
export const ALL_BASES = Array.from(
    { length: MAX_BASE - MIN_BASE + 1 }, 
    (_, i) => i + MIN_BASE
);

// Zestaw symboli dla baz 2-40 (0-9, A-Z, @, #, $, £)
export const CUSTOM_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$£';

// Mapowania kolorów (inicjalizowane jako puste obiekty)
export const baseColorMap = {};
export const magicSumColorMap = {};
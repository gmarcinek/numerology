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
export const baseColorMap = {
    1: '#e41a1c', // czerwony // czerwony
    2: '#377eb8', // niebieski // niebieski
    3: '#70bb6eff', // zielony // zielony
    4: '#984ea3', // fioletowy // fioletowy
    5: '#ff7f00', // pomarańczowy // pomarańczowy
    6: '#ffff33', // żółty // żółty
    7: '#a65628', // brązowy // brązowy
    8: '#f781bf', // różowy // różowy
    9: '#ff004cff',  // szary // szary
    10: '#01bde7ff', // turkusowy
    11: '#0681cdff', // łososiowy
    12: '#c25d9dff', // jasnoniebieski
    13: '#865266ff', // jasnoróżowy
    14: '#7dcb00ff', // limonkowy
    15: '#ffd726',  // złoty
    16: '#c26f79ff',  // purp
    17: '#f05cc4ff',  // fuksja
};
export const magicSumColorMap = {};
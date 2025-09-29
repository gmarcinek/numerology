/* =================================================================
   OPISY WYKRESÓW - Teksty i Metadane
   ================================================================= */

export const CHART_DESCRIPTIONS = {
    main: {
        title: "Wykres Sumy Numerologicznej (Base10) dla Różnych Systemów Liczbowych od Base2 do Base40",
        subtitle: (count, range) => 
            `Pokazuje, jaką jedną liczbę (Suma Base10) otrzymujemy, sumując wszystkie cyfry daty zapisanej w różnych systemach liczbowych (BaseX). Każda linia to inny system pozycyjny. Grube punkty oznaczają Liczby Mistrzowskie.`
    },
    correlation: {
        title: "Korelacja: Jak często sumy cyfr w dniach przeliczone na system dziesiętny się powtarzają?",
        subtitle: (count) => 
            `Wykres słupkowy mierzy, ile maksymalnie aktywnych systemów liczbowych daje tę samą Sumę przeliczoną na Base10 w danym dniu. Wysoki słupek oznacza silną korelację (wiele BaseX prowadzi do tej samej liczby).`
    },
    nonCorrelation: {
        title: "NIEKORELACJA: Liczba unikalnych Sum Base10",
        subtitle: (count) => 
            `Wykres mierzy, ile aktywnych systemów liczbowych ma w danym dniu zupełnie unikalną sumę dni przeliczoną na system dziesiętny. Wysoki punkt oznacza silną niekorelację (różnorodność wyników), czyli dzień, w którym różne BaseX prowadzą do różnych wyników.`
    },
    magic: {
        title: "Wystąpienia Liczb Mistrzowskich (np. 11, 22, AA, BB)",
        subtitle: (count) => 
            `Wykres słupkowy pokazuje, w ilu aktywnych BaseX w danym dniu data prowadzi do Liczby Mistrzowskiej (sumy składającej się z identycznych, powtarzających się cyfr po przeliczeniu na system BaseX).`
    }
};
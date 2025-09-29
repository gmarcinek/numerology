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
        title: "Korelacja Sum Numerologicznych: Ile sum powtarza się?",
        subtitle: (count) => 
            `Wykres pokazuje, ile z ${count} aktywnych systemów liczbowych daje w danym dniu sumę normalizowaną do Base10, która powtarza się w innym systemie. Im wyższy słupek, tym większa jest korelacja pomiędzy różnymi systemami pozycyjnymi i tym bardziej wiarygodna jest numerologia. Maksymalna wartość: ${count} BaseX.`
    },
    magic: {
        title: "Wystąpienia Liczb Mistrzowskich (np. 11, 22, AA, BB)",
        subtitle: (count) => 
            `Wykres słupkowy pokazuje, w ilu aktywnych BaseX w danym dniu data prowadzi do Liczby Mistrzowskiej (sumy składającej się z identycznych, powtarzających się cyfr po przeliczeniu na system BaseX).`
    }
};
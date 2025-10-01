/* =================================================================
   OPISY WYKRESÓW - Teksty i Metadane
   ================================================================= */

export const CHART_DESCRIPTIONS = {
    main: {
        title: "Wykres Sumy Numerologicznej (Base10) dla Różnych Systemów Liczbowych od Base2 do Base16",
        subtitle: (count, range) => 
            `Pokazuje, jaką jedną liczbę (Suma Base10) otrzymujemy, sumując wszystkie cyfry daty zapisanej w różnych systemach liczbowych (BaseX). Każda linia to inny system pozycyjny. Grube punkty oznaczają Liczby Mistrzowskie.`
    },
    correlation: {
        title: "Korelacje archetypów: Ile systemów dzieli ten sam archetyp tego samego dnia?",
        subtitle: (count) =>
            `Wykres pokazuje z ilu z ${count} aktywnych baz tworzą się grupy współdzielące identyczny archetyp (digital root / liczby mistrzowskie) w danym dniu. 
            Kolorowe segmenty = osobne grupy archetypów (każda to inny archetyp), szary = bazy bez par (singlety) lub z innym archetypem.`
    },
    magic: {
        title: "Wystąpienia Liczb Mistrzowskich (np. 11, 22, AA, BB)",
        subtitle: (count) => 
            `Wykres słupkowy pokazuje, w ilu aktywnych BaseX w danym dniu data prowadzi do Liczby Mistrzowskiej (sumy składającej się z identycznych, powtarzających się cyfr po przeliczeniu na system BaseX).`
    },
    base10Correlation: {
        title: "Korelacja archetypów z Base10: Ile systemów dzieli ten sam Archetyp co domyślny system ludzkości Base10?",
        subtitle: (count) =>
            `Wykres pokazuje, ile z ${count} aktywnych systemów liczbowych ma w danym dniu archetyp identyczny z Base10. 
            Kolorowe segmenty = bazy o tym samym archetypie co Base10, szary = inne archetypy. 
            Uwaga: w bazach powyżej 10 mogą pojawiać się archetypy A–F, które nigdy nie mają odpowiednika w Base10.`
    },
    archetype: {
        title: "Archetypy numerologiczne",
        subtitle: (activeCount) => 
        `Redukcja sum BaseX do archetypu (1–9 albo liczby mistrzowskie). Analiza dla ${activeCount} aktywnych baz.`
    }
};
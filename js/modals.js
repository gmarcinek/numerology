/* =================================================================
   MODALE - Obsługa Okien Dialogowych
   ================================================================= */

import { MIN_BASE, MAX_BASE } from './config.js';
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth < 768;
/**
 * Otwiera modal ustawień BaseX
 * @param {Array<number>} activeBases - Aktualnie aktywne bazy
 */
export function openSettingsModal(activeBases) {
    document.getElementById('settings-modal').style.display = 'block';
    if (document.getElementById('base-settings').children.length === 0) {
        populateBaseSettings();
    }
    updateSettingsState(activeBases);
}

/**
 * Zamyka modal ustawień BaseX
 */
export function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

/**
 * Zamyka drawer szczegółów
 */
export function closeDetailsModal() {
    const backdrop = document.getElementById('details-backdrop');
    const drawer = document.getElementById('details-drawer');
    
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    
    setTimeout(() => {
        backdrop.style.display = 'none';
    }, 300);
}

/**
 * Otwiera drawer szczegółów dla konkretnej daty
 * @param {string} date - Data (YYYY-MM-DD)
 * @param {Object} allResults - Wszystkie wyniki analizy
 * @param {Array<number>} activeBases - Aktywne bazy
 */
export function openDetailsModal(date, allResults, activeBases) {
    document.getElementById('details-date').textContent = `Szczegóły dla: ${date}`;
    const detailsContent = document.getElementById('details-content');
    detailsContent.innerHTML = '';

    const data = getDetailsForDate(date, allResults, activeBases);
    populateDetailsTable(detailsContent, data);

    const backdrop = document.getElementById('details-backdrop');
    const drawer = document.getElementById('details-drawer');
    
    backdrop.style.display = 'block';
    
    requestAnimationFrame(() => {
        backdrop.classList.add('open');
        drawer.classList.add('open');
    });
}

/**
 * Pobiera szczegóły dla konkretnej daty
 * @param {string} date - Data (YYYY-MM-DD)
 * @param {Object} allResults - Wszystkie wyniki analizy
 * @param {Array<number>} activeBases - Aktywne bazy
 * @returns {Array<Object>} - Tablica obiektów ze szczegółami
 */
function getDetailsForDate(date, allResults, activeBases) {
    let details = [];
    activeBases.forEach(base => {
        const result = allResults[base].find(r => r.date === date);
        if (result) {
            details.push({
                base: base,
                sumBase10: result.sumBase10,
                sumBaseX: result.sumStr,
                baseDate: result.baseDate,
                fullDateStr: result.fullDateStr,
                magic: result.magic ? 'TAK 🎉' : 'NIE'
            });
        }
    });
    return details;
}

/**
 * Wypełnia tabelę szczegółów danymi
 * @param {HTMLElement} container - Kontener na tabelę
 * @param {Array<Object>} data - Dane do wyświetlenia
 */
function populateDetailsTable(container, data) {
    const table = document.createElement('table');
    table.className = 'details-table';

    table.innerHTML = `
        <thead>
            <tr>
                <th>System Pozycyjny</th>
                <th>Zapis Daty</th>
                <th>BaseX &sum;</th>
                <th>Normal &sum;</th>
                ${!isMobile ? '<th>Mistrzowska?</th>' : ""}
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    data.forEach(item => {
        const row = tbody.insertRow();
        row.className = item.magic === 'TAK 🎉' ? 'correlated' : '';
        row.innerHTML = `
            <td>Base ${item.base}</td>
            <td>${item.baseDate}<sub>${item.base}</sub></td>
            <td>${item.sumBaseX}<sub>${item.base}</sub></td>
            <td>${item.sumBase10}<sub>10</sub></td>
            ${!isMobile ? `<td>${item.magic}</td>` : ""}
            
        `;
    });

    container.appendChild(table);
}

/**
 * Wypełnia sekcję ustawień BaseX checkboxami
 */
function populateBaseSettings() {
    const container = document.getElementById('base-settings');
    container.innerHTML = '';
    for (let i = MIN_BASE; i <= MAX_BASE; i++) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" data-base="${i}"> Base ${i}`;
        container.appendChild(label);
    }
}

/**
 * Aktualizuje stan checkboxów w ustawieniach
 * @param {Array<number>} activeBases - Aktualnie aktywne bazy
 */
function updateSettingsState(activeBases) {
    const checkboxes = document.querySelectorAll('#base-settings input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const base = parseInt(checkbox.dataset.base);
        checkbox.checked = activeBases.includes(base);
    });
}

/**
 * Zaznacza/odznacza wszystkie bazy
 * @param {boolean} check - True = zaznacz, False = odznacz
 */
export function toggleAllBases(check) {
    const checkboxes = document.querySelectorAll('#base-settings input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = check;
    });
}

/**
 * Pobiera aktualnie wybrane bazy z checkboxów
 * @returns {Array<number>} - Tablica wybranych baz
 */
export function getSelectedBases() {
    const checkboxes = document.querySelectorAll('#base-settings input[type="checkbox"]');
    let selectedBases = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedBases.push(parseInt(checkbox.dataset.base));
        }
    });
    return selectedBases.sort((a, b) => a - b);
}

/**
 * Obsługuje kliknięcia poza modalem (zamykanie)
 */
export function setupModalCloseHandlers() {
    window.onclick = function (event) {
        if (event.target == document.getElementById('settings-modal')) {
            closeSettingsModal();
        } else if (event.target == document.getElementById('explanation-backdrop')) {
            closeExplanationDrawer();
        } else if (event.target == document.getElementById('details-backdrop')) {
            closeDetailsModal();
        }
    }
}
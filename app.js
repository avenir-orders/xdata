function getPasqua(anno) {
    const a = anno % 19, b = Math.floor(anno / 100), c = anno % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), n = h + l - 7 * m + 114;
    const mese = Math.floor(n / 31), giorno = (n % 31) + 1;
    const p = new Date(anno, mese - 1, giorno);
    const lund = new Date(p); lund.setDate(p.getDate() + 1);
    return { pasqua: p.toDateString(), pasquetta: lund.toDateString() };
}

function isFestivo(data) {
if (data.getDay() === 0 || data.getDay() === 6) return true;
    const day = data.getDate(), month = data.getMonth() + 1;
    const festiviFissi = ["1-1", "6-1", "25-4", "1-5", "2-6", "15-8", "1-11", "8-12", "25-12", "26-12"];
    if (festiviFissi.includes(`${day}-${month}`)) return true;
    const { pasqua, pasquetta } = getPasqua(data.getFullYear());
    return data.toDateString() === pasqua || data.toDateString() === pasquetta;
}

const oraAttuale = new Date();
const domani = new Date(oraAttuale); domani.setDate(oraAttuale.getDate() + 1);
const isWeekendDomani = isFestivo(domani);

function bloccaNonNumerici(e) {
    const allowed = ['0','1','2','3','4','5','6','7','8','9','.',',','/','+','Backspace','Tab','Delete','ArrowLeft','ArrowRight'];
    if (!allowed.includes(e.key)) { e.preventDefault(); }
}

function trasformaECalcola(input, soglia, index) {
    let rawVal = input.value.trim().replace(',', '.');
    if (rawVal === "") return;
    let calcolato;
    try {
        if (rawVal === "1/3") calcolato = 0.3;
        else if (rawVal === "1/2") calcolato = 0.5;
        else if (rawVal === "2/3") calcolato = 0.7;
        else if (rawVal === "1/4") calcolato = 0.25;
        else { calcolato = eval(rawVal); }
    } catch (e) { calcolato = NaN; }
    if (!isNaN(calcolato)) { input.value = Math.round(calcolato * 100) / 100; }
    valuta(index, soglia);
}

function estraiNumeroIntelligente(t) {
    if (!t) return NaN;
    t = t.toString().toLowerCase().trim().replace(',', '.');
    try { return eval(t); } catch(e) { return parseFloat(t); }
}

function filtraLista() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    const p = document.getElementById('pizzeria').value;

    if (p === "TUTTE") {
        // --- LOGICA PER IL TABELLONE "TUTTE" ---
        const righe = document.querySelectorAll('.tabella-tutte tbody tr');
        const contenitoriCat = document.querySelectorAll('.container-cat-tutte');

        // Mostra/Nasconde le singole righe della tabella
        righe.forEach(riga => {
            const nomeArticolo = riga.querySelector('.td-nome').innerText.toLowerCase();
            if (q === "" || nomeArticolo.includes(q)) {
                riga.style.display = ""; // Mostra
            } else {
                riga.style.display = "none"; // Nasconde
            }
        });

        // Nasconde l'intero blocco della categoria (es. FORMAGGI) se tutte le sue righe sono nascoste
        contenitoriCat.forEach(container => {
            const righeVisibili = container.querySelectorAll('.tabella-tutte tbody tr:not([style*="display: none"])');
            if (righeVisibili.length === 0) {
                container.style.display = "none";
            } else {
                container.style.display = "";
            }
        });

    } else {
        // --- LOGICA CLASSICA PER LE SINGOLE PIZZERIE ---
        const items = document.querySelectorAll('.ing-item');
        const catTitles = document.querySelectorAll('.cat-title');

        items.forEach(it => {
            const nome = it.dataset.nome;
            if (q === "barbazza") {
                it.style.display = listaBarbazza.includes(nome) ? "flex" : "none";
            } else if (q === "metro") {
                let isMetro = listaMetro.includes(nome);
                if (p === "BIBAN" && listaMetroBiban.includes(nome)) {
                    isMetro = true;
                }
                it.style.display = isMetro ? "flex" : "none";
            } else if (q === "" || nome.includes(q)) {
                it.style.display = "flex";
            } else { 
                it.style.display = "none"; 
            }
        });
        
        catTitles.forEach(title => { 
            title.style.display = (q === "") ? "block" : "none"; 
        });
    }
}
function generaVistaTutte(fornitoreSelezionato = "TUTTI") {
    const cont = document.getElementById('contenitore-lista');
    cont.classList.add("vista-tabellare");
    const d_casta = JSON.parse(localStorage.getItem('inventario_dati_CASTA')) || {};
    const d_silea = JSON.parse(localStorage.getItem('inventario_dati_SILEA')) || {};
    const d_biban = JSON.parse(localStorage.getItem('inventario_dati_BIBAN')) || {};

    const raggruppati = {};
    ingredienti.forEach(ing => {
        if (!raggruppati[ing.cat]) raggruppati[ing.cat] = { color: ing.color, items: [] };
        raggruppati[ing.cat].items.push(ing);
    });
    
    let selectFornitori = `
        <select id="filtro-fornitori" onchange="generaVistaTutte(this.value)" style="width:100%; margin-bottom:15px; padding:12px; border-radius:10px; font-weight:bold; border:1px solid #e7e0d7; font-size:16px; background:white; color:var(--text-main); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <option value="TUTTI" ${fornitoreSelezionato === 'TUTTI' ? 'selected' : ''}>FORNITORI</option>
            <option value="METRO" ${fornitoreSelezionato === 'METRO' ? 'selected' : ''}>METRO</option>
            <option value="BARBAZZA" ${fornitoreSelezionato === 'BARBAZZA' ? 'selected' : ''}>BARBAZZA</option>
            <option value="TONON" ${fornitoreSelezionato === 'TONON' ? 'selected' : ''}>TONON</option>
            <option value="PIAN" ${fornitoreSelezionato === 'PIAN' ? 'selected' : ''}>PIAN</option>
            <option value="RONCADESE" ${fornitoreSelezionato === 'RONCADESE' ? 'selected' : ''}>RONCADESE</option>
            <option value="BORTOLATO" ${fornitoreSelezionato === 'BORTOLATO' ? 'selected' : ''}>BORTOLATO</option>
            <option value="GHIACCIO FACILE" ${fornitoreSelezionato === 'GHIACCIO FACILE' ? 'selected' : ''}>GHIACCIO FACILE</option>
            <option value="VOLPATO" ${fornitoreSelezionato === 'VOLPATO' ? 'selected' : ''}>VOLPATO</option>
        </select>
    `;

    let h = selectFornitori;

    // === PULSANTI PER GLI ORDINI AI FORNITORI ===
    if (fornitoreSelezionato === "BARBAZZA") {
        h += `<button onclick="inviaOrdineBarbazza()" style="background:#25D366; color:white; width:100%; margin-bottom:10px; padding:12px; border-radius:10px; font-weight:bold; border:none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🟢 INVIA ORDINE BARBAZZA</button>`;
    }
    if (fornitoreSelezionato === "TONON") {
        h += `<button onclick="inviaOrdineTonon()" style="background:#2E7D32; color:white; width:100%; margin-bottom:10px; padding:12px; border-radius:10px; font-weight:bold; border:none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🟢 INVIA ORDINE TONON</button>`;
    }
    // ============================================

    if (fornitoreSelezionato === "TUTTI") {
        h += `<button onclick="scaricaScreenshot(this)" style="background:var(--primary); color:white; width:100%; margin-bottom:15px; padding:12px; border-radius:10px; font-weight:bold; border:none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">📸 SALVA COME IMMAGINE</button>`;
    }

    h += `<div id="area-da-fotografare" style="background:var(--bg-body); padding:15px; border-radius:10px; display:flex; flex-wrap:wrap; gap:15px; align-items:flex-start;">`;

    const colonneHTML = ["", "", ""];
    const ordineSacro = ["PASTA", "VASCHETTE", "FRESCO", "FORMAGGI", "SALUMI", "PESCE", "SCAFFALERIA", "IMPASTI", "IMBALLAGGI"];
    const chiaviSito = Object.keys(raggruppati);
    const ordineFinale = [];

    ordineSacro.forEach(target => {
        const chiaveVera = chiaviSito.find(k => k.trim().toUpperCase() === target);
        if (chiaveVera) {
            ordineFinale.push(chiaveVera);
            chiaviSito.splice(chiaviSito.indexOf(chiaveVera), 1);
        }
    });

    const chiaviResto = chiaviSito.filter(k => !k.trim().toUpperCase().includes("BIBITE"));
    ordineFinale.push(...chiaviResto);
    const chiaviBibite = chiaviSito.filter(k => k.trim().toUpperCase().includes("BIBITE"));
    ordineFinale.push(...chiaviBibite);

    // Mappatura articoli aggiornata
    const fornitori = {
        "TONON": ["mozzarella in kg", "mozza", "mozzarella", "provola", "provola aff.", "bufala (numero)", "bufala", "mozzarella di bufala"],
        "PIAN": ["porchetta", "salamino num", "prosciutto cotto", "sopressa", "roastbeef"],
        "RONCADESE": ["salsiccia", "pancetta"],
        "BORTOLATO": ["burrata"],
        "GHIACCIO FACILE": ["ghiaccio"],
        "VOLPATO": ["cass. datterino", "cass.datterino", "datt. giallo vaschette", "cass cipolla", "cass.cipolla", "basilico", "rucola", "melanzane crude", "zucchine crude", "peperoni crudi", "funghi crudi"]
    };
    
    let blocchiCategorie = [];

    for (const cat of ordineFinale) {
        if (!raggruppati[cat]) continue;
        let itemsFiltrati = raggruppati[cat].items.filter(ing => {
            if (fornitoreSelezionato === "TUTTI") return true;
            let nomeLower = ing.nome.toLowerCase().trim();
            if (fornitoreSelezionato === "METRO") {
                const bibiteNuove = ["stracciatella", "coca cola n.", "coca cola zero n.", "fanta n.", "ichnusa non filtrata n.", "pedavena n.", "acqua naturale n.", "acqua frizzante n."];
                return (typeof listaMetro !== 'undefined' && listaMetro.includes(nomeLower)) || (typeof listaMetroBiban !== 'undefined' && listaMetroBiban.includes(nomeLower)) || bibiteNuove.includes(nomeLower);
            }
            if (fornitoreSelezionato === "BARBAZZA") {
                return (typeof listaBarbazza !== 'undefined' && listaBarbazza.includes(nomeLower)) || nomeLower === "olive (buste)";
            }
            if (fornitori[fornitoreSelezionato]) {
                return fornitori[fornitoreSelezionato].includes(nomeLower);
            }
            return false;
        });

        if (itemsFiltrati.length === 0) continue; 
        let catHTML = `<div class="container-cat-tutte" style="background:#ffffff !important; border:1px solid #e7e0d7 !important; border-radius:10px; overflow:hidden; margin-bottom:15px; width:100%;">
            <div class="header-cat-tabella">${cat}</div>
            <table class="tabella-tutte"><thead><tr><th>Articolo</th><th>Casta</th><th>Silea</th><th>Biban</th></tr></thead><tbody>`;
        itemsFiltrati.forEach(ing => {
            const soglia = isWeekendDomani ? ing.we : ing.fer;
            const processaValore = (val) => {
                const n = estraiNumeroIntelligente(val);
                if (!isNaN(n) && n < soglia) return `<span style="color:var(--red-alert); font-weight:bold">${val}</span>`;
                return val || "-";
            };
            catHTML += `<tr><td class="td-nome">${ing.nome}</td><td>${processaValore(d_casta[ing.nome])}</td><td>${processaValore(d_silea[ing.nome])}</td><td>${processaValore(d_biban[ing.nome])}</td></tr>`;
        });
        catHTML += `</tbody></table></div>`;
        blocchiCategorie.push(catHTML);
    }

    const itemsPerCol = Math.ceil(blocchiCategorie.length / 3);
    let indexCorrente = 0;
    blocchiCategorie.forEach(catHTML => {
        let indexColonna = itemsPerCol > 0 ? Math.floor(indexCorrente / itemsPerCol) : 0;
        if (indexColonna > 2) indexColonna = 2;
        colonneHTML[indexColonna] += catHTML;
        indexCorrente++;
    });

    h += `<div class="colonna-fisica" style="flex:1; min-width:300px; display:flex; flex-direction:column;">${colonneHTML[0]}</div>`;
    h += `<div class="colonna-fisica" style="flex:1; min-width:300px; display:flex; flex-direction:column;">${colonneHTML[1]}</div>`;
    h += `<div class="colonna-fisica" style="flex:1; min-width:300px; display:flex; flex-direction:column;">${colonneHTML[2]}</div>`;
    h += `</div>`;
    cont.innerHTML = h;
}
function scaricaScreenshot(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ Generazione in corso (attendi)...";
    btn.disabled = true;
    const area = document.getElementById('area-da-fotografare');
    setTimeout(() => {
        html2canvas(area, { scale: 1, backgroundColor: "#ffffff", useCORS: true, windowWidth: 1200, onclone: function(clonedDoc) {
                const areaClone = clonedDoc.getElementById('area-da-fotografare');
                areaClone.style.display = "flex"; areaClone.style.flexWrap = "wrap"; areaClone.style.width = "1200px"; areaClone.style.gap = "10px";
                const colonne = areaClone.querySelectorAll('.colonna-fisica');
                colonne.forEach(col => { col.style.width = "380px"; col.style.flex = "0 0 380px"; });
            }
        }).then(canvas => {
            document.getElementById('img-risultato').src = canvas.toDataURL('image/png');
            document.getElementById('modal-screenshot').style.display = 'flex';
            btn.innerHTML = originalText; btn.disabled = false;
        }).catch(err => {
            alert("Errore sul telefono. Riprova con una lista leggermente più corta.");
            btn.innerHTML = originalText; btn.disabled = false;
        });
    }, 500);
}

function generaVistaArchivio() {
    const dataScelta = document.getElementById('archiveDate').value;
    if (!dataScelta) return;
    const cont = document.getElementById('contenitore-lista');
    cont.classList.add("vista-tabellare");
   // Cerca SOLO i dati della data scelta. Se non ci sono, lascia l'oggetto vuoto {} senza pescare da oggi
    const d_casta = JSON.parse(localStorage.getItem(`inventario_dati_CASTA_${dataScelta}`)) || {};
    const d_silea = JSON.parse(localStorage.getItem(`inventario_dati_SILEA_${dataScelta}`)) || {};
    const d_biban = JSON.parse(localStorage.getItem(`inventario_dati_BIBAN_${dataScelta}`)) || {};
    const raggruppati = {};
    ingredienti.forEach(ing => {
        if (!raggruppati[ing.cat]) raggruppati[ing.cat] = { color: ing.color, items: [] };
        raggruppati[ing.cat].items.push(ing);
    });
    let h = `<div style="grid-column: 1/-1; text-align:center; padding:15px; font-weight:bold; color:var(--primary)">Archivio: ${dataScelta}</div><div id="area-da-fotografare" style="background:var(--bg-body); padding:15px; border-radius:10px; display:flex; flex-wrap:wrap; gap:15px; align-items:flex-start;">`;
    const colonneHTML = ["", "", ""];
    let indexColonna = 0;
    for (const cat in raggruppati) {
        let catHTML = `<div class="container-cat-tutte" style="background:#ffffff !important; border:1px solid #e7e0d7 !important; border-radius:10px; overflow:hidden; margin-bottom:15px; width:100%;"><div class="header-cat-tabella">${cat}</div><table class="tabella-tutte"><thead><tr><th>Articolo</th><th>Casta</th><th>Silea</th><th>Biban</th></tr></thead><tbody>`;
        raggruppati[cat].items.forEach(ing => { catHTML += `<tr><td class="td-nome">${ing.nome}</td><td>${d_casta[ing.nome] || "-"}</td><td>${d_silea[ing.nome] || "-"}</td><td>${d_biban[ing.nome] || "-"}</td></tr>`; });
        catHTML += `</tbody></table></div>`;
        colonneHTML[indexColonna] += catHTML;
        indexColonna = (indexColonna + 1) % 3;
    }
    h += `<div class="colonna-fisica" style="flex:1; min-width:300px; display:flex; flex-direction:column;">${colonneHTML[0]}</div><div class="colonna-fisica" style="flex:1; min-width:300px; display:flex; flex-direction:column;">${colonneHTML[1]}</div><div class="colonna-fisica" style="flex:1; min-width:300px; display:flex; flex-direction:column;">${colonneHTML[2]}</div></div>`;
    cont.innerHTML = h;
}

function creaLista() {
    const cont = document.getElementById('contenitore-lista');
    const p = document.getElementById('pizzeria').value;
    cont.innerHTML = "";
    cont.classList.remove("vista-tabellare");
    document.getElementById('btn-azzera').style.display = (p && p !== "TUTTE" && p !== "ARCHIVIO") ? "block" : "none";
    document.getElementById('footer-btns').style.display = (p && p !== "ARCHIVIO") ? "flex" : "none";
    document.getElementById('save-btn').style.display = (p === "TUTTE") ? "none" : "block";
    document.getElementById('search-box').style.display = (p && p !== "ARCHIVIO") ? "block" : "none";
    document.getElementById('date-picker-container').style.display = (p === "ARCHIVIO") ? "block" : "none";
    if (p === "TUTTE") { generaVistaTutte(); return; }
    if (p === "ARCHIVIO") { generaVistaArchivio(); return; }
    if (!p) return;
    const s = JSON.parse(localStorage.getItem('inventario_dati_'+p)) || {};
    let currentCat = "";
    ingredienti.forEach((ing, i) => {
        if (ing.nome === "Lievito" && p !== "BIBAN") return;
        if (ing.nome === "Pel.Salsa" && p !== "CASTA") return;
        if (ing.nome === "Pelati Salsa" && p === "SILEA") return;
        if (ing.cat === "VERDURE CRUDE" && p !== "CASTA") return;
        if ((ing.nome === "Ghiaccio" || ing.nome === "Canapa Bio") && (p === "CASTA" || p === "SILEA")) return;
        if ((ing.nome === "Olio Fritte" || ing.nome === "Patate Fritte" || ing.nome === "Patate al Forno") && (p === "SILEA" || p === "BIBAN")) return;
        if (ing.cat !== currentCat) {
            cont.innerHTML += `<div class="categoria-header cat-title">${ing.cat}</div>`;
            currentCat = ing.cat;
        }
        const soglia = isWeekendDomani ? ing.we : ing.fer;
        const v = s[ing.nome] || "";
        const isCipolla = ing.nome === "cass.Cipolla";
        const limitAttr = ing.cat === "VASCHETTE" ? ' maxlength="4" oninput="if(!/^(0(,(25?|3|5|7)?)?|1(,(25?|3|5|7)?)?|2(,(25?|3|5|7)?)?|3(,(25?|3|5|7)?)?|4(,(25?|3|5|7)?)?|5(,(25?|3|5|7)?)?|6(,(25?|3|5|7)?)?|7(,(25?|3|5|7)?)?|8(,(25?|3|5|7)?)?)?$/.test(this.value)) this.value = this.value.slice(0, -1);"' : '';
        let inputHtml = isCipolla ? `<div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px"><div style="display:flex; align-items:center; gap:5px; font-size:10px; color:var(--secondary)">Sfuse <input type="text" inputmode="decimal" class="qty-input" style="height:32px; width:55px" id="sfuse-${i}" onkeydown="bloccaNonNumerici(event)" onchange="trasformaECalcola(this, 0, ${i}); document.getElementById('sel-${i}').value = (this.value/20).toFixed(2); valuta(${i}, ${soglia})"></div><input type="text" inputmode="decimal" class="qty-input" id="sel-${i}" placeholder="Qtà" value="${v}" onkeydown="bloccaNonNumerici(event)" onchange="trasformaECalcola(this, ${soglia}, ${i})"></div>` : `<input type="text" inputmode="decimal" class="qty-input" id="sel-${i}" placeholder="0" value="${v}" onkeydown="bloccaNonNumerici(event)" onchange="trasformaECalcola(this, ${soglia}, ${i})"${limitAttr}>`;
        cont.innerHTML += `<div class="item ${v===''?'vuoto':''} ing-item" id="box-${i}" data-nome="${ing.nome.toLowerCase()}"><div class="nome-container"><b>${ing.nome}</b><small>Minimo: ${soglia}</small></div><div>${inputHtml}</div></div>`;
        if(v !== "") valuta(i, soglia);
    });
}

function controllaESalva() {
    const p = document.getElementById('pizzeria').value;
    const vuoti = [];
    ingredienti.forEach((ing, i) => {
        const input = document.getElementById(`sel-${i}`);
        if (input && input.value.trim() === "") {
            if (!(ing.nome === "Lievito" && p !== "BIBAN") && !(ing.nome === "Pel.Salsa" && p !== "CASTA") && !(ing.nome === "Pelati Salsa" && p === "SILEA") && !((ing.nome === "Ghiaccio" || ing.nome === "Canapa Bio") && (p === "CASTA" || p === "SILEA")) && !((ing.nome === "Olio Fritte" || ing.nome === "Patate Fritte" || ing.nome === "Patate al Forno") && p === "SILEA") && !ing.noObbligo) { vuoti.push(ing.nome); }
        }
    });
    if (vuoti.length > 0) {
        document.getElementById('lista-nomi-vuoti').innerHTML = vuoti.join(", ");
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('dialog-vuoti').style.display = 'block';
    } else { eseguiSalva(); }
}

function chiudiDialog() { document.getElementById('overlay').style.display = 'none'; document.getElementById('dialog-vuoti').style.display = 'none'; }

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKYWNbfIyXW_lRfaT-LRA9l6LSfdnwhoQI80cTuZJBlrGuKKnQdIpWjbae_r_s6yNWFA/exec";

let modificheNonSalvate = false;
let ultimoSalvataggio = 0; // === SCUDO TEMPORALE ===

document.addEventListener('input', (e) => {
    if (e.target && e.target.tagName === 'INPUT') {
        modificheNonSalvate = true;
    }
});
document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'pizzeria') {
        modificheNonSalvate = false;
    }
});

async function eseguiSalva(forza = false) {
    const p = document.getElementById('pizzeria').value;
    const d = {};
    const oggiStr = new Date().toISOString().split('T')[0];
    
    ingredienti.forEach((ing, i) => { 
        const input = document.getElementById(`sel-${i}`); 
        if(input) d[ing.nome] = input.value; 
    });
    
    const newDataString = JSON.stringify(d);
    document.getElementById('sync-status').innerText = 'Sincronizzazione in corso...';
    
    // 1. Salvataggio immediato in memoria per sicurezza estrema
    localStorage.setItem('inventario_dati_' + p, newDataString);
    localStorage.setItem(`inventario_dati_${p}_${oggiStr}`, newDataString);
    
    // Attiva lo scudo temporale: segna l'istante esatto di questo salvataggio
    ultimoSalvataggio = Date.now(); 
    
    const payload = {
        ['inventario_dati_' + p]: newDataString,
        [`inventario_dati_${p}_${oggiStr}`]: newDataString
    };
    
    try {
        await syncCloud(payload);
        modificheNonSalvate = false; 
        chiudiDialog(); 
        alert("✅ Report salvato!");
    } catch (e) { 
        console.error("Errore salva:", e); 
        modificheNonSalvate = false; 
        document.getElementById('sync-status').innerText = '✅ Salvato in locale';
        chiudiDialog();
        alert("⚠️ Rete o Server Google lenti: Dati salvati in sicurezza sul dispositivo!");
    }
}

async function syncCloud(data = null) {
    const status = document.getElementById('sync-status');
    if (!status) return;
    
    status.style.color = "#666666"; 
    
    // === ANTI-BLOCCO: Chiude la connessione se Google si incanta per più di 8 secondi ===
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        if (data) {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(data),
                signal: controller.signal // Collega il timer alla chiamata
            });
            clearTimeout(timeoutId);
            status.innerText = 'Sincronizzazione completata';
            status.style.color = "#25D366"; 
        } else {
            // === SCUDO ATTIVO: Se ho salvato da meno di 3 minuti (180.000 millisecondi), blocco il download dal cloud ===
            if (Date.now() - ultimoSalvataggio < 180000) {
                console.log("Download protetto: dati locali più freschi, blocco la sovrascrittura di Google.");
                return; 
            }

            const res = await fetch(`${SCRIPT_URL}?nocache=${new Date().getTime()}`, { 
                redirect: 'follow',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (res.ok) {
                const cloudData = await res.json();
                if (cloudData && typeof cloudData === 'object') { 
                    Object.keys(cloudData).forEach(key => {
                        if(cloudData[key]) localStorage.setItem(key, cloudData[key]);
                    }); 
                    status.innerText = '✅ Dati caricati'; 
                    status.style.color = "#25D366";
                }
            }
        }
    } catch (e) { 
        clearTimeout(timeoutId);
        console.error("Errore Sync:", e);
        status.innerText = '✅ Modalità Offline'; 
        status.style.color = "#e67e22"; 
  } finally {
        if (typeof creaLista === 'function' && !data) {
            const casellaAttiva = document.activeElement && document.activeElement.tagName === 'INPUT';
            const menuAttivo = document.getElementById('pizzeria') ? document.getElementById('pizzeria').value : '';
            
            // Se non ci sono modifiche in sospeso E l'utente non sta guardando le viste speciali (Tutte/Archivio/Fornitori) -> aggiorna la grafica
            if (!modificheNonSalvate && !casellaAttiva && menuAttivo !== 'TUTTE' && menuAttivo !== 'ARCHIVIO' && menuAttivo !== 'FORNITORI') {
                creaLista();
            }
        }
    }
}
    
function cambiaPizzeria() { localStorage.setItem('ultima_pizzeria', document.getElementById('pizzeria').value); creaLista(); }
function valuta(i, s) { const input = document.getElementById(`sel-${i}`); if(!input) return; const v = estraiNumeroIntelligente(input.value); document.getElementById(`box-${i}`).className = `item ${isNaN(v) ? 'vuoto' : (v < s ? 'urgente' : 'ok')} ing-item`; }
function azzeraLista() { if(confirm("Cancellare dati?")) { localStorage.removeItem('inventario_dati_'+document.getElementById('pizzeria').value); creaLista(); } }

function inviaWhatsApp() {
    const p = document.getElementById('pizzeria').value;
    let msg = "";
    const processaLista = (pv, dataObj) => {
        let msgPv = `*${pv}*\n`;
        let haMancanze = false;
        ingredienti.forEach((ing) => {
            if (ing.cat === "VERDURE CRUDE") return;
            if (ing.cat === "VASCHETTE") return;
            if (ing.nome === "Lievito" && pv !== "BIBAN") return;
            if (ing.nome === "Pel.Salsa" && pv !== "CASTA") return;
            if (ing.nome === "Pelati Salsa" && pv === "SILEA") return;
            if ((ing.nome === "Ghiaccio" || ing.nome === "Canapa Bio") && (pv === "CASTA" || pv === "SILEA")) return;
            if ((ing.nome === "Olio Fritte" || ing.nome === "Patate Fritte" || ing.nome === "Patate al Forno") && (pv === "SILEA" || pv === "BIBAN")) return;
            const val = dataObj[ing.nome];
            if (val !== undefined && val !== "") {
                const v = estraiNumeroIntelligente(val);
                const s = isWeekendDomani ? ing.we : ing.fer;
                if (!isNaN(v) && v < s) { msgPv += `• ${ing.nome}: ${val}\n`; haMancanze = true; }
            }
        });
        return haMancanze ? msgPv + "\n" : "";
    };
    if (p === "TUTTE") {
        msg += `*REPORT MANCANZE*\n\n`;
        ["CASTA", "SILEA", "BIBAN"].forEach(pv => { const s = localStorage.getItem('inventario_dati_' + pv); if(s) msg += processaLista(pv, JSON.parse(s)); });
    } else {
        msg += `*MANCANZE ${p}*\n\n`;
        const s = localStorage.getItem('inventario_dati_' + p);
        if(s) msg += processaLista(p, JSON.parse(s));
    }
    if (msg.trim() === "*REPORT MANCANZE*" || msg.trim() === `*MANCANZE ${p}*`) msg = `✅ Tutto OK per ${p === "TUTTE" ? "tutte" : p}`;
    window.location.href = "whatsapp://send?text=" + encodeURIComponent(msg);
}
function inviaOrdineBarbazza() {
    let msg = "";
    const puntiVendita = ["CASTA", "SILEA", "BIBAN"];
    let haQualcosa = false;

    const calcolaGiacenza = (d, nomeEsatto) => {
        if (d && d[nomeEsatto] && d[nomeEsatto] !== "") {
            const n = estraiNumeroIntelligente(d[nomeEsatto]);
            return isNaN(n) ? 0 : n;
        }
        return 0; // se vuoto, considera zero
    };

    // Controllo silenzioso delle scorte di Tonno
    let giacenzaTonno = {};
    let pizzerieConSurplusTonno = [];
    
    puntiVendita.forEach(p => {
        const datiPV = JSON.parse(localStorage.getItem('inventario_dati_' + p)) || {};
        giacenzaTonno[p] = calcolaGiacenza(datiPV, "Tonno (latte)");
        if (giacenzaTonno[p] > 6) {
            pizzerieConSurplusTonno.push(p);
        }
    });

    puntiVendita.forEach(pv => {
        const storedData = localStorage.getItem('inventario_dati_' + pv);
        if (storedData) {
            const d = JSON.parse(storedData);
            let msgPv = `*${pv}*\n`;
            let haOrdinePv = false;

            const aggiungiAllOrdine = (nome, daOrdinare) => {
                if (daOrdinare > 0) {
                    msgPv += `${Math.ceil(daOrdinare)} ${nome}\n`;
                    haOrdinePv = true;
                    haQualcosa = true;
                }
            };
         // Regole standard generali
            const regoleStandard = [
                { nome: "Brie", soglia: pv === "SILEA" ? 4 : 5 }, 
                { nome: "Gorgonzola", soglia: pv === "SILEA" ? 2.5 : 3 },
                { nome: "Asiago", soglia: 1 }, { nome: "Bresaola", soglia: 1 },
                { nome: "Acciughe", soglia: 2 }, { nome: "Capperi", soglia: 1 },
                { nome: "Semola", soglia: pv === "SILEA" ? 2 : 3 },
               { nome: "Cart.med", soglia: 8 }, { nome: "Cart.mezzi", soglia: 2 }
            ];

            // Calcola ordini standard per sottrazione
            regoleStandard.forEach(r => {
                let giacenza = calcolaGiacenza(d, r.nome);
                aggiungiAllOrdine(r.nome, r.soglia - giacenza);
            });

            // Regola speciale: Carta mani (Pacchi da 2 rotoli)
            // Silea: target 6 rotoli (3 pacchi). Casta/Biban: target 8 rotoli (4 pacchi).
            let giacenzaCarta = calcolaGiacenza(d, "Carta mani");
            let targetCarta = pv === "SILEA" ? 6 : 8; 
            
            if (giacenzaCarta < targetCarta) {
                // Calcola quanti rotoli mancano, divide per 2 (rotoli a pacco) e arrotonda per eccesso
                let pacchiCarta = Math.ceil((targetCarta - giacenzaCarta) / 2);
                aggiungiAllOrdine("Carta mani", pacchiCarta);
            }
            // Regola speciale: Carciofi (Scatole da 6)
            let giacenzaCarciofi = calcolaGiacenza(d, "Carciofi");
            if (giacenzaCarciofi < 6) {
                aggiungiAllOrdine("Carciofi", 1);
            }

           // Regola speciale: Salmone (Multipli di 5 per arrivare a ~15)
            let giacenzaSalmone = calcolaGiacenza(d, "Salmone");
            let confezioniSalmone = Math.round((15 - giacenzaSalmone) / 5) * 5;
            if (confezioniSalmone > 0) {
                aggiungiAllOrdine("Salmone", confezioniSalmone);
            }

            // Regola speciale: Tonno (Se <= 3 latte, ordina 1 scatola da 6)
            let giacenzaTonnoPV = calcolaGiacenza(d, "Tonno (latte)");
            if (giacenzaTonnoPV <= 3) {
                aggiungiAllOrdine("Tonno", 1);
            }
            // Regola speciale: Olive (Secchi da 5 buste per arrivare a ~9)
            let giacenzaOlive = calcolaGiacenza(d, "Olive (buste)");
            let secchiOlive = Math.round((5 - giacenzaOlive) / 5);
           if (secchiOlive > 0) {
                aggiungiAllOrdine("Olive", secchiOlive);
            }
          
            // Regola speciale: Pelati Salsa (Solo CASTA)
            if (pv === "CASTA") {
                let giacenzaPelati = calcolaGiacenza(d, "Pelati Salsa");
                aggiungiAllOrdine("Pelati Salsa", 18 - giacenzaPelati);
            }

            // Regola speciale: Lievito (Solo BIBAN)
            if (pv === "BIBAN") {
                let giacenzaLievito = calcolaGiacenza(d, "Lievito");
                aggiungiAllOrdine("Lievito", 1 - giacenzaLievito);
            }

            if (haOrdinePv) {
                msg += msgPv + "\n";
            }
        }
    });

    if (!haQualcosa) {
        alert("Giacenze già sufficienti! Nessun ordine necessario per Barbazza in questo momento.");
        return;
    }

    // Apre WhatsApp
    window.location.href = "whatsapp://send?text=" + encodeURIComponent(msg);
}
// ============================================================================
// GESTIONE ORDINI FORNITORE: TONON (CALIBRATO 100% SU TUTTE E 3 LE SEDI)
// ============================================================================

const FORMATO_SCATOLA = {
    mozza: 6,    // 1 scatola = 6 kg
    bufala: 24,  // 1 scatola = 24 pezzi singoli
    provola: 1   // 1 pezzo = 1 provola
};

// Tetti massimi del weekend calibrati per produrre esattamente:
// SILEA: 12, 2, 5 | CASTA: 11, 2, 7 | BIBAN: 12, 1, 2
const FABBISOGNO_TONON = {
    SILEA: {
        mozza: 84,   // 84 - 12 kg in negozio = 72 kg -> 12 mozza
        bufala: 72,  // 72 - 24 pz in negozio = 48 pz -> 2 bufala
        provola: 7   // 7 - 2 pz in negozio = 5 provola
    },
    CASTA: {
        mozza: 84,   // 84 - 18 kg in negozio = 66 kg -> 11 mozza
        bufala: 72,  // 72 - 24 pz in negozio = 48 pz -> 2 bufala
        provola: 8   // 8 - 1 pz in negozio = 7 provola
    },
    BIBAN: {
        mozza: 90,   // 90 - 18 kg in negozio = 72 kg -> 12 mozza
        bufala: 72,  // 72 - 48 pz in negozio = 24 pz -> 1 bufala
        provola: 7   // 7 - 5 pz in negozio = 2 provola
    }
};

const CONSEGNE_TONON = {
    SILEA: [2, 4], // Mar, Gio
    CASTA: [1, 5], // Lun, Ven
    BIBAN: [2, 5]  // Mar, Ven
};

const NOMI_GIORNI_BREVI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

function cercaGiacenza(inventario, tipo) {
    for (const key in inventario) {
        const keyLower = key.toLowerCase().trim();
        let match = false;

        if (tipo === 'mozza') {
            match = keyLower.includes('mozza') && !keyLower.includes('bufala');
        } else if (tipo === 'bufala') {
            match = keyLower.includes('bufala');
        } else if (tipo === 'provola') {
            match = keyLower.includes('provola');
        }

        if (match) {
            const num = parseFloat(String(inventario[key]).replace(/[^0-9.]/g, ''));
            if (!isNaN(num)) return num;
        }
    }
    return 0;
}

function calcolaFinestraConsegnaTonon(sede, dataRiferimento = new Date()) {
    const giornoAttuale = dataRiferimento.getDay();
    const giorniConsegna = CONSEGNE_TONON[sede];
    
    let prossimoGiorno = giorniConsegna.find(g => g >= giornoAttuale);
    if (prossimoGiorno === undefined) prossimoGiorno = giorniConsegna[0]; 
    
    return { giornoConsegnaBreve: NOMI_GIORNI_BREVI[prossimoGiorno] };
}

function calcolaOrdineSedeTonon(sedeKey, nomeDisplay) {
    const finestra = calcolaFinestraConsegnaTonon(sedeKey);
    const rawData = localStorage.getItem('inventario_dati_' + sedeKey);
    const inventario = rawData ? JSON.parse(rawData) : {};
    
    const giacenze = {
        mozza: cercaGiacenza(inventario, 'mozza'),
        bufala: cercaGiacenza(inventario, 'bufala'),
        provola: cercaGiacenza(inventario, 'provola')
    };

    const ordineScatole = {};
    ['mozza', 'bufala', 'provola'].forEach(prodotto => {
        const target = FABBISOGNO_TONON[sedeKey][prodotto] || 0;
        const daOrdinareNetto = Math.max(0, target - giacenze[prodotto]);
        ordineScatole[prodotto] = Math.ceil(daOrdinareNetto / FORMATO_SCATOLA[prodotto]);
    });

    return `${nomeDisplay} ${finestra.giornoConsegnaBreve}\n` +
           `  ${ordineScatole.mozza} mozza\n` +
           `  ${ordineScatole.bufala} bufala\n` +
           `  ${ordineScatole.provola} provola`;
}

function inviaOrdineTonon() {
    const bloccoSilea = calcolaOrdineSedeTonon('SILEA', 'Silea');
    const bloccoCasta = calcolaOrdineSedeTonon('CASTA', 'Casta');
    const bloccoBiban = calcolaOrdineSedeTonon('BIBAN', 'Biban');

    const messaggioFinale = `${bloccoSilea}\n\n${bloccoCasta}\n\n${bloccoBiban}`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(messaggioFinale).catch(err => console.error("Errore copia appunti:", err));
    }
    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(messaggioFinale)}`;
    window.open(urlWhatsApp, '_blank');
}
window.onload = async function() {
    const nomiGiorni = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
    document.getElementById('info-giorno').innerHTML = `Lista per <b>${nomiGiorni[domani.getDay()]}</b> ${isWeekendDomani?'(FESTIVO)':''}`;
    await syncCloud();
    
    // Timer in background: ogni 2 minuti (120.000 ms) scarica i dati in modo invisibile.
    // Grazie alle tue protezioni, aggiornerà lo schermo SOLO se nessuno sta scrivendo!
    setInterval(async () => {
        await syncCloud();
    }, 120000); 
};

// 1. Sveglia standard (quando cambi app e torni indietro)
document.addEventListener("visibilitychange", async function() {
    if (document.visibilityState === "visible") await syncCloud();
});

// 2. Sveglia al tocco (quando tocchi lo schermo dopo che era in standby)
window.addEventListener("focus", async function() {
    await syncCloud();
});

// 3. Sveglia anti-ibernazione (quando il telefono scongela l'app dalla memoria RAM)
window.addEventListener("pageshow", async function(e) {
    if (e.persisted) await syncCloud();
});

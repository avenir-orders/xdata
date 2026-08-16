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

    // === NUOVA LOGICA: MOSTRA/NASCONDI I TASTI DEGLI ORDINI ===
    const btnTonon = document.getElementById('btn-invia-tonon');
    const btnBarbazza = document.getElementById('btn-invia-barbazza');
    const btnMetro = document.getElementById('btn-invia-metro');

    // 1. Prima nasconde tutti i tasti per azzerare la situazione
    if (btnTonon) btnTonon.style.display = 'none';
    if (btnBarbazza) btnBarbazza.style.display = 'none';
    if (btnMetro) btnMetro.style.display = 'none';

    // 2. Mostra il tasto corretto in base a ciò che stai cercando (q) o alla vista selezionata (p)
    if (p === "TONON" || q === "tonon") {
        if (btnTonon) btnTonon.style.display = 'block';
    } 
    if (p === "BARBAZZA" || q === "barbazza") {
        if (btnBarbazza) btnBarbazza.style.display = 'block';
    } 
    if (p === "METRO" || q === "metro") {
        if (btnMetro) btnMetro.style.display = 'block';
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
// --- AGGIUNGI QUESTO NUOVO BLOCCO PER LA METRO ---
    if (fornitoreSelezionato === "METRO") {
        h += `<button onclick="inviaOrdineMetro()" style="background:#2e7d32; color:white; width:100%; margin-bottom:10px; padding:12px; border-radius:10px; font-weight:bold; border:none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🟢 INVIA ORDINE METRO</button>`;
    }
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
    
    // === CONTROLLO ISTANTANEO DELLA RETE (IL RADAR) ===
    // Se il dispositivo capisce di non avere linea, va offline in un millesimo di secondo
    if (!navigator.onLine) {
        status.innerHTML = '✅ MODALITÀ OFFLINE<br><span style="font-size: 12px; font-weight: normal; color: #e67e22; margin-top: 6px; display: block; line-height: 1.3; text-transform: none;">(Puoi compilare e salvare normalmente: i dati resteranno al sicuro sul dispositivo. Quando torna la rete, premi di nuovo SALVA per inviarli al Cloud)</span>'; 
        status.style.color = "#e67e22";
        return; // Blocca la funzione qui, senza far partire nessun timer!
    }
    
    status.style.color = "#666666"; 
    
    // === ANTI-BLOCCO: Abbassato a 20 secondi per non farti aspettare un'eternità ===
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); 

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
           // === SCUDO ATTIVO: Se ho salvato da meno di 3 minuti, blocco il download ===
            if (Date.now() - ultimoSalvataggio < 180000) {
                clearTimeout(timeoutId); // Spegne il timer per non farlo andare in errore
                status.innerText = '✅ Pronta (Dati locali)'; 
                status.style.color = "#25D366";
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
        
        const status = document.getElementById('sync-status');
        if(status) {
            // Inserisce il titolo arancione e le istruzioni in piccolo subito sotto
            status.innerHTML = 'MODALITÀ OFFLINE<br><span style="font-size: 12px; font-weight: normal; color: #e67e22; margin-top: 6px; display: block; line-height: 1.3; text-transform: none;">(Puoi compilare e salvare normalmente: i dati resteranno al sicuro sul dispositivo. Quando torna la rete, premi di nuovo SALVA per inviarli al Cloud)</span>'; 
            status.style.color = "#e67e22"; 
        }
} finally {
        if (typeof creaLista === 'function' && !data) {
            const menuAttivo = document.getElementById('pizzeria') ? document.getElementById('pizzeria').value : '';
            
            // 1. Se sei nella vista TUTTE, la ricarica mantenendo il filtro Fornitore
            if (menuAttivo === 'TUTTE') {
                const filtroFornitore = document.getElementById('filtro-fornitori') ? document.getElementById('filtro-fornitori').value : 'TUTTI';
                generaVistaTutte(filtroFornitore);
            } 
            // 2. Se sei in una lista singola (es. Casta), aggiorna in modo "fluido" solo i numeri, mantenendo la tua posizione di scorrimento!
            else if (menuAttivo !== 'ARCHIVIO' && menuAttivo !== 'FORNITORI' && menuAttivo !== '') {
                const datiAggiornati = JSON.parse(localStorage.getItem('inventario_dati_' + menuAttivo)) || {};
                
                ingredienti.forEach((ing, i) => {
                    const input = document.getElementById(`sel-${i}`);
                    // Aggiorna il numero solo se non stai letteralmente cliccando dentro quella precisa casella in questo istante
                    if (input && document.activeElement !== input) { 
                        const nuovoValore = datiAggiornati[ing.nome] || "";
                        if (input.value !== nuovoValore) {
                            input.value = nuovoValore; // Inietta il nuovo dato
                            const soglia = isWeekendDomani ? ing.we : ing.fer;
                            valuta(i, soglia); // Aggiorna i colori verde/rosso
                        }
                    }
                });
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
// GESTIONE ORDINI FORNITORE: TONON (DOPPIA FASCIA INFRAS/WEEKEND)
// ============================================================================

const FORMATO_SCATOLA = {
    mozza: 6,    // 1 scatola = 6 kg
    bufala: 24,  // 1 scatola = 24 pezzi singoli
    provola: 1   // 1 pezzo = 1 provola
};

// Tetti massimi sdoppiati per consegna.
// CONSEGNA_1: Arrivo inizio settimana
// CONSEGNA_2: Arrivo per il weekend
const FABBISOGNO_TONON = {
    SILEA: {
        // Ordine Domenica -> Arriva Martedì -> Copre Mar, Mer (2 giorni)
        CONSEGNA_1: { mozza: 24, bufala: 24, provola: 4 }, // <--- MODIFICA QUESTI NUMERI
        // Ordine Mercoledì -> Arriva Giovedì -> Copre Gio, Ven, Sab, Dom (4 giorni)
        CONSEGNA_2: { mozza: 84, bufala: 72, provola: 7 }
    },
    CASTA: {
        // Ordine Domenica -> Arriva Lunedì -> Copre Lun, Mar, Mer, Gio (4 giorni)
        CONSEGNA_1: { mozza: 50, bufala: 48, provola: 10 }, // <--- MODIFICA QUESTI NUMERI
        // Ordine Giovedì -> Arriva Venerdì -> Copre Ven, Sab, Dom (3 giorni)
        CONSEGNA_2: { mozza: 84, bufala: 72, provola: 10 }
    },
    BIBAN: {
        // Ordine Domenica -> Arriva Martedì -> Copre Mar, Mer, Gio (3 giorni)
        CONSEGNA_1: { mozza: 50, bufala: 48, provola: 8 }, // <--- MODIFICA QUESTI NUMERI
        // Ordine Giovedì -> Arriva Venerdì -> Copre Ven, Sab, Dom, Lun (4 giorni)
        CONSEGNA_2: { mozza: 90, bufala: 72, provola: 10 }
    }
};

const CONSEGNE_TONON = {
    SILEA: [2, 4], // 2=Mar, 4=Gio
    CASTA: [1, 5], // 1=Lun, 5=Ven
    BIBAN: [2, 5]  // 2=Mar, 5=Ven
};

const NOMI_GIORNI_BREVI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

function cercaGiacenza(inventario, tipo) {
    for (const key in inventario) {
        const keyLower = key.toLowerCase().trim();
        let match = false;
        
        if (tipo === 'mozza') match = keyLower.includes('mozza') && !keyLower.includes('bufala');
        else if (tipo === 'bufala') match = keyLower.includes('bufala');
        else if (tipo === 'provola') match = keyLower.includes('provola');

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

    // Cerca il primo giorno di consegna successivo a oggi
    let indiceConsegna = giorniConsegna.findIndex(g => g > giornoAttuale);

    // Se faccio l'ordine nel weekend e non trova giorni maggiori, riparte dalla prima consegna della settimana (indice 0)
    if (indiceConsegna === -1) {
        indiceConsegna = 0;
    }

    return {
        giornoConsegnaBreve: NOMI_GIORNI_BREVI[giorniConsegna[indiceConsegna]],
        tipoConsegna: indiceConsegna === 0 ? 'CONSEGNA_1' : 'CONSEGNA_2'
    };
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

    // Prende i target specifici in base al tipo di consegna che sta calcolando
    const targetSede = FABBISOGNO_TONON[sedeKey][finestra.tipoConsegna];
    const ordineScatole = {};

    ['mozza', 'bufala', 'provola'].forEach(prodotto => {
        const target = targetSede[prodotto] || 0;
        const daOrdinareNetto = Math.max(0, target - giacenze[prodotto]);
        ordineScatole[prodotto] = Math.ceil(daOrdinareNetto / FORMATO_SCATOLA[prodotto]);
    });

    // Aggiunge un'etichetta nel messaggio per farti sapere quale logica sta usando
    const labelTipo = finestra.tipoConsegna === 'CONSEGNA_1' ? 'Infrasettimanale' : 'Weekend';

    return `${nomeDisplay} ${finestra.giornoConsegnaBreve} (${labelTipo})\n` +
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

function generaOrdineMetro(dati) {
    let testoOrdine = "";
    const sedi = ['Biban', 'Casta', 'Silea'];
    
    // Preparo la lettura del magazzino di Casta per la regola speciale delle patate
    const listaCasta = dati['CASTA'] || {};
    const getValCasta = (nome) => parseFloat(listaCasta[nome]) || 0;
    
    sedi.forEach(sede => {
        let sedeKey = sede.toUpperCase(); // Es: 'BIBAN'
        let lista = dati[sedeKey] || {};
        
        // Funzione per leggere i numeri del locale attuale in modo sicuro
        const getVal = (nome) => parseFloat(lista[nome]) || 0;
        
        let ordineSede = [];
        
        // 1. Ricotta (Soglia totale 10)
        let qRicotta = Math.ceil(10 - getVal('ricotta'));
        if (qRicotta > 0) ordineSede.push(`${qRicotta} Ricotta`);
        
        // 2. No Lattosio (Soglia totale 15, buste da 3)
        let qNoLatt = Math.ceil((15 - getVal('nolatt')) / 3);
        if (qNoLatt > 0) ordineSede.push(`${qNoLatt} NoLatt`);
        
        // 3. Parmigiano 24m (Soglia totale 5)
        let qParm = Math.ceil(5 - getVal('parmigiano'));
        if (qParm > 0) ordineSede.push(`${qParm} Parmigiano`);
        
        // 4. Stracciatella (Soglia totale 8)
        let qStracc = Math.ceil(8 - getVal('stracciatella'));
        if (qStracc > 0) ordineSede.push(`${qStracc} Stracciatella`);
        
        // 5. Speck (Soglia 2. Sopra 0.3 ordina 1, sotto ordina per arrivare a 2)
        let valSpeck = getVal('speck');
        let qSpeck = 0;
        if (valSpeck < 2) {
            if (valSpeck > 0.3) {
                qSpeck = 1;
            } else {
                qSpeck = Math.ceil(2 - valSpeck);
            }
        }
        if (qSpeck > 0) ordineSede.push(`${qSpeck} Speck`);
        
        // 6. Mortadella (Soglia 1. Sotto 1 ordina 1, se sopra 1 non ordina)
        if (getVal('mortadella') < 1) ordineSede.push(`1 Mortadella`);
        
        // 7. Crudo (Soglia 1.5. Arrotondato per eccesso)
        let qCrudo = Math.ceil(1.5 - getVal('crudo'));
        if (qCrudo > 0) ordineSede.push(`${qCrudo} Crudo`);
        
        // 8. Datterino Rosso (Soglie: Casta 5, Silea 2, Biban 4)
        let sogliaDattRosso = (sede === 'Casta') ? 5 : (sede === 'Silea' ? 2 : 4);
        let qDattRosso = Math.ceil(sogliaDattRosso - getVal('dattrosso'));
        if (qDattRosso > 0) ordineSede.push(`${qDattRosso} Datt. rosso`);
        
        // 9. Datterino Giallo (Soglia 6 vaschette, che formano 1 cassa)
        if (getVal('dattgiallo') < 6) ordineSede.push(`1 Datt. Giallo o Arancione`);
        
        // 10. Noci (Soglia totale 3 per tutti)
        let qNoci = Math.ceil(3 - getVal('noci'));
        if (qNoci > 0) ordineSede.push(`${qNoci} Noci`);

        // 11. Pellicola (Soglia: Casta/Biban 6, Silea 2)
        let sogliaPellicola = (sede === 'Silea') ? 2 : 6;
        let qPellicola = Math.ceil(sogliaPellicola - getVal('pellicola'));
        if (qPellicola > 0) ordineSede.push(`${qPellicola} Pellicola`);

        // 12. Coca Cola (Senza N. - casse da 24)
        let qCoca = Math.ceil((48 - getVal('cocacola')) / 24);
        if (qCoca > 0) ordineSede.push(`${qCoca} casse Coca Cola`);

        // 13. Coca Cola zero (Senza N. - casse da 24)
        let qCocaZero = Math.ceil((48 - getVal('cocacolazero')) / 24);
        if (qCocaZero > 0) ordineSede.push(`${qCocaZero} casse Coca Cola zero`);

        // 14. Ichnusa non filtrata (Senza N. - casse da 15)
        let qIchnusa = Math.ceil((30 - getVal('ichnusa')) / 15);
        if (qIchnusa > 0) ordineSede.push(`${qIchnusa} casse Ichnusa non filtrata`);

        // 15. Pedavena (Senza N. - casse da 15)
        let qPedavena = Math.ceil((30 - getVal('pedavena')) / 15);
        if (qPedavena > 0) ordineSede.push(`${qPedavena} casse Pedavena`);

        // === REGOLE ESCLUSIVE PER BIBAN ===
        if (sede === 'Biban') {
            // Sale fino (Soglia totale 3, ordinato SOLO a Biban)
            let qSale = Math.ceil(3 - getVal('sale'));
            if (qSale > 0) ordineSede.push(`${qSale} sale fino (10kg)`);

            // Patate fritte: soglia 25 sacchetti. Arrivano in scatole da 5.
            let qPatateFritte = Math.ceil((25 - getValCasta('patatefritte')) / 5);
            if (qPatateFritte > 0) ordineSede.push(`${qPatateFritte} scatole Patate fritte`);
            
            // Patate al forno: soglia 25 sacchetti. Arrivano in scatole da 5.
            let qPatateForno = Math.ceil((25 - getValCasta('patateforno')) / 5);
            if (qPatateForno > 0) ordineSede.push(`${qPatateForno} scatole Patate al forno`);
        }
        
        // Costruzione finale del testo per la sede attuale
        if (ordineSede.length > 0) {
            testoOrdine += `${sede}\n`;
            ordineSede.forEach(item => {
                testoOrdine += `  ${item}\n`;
            });
            testoOrdine += `\n`; 
        }
    });
    
    return testoOrdine.trim();
}

function inviaOrdineMetro() {
    // Legge i dati REALI salvati nella memoria del dispositivo per le 3 sedi
    let tuttiIDati = {
        'BIBAN': JSON.parse(localStorage.getItem('inventario_dati_BIBAN')) || {},
        'CASTA': JSON.parse(localStorage.getItem('inventario_dati_CASTA')) || {},
        'SILEA': JSON.parse(localStorage.getItem('inventario_dati_SILEA')) || {}
    };

    // Richiama la grande funzione matematica che abbiamo creato prima
    let testoOrdine = generaOrdineMetro(tuttiIDati);

    if (testoOrdine === "") {
        alert("Nessun prodotto sotto soglia. Non c'è nulla da ordinare alla Metro!");
        return;
    }

  // Apre WhatsApp e ti fa scegliere il contatto a cui inviarlo
    window.location.href = "whatsapp://send?text=" + encodeURIComponent(testoOrdine);
}
// Se l'utente è nella vista singola e preme il tasto in index.html, usa questa stessa funzione
const btnMetroFisico = document.getElementById('btn-invia-metro');
if (btnMetroFisico) {
    btnMetroFisico.addEventListener('click', inviaOrdineMetro);
}

window.onload = async function() {
    const nomiGiorni = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
    document.getElementById('info-giorno').innerHTML = `Lista per <b>${nomiGiorni[domani.getDay()]}</b> ${isWeekendDomani?'(FESTIVO)':''}`;
    
    // Al primo avvio carica i dati normalmente
    await syncCloud(); 
};

// === FUNZIONE DEDICATA AL RISVEGLIO DELL'APP ===
function risveglioApp() {
    const status = document.getElementById('sync-status');
    if (status) {
        status.innerText = '🔄 Aggiornamento dati al rientro...';
        status.style.color = "#e67e22"; 
    }
    
    // Disattiva istantaneamente lo scudo per forzare il download dei dati freschi
    ultimoSalvataggio = 0; 
    syncCloud();
}

// === CRONOMETRO BACKGROUND ===
let orarioUscita = Date.now(); // Registra il momento in cui apri l'app

// GESTIONE USCITA E RIENTRO DALL'APP
document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") {
        modificheNonSalvate = false; 
        if (document.activeElement) document.activeElement.blur(); 
        
        // Fai scattare il cronometro appena l'app va in background
        orarioUscita = Date.now(); 
        
    } else if (document.visibilityState === "visible") {
        // Calcola quanto tempo sei stata fuori (in millisecondi)
        let tempoFuori = Date.now() - orarioUscita;
        
        // 5 minuti equivalgono a 300.000 millisecondi (5 * 60 * 1000)
        // Se sei stata via per PIÙ di 5 minuti, fa l'aggiornamento automatico
        if (tempoFuori > 300000) {
            setTimeout(risveglioApp, 2500);
        }
        // Se sei stata via per MENO di 5 minuti, l'app non fa assolutamente nulla e ti lascia lavorare
    }
});

// GESTIONE "SCONGELAMENTO" MEMORIA BROWSER
window.addEventListener("pageshow", function(e) {
    if (e.persisted) {
        modificheNonSalvate = false;
        // In caso di vero e proprio congelamento di sistema, forziamo l'aggiornamento per sicurezza
        setTimeout(risveglioApp, 2500);
    }
});

// --- CONFIGURAZIONE E UTILS ---
const API_URL = 'http://localhost:8080/api/issues';
let allIssues = [];
let currentEditingId = null;
let currentFilterMode = 'ALL'; // Di default mostra tutto

// Gestione Utente
const storedUser = localStorage.getItem('user');
if (!storedUser) window.location.href = 'login.html';
const currentUser = JSON.parse(storedUser);

// Funzione helper per capire chi è l'utente attuale
function getCurrentUserName() {
    const email = currentUser.email.toLowerCase(); // Convertiamo sempre in minuscolo per sicurezza

    // Se sei uno dei "VIP", usa il nome completo
    if (email.includes("mario")) return "Mario Rossi";
    if (email.includes("luigi")) return "Luigi Verdi";
    if (email.includes("peach")) return "Peach";

    // SE SEI TU (o un utente nuovo):
    // Restituisce l'email esatta
    return currentUser.email;
}

// Mostra l'utente nella barra in alto
const userDisplay = document.getElementById('user-display');
if(userDisplay) {
    userDisplay.innerHTML = `Ciao, <b>${currentUser.email}</b> <button class="logout-btn" onclick="logout()">Esci</button>`;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// --- FUNZIONE TOAST (NOTIFICHE) ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    // Se non esiste il container nel HTML, crealo al volo (sicurezza)
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// --- LOGICA PRINCIPALE ---
async function loadIssues() {
    try {
        // Aggiungiamo un timestamp per evitare che il browser usi dati vecchi (cache)
        const response = await fetch(API_URL + '?t=' + new Date().getTime());
        allIssues = await response.json();

        // Applichiamo il filtro salvato
        filterIssues(currentFilterMode);
    } catch (error) {
        console.error(error);
        showToast("Errore caricamento dati", "error");
    }
}

// --- FUNZIONE FILTRI (Corretta e Case-Insensitive) ---
function filterIssues(type) {
    currentFilterMode = type;

    // 1. Gestione Grafica Bottoni
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (typeof event !== 'undefined' && event) event.target.classList.add('active');

    // 2. Logica di Filtro
    if (type === 'ALL') {
        renderIssues(allIssues);

    } else if (type === 'MINE') {
        const myName = getCurrentUserName().toLowerCase();
        const myEmail = currentUser.email.toLowerCase();

        console.log("Filtro i ticket per:", myName);

        const myTickets = allIssues.filter(i => {
            // Controllo sicuro ignorando maiuscole/minuscole
            const assignee = (i.assignee || '').toLowerCase();
            const reporter = (i.reporter && i.reporter.email) ? i.reporter.email.toLowerCase() : '';

            return assignee === myName || reporter === myEmail;
        });

        renderIssues(myTickets);

    } else {
        renderIssues(allIssues.filter(i => i.type === type));
    }
}

// --- RENDER KANBAN BOARD ---
function renderIssues(listData) {
    // 1. Pulisci le 3 colonne
    const colOpen = document.getElementById('list-open');
    const colProgress = document.getElementById('list-in-progress');
    const colDone = document.getElementById('list-done');

    if (!colOpen || !colProgress || !colDone) return;

    colOpen.innerHTML = '';
    colProgress.innerHTML = '';
    colDone.innerHTML = '';

    // 2. Contatori
    let countOpen = 0;
    let countProgress = 0;
    let countDone = 0;

    const priorityColors = { 'HIGH': 'red', 'MEDIUM': 'orange', 'LOW': 'green' };

    listData.slice().reverse().forEach(issue => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderLeft = `5px solid ${priorityColors[issue.priority] || 'grey'}`;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <span class="badge bg-${issue.type}" style="font-size:0.75em; padding:4px 8px; border-radius:4px;">${issue.type}</span>
                <small style="font-weight:bold; color:${priorityColors[issue.priority]}">${issue.priority}</small>
            </div>

            <h4 style="margin: 0 0 5px 0; font-size: 1.1em; color: #2c3e50;">${issue.title}</h4>

            <div style="font-size: 0.85em; color: #666; margin-bottom: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${issue.description}
            </div>

            <div style="border-top: 1px solid #f0f0f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-size: 0.75em; color: #999;">Assegnato a:</span>
                    <span style="font-size: 0.85em; font-weight: 600; color: #444;">👤 ${issue.assignee || 'Nessuno'}</span>
                </div>

                <div class="card-actions" style="display: flex; gap: 5px;">
                    ${issue.status === 'OPEN' ?
                      `<button onclick="updateStatus(${issue.id}, 'IN_PROGRESS')" class="mini-btn btn-progress" title="Prendi in carico">🔥</button>` : ''}

                    ${issue.status === 'IN_PROGRESS' ?
                      `<button onclick="closeIssue(${issue.id})" class="mini-btn btn-done" title="Concludi">✅</button>` : ''}

                    <button onclick="startEdit(${issue.id})" class="mini-btn" title="Modifica">✏️</button>
                    <button onclick="deleteIssue(${issue.id})" class="mini-btn btn-delete" title="Elimina">🗑️</button>
                </div>
            </div>
        `;

        // 3. Smistamento Colonne
        if (issue.status === 'IN_PROGRESS') {
            colProgress.appendChild(card);
            countProgress++;
        } else if (issue.status === 'DONE' || issue.status === 'CLOSED') {
            colDone.appendChild(card);
            countDone++;
        } else {
            colOpen.appendChild(card);
            countOpen++;
        }
    });

    // 4. Aggiorna contatori
    if(document.getElementById('count-open')) document.getElementById('count-open').textContent = countOpen;
    if(document.getElementById('count-progress')) document.getElementById('count-progress').textContent = countProgress;
    if(document.getElementById('count-done')) document.getElementById('count-done').textContent = countDone;
}

// --- AZIONI CRUD ---

// Funzione Sicura per Aggiornare lo Stato
async function updateStatus(id, newStatus) {
    const issue = allIssues.find(i => i.id === id);
    if (!issue) return;

    const myName = getCurrentUserName(); // Prende il nome attuale

    // --- BLOCCO DI SICUREZZA ---
    // Se il ticket è assegnato a qualcuno (non Nessuno) E quel qualcuno NON sono io (ignorando maiuscole)
    const isAssignedToSomeoneElse = issue.assignee &&
                                    issue.assignee !== 'Nessuno' &&
                                    issue.assignee.toLowerCase() !== myName.toLowerCase();

    if (isAssignedToSomeoneElse) {
        Swal.fire({
            icon: 'error',
            title: 'Non toccare!',
            text: `Questo ticket è assegnato a ${issue.assignee}. Non puoi prenderlo tu!`
        });
        return;
    }

    // Aggiorno lo stato locale
    issue.status = newStatus;

    // Se lo prendo in carico, mi auto-assegno
    if (newStatus === 'IN_PROGRESS' && (!issue.assignee || issue.assignee === 'Nessuno')) {
        issue.assignee = myName;
    }

    try {
        const response = await fetch(API_URL + '/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issue)
        });

        if (response.ok) {
            loadIssues();
            showToast(`Stato aggiornato!`, "success");
        }
    } catch (e) { console.error(e); }
}

function deleteIssue(id) {
    Swal.fire({
        title: 'Sei sicuro?',
        text: "Non potrai recuperare questa segnalazione!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sì, elimina!',
        cancelButtonText: 'Annulla'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                Swal.fire('Eliminato!', 'La segnalazione è stata cancellata.', 'success');
                loadIssues();
            } catch (error) {
                console.error("Errore:", error);
                Swal.fire('Errore!', 'Impossibile eliminare il ticket.', 'error');
            }
        }
    });
}

async function closeIssue(id) {
    try {
        const response = await fetch(API_URL + '/' + id + '/close', { method: 'PUT' });
        if (response.ok) {
            loadIssues();
            showToast("Ticket risolto! Ottimo lavoro 👏", "success");
        }
    } catch (e) { console.error(e); }
}

function startEdit(id) {
    const issue = allIssues.find(i => i.id === id);
    if (!issue) return;

    document.getElementById('title').value = issue.title;
    document.getElementById('description').value = issue.description;
    document.getElementById('type').value = issue.type;
    document.getElementById('priority').value = issue.priority;
    document.getElementById('assignee').value = issue.assignee || 'Nessuno';

    currentEditingId = id;
    document.querySelector('.submit-btn').textContent = "💾 Salva Modifiche";
    window.scrollTo(0, 0);
}

// Gestione Form (Create & Update)
document.getElementById('createIssueForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const issueData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        type: document.getElementById('type').value,
        priority: document.getElementById('priority').value,
        assignee: document.getElementById('assignee').value
    };

    if (currentEditingId) {
        // UPDATE
        const response = await fetch(API_URL + '/' + currentEditingId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issueData)
        });
        if (response.ok) {
            showToast("Modifica salvata con successo!", "success");
            resetForm();
            loadIssues();
        }
    } else {
        // CREATE
        const response = await fetch(API_URL + '?reporterId=' + currentUser.id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issueData)
        });
        if (response.ok) {
            showToast("Nuovo ticket creato!", "success");
            resetForm();
            loadIssues();
        } else {
            showToast("Errore dal server!", "error");
        }
    }
});

function resetForm() {
    document.getElementById('createIssueForm').reset();
    currentEditingId = null;
    document.querySelector('.submit-btn').textContent = "Invia Segnalazione";
}

// Logica Ricerca
const searchBar = document.getElementById('searchBar');
if(searchBar) {
    searchBar.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allIssues.filter(issue =>
            issue.title.toLowerCase().includes(term) ||
            issue.description.toLowerCase().includes(term)
        );
        renderIssues(filtered);
    });
}

// Avvio
loadIssues();

// --- DARK MODE LOGIC ---
const themeBtn = document.getElementById('themeToggle');
const body = document.body;
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if(themeBtn) themeBtn.innerText = '☀️';
}

if(themeBtn) {
    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeBtn.innerText = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeBtn.innerText = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });
}
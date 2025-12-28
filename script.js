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
    const email = currentUser.email.toLowerCase();

    if (email.includes("mario")) return "Mario Rossi";
    if (email.includes("luigi")) return "Luigi Verdi";
    if (email.includes("peach")) return "Peach";

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
        const response = await fetch(API_URL + '?t=' + new Date().getTime());
        allIssues = await response.json();
        filterIssues(currentFilterMode);
    } catch (error) {
        console.error(error);
        showToast("Errore caricamento dati", "error");
    }
}

// --- FUNZIONE FILTRI ---
function filterIssues(type) {
    currentFilterMode = type;

    // Gestione Grafica Bottoni
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (typeof event !== 'undefined' && event) event.target.classList.add('active');

    // Logica di Filtro
    if (type === 'ALL') {
        renderIssues(allIssues);
    } else if (type === 'MINE') {
        const myName = getCurrentUserName().toLowerCase().trim();
        const myEmail = currentUser.email.toLowerCase().trim();

        const myTickets = allIssues.filter(i => {
            const assignee = (i.assignee || '').toLowerCase().trim();
            const reporter = (i.reporter && i.reporter.email) ? i.reporter.email.toLowerCase().trim() : '';

            // Logica permissiva: controlla se il nome è contenuto
            const isAssigned = assignee === myName || assignee.includes(myName) || myName.includes(assignee);
            const isReporter = reporter === myEmail;

            return isAssigned || isReporter;
        });

        renderIssues(myTickets);
    } else {
        renderIssues(allIssues.filter(i => i.type === type));
    }
}

// --- RENDER KANBAN BOARD ---
function renderIssues(listData) {
    // 1. Pulisci le colonne
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

        // --- FORMATTAZIONE DATA E REPORTER ---

        // Data
        const dateStr = issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('it-IT', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
        }) : 'Data N/A';

        // Nome Reporter (pulito dalla mail)
        const reporterName = issue.reporter ? issue.reporter.email.split('@')[0] : 'Anonimo';

        // --- HTML DELLA CARD ---
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <span class="badge bg-${issue.type}" style="font-size:0.75em; padding:4px 8px; border-radius:4px;">${issue.type}</span>
                <small style="font-weight:bold; color:${priorityColors[issue.priority]}">${issue.priority}</small>
            </div>

            <h4 style="margin: 0 0 5px 0; font-size: 1.1em; color: #2c3e50;">${issue.title}</h4>

            <div style="font-size: 0.85em; color: #666; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${issue.description}
            </div>

            <div style="font-size: 0.75em; color: #888; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <span>📅 ${dateStr}</span>
                <span title="Creato da">🎤 <b>${reporterName}</b></span>
            </div>

            <div style="border-top: 1px solid #f0f0f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-size: 0.75em; color: #999;">Assegnato a:</span>
                    <span style="font-size: 0.85em; font-weight: 600; color: #444;">👤 ${issue.assignee || 'Nessuno'}</span>
                </div>

                <div class="card-actions" style="display: flex; gap: 5px;">
                        <button onclick="openComments(${issue.id}, '${issue.title.replace(/'/g, "\\'")}')" class="mini-btn" title="Discussione">💬</button>

                        ${issue.status === 'OPEN' ?
                             `<button onclick="updateStatus(${issue.id}, 'IN_PROGRESS')" class="mini-btn btn-progress" title="Prendi in carico">🔥</button>` : ''}

                         ${issue.status === 'IN_PROGRESS' || issue.status === 'IN PROGRESS' ?
                        `<button onclick="closeIssue(${issue.id})" class="mini-btn btn-done" title="Concludi">✅</button>` : ''}

                        <button onclick="startEdit(${issue.id})" class="mini-btn" title="Modifica">✏️</button>
                        <button onclick="deleteIssue(${issue.id})" class="mini-btn btn-delete" title="Elimina">🗑️</button>
                </div>
            </div>
        `;

        // 3. Smistamento Colonne
        // Controllo sicuro anche per status scritti male (es. "IN PROGRESS" con lo spazio)
        const status = (issue.status || '').toUpperCase();

        if (status === 'IN_PROGRESS' || status === 'IN PROGRESS') {
            colProgress.appendChild(card);
            countProgress++;
        } else if (status === 'DONE' || status === 'CLOSED' || status === 'RESOLVED') {
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

async function updateStatus(id, newStatus) {
    const issue = allIssues.find(i => i.id === id);
    if (!issue) return;

    const myName = getCurrentUserName();

    // BLOCCO DI SICUREZZA: Non rubare ticket altrui
    const isAssignedToSomeoneElse = issue.assignee &&
                                    issue.assignee !== 'Nessuno' &&
                                    !issue.assignee.toLowerCase().includes(myName.toLowerCase()); // Controllo più gentile

    if (isAssignedToSomeoneElse) {
        Swal.fire({
            icon: 'error',
            title: 'Non toccare!',
            text: `Questo ticket è assegnato a ${issue.assignee}. Non puoi prenderlo tu!`
        });
        return;
    }

    // Aggiorno dati locali per l'invio
    issue.status = newStatus;

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
        text: "Non potrai recuperare questa segnalazione e i suoi commenti!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sì, elimina!',
        cancelButtonText: 'Annulla'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

                // 👇 CONTROLLO FONDAMENTALE: È andato tutto bene?
                if (response.ok) {
                    Swal.fire('Eliminato!', 'La segnalazione è stata cancellata.', 'success');
                    loadIssues(); // Aggiorna la board
                } else {
                    // Se il server ha detto "NO", mostriamo un errore
                    Swal.fire('Errore!', 'Impossibile eliminare: forse ci sono problemi col database.', 'error');
                }
            } catch (error) {
                console.error("Errore:", error);
                Swal.fire('Errore!', 'Problema di connessione.', 'error');
            }
        }
    });
}

async function closeIssue(id) {
    try {
        // Nota: Assicurati che nel backend esista /{id}/close, altrimenti usiamo updateStatus normale
        // Per sicurezza qui uso la logica standard di update se l'endpoint specifico fallisce
        const issue = allIssues.find(i => i.id === id);
        issue.status = 'CLOSED';

        const response = await fetch(API_URL + '/' + id, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(issue)
        });

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

    // 1. Raccogliamo i dati dal modulo
    let issueData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        type: document.getElementById('type').value,
        priority: document.getElementById('priority').value,
        assignee: document.getElementById('assignee').value
    };

    if (currentEditingId) {
        // --- MODALITÀ MODIFICA (UPDATE) ---

        // RECUPERIAMO IL TICKET ORIGINALE
        const originalIssue = allIssues.find(i => i.id === currentEditingId);

        if (originalIssue) {
            // FIX QUI: Manteniamo lo stato vecchio! Altrimenti torna a "Da Fare"
            issueData.status = originalIssue.status;

            // Già che ci siamo, manteniamo anche data e reporter originali per sicurezza
            issueData.createdAt = originalIssue.createdAt;
            issueData.reporter = originalIssue.reporter;
        }

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
        // --- MODALITÀ CREAZIONE (CREATE) ---
        // Qui lo stato sarà gestito dal backend (default OPEN)
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

// --- LOGICA CHAT / COMMENTI ---
let currentChatIssueId = null;

async function openComments(issueId, issueTitle) {
    currentChatIssueId = issueId;
    document.getElementById('comment-modal').style.display = 'flex'; // Mostra modale
    document.getElementById('chat-title').innerText = "💬 " + issueTitle;

    await loadComments(issueId);
}

function closeComments() {
    document.getElementById('comment-modal').style.display = 'none';
    currentChatIssueId = null;
}

async function loadComments(issueId) {
    const chatBody = document.getElementById('chat-body');
    chatBody.innerHTML = '<p style="text-align:center; color:#888;">Caricamento...</p>';

    try {
        const response = await fetch(`${API_URL.replace('/issues', '/comments')}/issue/${issueId}`);
        const comments = await response.json();

        chatBody.innerHTML = ''; // Pulisce

        if (comments.length === 0) {
            chatBody.innerHTML = '<p style="text-align:center; color:#ccc; margin-top:20px;">Nessun commento ancora. Scrivi tu!</p>';
            return;
        }

        const myEmail = currentUser.email;

        comments.forEach(c => {
            const isMine = c.author.email === myEmail;
            const div = document.createElement('div');
            div.className = `chat-msg ${isMine ? 'msg-mine' : 'msg-others'}`;

            // Formatta data
            const date = new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            div.innerHTML = `
                <span class="msg-info">${isMine ? 'Tu' : c.author.email.split('@')[0]} • ${date}</span>
                ${c.text}
            `;
            chatBody.appendChild(div);
        });

        // Scroll automatico in fondo
        chatBody.scrollTop = chatBody.scrollHeight;

    } catch (e) {
        console.error(e);
        chatBody.innerHTML = '<p style="color:red; text-align:center;">Errore caricamento chat</p>';
    }
}

async function sendComment() {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text || !currentChatIssueId) return;

    try {
        // currentUser.id deve esistere (salvato al login)
        const response = await fetch(`${API_URL.replace('/issues', '/comments')}?issueId=${currentChatIssueId}&authorId=${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        if (response.ok) {
            input.value = ''; // Pulisci input
            loadComments(currentChatIssueId); // Ricarica messaggi
        } else {
            showToast("Errore invio commento", "error");
        }
    } catch (e) { console.error(e); }
}

// Invia con tasto Enter
function handleEnter(e) {
    if (e.key === 'Enter') sendComment();
}
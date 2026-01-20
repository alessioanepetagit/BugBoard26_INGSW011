// --- CONFIGURAZIONE E UTILS ---
const API_URL = 'http://localhost:8080/api/issues';
const USERS_URL = 'http://localhost:8080/api/users';
let allIssues = [];
let currentEditingId = null;
let currentFilterMode = 'ALL';
let existingImageBase64 = null;
let currentSortOrder = 'DATE_DESC';

// Gestione Utente (Login check)
const storedUser = localStorage.getItem('user');
if (!storedUser) window.location.href = 'login.html';
const currentUser = JSON.parse(storedUser);

// --- 1. ASPETTIAMO CHE LA PAGINA SIA CARICA ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 PAGINA CARICATA: Inizializzazione script...");

    loadIssues();
    setupUserInterface();
    setupTheme();
    setupSearch();

    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', handleCreateUser);
    }

    const createIssueForm = document.getElementById('createIssueForm');
    if (createIssueForm) {
        createIssueForm.addEventListener('submit', handleCreateIssue);
    }
});

// --- FUNZIONI INTERFACCIA ---
function setupUserInterface() {
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        const isUserAdmin = currentUser.role === 'ADMIN';
        const roleBadge = isUserAdmin ? ' <span style="background:gold; color:black; padding:2px 6px; border-radius:4px; font-size:0.8em; font-weight:bold;">ADMIN</span>' : '';
        const adminBtn = isUserAdmin ? `<button onclick="openUserModal()" class="logout-btn" style="background:#27ae60; margin-right:5px;">👥 Nuova Utenza</button>` : '';

        userDisplay.innerHTML = `Ciao, <b>${currentUser.email}</b>${roleBadge} ${adminBtn} <button class="logout-btn" onclick="logout()">Esci</button>`;
    }
}

function setupTheme() {
    const themeBtn = document.getElementById('themeToggle');
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    if (themeBtn) themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
}

function setupSearch() {
    const searchBar = document.getElementById('searchBar');
    if (searchBar) searchBar.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const visible = allIssues.filter(i => i.status !== 'ARCHIVED');
        renderIssues(visible.filter(i => i.title.toLowerCase().includes(term) || i.description.toLowerCase().includes(term)));
    });
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// --- LOGICA GESTIONE UTENTI (ADMIN) ---
function openUserModal() { document.getElementById('user-modal').style.display = 'flex'; }
function closeUserModal() { document.getElementById('user-modal').style.display = 'none'; }

async function handleCreateUser(e) {
    e.preventDefault();
    const newUser = {
        name: document.getElementById('newUserName').value.trim(),
        email: document.getElementById('newUserEmail').value.trim(),
        password: document.getElementById('newUserPassword').value.trim(),
        role: document.getElementById('newUserRole').value
    };

    if(!newUser.name || !newUser.email || !newUser.password) {
        return Swal.fire('Attenzione', 'Tutti i campi sono obbligatori e non possono essere vuoti.', 'warning');
    }

    try {
        const response = await fetch(USERS_URL + '/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (response.ok) {
            Swal.fire('Fatto!', `Utente ${newUser.name} creato con successo.`, 'success');
            document.getElementById('createUserForm').reset();
            closeUserModal();
        } else {
            const msg = await response.text();
            Swal.fire('Errore', msg || 'Impossibile creare utente', 'error');
        }
    } catch (error) {
        console.error("❌ ERRORE RETE:", error);
        Swal.fire('Errore', 'Problema di connessione', 'error');
    }
}

// --- LOGICA PRINCIPALE TICKET ---
async function loadIssues() {
    try {
        const response = await fetch(API_URL + '?t=' + new Date().getTime());
        allIssues = await response.json();
        filterIssues(currentFilterMode);
    } catch (error) {
        console.error(error);
    }
}

async function handleCreateIssue(e) {
    e.preventDefault();

    const titleVal = document.getElementById('title').value.trim();
    const descVal = document.getElementById('description').value.trim();

    if (!titleVal || !descVal) {
        showToast("⚠️ Titolo e Descrizione non possono essere vuoti (o solo spazi)!", "warning");
        return;
    }

    const fileInput = document.getElementById('imageUpload');
    let finalImageBase64 = existingImageBase64;

    if (fileInput && fileInput.files.length > 0) {
        try { finalImageBase64 = await toBase64(fileInput.files[0]); } catch (error) { return; }
    }

    let formData = {
        title: titleVal,
        description: descVal,
        type: document.getElementById('type').value,
        priority: document.getElementById('priority').value,
        assignee: null,
        imageBase64: finalImageBase64
    };

    try {
        let response;
        if (currentEditingId) {
            const original = allIssues.find(i => i.id === currentEditingId);
            if (original) {
                formData.status = original.status;
                formData.createdAt = original.createdAt;
                formData.reporter = original.reporter;
            }
            response = await fetch(API_URL + '/' + currentEditingId, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
            });
        } else {

            response = await fetch(API_URL + '/' + currentUser.id, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            const savedIssue = await response.json();

            if (currentEditingId) {
                const index = allIssues.findIndex(i => i.id === currentEditingId);
                if (index !== -1) allIssues[index] = savedIssue;
                showToast("Modifica salvata!", "success");
            } else {
                const safeIssue = {
                    ...savedIssue,
                    reporter: savedIssue.reporter || currentUser,
                    createdAt: savedIssue.createdAt || new Date().toISOString(),
                    priority: savedIssue.priority || formData.priority,
                    type: savedIssue.type || formData.type,
                    status: savedIssue.status || 'TODO'
                };
                allIssues.push(safeIssue);
                showToast("Nuovo ticket creato!", "success");
            }

            const form = document.getElementById('createIssueForm');
            if (form) form.reset();

            const imgContainer = document.getElementById('editImagePreviewContainer');
            if (imgContainer) imgContainer.style.display = 'none';

            existingImageBase64 = null;
            currentEditingId = null;

            const submitBtn = document.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = "Invia Segnalazione";

            filterIssues(currentFilterMode);

        } else {
            if (response.status === 500) {
                showToast("⚠️ Errore: Il testo inserito è troppo lungo!", "error");
            } else {
                const errorText = await response.text();
                let cleanMsg = errorText;
                try {
                    const jsonError = JSON.parse(errorText);
                    if(jsonError.message) cleanMsg = jsonError.message;
                } catch(e) { }
                showToast("Errore: " + cleanMsg, "error");
            }
        }

    } catch (error) {
        console.error("ERRORE CRITICO:", error);
        showToast("Errore imprevisto: " + error.message, "error");
    }
}

function changeSortOrder(order) {
    currentSortOrder = order;
    filterIssues(currentFilterMode);
}

function filterIssues(type) {
    currentFilterMode = type;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (typeof event !== 'undefined' && event.target.classList.contains('filter-btn')) event.target.classList.add('active');

    const visibleIssues = allIssues.filter(i => i.status !== 'ARCHIVED');

    if (type === 'ALL') {
        renderIssues(visibleIssues);
    } else if (type === 'MINE') {
        const myName = getCurrentUserName().toLowerCase().trim();
        const myEmail = currentUser.email.toLowerCase().trim();
        renderIssues(visibleIssues.filter(i => {
            const assignee = (i.assignee || '').toLowerCase().trim();
            const reporter = (i.reporter && i.reporter.email) ? i.reporter.email.toLowerCase().trim() : '';
            return assignee.includes(myName) || reporter === myEmail;
        }));
    } else {
        renderIssues(visibleIssues.filter(i => i.type === type));
    }
}

function getCurrentUserName() {
    const email = currentUser.email.toLowerCase();
    if (email.includes("mario")) return "Mario Rossi";
    if (email.includes("luigi")) return "Luigi Verdi";
    return currentUser.name || currentUser.email;
}


function renderIssues(listData) {
    const colOpen = document.getElementById('list-open');
    const colProgress = document.getElementById('list-in-progress');
    const colDone = document.getElementById('list-done');
    if (!colOpen || !colProgress || !colDone) return;

    colOpen.innerHTML = ''; colProgress.innerHTML = ''; colDone.innerHTML = '';
    let cOpen = 0, cProg = 0, cDone = 0;

    const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const priorityColors = { 'HIGH': '#e74c3c', 'MEDIUM': '#f39c12', 'LOW': '#27ae60' };
    const isUserAdmin = currentUser.role === 'ADMIN';

    let sortedList = [...listData];
    sortedList.sort((a, b) => {
        if (currentSortOrder === 'DATE_DESC') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (currentSortOrder === 'DATE_ASC') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (currentSortOrder === 'PRIORITY_HIGH') {
            return (priorityWeight[b.priority] - priorityWeight[a.priority]) || (new Date(b.createdAt) - new Date(a.createdAt));
        } else if (currentSortOrder === 'PRIORITY_LOW') {
            return (priorityWeight[a.priority] - priorityWeight[b.priority]) || (new Date(b.createdAt) - new Date(a.createdAt));
        }
        return 0;
    });

    sortedList.forEach(issue => {
        const card = document.createElement('div');
        card.className = `card ${issue.type}`;
        if (!card.style.borderLeftColor) card.style.borderLeft = `5px solid ${priorityColors[issue.priority] || 'grey'}`;

        const dateStr = issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('it-IT') : 'N/A';
        const reporterName = issue.reporter ? issue.reporter.email.split('@')[0] : 'Anonimo';
        let imageHtml = issue.imageBase64 ? `<div style="margin: 10px 0; text-align: center;"><img src="${issue.imageBase64}" style="max-width: 100%; max-height: 150px; border-radius: 5px; cursor:pointer;" onclick="Swal.fire({imageUrl: '${issue.imageBase64}', showConfirmButton: false, background: 'transparent'})"></div>` : '';

        // --- DEFINIZIONE PERMESSI ---
        const reporterEmail = issue.reporter ? issue.reporter.email : '';
        const isMyTicket = reporterEmail === currentUser.email;
        const assigneeName = issue.assignee || '';
        const status = (issue.status || 'TODO').toUpperCase();

        const isAssignedToMe = assigneeName.toLowerCase().includes(currentUser.email.split('@')[0].toLowerCase()) || assigneeName.toLowerCase().includes(currentUser.name?.toLowerCase());

        // 1. Prendi in carico: Solo se non è mio e non è già assegnato a me
        const canTakeCharge = (status === 'TODO' || status === 'OPEN') && !isMyTicket;

        // 2. Chiudi: Admin OPPURE Assegnatario
        const canClose = (status === 'IN_PROGRESS') && (isUserAdmin || isAssignedToMe);

        // 3. Revert: Admin OPPURE Assegnatario (se ho sbagliato a chiudere)
        const canRevert = (status !== 'TODO' && status !== 'OPEN') && (isUserAdmin || isAssignedToMe);

        // 4.  MODIFICA: Admin OPPURE Assegnatario OPPURE Creatore (Reporter)
        // Se il ticket è di un altro e non ci sto lavorando io, NON posso toccarlo.
        const canEdit = isUserAdmin || isMyTicket || isAssignedToMe;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span class="badge bg-${issue.type}">${issue.type}</span>
                <small style="font-weight:bold; color:${priorityColors[issue.priority]}">
                    ${issue.priority === 'HIGH' ? '🔥 ALTA' : (issue.priority === 'MEDIUM' ? '🔸 MEDIA' : '🌱 BASSA')}
                </small>
            </div>
            <h4 style="margin:0 0 5px 0; color:#2c3e50;">${issue.title}</h4>
            <div style="font-size:0.85em; color:#666; margin-bottom:5px; word-wrap: break-word;">${issue.description}</div>
            ${imageHtml}
            <div style="font-size:0.75em; color:#888; margin-bottom:12px; margin-top: 10px;">📅 ${dateStr} • 🎤 <b>${reporterName}</b></div>
            <div style="border-top:1px solid #eee; padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; flex-direction:column;"><span style="font-size:0.7em; color:#999;">Assegnato a:</span><span style="font-size:0.8em; font-weight:600;">👤 ${issue.assignee || 'Nessuno'}</span></div>
                <div class="card-actions" style="display:flex; gap:5px;">
                    <button onclick="openComments(${issue.id}, '${issue.title.replace(/'/g, "\\'")}')" class="mini-btn" title="Chat">💬</button>
                    ${canRevert ? `<button onclick="updateStatus(${issue.id}, 'TODO')" class="mini-btn" title="Riporta in Da Fare" style="color:#e67e22;">🔙</button>` : ''}
                    ${canTakeCharge ? `<button onclick="updateStatus(${issue.id}, 'IN_PROGRESS')" class="mini-btn btn-progress" title="Prendi in carico">🔥</button>` : ''}
                    ${canClose ? `<button onclick="closeIssue(${issue.id})" class="mini-btn btn-done" title="Segna come Fatto">✅</button>` : ''}

                    ${canEdit ? `<button onclick="startEdit(${issue.id})" class="mini-btn" title="Modifica">✏️</button>` : ''}

                    ${isUserAdmin ? `<button onclick="archiveIssue(${issue.id})" class="mini-btn btn-archive" title="Archivia">📦</button>` : ''}
                </div>
            </div>
        `;

        if (status === 'IN_PROGRESS') { colProgress.appendChild(card); cProg++; }
        else if (['DONE', 'CLOSED', 'RESOLVED'].includes(status)) { colDone.appendChild(card); cDone++; }
        else { colOpen.appendChild(card); cOpen++; }
    });

    if (document.getElementById('count-open')) document.getElementById('count-open').textContent = cOpen;
    if (document.getElementById('count-progress')) document.getElementById('count-progress').textContent = cProg;
    if (document.getElementById('count-done')) document.getElementById('count-done').textContent = cDone;
}

// --- AZIONI SECONDARIE ---
async function updateStatus(id, newStatus) {
    const issue = allIssues.find(i => i.id === id);
    if (!issue) return;
    issue.status = newStatus;
    if (newStatus === 'IN_PROGRESS' && (!issue.assignee || issue.assignee === 'Nessuno')) issue.assignee = getCurrentUserName();
    await fetch(API_URL + '/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(issue) });
    loadIssues();
}

async function closeIssue(id) {
    const issue = allIssues.find(i => i.id === id);
    issue.status = 'CLOSED';
    await fetch(API_URL + '/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(issue) });
    loadIssues();
}

async function archiveIssue(id) {
    // Usa 'currentUser' già definito all'inizio di script.js
    if (!currentUser || currentUser.role !== 'ADMIN') {
        Swal.fire('Errore', 'Solo gli amministratori possono archiviare.', 'error');
        return;
    }

    try {
        // Usa API_URL (definita come http://localhost:8080/api/issues)
        const response = await fetch(`${API_URL}/${id}/archive`, {
            method: 'PUT',
            headers: {
                'X-User-Role': currentUser.role // Invia il ruolo per il controllo backend
            }
        });

        if (response.ok) {
            Swal.fire('Archiviato!', 'Il bug è stato spostato nell\'archivio.', 'success');
            loadIssues(); // Ricarica la board principale
        } else {
            const errorMsg = await response.text();
            Swal.fire('Errore', errorMsg, 'error');
        }
    } catch (error) {
        console.error("Errore archiviazione:", error);
        Swal.fire('Errore', 'Problema di connessione al server', 'error');
    }
}

function startEdit(id) {
    const issue = allIssues.find(i => i.id === id);
    document.getElementById('title').value = issue.title;
    document.getElementById('description').value = issue.description;
    document.getElementById('type').value = issue.type;
    document.getElementById('priority').value = issue.priority;
    currentEditingId = id;

    if (issue.imageBase64) {
        document.getElementById('editImagePreview').src = issue.imageBase64;
        document.getElementById('editImagePreviewContainer').style.display = 'block';
        existingImageBase64 = issue.imageBase64;
    } else {
        document.getElementById('editImagePreviewContainer').style.display = 'none';
        existingImageBase64 = null;
    }

    document.querySelector('.submit-btn').textContent = "💾 Salva Modifiche";
    window.scrollTo(0, 0);
}

function clearImage() {
    document.getElementById('imageUpload').value = "";
    document.getElementById('editImagePreview').src = "";
    document.getElementById('editImagePreviewContainer').style.display = 'none';
    existingImageBase64 = null;
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Chat e Commenti
let currentChatIssueId = null;
async function openComments(issueId, title) {
    currentChatIssueId = issueId;
    document.getElementById('comment-modal').style.display = 'flex';
    document.getElementById('chat-title').innerText = "💬 " + title;
    await loadComments(issueId);
}
function closeComments() { document.getElementById('comment-modal').style.display = 'none'; }

async function loadComments(issueId) {
    const res = await fetch(`http://localhost:8080/api/comments/issue/${issueId}`);
    const comments = await res.json();
    const body = document.getElementById('chat-body');
    body.innerHTML = '';
    comments.forEach(c => {
        const isMine = c.author.email === currentUser.email;
        body.innerHTML += `<div class="chat-msg ${isMine ? 'msg-mine' : 'msg-others'}"><span class="msg-info">${isMine ? 'Tu' : c.author.email.split('@')[0]}</span>${c.text}</div>`;
    });
    body.scrollTop = body.scrollHeight;
}

async function sendComment() {
    const input = document.getElementById('comment-input');
    const txt = input.value.trim();

    if (!txt) return;

    await fetch(`http://localhost:8080/api/comments?issueId=${currentChatIssueId}&authorId=${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: txt })
    });

    input.value = '';
    loadComments(currentChatIssueId);
}

function handleEnter(e) {
    if (e.key === 'Enter') sendComment();
}
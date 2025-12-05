const form = document.getElementById("myForm");
const loginForm = document.getElementById("loginForm");

// Live validation while typing
if (form) {
    document.getElementById("username").addEventListener("input", validateUsername);
    document.getElementById("email").addEventListener("input", validateEmail);
    document.getElementById("password").addEventListener("input", validatePassword);
    document.getElementById("password").addEventListener("input", validateConfirmPassword);
    document.getElementById("confirmpassword").addEventListener("input", validateConfirmPassword);
}

// =====================
// VALIDATION FUNCTIONS
// =====================
function validateUsername() {
    const username = document.getElementById("username").value.trim();
    const userErr = document.getElementById("usernameError");

    if (username === "") {
        userErr.textContent = "Username is required.";
        return false;
    } else if (username.length < 4) {
        userErr.textContent = "Username must be at least 4 characters.";
        return false;
    } else {
        userErr.textContent = "";
        return true;
    }
}

function validateEmail() {
    const email = document.getElementById("email").value.trim();
    const emailErr = document.getElementById("emailError");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
        emailErr.textContent = "Email is required.";
        return false;
    } else if (!emailPattern.test(email)) {
        emailErr.textContent = "Enter a valid email address.";
        return false;
    } else {
        emailErr.textContent = "";
        return true;
    }
}

function validatePassword() {
    const password = document.getElementById("password").value.trim();
    const passErr = document.getElementById("passwordError");

    if (password === "") {
        passErr.textContent = "Password is required.";
        return false;
    } else if (password.length < 6) {
        passErr.textContent = "Password must be at least 6 characters.";
        return false;
    } else {
        passErr.textContent = "";
        return true;
    }
}

function validateConfirmPassword() {
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmpassword").value.trim();
    const confirmErr = document.getElementById("confirmPasswordError");

    if (confirmPassword === "") {
        confirmErr.textContent = "Please confirm your password.";
        return false;
    } else if (password !== confirmPassword) {
        confirmErr.textContent = "Passwords do not match.";
        return false;
    } else {
        confirmErr.textContent = "";
        return true;
    }
}
// ==========================
// FORM SUBMISSION
// ==========================
if (form) form.addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent page reload

    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
        const newUser = {
            username: document.getElementById("username").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value.trim()
        };

        try {
            const existing = JSON.parse(localStorage.getItem("users") || "[]");

            // Prevent duplicate by email or username
            const duplicate = existing.find(u => u.email === newUser.email || u.username === newUser.username);
            if (duplicate) {
                alert("A user with this email or username already exists.");
                return;
            }

            existing.push(newUser);
            localStorage.setItem("users", JSON.stringify(existing));

            window.location.href = "registrationsuccess.html";
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            alert("Error: Could not save data. Please check if localStorage is enabled.");
        }
    }
});

// ==========================
// LOGIN HANDLERS
// ==========================
function validateLoginId() {
    const id = document.getElementById("loginId").value.trim();
    const err = document.getElementById("loginIdError");
    if (id === "") { err.textContent = "Username or email is required."; return false; }
    err.textContent = ""; return true;
}

function validateLoginPassword() {
    const pwd = document.getElementById("loginPassword").value.trim();
    const err = document.getElementById("loginPasswordError");
    if (pwd === "") { err.textContent = "Password is required."; return false; }
    err.textContent = ""; return true;
}

if (loginForm) {
    document.getElementById("loginId").addEventListener("input", validateLoginId);
    document.getElementById("loginPassword").addEventListener("input", validateLoginPassword);

    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const okId = validateLoginId();
        const okPwd = validateLoginPassword();
        if (!okId || !okPwd) return;

        const loginId = document.getElementById("loginId").value.trim();
        const loginPwd = document.getElementById("loginPassword").value.trim();

        try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const match = users.find(u => (u.email === loginId || u.username === loginId) && u.password === loginPwd);
            if (match) {
                localStorage.setItem("currentUser", JSON.stringify({ username: match.username, email: match.email }));
                // Redirect post login (adjust target as needed)
                window.location.href = "users.html";
            } else {
                alert("Invalid credentials. Please check your username/email and password.");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Error: Unable to read users from localStorage.");
        }
    });
}

// ==========================
// LOGOUT HANDLER (navbar)
// ==========================
const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
    logoutLink.addEventListener("click", function(e) {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        // Optionally keep users list; just clearing session
        window.location.href = "login.html";
    });
}

// ==========================
// USERS LIST POPULATION
// ==========================
const usersListContainer = document.getElementById("usersList");
if (usersListContainer) {
    try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const countBadge = document.getElementById("userCountBadge");
        if (countBadge) countBadge.textContent = users.length;
        if (users.length === 0) {
            usersListContainer.innerHTML = '<p class="text-muted">No registered users yet.</p>';
        } else {
            const rows = users.map((u,i) => `
                <tr>
                    <td>${i+1}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td><a href="#" data-username="${u.username}" class="edit-link">Edit</a></td>
                    <td><button type="button" data-username="${u.username}" class="btn btn-danger btn-sm delete-btn">Delete</button></td>
                </tr>
            `).join("");
            usersListContainer.innerHTML = `
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>`;

            // Wire up actions
            usersListContainer.querySelectorAll('.edit-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const uname = this.getAttribute('data-username');
                    handleEditUser(uname);
                });
            });

            usersListContainer.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const uname = this.getAttribute('data-username');
                    handleDeleteUser(uname);
                });
            });
        }
    } catch(err) {
        usersListContainer.innerHTML = '<p class="text-danger">Unable to load users.</p>';
        console.error('Users load error:', err);
    }
}

// ==========================
// SIMPLE DIRECT CHAT (Group Chat page)
// ==========================
const chatForm = document.getElementById('chatForm');
const messageList = document.getElementById('messageList');

function getCurrentUser() {
    try {
        const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return current && current.username ? current : null;
    } catch { return null; }
}

function getMessages() {
    try { return JSON.parse(localStorage.getItem('messages') || '[]'); } catch { return []; }
}

function saveMessages(msgs) {
    localStorage.setItem('messages', JSON.stringify(msgs));
}

function renderGroupFeed(currentUsername) {
    const msgs = getMessages();
    messageList.innerHTML = '';
    msgs.forEach(m => {
        const item = document.createElement('div');
        const outgoing = m.from === currentUsername;
        item.className = `message ${outgoing ? 'outgoing' : 'incoming'}`;
        const time = new Date(m.timestamp || Date.now());
        item.innerHTML = `
            <div class="message-text">${escapeHtml(m.text)}</div>
            <div class="message-meta">${outgoing ? 'You' : m.from} · ${time.toLocaleTimeString()}</div>
        `;
        messageList.appendChild(item);
    });
    messageList.scrollTop = messageList.scrollHeight;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

if (chatForm && messageList) {
    const current = getCurrentUser();
    // Guard: must be logged in
    if (!current) {
        messageList.innerHTML = '<p class="text-danger">Please login to use chat.</p>';
    } else {
        renderGroupFeed(current.username);

        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const text = document.getElementById('messageInput').value.trim();
            if (!text) return;
            const msgs = getMessages();
            msgs.push({ from: current.username, to: 'ALL', text, timestamp: Date.now() });
            saveMessages(msgs);
            document.getElementById('messageInput').value = '';
            renderGroupFeed(current.username);
        });

        // Live update if another tab writes
        window.addEventListener('storage', function(ev) {
            if (ev.key === 'messages') {
                renderGroupFeed(current.username);
            }
        });
    }
}
// ==========================
// EDIT/DELETE HANDLERS
// ==========================
function handleEditUser(username) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = users.findIndex(u => u.username === username);
        if (idx === -1) {
            alert('User not found.');
            return;
        }
        const current = users[idx];
        const newUsername = prompt('Edit username:', current.username);
        if (newUsername === null) return; // cancelled
        const trimmedUsername = newUsername.trim();
        if (!trimmedUsername) { alert('Username cannot be empty.'); return; }

        // Check duplicate username (excluding current)
        const dupUser = users.find((u, i) => i !== idx && u.username === trimmedUsername);
        if (dupUser) { alert('A user with this username already exists.'); return; }

        const newEmail = prompt('Edit email:', current.email);
        if (newEmail === null) return; // cancelled
        const trimmedEmail = newEmail.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedEmail)) { alert('Enter a valid email.'); return; }

        // Check duplicate email (excluding current)
        const dupEmail = users.find((u, i) => i !== idx && u.email === trimmedEmail);
        if (dupEmail) { alert('A user with this email already exists.'); return; }

        users[idx] = { ...current, username: trimmedUsername, email: trimmedEmail };
        localStorage.setItem('users', JSON.stringify(users));

        // Re-render list
        if (usersListContainer) {
            // Trigger a simple refresh by re-running population block
            const countBadge = document.getElementById('userCountBadge');
            if (countBadge) countBadge.textContent = users.length;
            const rows = users.map((u,i) => `
                <tr>
                    <td>${i+1}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td><a href="#" data-username="${u.username}" class="edit-link">Edit</a></td>
                    <td><button type="button" data-username="${u.username}" class="btn btn-danger btn-sm delete-btn">Delete</button></td>
                </tr>
            `).join('');
            usersListContainer.innerHTML = `
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>`;
            usersListContainer.querySelectorAll('.edit-link').forEach(link => {
                link.addEventListener('click', function(e) { e.preventDefault(); handleEditUser(this.getAttribute('data-username')); });
            });
            usersListContainer.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() { handleDeleteUser(this.getAttribute('data-username')); });
            });
        }
    } catch (err) {
        console.error('Edit user error:', err);
        alert('Error editing user.');
    }
}

// ==========================
// DOCUMENTS: Upload and Tables
// ==========================
const uploadForm = document.getElementById('uploadForm');
const myDocsDiv = document.getElementById('myDocs');
const allDocsDiv = document.getElementById('allDocs');
const uploadStatus = document.getElementById('uploadStatus');

function getDocuments() {
    try { return JSON.parse(localStorage.getItem('documents') || '[]'); } catch { return []; }
}

function saveDocuments(docs) {
    localStorage.setItem('documents', JSON.stringify(docs));
}

function renderDocumentsTables(currentUser) {
    const docs = getDocuments();
    // My uploads
    if (myDocsDiv) {
        const mine = docs.filter(d => d.username === currentUser.username);
        if (mine.length === 0) {
            myDocsDiv.innerHTML = '<p class="text-muted">You have not uploaded any documents yet.</p>';
        } else {
            const rows = mine.map((d,i) => `
                <tr>
                    <td>${i+1}</td>
                    <td>${d.title}</td>
                    <td>${d.url ? `<a href="${d.url}" target="_blank">Open</a>` : '-'}</td>
                    <td>${new Date(d.timestamp).toLocaleString()}</td>
                    <td>
                        <button type="button" class="btn btn-sm doc-edit" data-index="${i}">Edit</button>
                        <button type="button" class="btn btn-sm doc-delete" data-index="${i}">Delete</button>
                    </td>
                </tr>
            `).join('');
            myDocsDiv.innerHTML = `
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Link</th>
                            <th>Uploaded</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>`;

            // Wire up actions for My Uploads
            myDocsDiv.querySelectorAll('.doc-edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idxInMine = parseInt(this.getAttribute('data-index'), 10);
                    // Map idxInMine to actual index in docs
                    const mineDocs = docs.filter(d => d.username === currentUser.username);
                    const docToEdit = mineDocs[idxInMine];
                    if (!docToEdit) return;
                    const globalIndex = docs.findIndex(d => d.username === currentUser.username && d.timestamp === docToEdit.timestamp && d.title === docToEdit.title);
                    if (globalIndex === -1) return;
                    const newTitle = prompt('Edit title:', docToEdit.title);
                    if (newTitle === null) return;
                    const trimmedTitle = newTitle.trim();
                    if (!trimmedTitle) { alert('Title cannot be empty.'); return; }
                    const newUrl = prompt('Edit URL (optional):', docToEdit.url || '');
                    if (newUrl === null) return;
                    docs[globalIndex] = { ...docToEdit, title: trimmedTitle, url: (newUrl || '').trim() };
                    saveDocuments(docs);
                    renderDocumentsTables(currentUser);
                });
            });
            myDocsDiv.querySelectorAll('.doc-delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idxInMine = parseInt(this.getAttribute('data-index'), 10);
                    const mineDocs = docs.filter(d => d.username === currentUser.username);
                    const docToDelete = mineDocs[idxInMine];
                    if (!docToDelete) return;
                    if (!confirm('Delete this document?')) return;
                    const remaining = docs.filter(d => !(d.username === currentUser.username && d.timestamp === docToDelete.timestamp && d.title === docToDelete.title));
                    saveDocuments(remaining);
                    renderDocumentsTables(currentUser);
                });
            });
        }
    }

    // All documents
    if (allDocsDiv) {
        if (docs.length === 0) {
            allDocsDiv.innerHTML = '<p class="text-muted">No documents uploaded yet.</p>';
        } else {
            const rows = docs.map((d,i) => `
                <tr>
                    <td>${i+1}</td>
                    <td>${d.title}</td>
                    <td>${d.username}</td>
                    <td>${d.url ? `<a href="${d.url}" target="_blank">Open</a>` : '-'}</td>
                    <td>${new Date(d.timestamp).toLocaleString()}</td>
                </tr>
            `).join('');
            allDocsDiv.innerHTML = `
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Uploaded By</th>
                            <th>Link</th>
                            <th>Uploaded</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>`;
        }
    }
}

if (uploadForm && (myDocsDiv || allDocsDiv)) {
    const current = getCurrentUser();
    if (!current) {
        if (myDocsDiv) myDocsDiv.innerHTML = '<p class="text-danger">Please login to upload and view your documents.</p>';
        if (allDocsDiv) allDocsDiv.innerHTML = '<p class="text-danger">Please login to view documents.</p>';
        if (uploadStatus) uploadStatus.textContent = 'Login required to upload.';
    } else {
        renderDocumentsTables(current);
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('docTitle').value.trim();
            const url = document.getElementById('docUrl').value.trim();
            if (!title) { alert('Document title is required.'); return; }
            const docs = getDocuments();
            docs.push({ title, url: url || '', username: current.username, timestamp: Date.now() });
            saveDocuments(docs);
            document.getElementById('docTitle').value = '';
            document.getElementById('docUrl').value = '';
            renderDocumentsTables(current);
            if (uploadStatus) { uploadStatus.textContent = 'Uploaded successfully.'; setTimeout(() => uploadStatus.textContent = '', 2000); }
        });

        window.addEventListener('storage', function(ev) {
            if (ev.key === 'documents') {
                renderDocumentsTables(current);
            }
        });
    }
}
function handleDeleteUser(username) {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filtered = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(filtered));
        // Refresh view
        const countBadge = document.getElementById('userCountBadge');
        if (countBadge) countBadge.textContent = filtered.length;
        if (usersListContainer) {
            if (filtered.length === 0) {
                usersListContainer.innerHTML = '<p class="text-muted">No registered users yet.</p>';
                return;
            }
            const rows = filtered.map((u,i) => `
                <tr>
                    <td>${i+1}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td><a href="#" data-username="${u.username}" class="edit-link">Edit</a></td>
                    <td><button type="button" data-username="${u.username}" class="btn btn-danger btn-sm delete-btn">Delete</button></td>
                </tr>
            `).join('');
            usersListContainer.innerHTML = `
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>`;
            usersListContainer.querySelectorAll('.edit-link').forEach(link => {
                link.addEventListener('click', function(e) { e.preventDefault(); handleEditUser(this.getAttribute('data-username')); });
            });
            usersListContainer.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() { handleDeleteUser(this.getAttribute('data-username')); });
            });
        }
    } catch (err) {
        console.error('Delete user error:', err);
        alert('Error deleting user.');
    }
}


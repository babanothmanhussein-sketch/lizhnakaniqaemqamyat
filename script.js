// Database Management System for Committee Management
// Global Variables
let currentUser = null;
let currentRole = null;
let dataRecords = [];
let users = [];
let messages = [];
let autoNumber = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase();
    setupEventListeners();
    updateStats();
});

// Database Initialization
function initializeDatabase() {
    // Initialize local storage if empty
    if (!localStorage.getItem('users')) {
        // Create default admin user
        const defaultAdmin = {
            id: 1,
            username: 'admin',
            password: 'admin',
            committeeName: 'ئەدمینی سەرەکی',
            email: 'admin@committee.gov',
            mobile: '07500000000',
            location: 'سلێمانی',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        
        users = [defaultAdmin];
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        users = JSON.parse(localStorage.getItem('users'));
    }
    
    if (!localStorage.getItem('dataRecords')) {
        dataRecords = [];
        localStorage.setItem('dataRecords', JSON.stringify(dataRecords));
    } else {
        dataRecords = JSON.parse(localStorage.getItem('dataRecords'));
        autoNumber = dataRecords.length > 0 ? Math.max(...dataRecords.map(r => r.id)) + 1 : 1;
    }
    
    if (!localStorage.getItem('messages')) {
        messages = [];
        localStorage.setItem('messages', JSON.stringify(messages));
    } else {
        messages = JSON.parse(localStorage.getItem('messages'));
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Data entry form
    const dataEntryForm = document.getElementById('dataEntryForm');
    if (dataEntryForm) {
        dataEntryForm.addEventListener('submit', handleDataEntry);
    }
    
    // User form
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserCreation);
    }
    
    // Message form
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSend);
    }
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    
    const loginInput = document.getElementById('loginInput').value;
    const password = document.getElementById('password').value;
    const loginTab = document.querySelector('.login-tabs .tab-btn.active').textContent;
    
    // Find user
    const user = users.find(u => 
        (u.email === loginInput || u.mobile === loginInput || u.username === loginInput) && 
        u.password === password
    );
    
    if (user) {
        currentUser = user;
        currentRole = user.role || 'user';
        
        // Store session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('currentRole', currentRole);
        
        // Redirect to appropriate dashboard
        if (currentRole === 'admin') {
            showAdminDashboard();
        } else {
            showUserDashboard();
        }
        
        showMessage('سەرکەوتووانە چووتەژوورەوە', 'success');
    } else {
        showMessage('ئیمەیڵ/مۆبایل یان پاسۆرد هەڵەیە', 'error');
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentRole');
    
    showPage('loginPage');
    document.getElementById('loginForm').reset();
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showAdminDashboard() {
    showPage('adminPage');
    document.getElementById('adminCommitteeName').textContent = currentUser.committeeName;
    loadUsers();
    loadData();
    loadMessages();
    updateStats();
}

function showUserDashboard() {
    showPage('userPage');
    document.getElementById('userCommitteeName').textContent = currentUser.committeeName;
    document.getElementById('committeeName').value = currentUser.committeeName;
    loadUserData();
    updateUserStats();
}

// Tab Switching
function switchLoginTab(tab) {
    document.querySelectorAll('.login-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
    
    if (tab === 'users') {
        loadUsers();
    } else if (tab === 'data') {
        loadData();
    } else if (tab === 'messages') {
        loadMessages();
    }
}

function switchUserTab(tab) {
    document.querySelectorAll('.user-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
    
    if (tab === 'view') {
        loadUserData();
    }
}

// User Management Functions
function loadUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.filter(u => u.role !== 'admin').forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.committeeName}</td>
            <td>${user.email}</td>
            <td>${user.mobile}</td>
            <td>${user.location || '-'}</td>
            <td>
                <button onclick="editUser(${user.id})" class="add-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUser(${user.id})" class="cancel-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openUserModal() {
    document.getElementById('userModal').style.display = 'block';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userForm').reset();
}

function handleUserCreation(e) {
    e.preventDefault();
    
    const newUser = {
        id: Date.now(),
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        committeeName: document.getElementById('committeeNameSelect').value,
        email: document.getElementById('userEmail').value,
        mobile: document.getElementById('userMobile').value,
        location: document.getElementById('userLocation').value,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    closeUserModal();
    loadUsers();
    showMessage('یوزەر بەسەرکەوتوویی زیادکرا', 'success');
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        document.getElementById('newUsername').value = user.username;
        document.getElementById('newPassword').value = user.password;
        document.getElementById('committeeNameSelect').value = user.committeeName;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userMobile').value = user.mobile;
        document.getElementById('userLocation').value = user.location;
        
        openUserModal();
        
        // Change form submit handler to update
        document.getElementById('userForm').onsubmit = function(e) {
            e.preventDefault();
            updateUser(userId);
        };
    }
}

function updateUser(userId) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            username: document.getElementById('newUsername').value,
            password: document.getElementById('newPassword').value,
            committeeName: document.getElementById('committeeNameSelect').value,
            email: document.getElementById('userEmail').value,
            mobile: document.getElementById('userMobile').value,
            location: document.getElementById('userLocation').value
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        closeUserModal();
        loadUsers();
        showMessage('یوزەر بەسەرکەوتوویی نوێکرایەوە', 'success');
        
        // Reset form handler
        document.getElementById('userForm').onsubmit = handleUserCreation;
    }
}

function deleteUser(userId) {
    if (confirm('ئایا دڵنیایت لە سڕینەوەی ئەم یوزەرە؟')) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        showMessage('یوزەر سڕایەوە', 'success');
    }
}

// Data Management Functions
function handleDataEntry(e) {
    e.preventDefault();
    
    const addresses = [];
    document.querySelectorAll('[id^="address"]').forEach(input => {
        if (input.value.trim()) addresses.push(input.value.trim());
    });
    
    const reportTypes = [];
    document.querySelectorAll('input[name="reportType"]:checked').forEach(checkbox => {
        reportTypes.push(checkbox.value);
    });
    
    const permitTypes = [];
    document.querySelectorAll('input[name="permitType"]:checked').forEach(checkbox => {
        permitTypes.push(checkbox.value);
    });
    
    const mobileNumbers = [];
    document.querySelectorAll('[id^="mobile"]').forEach(input => {
        if (input.value.trim()) mobileNumbers.push(input.value.trim());
    });
    
    const notes = [];
    document.querySelectorAll('[id^="note"]').forEach(input => {
        if (input.value.trim()) notes.push(input.value.trim());
    });
    
    const newRecord = {
        id: autoNumber++,
        committeeName: document.getElementById('committeeName').value,
        ownerName: document.getElementById('ownerName').value,
        addresses: addresses,
        placeName: document.getElementById('placeName').value,
        reportTypes: reportTypes,
        permitNumber: document.getElementById('permitNumber').value,
        permitTypes: permitTypes,
        mobileNumbers: mobileNumbers,
        notes: notes,
        date: new Date().toISOString().split('T')[0],
        userId: currentUser.id,
        userCommitteeName: currentUser.committeeName
    };
    
    dataRecords.push(newRecord);
    localStorage.setItem('dataRecords', JSON.stringify(dataRecords));
    
    document.getElementById('dataEntryForm').reset();
    document.getElementById('committeeName').value = currentUser.committeeName;
    
    showMessage('زانیاری بەسەرکەوتوویی تۆمارکرا', 'success');
    updateUserStats();
}

function loadUserData() {
    const tbody = document.querySelector('#userDataTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const userData = dataRecords.filter(r => r.userId === currentUser.id);
    
    userData.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.ownerName}</td>
            <td>${record.addresses.join(', ')}</td>
            <td>${record.placeName}</td>
            <td>${record.reportTypes.join(', ')}</td>
            <td>${record.permitNumber}</td>
            <td>${record.permitTypes.join(', ')}</td>
            <td>${record.mobileNumbers.join(', ')}</td>
            <td>${record.date}</td>
            <td>${record.notes.join(', ')}</td>
            <td>
                <button onclick="printRecord(${record.id})" class="report-btn">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadData() {
    const tbody = document.querySelector('#dataTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    dataRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.committeeName}</td>
            <td>${record.ownerName}</td>
            <td>${record.addresses.join(', ')}</td>
            <td>${record.placeName}</td>
            <td>${record.reportTypes.join(', ')}</td>
            <td>${record.permitNumber}</td>
            <td>${record.permitTypes.join(', ')}</td>
            <td>${record.mobileNumbers.join(', ')}</td>
            <td>${record.date}</td>
            <td>${record.notes.join(', ')}</td>
            <td>
                <button onclick="printRecord(${record.id})" class="report-btn">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Search Functions
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const tbody = document.querySelector('#usersTable tbody');
    
    tbody.innerHTML = '';
    
    users.filter(u => u.role !== 'admin' && 
        (u.username.toLowerCase().includes(searchTerm) || 
         u.committeeName.toLowerCase().includes(searchTerm)))
        .forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.committeeName}</td>
                <td>${user.email}</td>
                <td>${user.mobile}</td>
                <td>${user.location || '-'}</td>
                <td>
                    <button onclick="editUser(${user.id})" class="add-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteUser(${user.id})" class="cancel-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
}

function searchData() {
    const searchTerm = document.getElementById('dataSearch').value.toLowerCase();
    const tbody = document.querySelector('#dataTable tbody');
    
    tbody.innerHTML = '';
    
    dataRecords.filter(r => 
        r.committeeName.toLowerCase().includes(searchTerm) ||
        r.ownerName.toLowerCase().includes(searchTerm) ||
        r.id.toString().includes(searchTerm) ||
        r.mobileNumbers.some(m => m.includes(searchTerm)))
        .forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.id}</td>
                <td>${record.committeeName}</td>
                <td>${record.ownerName}</td>
                <td>${record.addresses.join(', ')}</td>
                <td>${record.placeName}</td>
                <td>${record.reportTypes.join(', ')}</td>
                <td>${record.permitNumber}</td>
                <td>${record.permitTypes.join(', ')}</td>
                <td>${record.mobileNumbers.join(', ')}</td>
                <td>${record.date}</td>
                <td>${record.notes.join(', ')}</td>
                <td>
                    <button onclick="printRecord(${record.id})" class="report-btn">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
}

function searchByReceiptNumber() {
    const receiptNumber = document.getElementById('searchByReceipt').value;
    const resultsDiv = document.getElementById('searchResults');
    
    const results = dataRecords.filter(r => r.id.toString() === receiptNumber);
    displaySearchResults(results, resultsDiv);
}

function searchByOwnerName() {
    const ownerName = document.getElementById('searchByName').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    const results = dataRecords.filter(r => 
        r.userId === currentUser.id && 
        r.ownerName.toLowerCase().includes(ownerName));
    displaySearchResults(results, resultsDiv);
}

function searchByMobileNumber() {
    const mobileNumber = document.getElementById('searchByMobile').value;
    const resultsDiv = document.getElementById('searchResults');
    
    const results = dataRecords.filter(r => 
        r.userId === currentUser.id && 
        r.mobileNumbers.some(m => m.includes(mobileNumber)));
    displaySearchResults(results, resultsDiv);
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<p>هیچ ئەنجامێک نەدۆزرایەوە</p>';
        return;
    }
    
    let html = '<h4>ئەنجامەکانی گەڕان:</h4>';
    results.forEach(record => {
        html += `
            <div class="search-result-item">
                <p><strong>ژمارە:</strong> ${record.id}</p>
                <p><strong>ناوی خاوەن کار:</strong> ${record.ownerName}</p>
                <p><strong>ناونیشان:</strong> ${record.addresses.join(', ')}</p>
                <p><strong>جۆری ڕاپۆرت:</strong> ${record.reportTypes.join(', ')}</p>
                <p><strong>بەروار:</strong> ${record.date}</p>
                <button onclick="printRecord(${record.id})" class="report-btn">
                    <i class="fas fa-print"></i> چاپکردن
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function searchByDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const tbody = document.querySelector('#dataTable tbody');
    
    tbody.innerHTML = '';
    
    dataRecords.filter(r => {
        const recordDate = new Date(r.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return recordDate >= start && recordDate <= end;
    }).forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.committeeName}</td>
            <td>${record.ownerName}</td>
            <td>${record.addresses.join(', ')}</td>
            <td>${record.placeName}</td>
            <td>${record.reportTypes.join(', ')}</td>
            <td>${record.permitNumber}</td>
            <td>${record.permitTypes.join(', ')}</td>
            <td>${record.mobileNumbers.join(', ')}</td>
            <td>${record.date}</td>
            <td>${record.notes.join(', ')}</td>
            <td>
                <button onclick="printRecord(${record.id})" class="report-btn">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Message Functions
function openMessageModal() {
    document.getElementById('messageModal').style.display = 'block';
    loadUserCheckboxes();
}

function closeMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
    document.getElementById('messageForm').reset();
}

function loadUserCheckboxes() {
    const container = document.getElementById('userCheckboxes');
    container.innerHTML = '';
    
    users.filter(u => u.role !== 'admin').forEach(user => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="selectedUsers" value="${user.id}">
            ${user.username} (${user.committeeName})
        `;
        container.appendChild(label);
    });
}

function handleMessageSend(e) {
    e.preventDefault();
    
    const selectedUsers = Array.from(document.querySelectorAll('input[name="selectedUsers"]:checked'))
        .map(cb => parseInt(cb.value));
    
    const message = {
        id: Date.now(),
        title: document.getElementById('messageTitle').value,
        content: document.getElementById('messageContent').value,
        senderId: currentUser.id,
        recipientIds: selectedUsers,
        date: new Date().toISOString(),
        read: false
    };
    
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    closeMessageModal();
    showMessage('پەیام بەسەرکەوتوویی نێردرا', 'success');
}

function loadMessages() {
    const container = document.getElementById('messagesList');
    container.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-item';
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-title">${message.title}</span>
                <span class="message-date">${new Date(message.date).toLocaleDateString('ku-IQ')}</span>
            </div>
            <div class="message-content">${message.content}</div>
            <div class="message-recipients">
                <small>نێردرا بۆ: ${message.recipientIds.length} یوزەر</small>
            </div>
        `;
        container.appendChild(messageDiv);
    });
}

// Statistics Functions
function updateStats() {
    const receiptCount = dataRecords.filter(r => r.reportTypes.includes('ئاگاداری')).length;
    const attendanceCount = dataRecords.filter(r => r.reportTypes.includes('ئامادەبوون')).length;
    const closingCount = dataRecords.filter(r => r.reportTypes.includes('داخستن')).length;
    
    // Update admin stats
    const totalReceiptsEl = document.getElementById('totalReceipts');
    const totalAttendanceEl = document.getElementById('totalAttendance');
    const totalClosingEl = document.getElementById('totalClosing');
    
    if (totalReceiptsEl) totalReceiptsEl.textContent = receiptCount;
    if (totalAttendanceEl) totalAttendanceEl.textContent = attendanceCount;
    if (totalClosingEl) totalClosingEl.textContent = closingCount;
}

function updateUserStats() {
    const userData = dataRecords.filter(r => r.userId === currentUser.id);
    const receiptCount = userData.filter(r => r.reportTypes.includes('ئاگاداری')).length;
    const attendanceCount = userData.filter(r => r.reportTypes.includes('ئامادەبوون')).length;
    const closingCount = userData.filter(r => r.reportTypes.includes('داخستن')).length;
    
    const userTotalReceiptsEl = document.getElementById('userTotalReceipts');
    const userTotalAttendanceEl = document.getElementById('userTotalAttendance');
    const userTotalClosingEl = document.getElementById('userTotalClosing');
    
    if (userTotalReceiptsEl) userTotalReceiptsEl.textContent = receiptCount;
    if (userTotalAttendanceEl) userTotalAttendanceEl.textContent = attendanceCount;
    if (userTotalClosingEl) userTotalClosingEl.textContent = closingCount;
}

// Form Field Management
function addAddressField() {
    const container = document.querySelector('.address-inputs');
    const currentCount = container.querySelectorAll('input').length;
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.id = `address${currentCount + 1}`;
    newInput.placeholder = `ناونیشانی ${currentCount + 2}`;
    container.insertBefore(newInput, container.lastElementChild);
}

function addMobileField() {
    const container = document.querySelector('.mobile-inputs');
    const currentCount = container.querySelectorAll('input').length;
    const newInput = document.createElement('input');
    newInput.type = 'tel';
    newInput.id = `mobile${currentCount + 1}`;
    newInput.placeholder = `ژمارە مۆبایل ${currentCount + 2}`;
    container.insertBefore(newInput, container.lastElementChild);
}

function addNoteField() {
    const container = document.querySelector('.notes-inputs');
    const currentCount = container.querySelectorAll('input').length;
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.innerHTML = `
        <span class="note-number">${currentCount + 1}-</span>
        <input type="text" id="note${currentCount + 1}" placeholder="سەرپێچی ${currentCount + 1}">
    `;
    container.insertBefore(noteItem, container.lastElementChild);
}

// Print Functions
function printRecord(recordId) {
    const record = dataRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const printWindow = window.open('', '_blank');
    const printContent = `
        <html dir="rtl">
        <head>
            <title>چاپی تۆمار - ${record.id}</title>
            <style>
                body { font-family: 'Amiri', sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .record-info { margin-bottom: 20px; }
                .field { margin-bottom: 10px; }
                .field-label { font-weight: bold; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>سیستمی بەڕێوەبردنی لیژنەکانی قائیمقامیەت</h1>
                <p>بەنوێنەرایەتی کارمەندو ئەفسەرانی بەڕێوەبەرایەتی ئاسایشی پارێزگای سلێمانی</p>
            </div>
            
            <div class="record-info">
                <div class="field">
                    <span class="field-label">ژمارە:</span> ${record.id}
                </div>
                <div class="field">
                    <span class="field-label">ناوی لیژنە:</span> ${record.committeeName}
                </div>
                <div class="field">
                    <span class="field-label">ناوی خاوەن کار:</span> ${record.ownerName}
                </div>
                <div class="field">
                    <span class="field-label">ناونیشان:</span> ${record.addresses.join(', ')}
                </div>
                <div class="field">
                    <span class="field-label">ناوی شوێن:</span> ${record.placeName}
                </div>
                <div class="field">
                    <span class="field-label">جۆری ڕاپۆرت:</span> ${record.reportTypes.join(', ')}
                </div>
                <div class="field">
                    <span class="field-label">ژمارەی مۆڵەت:</span> ${record.permitNumber}
                </div>
                <div class="field">
                    <span class="field-label">جۆری مۆڵەت:</span> ${record.permitTypes.join(', ')}
                </div>
                <div class="field">
                    <span class="field-label">ژمارە مۆبایل:</span> ${record.mobileNumbers.join(', ')}
                </div>
                <div class="field">
                    <span class="field-label">بەروار:</span> ${record.date}
                </div>
                <div class="field">
                    <span class="field-label">سەرپێچییەکان:</span> ${record.notes.join(', ')}
                </div>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function generateReport() {
    const reportContent = document.getElementById('reportContent');
    
    const reportData = {
        totalRecords: dataRecords.length,
        receiptCount: dataRecords.filter(r => r.reportTypes.includes('ئاگاداری')).length,
        attendanceCount: dataRecords.filter(r => r.reportTypes.includes('ئامادەبوون')).length,
        closingCount: dataRecords.filter(r => r.reportTypes.includes('داخستن')).length,
        usersCount: users.filter(u => u.role !== 'admin').length
    };
    
    reportContent.innerHTML = `
        <div class="report-summary">
            <h3>کۆی گشتی ڕاپۆرت</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>تۆماری گشتی</h4>
                    <p>${reportData.totalRecords}</p>
                </div>
                <div class="stat-card">
                    <h4>پسوڵەی ئاگاداری</h4>
                    <p>${reportData.receiptCount}</p>
                </div>
                <div class="stat-card">
                    <h4>پسوڵەی ئامادەبوون</h4>
                    <p>${reportData.attendanceCount}</p>
                </div>
                <div class="stat-card">
                    <h4>پسوڵەی داخستن</h4>
                    <p>${reportData.closingCount}</p>
                </div>
                <div class="stat-card">
                    <h4>ژمارەی یوزەرەکان</h4>
                    <p>${reportData.usersCount}</p>
                </div>
            </div>
            
            <button onclick="printReport()" class="report-btn">
                <i class="fas fa-print"></i> چاپی ڕاپۆرت
            </button>
        </div>
    `;
}

function printReport() {
    window.print();
}

// Utility Functions
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Check for existing session on page load
window.addEventListener('load', function() {
    const savedUser = sessionStorage.getItem('currentUser');
    const savedRole = sessionStorage.getItem('currentRole');
    
    if (savedUser && savedRole) {
        currentUser = JSON.parse(savedUser);
        currentRole = savedRole;
        
        if (currentRole === 'admin') {
            showAdminDashboard();
        } else {
            showUserDashboard();
        }
    }
});

// Close modals when clicking outside
window.onclick = function(event) {
    const userModal = document.getElementById('userModal');
    const messageModal = document.getElementById('messageModal');
    
    if (event.target === userModal) {
        closeUserModal();
    }
    if (event.target === messageModal) {
        closeMessageModal();
    }
}

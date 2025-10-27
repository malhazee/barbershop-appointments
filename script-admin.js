// إعدادات الصالون
let SETTINGS = JSON.parse(localStorage.getItem('settings')) || {
    workingHours: {
        start: '09:00',
        end: '21:00'
    },
    slotDuration: 30,
    breakTime: 15
};

// كلمة السر
const DEFAULT_ADMIN_PASSWORD = '1234';
let adminPassword = localStorage.getItem('adminPassword') || DEFAULT_ADMIN_PASSWORD;
let isAdminLoggedIn = false;

// تخزين المواعيد
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let currentFilter = 'today';

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

function checkLoginStatus() {
    const sessionLogin = sessionStorage.getItem('adminLoggedIn');
    if (sessionLogin === 'true') {
        isAdminLoggedIn = true;
        showDashboard();
    }
}

function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === adminPassword) {
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        alert('✅ مرحباً بك في لوحة الإدارة!');
    } else {
        alert('❌ كلمة السر غير صحيحة!');
    }
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadWorkingHours();
    displayAppointments('today');
    updateStatistics();
}

function logoutAdmin() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        isAdminLoggedIn = false;
        sessionStorage.removeItem('adminLoggedIn');
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminPassword').value = '';
    }
}

function showAppointments(filter) {
    currentFilter = filter;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayAppointments(filter);
}

function displayAppointments(filter = 'today') {
    const appointmentsList = document.getElementById('appointmentsList');
    const statsSection = document.getElementById('statsSection');
    
    let filtered = [...appointments];
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    if (filter === 'today') {
        filtered = appointments.filter(app => app.date === today);
    } else if (filter === 'tomorrow') {
        filtered = appointments.filter(app => app.date === tomorrowDate);
    }
    
    filtered.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });
    
    if (filtered.length === 0) {
        appointmentsList.innerHTML = '<div class="empty-message">📅 لا توجد مواعيد</div>';
        statsSection.innerHTML = '';
        return;
    }
    
    appointmentsList.innerHTML = filtered.map(appointment => `
        <div class="appointment-item">
            <h3>👤 ${appointment.clientName}</h3>
            <p>📱 ${appointment.clientPhone}</p>
            <p>📅 ${formatDateFull(appointment.date)}</p>
            <p>✂️ ${appointment.service}</p>
            <span class="time-badge">🕐 ${formatTime(appointment.time)}</span>
            <br>
            <button class="btn-delete" onclick="quickDeleteAppointment(${appointment.id})">❌ إلغاء</button>
        </div>
    `).join('');
    
    statsSection.innerHTML = `
        <p>📊 عدد المواعيد: <strong>${filtered.length}</strong></p>
    `;
}

function quickDeleteAppointment(id) {
    const appointment = appointments.find(app => app.id === id);
    if (confirm(`هل أنت متأكد من إلغاء موعد:\n${appointment.clientName}\n${formatDateFull(appointment.date)} - ${formatTime(appointment.time)}؟`)) {
        appointments = appointments.filter(app => app.id !== id);
        saveAppointments();
        displayAppointments(currentFilter);
        updateStatistics();
        alert('✅ تم إلغاء الموعد بنجاح!');
    }
}

function adminDeleteAppointment() {
    if (appointments.length === 0) {
        alert('❌ لا توجد مواعيد لإلغائها');
        return;
    }
    
    let message = '📋 جميع المواعيد:\n\n';
    appointments.forEach((app, index) => {
        message += `${index + 1}. ${app.clientName} - ${app.clientPhone}\n`;
        message += `   ${formatDateFull(app.date)} - ${formatTime(app.time)}\n`;
        message += `   ${app.service}\n\n`;
    });
    message += 'أدخل رقم الموعد الذي تريد إلغاءه:';
    
    const choice = prompt(message);
    if (!choice) return;
    
    const index = parseInt(choice) - 1;
    
    if (index < 0 || index >= appointments.length) {
        alert('❌ اختيار غير صحيح');
        return;
    }
    
    const appointmentToDelete = appointments[index];
    
    if (confirm(`هل أنت متأكد من إلغاء موعد:\n${appointmentToDelete.clientName}\n${formatDateFull(appointmentToDelete.date)} - ${formatTime(appointmentToDelete.time)}؟`)) {
        appointments.splice(index, 1);
        saveAppointments();
        displayAppointments(currentFilter);
        updateStatistics();
        alert('✅ تم إلغاء الموعد بنجاح!');
    }
}

function clearAllAppointments() {
    if (confirm('⚠️ تحذير!\n\nهل أنت متأكد من حذف جميع المواعيد؟\nهذا الإجراء لا يمكن التراجع عنه!')) {
        if (confirm('تأكيد نهائي - سيتم حذف كل شيء!')) {
            appointments = [];
            saveAppointments();
            displayAppointments(currentFilter);
            updateStatistics();
            alert('✅ تم حذف جميع المواعيد');
        }
    }
}

function exportAppointments() {
    const dataStr = JSON.stringify(appointments, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointments_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    alert('✅ تم تصدير المواعيد بنجاح!');
}

function changePassword() {
    const oldPassword = prompt('أدخل كلمة السر الحالية:');
    
    if (oldPassword !== adminPassword) {
        alert('❌ كلمة السر الحالية غير صحيحة!');
        return;
    }
    
    const newPassword = prompt('أدخل كلمة السر الجديدة:');
    
    if (!newPassword || newPassword.length < 4) {
        alert('❌ كلمة السر يجب أن تكون 4 أحرف على الأقل');
        return;
    }
    
    const confirmPassword = prompt('أعد إدخال كلمة السر الجديدة:');
    
    if (newPassword !== confirmPassword) {
        alert('❌ كلمة السر غير متطابقة!');
        return;
    }
    
    adminPassword = newPassword;
    localStorage.setItem('adminPassword', adminPassword);
    alert('✅ تم تغيير كلمة السر بنجاح!');
}

function viewSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function loadWorkingHours() {
    document.getElementById('workStart').value = SETTINGS.workingHours.start;
    document.getElementById('workEnd').value = SETTINGS.workingHours.end;
}

function saveSettings() {
    SETTINGS.workingHours.start = document.getElementById('workStart').value;
    SETTINGS.workingHours.end = document.getElementById('workEnd').value;
    
    localStorage.setItem('settings', JSON.stringify(SETTINGS));
    alert('✅ تم حفظ الإعدادات بنجاح!');
}

function updateStatistics() {
    const statsContainer = document.getElementById('statistics');
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    const todayCount = appointments.filter(app => app.date === today).length;
    const tomorrowCount = appointments.filter(app => app.date === tomorrowDate).length;
    const totalCount = appointments.length;
    
    statsContainer.innerHTML = `
        <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #667eea; margin-bottom: 10px;">📅 اليوم</h3>
            <p style="font-size: 2em; font-weight: bold; color: #333;">${todayCount}</p>
        </div>
        <div style="background: #fff3e0; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #ff9800; margin-bottom: 10px;">📅 غداً</h3>
            <p style="font-size: 2em; font-weight: bold; color: #333;">${tomorrowCount}</p>
        </div>
        <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #9c27b0; margin-bottom: 10px;">📊 الإجمالي</h3>
            <p style="font-size: 2em; font-weight: bold; color: #333;">${totalCount}</p>
        </div>
    `;
}

function saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

function formatDateFull(dateString) {
    const date = new Date(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${dayName} ${day} ${month}`;
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'مساءً' : 'صباحاً';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes} ${period}`;
}

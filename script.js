// إعدادات الصالون
const SETTINGS = {
    workingHours: {
        start: '09:00',  // بداية العمل
        end: '21:00'     // نهاية العمل
    },
    slotDuration: 30,    // مدة كل فترة بالدقائق
    breakTime: 15        // وقت الراحة بين كل عميل
};

// كلمة السر الافتراضية للحلاق (يمكن تغييرها من لوحة الإدارة)
const DEFAULT_ADMIN_PASSWORD = '1234';
let adminPassword = localStorage.getItem('adminPassword') || DEFAULT_ADMIN_PASSWORD;
let isAdminLoggedIn = false;

// تخزين المواعيد
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let selectedDate = null;
let selectedTime = null;

// تهيئة التطبيق عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    initializeDates();
    setupEventListeners();
    displayAppointments('today');
});

// إعداد التواريخ
function initializeDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('todayDate').textContent = formatDateShort(today);
    document.getElementById('tomorrowDate').textContent = formatDateShort(tomorrow);
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // اختيار اليوم
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDay(this.dataset.day);
        });
    });
    
    // اختيار الخدمة
    document.getElementById('serviceType').addEventListener('change', function() {
        if (selectedDate && this.value) {
            generateTimeSlots();
        }
    });
    
    // إرسال النموذج
    document.getElementById('appointmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        bookAppointment();
    });
}

// اختيار اليوم
function selectDay(day) {
    // إزالة التحديد السابق
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // تحديد اليوم الجديد
    const btn = document.querySelector(`[data-day="${day}"]`);
    btn.classList.add('selected');
    
    // حساب التاريخ
    const date = new Date();
    if (day === 'tomorrow') {
        date.setDate(date.getDate() + 1);
    }
    
    selectedDate = date.toISOString().split('T')[0];
    document.getElementById('selectedDate').value = selectedDate;
    
    // إنشاء فترات الوقت إذا كانت الخدمة محددة
    const service = document.getElementById('serviceType').value;
    if (service) {
        generateTimeSlots();
    }
}

// إنشاء فترات الوقت المتاحة
function generateTimeSlots() {
    if (!selectedDate) return;
    
    const timeSlotsContainer = document.getElementById('timeSlots');
    const timeSlotsSection = document.getElementById('timeSlotsSection');
    timeSlotsContainer.innerHTML = '';
    timeSlotsSection.style.display = 'block';
    
    const slots = getAvailableTimeSlots(selectedDate);
    
    if (slots.length === 0) {
        timeSlotsContainer.innerHTML = '<p class="empty-message">😔 عذراً، لا توجد أوقات متاحة لهذا اليوم</p>';
        return;
    }
    
    slots.forEach(slot => {
        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = 'time-slot';
        slotBtn.textContent = formatTime(slot.time);
        
        if (slot.booked) {
            slotBtn.classList.add('booked');
            slotBtn.textContent += '\n(محجوز)';
            slotBtn.disabled = true;
        } else {
            slotBtn.addEventListener('click', function() {
                selectTimeSlot(slot.time, this);
            });
        }
        
        timeSlotsContainer.appendChild(slotBtn);
    });
}

// الحصول على الفترات المتاحة
function getAvailableTimeSlots(date) {
    const slots = [];
    const start = SETTINGS.workingHours.start;
    const end = SETTINGS.workingHours.end;
    
    let currentTime = start;
    
    while (currentTime < end) {
        const isBooked = appointments.some(app => 
            app.date === date && app.time === currentTime
        );
        
        // التحقق من أن الوقت لم يمضي (لليوم فقط)
        const now = new Date();
        const slotDate = new Date(date + 'T' + currentTime);
        const isPast = slotDate < now;
        
        slots.push({
            time: currentTime,
            booked: isBooked || isPast
        });
        
        // إضافة الفاصل الزمني التالي
        currentTime = addMinutes(currentTime, SETTINGS.slotDuration + SETTINGS.breakTime);
    }
    
    return slots;
}

// إضافة دقائق إلى وقت
function addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0);
    return date.toTimeString().slice(0, 5);
}

// اختيار فترة زمنية
function selectTimeSlot(time, element) {
    // إزالة التحديد السابق
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // تحديد الفترة الجديدة
    element.classList.add('selected');
    selectedTime = time;
    document.getElementById('selectedTime').value = time;
    
    // تفعيل زر الحجز
    document.getElementById('submitBtn').disabled = false;
}

// حجز موعد
function bookAppointment() {
    const appointment = {
        id: Date.now(),
        clientName: document.getElementById('clientName').value,
        clientPhone: document.getElementById('clientPhone').value,
        date: selectedDate,
        time: selectedTime,
        service: document.getElementById('serviceType').value,
        bookedAt: new Date().toISOString()
    };
    
    appointments.push(appointment);
    saveAppointments();
    
    // رسالة نجاح
    alert(`✅ تم حجز موعدك بنجاح!\n\n📅 التاريخ: ${formatDateFull(selectedDate)}\n🕐 الوقت: ${formatTime(selectedTime)}\n✂️ الخدمة: ${appointment.service}\n\nنتطلع لرؤيتك! 💈`);
    
    // إعادة تعيين النموذج
    document.getElementById('appointmentForm').reset();
    selectedDate = null;
    selectedTime = null;
    document.getElementById('timeSlotsSection').style.display = 'none';
    document.getElementById('submitBtn').disabled = true;
    document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('selected'));
    
    // تحديث العرض
    displayAppointments('today');
}

// عرض المواعيد
function showAppointments(filter) {
    // تحديث التبويبات
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
    
    // ترتيب حسب الوقت
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
    
    appointmentsList.innerHTML = filtered.map(appointment => {
        // إخفاء جزء من رقم الهاتف للخصوصية
        const maskedPhone = appointment.clientPhone.slice(0, 3) + '****' + appointment.clientPhone.slice(-2);
        
        return `
        <div class="appointment-item">
            <h3>👤 ${appointment.clientName}</h3>
            <p>📱 ${maskedPhone}</p>
            <p>📅 ${formatDateFull(appointment.date)}</p>
            <p>✂️ ${appointment.service}</p>
            <span class="time-badge">🕐 ${formatTime(appointment.time)}</span>
        </div>
    `;
    }).join('');
    
    // الإحصائيات
    statsSection.innerHTML = `
        <p>📊 عدد المواعيد: <strong>${filtered.length}</strong></p>
    `;
}

// إلغاء موعد العميل (باستخدام رقم الهاتف)
function cancelMyAppointment() {
    const phone = document.getElementById('cancelPhone').value.trim();
    
    if (!phone) {
        alert('⚠️ الرجاء إدخال رقم الهاتف');
        return;
    }
    
    // البحث عن المواعيد بهذا الرقم
    const myAppointments = appointments.filter(app => app.clientPhone === phone);
    
    if (myAppointments.length === 0) {
        alert('❌ لا توجد مواعيد مسجلة بهذا الرقم');
        return;
    }
    
    // عرض المواعيد للاختيار
    let message = '📋 مواعيدك المسجلة:\n\n';
    myAppointments.forEach((app, index) => {
        message += `${index + 1}. ${formatDateFull(app.date)} - ${formatTime(app.time)}\n   ${app.service}\n\n`;
    });
    message += 'أدخل رقم الموعد الذي تريد إلغاءه:';
    
    const choice = prompt(message);
    
    if (!choice) return;
    
    const index = parseInt(choice) - 1;
    
    if (index < 0 || index >= myAppointments.length) {
        alert('❌ اختيار غير صحيح');
        return;
    }
    
    const appointmentToDelete = myAppointments[index];
    
    if (confirm(`هل أنت متأكد من إلغاء موعد:\n${formatDateFull(appointmentToDelete.date)} - ${formatTime(appointmentToDelete.time)}؟`)) {
        appointments = appointments.filter(app => app.id !== appointmentToDelete.id);
        saveAppointments();
        displayAppointments('today');
        document.getElementById('cancelPhone').value = '';
        alert('✅ تم إلغاء موعدك بنجاح!');
    }
}

// حفظ المواعيد
function saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// وظائف الإدارة
function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        isAdminLoggedIn = false;
        document.getElementById('adminControls').style.display = 'none';
        document.getElementById('adminPassword').value = '';
    } else {
        panel.style.display = 'none';
    }
}

// تسجيل دخول الحلاق
function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === adminPassword) {
        isAdminLoggedIn = true;
        document.getElementById('adminControls').style.display = 'block';
        document.getElementById('adminPassword').value = '';
        alert('✅ تم تسجيل الدخول بنجاح!');
    } else {
        alert('❌ كلمة السر غير صحيحة!');
    }
}

// إلغاء موعد من قبل الحلاق
function adminDeleteAppointment() {
    if (!isAdminLoggedIn) {
        alert('⚠️ يجب تسجيل الدخول أولاً');
        return;
    }
    
    if (appointments.length === 0) {
        alert('❌ لا توجد مواعيد لإلغائها');
        return;
    }
    
    // عرض جميع المواعيد
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
        displayAppointments('today');
        alert('✅ تم إلغاء الموعد بنجاح!');
    }
}

// تغيير كلمة السر
function changePassword() {
    if (!isAdminLoggedIn) {
        alert('⚠️ يجب تسجيل الدخول أولاً');
        return;
    }
    
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

function clearAllAppointments() {
    if (confirm('⚠️ تحذير!\n\nهل أنت متأكد من حذف جميع المواعيد؟\nهذا الإجراء لا يمكن التراجع عنه!')) {
        if (confirm('تأكيد نهائي - سيتم حذف كل شيء!')) {
            appointments = [];
            saveAppointments();
            displayAppointments('today');
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
}

// وظائف تنسيق التاريخ والوقت
function formatDateShort(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
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

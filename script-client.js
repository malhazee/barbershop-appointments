// إعدادات الصالون
const SETTINGS = {
    workingHours: {
        start: '09:00',
        end: '21:00'
    },
    slotDuration: 30,
    breakTime: 15
};

// تخزين المواعيد
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let selectedDate = null;
let selectedTime = null;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeDates();
    setupEventListeners();
});

function initializeDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('todayDate').textContent = formatDateShort(today);
    document.getElementById('tomorrowDate').textContent = formatDateShort(tomorrow);
}

function setupEventListeners() {
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDay(this.dataset.day);
        });
    });
    
    document.getElementById('serviceType').addEventListener('change', function() {
        if (selectedDate && this.value) {
            generateTimeSlots();
        }
    });
    
    document.getElementById('appointmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        bookAppointment();
    });
}

function selectDay(day) {
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const btn = document.querySelector(`[data-day="${day}"]`);
    btn.classList.add('selected');
    
    const date = new Date();
    if (day === 'tomorrow') {
        date.setDate(date.getDate() + 1);
    }
    
    selectedDate = date.toISOString().split('T')[0];
    document.getElementById('selectedDate').value = selectedDate;
    
    const service = document.getElementById('serviceType').value;
    if (service) {
        generateTimeSlots();
    }
}

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

function getAvailableTimeSlots(date) {
    const slots = [];
    const start = SETTINGS.workingHours.start;
    const end = SETTINGS.workingHours.end;
    
    let currentTime = start;
    
    while (currentTime < end) {
        const isBooked = appointments.some(app => 
            app.date === date && app.time === currentTime
        );
        
        const now = new Date();
        const slotDate = new Date(date + 'T' + currentTime);
        const isPast = slotDate < now;
        
        slots.push({
            time: currentTime,
            booked: isBooked || isPast
        });
        
        currentTime = addMinutes(currentTime, SETTINGS.slotDuration + SETTINGS.breakTime);
    }
    
    return slots;
}

function addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0);
    return date.toTimeString().slice(0, 5);
}

function selectTimeSlot(time, element) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedTime = time;
    document.getElementById('selectedTime').value = time;
    document.getElementById('submitBtn').disabled = false;
}

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
    
    alert(`✅ تم حجز موعدك بنجاح!\n\n📅 التاريخ: ${formatDateFull(selectedDate)}\n🕐 الوقت: ${formatTime(selectedTime)}\n✂️ الخدمة: ${appointment.service}\n\nنتطلع لرؤيتك! 💈`);
    
    document.getElementById('appointmentForm').reset();
    selectedDate = null;
    selectedTime = null;
    document.getElementById('timeSlotsSection').style.display = 'none';
    document.getElementById('submitBtn').disabled = true;
    document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('selected'));
}

function cancelMyAppointment() {
    const phone = document.getElementById('cancelPhone').value.trim();
    
    if (!phone) {
        alert('⚠️ الرجاء إدخال رقم الهاتف');
        return;
    }
    
    const myAppointments = appointments.filter(app => app.clientPhone === phone);
    
    if (myAppointments.length === 0) {
        alert('❌ لا توجد مواعيد مسجلة بهذا الرقم');
        return;
    }
    
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
        document.getElementById('cancelPhone').value = '';
        alert('✅ تم إلغاء موعدك بنجاح!');
    }
}

function viewMyAppointments() {
    const phone = document.getElementById('viewPhone').value.trim();
    const listContainer = document.getElementById('myAppointmentsList');
    
    if (!phone) {
        alert('⚠️ الرجاء إدخال رقم الهاتف');
        return;
    }
    
    const myAppointments = appointments.filter(app => app.clientPhone === phone);
    
    if (myAppointments.length === 0) {
        listContainer.innerHTML = '<div class="empty-message">📅 لا توجد مواعيد مسجلة بهذا الرقم</div>';
        return;
    }
    
    myAppointments.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });
    
    listContainer.innerHTML = myAppointments.map(app => `
        <div class="appointment-item">
            <h3>👤 ${app.clientName}</h3>
            <p>📅 ${formatDateFull(app.date)}</p>
            <p>✂️ ${app.service}</p>
            <span class="time-badge">🕐 ${formatTime(app.time)}</span>
        </div>
    `).join('');
}

function saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

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

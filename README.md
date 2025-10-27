# 💈 نظام حجز مواعيد صالون الحلاقة

تطبيق ويب بسيط لإدارة مواعيد صالون الحلاقة بدون قاعدة بيانات.

## 📋 المميزات

### للعملاء:
- ✅ حجز موعد لليوم الحالي أو غداً فقط
- ✅ اختيار الوقت المناسب من الأوقات المتاحة
- ✅ عرض جميع المواعيد المحجوزة
- ✅ إلغاء الموعد الشخصي برقم الهاتف
- ✅ حماية خصوصية أرقام الهواتف

### للحلاق:
- ✅ مشاهدة جميع المواعيد (اليوم، غداً، الكل)
- ✅ لوحة إدارة محمية بكلمة سر
- ✅ إلغاء أي موعد
- ✅ حذف جميع المواعيد
- ✅ تصدير المواعيد
- ✅ تغيير كلمة السر

## 🚀 كيفية التشغيل

1. افتح ملف `index.html` في أي متصفح
2. لا حاجة لتثبيت أي شيء!
3. البيانات تُحفظ تلقائياً في المتصفح

## ⚙️ الإعدادات

يمكن تعديل الإعدادات في ملف `script.js`:

```javascript
const SETTINGS = {
    workingHours: {
        start: '09:00',  // بداية العمل
        end: '21:00'     // نهاية العمل
    },
    slotDuration: 30,    // مدة كل موعد (دقيقة)
    breakTime: 15        // وقت راحة بين المواعيد (دقيقة)
};
```

## 🔐 لوحة الإدارة

**كلمة السر الافتراضية:** `1234`

⚠️ **مهم:** غيّر كلمة السر فوراً بعد أول استخدام!

### كيفية الدخول:
1. اضغط على "⚙️ لوحة الإدارة (للحلاق فقط)"
2. أدخل كلمة السر: `1234`
3. اضغط "دخول"

### تغيير كلمة السر:
1. سجل دخولك إلى لوحة الإدارة
2. اضغط "🔑 تغيير كلمة السر"
3. أدخل كلمة السر الحالية ثم الجديدة

## 📱 للعملاء - إلغاء موعد

1. اذهب إلى قسم "🔍 إلغاء موعدك"
2. أدخل رقم هاتفك
3. اضغط "بحث وإلغاء"
4. اختر الموعد المراد إلغاؤه
5. أكد الإلغاء

## 📂 هيكل المشروع

```
barbershop-appointments/
├── index.html      # الصفحة الرئيسية
├── style.css       # التصميم
├── script.js       # البرمجة
└── README.md       # هذا الملف
```

## 💡 ملاحظات

- البيانات تُحفظ في المتصفح فقط (localStorage)
- لا حاجة لإنترنت بعد فتح الصفحة
- يمكن استضافة الموقع مجاناً على GitHub Pages أو Netlify
- التطبيق يدعم اللغة العربية بالكامل

## 🛠️ التقنيات المستخدمة

- HTML5
- CSS3
- JavaScript (Vanilla - بدون مكتبات خارجية)

## 📞 الدعم

للمساعدة أو الاستفسارات، راجع الشرح الموجود في التطبيق.

---

**صُمم خصيصاً لصالونات الحلاقة الرجالية 💈**

This project is a web application designed to manage appointments for a men's barbershop. It allows barbers to organize client appointments efficiently and provides a user-friendly interface for both barbers and clients.

## Features

- **Client Management**: Create, retrieve, and delete client information.
- **Appointment Management**: Schedule, view, and cancel appointments.
- **RESTful API**: The application exposes a RESTful API for managing clients and appointments.

## Project Structure

```
barbershop-appointments
├── src
│   ├── app.ts                  # Entry point of the application
│   ├── controllers             # Contains controllers for handling requests
│   │   ├── appointmentController.ts
│   │   └── clientController.ts
│   ├── models                  # Defines data models for appointments and clients
│   │   ├── Appointment.ts
│   │   └── Client.ts
│   ├── routes                  # Defines routes for the API
│   │   ├── appointmentRoutes.ts
│   │   └── clientRoutes.ts
│   ├── services                # Contains business logic for managing data
│   │   ├── appointmentService.ts
│   │   └── clientService.ts
│   └── types                   # Type definitions for TypeScript
│       └── index.ts
├── package.json                # NPM package configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd barbershop-appointments
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run the following command:
```
npm start
```

The application will be available at `http://localhost:3000`.

## API Endpoints

- **Clients**
  - `POST /clients` - Create a new client
  - `GET /clients` - Retrieve all clients
  - `DELETE /clients/:id` - Delete a client by ID

- **Appointments**
  - `POST /appointments` - Create a new appointment
  - `GET /appointments` - Retrieve all appointments
  - `DELETE /appointments/:id` - Delete an appointment by ID

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
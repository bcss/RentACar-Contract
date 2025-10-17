import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.contracts": "Contracts",
      "nav.users": "Users",
      "nav.auditLogs": "Audit Logs",
      "nav.settings": "Settings",
      
      // Common
      "common.search": "Search",
      "common.filter": "Filter",
      "common.export": "Export",
      "common.print": "Print",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.view": "View",
      "common.create": "Create",
      "common.back": "Back",
      "common.next": "Next",
      "common.submit": "Submit",
      "common.close": "Close",
      "common.loading": "Loading...",
      "common.noResults": "No results found",
      "common.error": "Error",
      "common.success": "Success",
      
      // Auth
      "auth.login": "Log In",
      "auth.logout": "Log Out",
      "auth.welcome": "Welcome",
      "auth.welcomeBack": "Welcome back",
      
      // Landing
      "landing.title": "Contract Management System",
      "landing.subtitle": "Digital rental car contract lifecycle management with bilingual support",
      "landing.loginButton": "Log In to Continue",
      
      // Login
      "login.subtitle": "Sign in to manage rental contracts",
      "login.username": "Username",
      "login.password": "Password",
      "login.usernamePlaceholder": "Enter your username",
      "login.passwordPlaceholder": "Enter your password",
      "login.loginButton": "Log In",
      "login.loggingIn": "Logging in...",
      "login.success": "Login successful",
      "login.failed": "Login failed",
      "login.invalidCredentials": "Invalid username or password",
      "login.welcomeBack": "Welcome back, {{name}}!",
      
      // Dashboard
      "dashboard.title": "Dashboard",
      "dashboard.totalContracts": "Total Contracts",
      "dashboard.draftContracts": "Draft Contracts",
      "dashboard.finalizedContracts": "Finalized Contracts",
      "dashboard.recentActivity": "Recent Activity",
      
      // Contracts
      "contracts.title": "Contracts",
      "contracts.newContract": "New Contract",
      "contracts.contractNumber": "Contract Number",
      "contracts.customerName": "Customer Name",
      "contracts.status": "Status",
      "contracts.createdDate": "Created Date",
      "contracts.actions": "Actions",
      "contracts.draft": "Draft",
      "contracts.finalized": "Finalized",
      "contracts.searchPlaceholder": "Search by contract number or customer name...",
      "contracts.disableContract": "Disable Contract",
      "contracts.enableContract": "Enable Contract",
      "contracts.disabledContracts": "Disabled Contracts",
      "contracts.disabledBy": "Disabled By",
      "contracts.disabledAt": "Disabled At",
      "contracts.contractDisabled": "Contract disabled successfully",
      "contracts.contractEnabled": "Contract enabled successfully",
      "contracts.confirmDisableContract": "Are you sure you want to disable this contract?",
      "contracts.confirmEnableContract": "Are you sure you want to enable this contract?",
      
      // Contract Form
      "form.customerInfo": "Customer Information",
      "form.customerNameEn": "Customer Name (English)",
      "form.customerNameAr": "Customer Name (Arabic)",
      "form.customerPhone": "Phone Number",
      "form.customerEmail": "Email",
      "form.customerAddress": "Address",
      "form.licenseNumber": "License Number",
      
      "form.vehicleInfo": "Vehicle Information",
      "form.vehicleMake": "Make",
      "form.vehicleModel": "Model",
      "form.vehicleYear": "Year",
      "form.vehicleColor": "Color",
      "form.vehiclePlate": "Plate Number",
      "form.vehicleVin": "VIN",
      
      "form.rentalDetails": "Rental Details",
      "form.rentalStartDate": "Start Date",
      "form.rentalEndDate": "End Date",
      "form.pickupLocation": "Pickup Location",
      "form.dropoffLocation": "Drop-off Location",
      
      "form.pricing": "Pricing",
      "form.dailyRate": "Daily Rate",
      "form.totalDays": "Total Days",
      "form.totalAmount": "Total Amount",
      "form.deposit": "Deposit",
      
      "form.additionalInfo": "Additional Information",
      "form.notes": "Notes",
      "form.termsAccepted": "Terms & Conditions Accepted",
      
      // User Management
      "users.title": "User Management",
      "users.addUser": "Add User",
      "users.name": "Name",
      "users.username": "Username",
      "users.email": "Email",
      "users.firstName": "First Name",
      "users.lastName": "Last Name",
      "users.role": "Role",
      "users.password": "Password",
      "users.confirmPassword": "Confirm Password",
      "users.createdAt": "Created At",
      "users.editUser": "Edit User",
      "users.disableUser": "Disable User",
      "users.enableUser": "Enable User",
      "users.cannotDisableSuperAdmin": "Cannot disable super admin",
      "users.userCreated": "User created successfully",
      "users.userUpdated": "User updated successfully",
      "users.userDisabled": "User disabled successfully",
      "users.userEnabled": "User enabled successfully",
      "users.confirmDisableUser": "Are you sure you want to disable this user? They will no longer be able to log in.",
      "users.confirmEnableUser": "Are you sure you want to enable this user?",
      "users.passwordMismatch": "Passwords do not match",
      "users.searchPlaceholder": "Search by username or name...",
      "users.disabledUsers": "Disabled Users",
      "users.disabledBy": "Disabled By",
      "users.disabledAt": "Disabled At",
      
      // Roles
      "role.admin": "Admin",
      "role.manager": "Manager",
      "role.staff": "Staff",
      "role.viewer": "Viewer",
      
      // Audit Logs
      "audit.title": "Audit Logs",
      "audit.user": "User",
      "audit.action": "Action",
      "audit.contract": "Contract",
      "audit.timestamp": "Timestamp",
      "audit.details": "Details",
      
      // Actions
      "action.create": "Create",
      "action.edit": "Edit",
      "action.finalize": "Finalize",
      "action.print": "Print",
      "action.delete": "Delete",
      "action.login": "Login",
      "action.logout": "Logout",
      
      // Messages
      "msg.contractCreated": "Contract created successfully",
      "msg.contractUpdated": "Contract updated successfully",
      "msg.contractFinalized": "Contract finalized successfully",
      "msg.contractDeleted": "Contract deleted successfully",
      "msg.printSuccess": "Contract is ready to print",
      "msg.confirmFinalize": "Are you sure you want to finalize this contract? This action cannot be undone.",
      "msg.confirmDelete": "Are you sure you want to delete this contract?",
      "msg.noPermission": "You don't have permission to perform this action",
    }
  },
  ar: {
    translation: {
      // Navigation
      "nav.contracts": "العقود",
      "nav.users": "المستخدمون",
      "nav.auditLogs": "سجلات التدقيق",
      "nav.settings": "الإعدادات",
      
      // Common
      "common.search": "بحث",
      "common.filter": "تصفية",
      "common.export": "تصدير",
      "common.print": "طباعة",
      "common.save": "حفظ",
      "common.cancel": "إلغاء",
      "common.delete": "حذف",
      "common.edit": "تعديل",
      "common.view": "عرض",
      "common.create": "إنشاء",
      "common.back": "رجوع",
      "common.next": "التالي",
      "common.submit": "إرسال",
      "common.close": "إغلاق",
      "common.loading": "جاري التحميل...",
      "common.noResults": "لا توجد نتائج",
      "common.error": "خطأ",
      "common.success": "نجح",
      
      // Auth
      "auth.login": "تسجيل الدخول",
      "auth.logout": "تسجيل الخروج",
      "auth.welcome": "مرحباً",
      "auth.welcomeBack": "مرحباً بعودتك",
      
      // Landing
      "landing.title": "نظام إدارة العقود",
      "landing.subtitle": "إدارة دورة حياة عقود تأجير السيارات رقمياً مع دعم ثنائي اللغة",
      "landing.loginButton": "تسجيل الدخول للمتابعة",
      
      // Login
      "login.subtitle": "سجل الدخول لإدارة عقود الإيجار",
      "login.username": "اسم المستخدم",
      "login.password": "كلمة المرور",
      "login.usernamePlaceholder": "أدخل اسم المستخدم",
      "login.passwordPlaceholder": "أدخل كلمة المرور",
      "login.loginButton": "تسجيل الدخول",
      "login.loggingIn": "جاري تسجيل الدخول...",
      "login.success": "تم تسجيل الدخول بنجاح",
      "login.failed": "فشل تسجيل الدخول",
      "login.invalidCredentials": "اسم المستخدم أو كلمة المرور غير صحيحة",
      "login.welcomeBack": "مرحباً بعودتك، {{name}}!",
      
      // Dashboard
      "dashboard.title": "لوحة التحكم",
      "dashboard.totalContracts": "إجمالي العقود",
      "dashboard.draftContracts": "المسودات",
      "dashboard.finalizedContracts": "العقود المكتملة",
      "dashboard.recentActivity": "النشاط الأخير",
      
      // Contracts
      "contracts.title": "العقود",
      "contracts.newContract": "عقد جديد",
      "contracts.contractNumber": "رقم العقد",
      "contracts.customerName": "اسم العميل",
      "contracts.status": "الحالة",
      "contracts.createdDate": "تاريخ الإنشاء",
      "contracts.actions": "الإجراءات",
      "contracts.draft": "مسودة",
      "contracts.finalized": "مكتمل",
      "contracts.searchPlaceholder": "البحث برقم العقد أو اسم العميل...",
      "contracts.disableContract": "تعطيل العقد",
      "contracts.enableContract": "تفعيل العقد",
      "contracts.disabledContracts": "العقود المعطلة",
      "contracts.disabledBy": "تم التعطيل بواسطة",
      "contracts.disabledAt": "تاريخ التعطيل",
      "contracts.contractDisabled": "تم تعطيل العقد بنجاح",
      "contracts.contractEnabled": "تم تفعيل العقد بنجاح",
      "contracts.confirmDisableContract": "هل أنت متأكد أنك تريد تعطيل هذا العقد؟",
      "contracts.confirmEnableContract": "هل أنت متأكد أنك تريد تفعيل هذا العقد؟",
      
      // Contract Form
      "form.customerInfo": "معلومات العميل",
      "form.customerNameEn": "اسم العميل (إنجليزي)",
      "form.customerNameAr": "اسم العميل (عربي)",
      "form.customerPhone": "رقم الهاتف",
      "form.customerEmail": "البريد الإلكتروني",
      "form.customerAddress": "العنوان",
      "form.licenseNumber": "رقم الرخصة",
      
      "form.vehicleInfo": "معلومات المركبة",
      "form.vehicleMake": "الصنع",
      "form.vehicleModel": "الموديل",
      "form.vehicleYear": "السنة",
      "form.vehicleColor": "اللون",
      "form.vehiclePlate": "رقم اللوحة",
      "form.vehicleVin": "رقم الهيكل",
      
      "form.rentalDetails": "تفاصيل الإيجار",
      "form.rentalStartDate": "تاريخ البداية",
      "form.rentalEndDate": "تاريخ النهاية",
      "form.pickupLocation": "موقع الاستلام",
      "form.dropoffLocation": "موقع التسليم",
      
      "form.pricing": "التسعير",
      "form.dailyRate": "السعر اليومي",
      "form.totalDays": "إجمالي الأيام",
      "form.totalAmount": "المبلغ الإجمالي",
      "form.deposit": "التأمين",
      
      "form.additionalInfo": "معلومات إضافية",
      "form.notes": "ملاحظات",
      "form.termsAccepted": "تم قبول الشروط والأحكام",
      
      // User Management
      "users.title": "إدارة المستخدمين",
      "users.addUser": "إضافة مستخدم",
      "users.name": "الاسم",
      "users.username": "اسم المستخدم",
      "users.email": "البريد الإلكتروني",
      "users.firstName": "الاسم الأول",
      "users.lastName": "اسم العائلة",
      "users.role": "الدور",
      "users.password": "كلمة المرور",
      "users.confirmPassword": "تأكيد كلمة المرور",
      "users.createdAt": "تاريخ الإنشاء",
      "users.editUser": "تعديل المستخدم",
      "users.disableUser": "تعطيل المستخدم",
      "users.enableUser": "تفعيل المستخدم",
      "users.cannotDisableSuperAdmin": "لا يمكن تعطيل المسؤول الرئيسي",
      "users.userCreated": "تم إنشاء المستخدم بنجاح",
      "users.userUpdated": "تم تحديث المستخدم بنجاح",
      "users.userDisabled": "تم تعطيل المستخدم بنجاح",
      "users.userEnabled": "تم تفعيل المستخدم بنجاح",
      "users.confirmDisableUser": "هل أنت متأكد أنك تريد تعطيل هذا المستخدم؟ لن يتمكن من تسجيل الدخول.",
      "users.confirmEnableUser": "هل أنت متأكد أنك تريد تفعيل هذا المستخدم؟",
      "users.passwordMismatch": "كلمات المرور غير متطابقة",
      "users.searchPlaceholder": "ابحث باسم المستخدم أو الاسم...",
      "users.disabledUsers": "المستخدمون المعطلون",
      "users.disabledBy": "تم التعطيل بواسطة",
      "users.disabledAt": "تاريخ التعطيل",
      
      // Roles
      "role.admin": "مدير",
      "role.manager": "مدير قسم",
      "role.staff": "موظف",
      "role.viewer": "مراجع",
      
      // Audit Logs
      "audit.title": "سجلات التدقيق",
      "audit.user": "المستخدم",
      "audit.action": "الإجراء",
      "audit.contract": "العقد",
      "audit.timestamp": "الوقت",
      "audit.details": "التفاصيل",
      
      // Actions
      "action.create": "إنشاء",
      "action.edit": "تعديل",
      "action.finalize": "إتمام",
      "action.print": "طباعة",
      "action.delete": "حذف",
      "action.login": "تسجيل دخول",
      "action.logout": "تسجيل خروج",
      
      // Messages
      "msg.contractCreated": "تم إنشاء العقد بنجاح",
      "msg.contractUpdated": "تم تحديث العقد بنجاح",
      "msg.contractFinalized": "تم إتمام العقد بنجاح",
      "msg.contractDeleted": "تم حذف العقد بنجاح",
      "msg.printSuccess": "العقد جاهز للطباعة",
      "msg.confirmFinalize": "هل أنت متأكد من إتمام هذا العقد؟ لا يمكن التراجع عن هذا الإجراء.",
      "msg.confirmDelete": "هل أنت متأكد من حذف هذا العقد؟",
      "msg.noPermission": "ليس لديك إذن لتنفيذ هذا الإجراء",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

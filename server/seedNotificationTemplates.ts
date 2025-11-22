import { storage } from "./storage";
import type { InsertNotificationTemplate } from "@shared/schema";

// Helper to create email template
const emailTemplate = (
  code: string,
  name: string,
  category: string,
  subjectEn: string,
  subjectAr: string,
  bodyEn: string,
  bodyAr: string
): InsertNotificationTemplate => ({
  templateCode: code,
  name,
  category,
  supportsEmail: true,
  supportsSms: false,
  subjectEn,
  subjectAr,
  bodyEn,
  bodyAr,
});

// Helper to create SMS template
const smsTemplate = (
  code: string,
  name: string,
  category: string,
  bodyEn: string,
  bodyAr: string
): InsertNotificationTemplate => ({
  templateCode: code,
  name,
  category,
  supportsEmail: false,
  supportsSms: true,
  subjectEn: null,
  subjectAr: null,
  bodyEn,
  bodyAr,
});

const notificationTemplates: InsertNotificationTemplate[] = [
  // ===== CONTRACT EVENTS (10 templates) =====
  emailTemplate(
    'CONTRACT_CREATED',
    'Contract Created',
    'contract',
    'Your Rental Contract {{contractNumber}} Has Been Created',
    'تم إنشاء عقد الإيجار {{contractNumber}}',
    'Dear {{customerName}},\n\nYour rental contract {{contractNumber}} has been successfully created for vehicle {{vehiclePlate}}.\n\nRental Period: {{startDate}} to {{endDate}}\nDaily Rate: AED {{dailyRate}}\nTotal Amount: AED {{totalAmount}}\n\nThank you for choosing our service.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nتم إنشاء عقد الإيجار {{contractNumber}} بنجاح للمركبة {{vehiclePlate}}.\n\nفترة الإيجار: {{startDate}} إلى {{endDate}}\nالسعر اليومي: {{dailyRate}} درهم\nالمبلغ الإجمالي: {{totalAmount}} درهم\n\nشكراً لاختيارك خدماتنا.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'CONTRACT_PENDING_APPROVAL',
    'Contract Pending Approval',
    'contract',
    'Your Contract {{contractNumber}} is Pending Approval',
    'عقدك {{contractNumber}} بانتظار الموافقة',
    'Dear {{customerName}},\n\nYour rental contract {{contractNumber}} has been submitted and is currently pending approval from our management team.\n\nWe will notify you once the contract is reviewed.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nتم تقديم عقد الإيجار {{contractNumber}} وهو حالياً بانتظار موافقة فريق الإدارة.\n\nسنقوم بإعلامك فور مراجعة العقد.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'CONTRACT_APPROVED',
    'Contract Approved',
    'contract',
    'Contract {{contractNumber}} Approved - Ready to Start',
    'تمت الموافقة على العقد {{contractNumber}} - جاهز للبدء',
    'Dear {{customerName}},\n\nGreat news! Your rental contract {{contractNumber}} has been approved.\n\nYou can now pick up your vehicle {{vehiclePlate}} starting {{startDate}}.\n\nPlease bring your original documents and payment receipt.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nأخبار سارة! تمت الموافقة على عقد الإيجار {{contractNumber}}.\n\nيمكنك الآن استلام مركبتك {{vehiclePlate}} ابتداءً من {{startDate}}.\n\nيرجى إحضار مستنداتك الأصلية وإيصال الدفع.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'CONTRACT_REJECTED',
    'Contract Rejected',
    'contract',
    'Contract {{contractNumber}} - Action Required',
    'العقد {{contractNumber}} - مطلوب إجراء',
    'Dear {{customerName}},\n\nUnfortunately, contract {{contractNumber}} could not be approved at this time.\n\nReason: {{rejectionReason}}\n\nPlease contact our office for more information or to resubmit with corrections.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nللأسف، لم يتم الموافقة على العقد {{contractNumber}} في هذا الوقت.\n\nالسبب: {{rejectionReason}}\n\nيرجى الاتصال بمكتبنا للحصول على مزيد من المعلومات أو لإعادة التقديم مع التصحيحات.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  smsTemplate(
    'CONTRACT_ACTIVE',
    'Contract Active - Rental Started',
    'contract',
    'Welcome! Contract {{contractNumber}} is now active. Vehicle {{vehiclePlate}} is in your care. Drive safely! - {{companyName}}',
    'مرحباً! العقد {{contractNumber}} نشط الآن. المركبة {{vehiclePlate}} في عهدتك. قيادة آمنة! - {{companyName}}'
  ),

  emailTemplate(
    'CONTRACT_EXTENDED',
    'Contract Extension Confirmed',
    'contract',
    'Contract {{contractNumber}} Extended Successfully',
    'تم تمديد العقد {{contractNumber}} بنجاح',
    'Dear {{customerName}},\n\nYour rental contract {{contractNumber}} has been extended.\n\nNew End Date: {{newEndDate}}\nExtension Amount: AED {{extensionAmount}}\n\nThank you for your continued business.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nتم تمديد عقد الإيجار {{contractNumber}}.\n\nتاريخ الانتهاء الجديد: {{newEndDate}}\nمبلغ التمديد: {{extensionAmount}} درهم\n\nشكراً لاستمرار تعاملك معنا.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  smsTemplate(
    'CONTRACT_DUE_TOMORROW',
    'Contract Due Tomorrow - Reminder',
    'contract',
    'Reminder: Contract {{contractNumber}} ends tomorrow {{endDate}}. Please return vehicle {{vehiclePlate}} by 9 PM. Contact us to extend. - {{companyName}}',
    'تذكير: العقد {{contractNumber}} ينتهي غداً {{endDate}}. يرجى إرجاع المركبة {{vehiclePlate}} قبل الساعة 9 مساءً. اتصل بنا للتمديد. - {{companyName}}'
  ),

  smsTemplate(
    'CONTRACT_OVERDUE',
    'Contract Overdue - Urgent',
    'contract',
    'URGENT: Contract {{contractNumber}} is overdue! Vehicle {{vehiclePlate}} should have been returned on {{endDate}}. Late fees apply. Contact us immediately. - {{companyName}}',
    'عاجل: العقد {{contractNumber}} متأخر! كان يجب إرجاع المركبة {{vehiclePlate}} في {{endDate}}. تطبق رسوم التأخير. اتصل بنا فوراً. - {{companyName}}'
  ),

  emailTemplate(
    'CONTRACT_RETURNED',
    'Contract Completed - Vehicle Returned',
    'contract',
    'Thank You - Contract {{contractNumber}} Completed',
    'شكراً لك - اكتمل العقد {{contractNumber}}',
    'Dear {{customerName}},\n\nThank you for returning vehicle {{vehiclePlate}}. Contract {{contractNumber}} is now complete.\n\nSecurity Deposit Status: {{depositStatus}}\nFinal Balance: AED {{finalBalance}}\n\nWe hope to serve you again soon!\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nشكراً لإرجاع المركبة {{vehiclePlate}}. العقد {{contractNumber}} مكتمل الآن.\n\nحالة التأمين: {{depositStatus}}\nالرصيد النهائي: {{finalBalance}} درهم\n\nنتطلع لخدمتك مرة أخرى قريباً!\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'CONTRACT_CANCELLED',
    'Contract Cancelled',
    'contract',
    'Contract {{contractNumber}} Cancellation Confirmation',
    'تأكيد إلغاء العقد {{contractNumber}}',
    'Dear {{customerName}},\n\nContract {{contractNumber}} has been cancelled as requested.\n\nCancellation Reason: {{cancellationReason}}\nRefund Amount: AED {{refundAmount}}\n\nRefunds will be processed within 5-7 business days.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nتم إلغاء العقد {{contractNumber}} كما طلبت.\n\nسبب الإلغاء: {{cancellationReason}}\nمبلغ الاسترداد: {{refundAmount}} درهم\n\nسيتم معالجة المبالغ المستردة خلال 5-7 أيام عمل.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  // ===== PAYMENT EVENTS (8 templates) =====
  emailTemplate(
    'PAYMENT_RECEIVED',
    'Payment Receipt',
    'payment',
    'Payment Receipt - {{paymentAmount}} AED',
    'إيصال الدفع - {{paymentAmount}} درهم',
    'Dear {{customerName}},\n\nWe confirm receipt of your payment:\n\nContract: {{contractNumber}}\nAmount Paid: AED {{paymentAmount}}\nPayment Method: {{paymentMethod}}\nDate: {{paymentDate}}\nReceipt #: {{receiptNumber}}\n\nOutstanding Balance: AED {{outstandingBalance}}\n\nThank you for your payment.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nنؤكد استلام دفعتك:\n\nالعقد: {{contractNumber}}\nالمبلغ المدفوع: {{paymentAmount}} درهم\nطريقة الدفع: {{paymentMethod}}\nالتاريخ: {{paymentDate}}\nرقم الإيصال: {{receiptNumber}}\n\nالرصيد المستحق: {{outstandingBalance}} درهم\n\nشكراً لدفعتك.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'PAYMENT_DUE_3DAYS',
    'Payment Due in 3 Days',
    'payment',
    'Payment Reminder - Due in 3 Days',
    'تذكير بالدفع - مستحق خلال 3 أيام',
    'Dear {{customerName}},\n\nThis is a friendly reminder that payment for contract {{contractNumber}} is due in 3 days.\n\nDue Date: {{dueDate}}\nAmount Due: AED {{amountDue}}\n\nPlease arrange payment to avoid late fees.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nهذا تذكير ودي بأن الدفع للعقد {{contractNumber}} مستحق خلال 3 أيام.\n\nتاريخ الاستحقاق: {{dueDate}}\nالمبلغ المستحق: {{amountDue}} درهم\n\nيرجى ترتيب الدفع لتجنب رسوم التأخير.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  smsTemplate(
    'PAYMENT_DUE_TOMORROW',
    'Payment Due Tomorrow',
    'payment',
    'REMINDER: Payment of AED {{amountDue}} for contract {{contractNumber}} is due tomorrow {{dueDate}}. Pay now to avoid late fees. - {{companyName}}',
    'تذكير: دفعة {{amountDue}} درهم للعقد {{contractNumber}} مستحقة غداً {{dueDate}}. ادفع الآن لتجنب رسوم التأخير. - {{companyName}}'
  ),

  smsTemplate(
    'PAYMENT_OVERDUE',
    'Payment Overdue - Urgent',
    'payment',
    'URGENT: Payment of AED {{amountDue}} for contract {{contractNumber}} is OVERDUE. Late fees apply. Pay immediately to avoid service suspension. - {{companyName}}',
    'عاجل: دفعة {{amountDue}} درهم للعقد {{contractNumber}} متأخرة. تطبق رسوم التأخير. ادفع فوراً لتجنب تعليق الخدمة. - {{companyName}}'
  ),

  smsTemplate(
    'PARTIAL_PAYMENT_RECEIVED',
    'Partial Payment Received',
    'payment',
    'Thank you! Partial payment of AED {{paymentAmount}} received for contract {{contractNumber}}. Remaining balance: AED {{remainingBalance}}. - {{companyName}}',
    'شكراً! تم استلام دفعة جزئية {{paymentAmount}} درهم للعقد {{contractNumber}}. الرصيد المتبقي: {{remainingBalance}} درهم. - {{companyName}}'
  ),

  emailTemplate(
    'SECURITY_DEPOSIT_RECEIVED',
    'Security Deposit Received',
    'payment',
    'Security Deposit Confirmation - {{contractNumber}}',
    'تأكيد التأمين - {{contractNumber}}',
    'Dear {{customerName}},\n\nWe confirm receipt of your security deposit:\n\nContract: {{contractNumber}}\nDeposit Amount: AED {{depositAmount}}\nReceipt #: {{receiptNumber}}\n\nThis deposit will be refunded upon successful return of the vehicle in good condition.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nنؤكد استلام التأمين الخاص بك:\n\nالعقد: {{contractNumber}}\nمبلغ التأمين: {{depositAmount}} درهم\nرقم الإيصال: {{receiptNumber}}\n\nسيتم استرداد هذا التأمين عند إرجاع المركبة بنجاح بحالة جيدة.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'SECURITY_DEPOSIT_REFUNDED',
    'Security Deposit Refunded',
    'payment',
    'Security Deposit Refund - {{contractNumber}}',
    'استرداد التأمين - {{contractNumber}}',
    'Dear {{customerName}},\n\nYour security deposit has been processed for refund:\n\nContract: {{contractNumber}}\nDeposit Amount: AED {{depositAmount}}\nDeductions: AED {{deductions}}\nRefund Amount: AED {{refundAmount}}\n\nThe refund will be credited to your account within 5-7 business days.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nتمت معالجة التأمين الخاص بك للاسترداد:\n\nالعقد: {{contractNumber}}\nمبلغ التأمين: {{depositAmount}} درهم\nالخصومات: {{deductions}} درهم\nمبلغ الاسترداد: {{refundAmount}} درهم\n\nسيتم إضافة المبلغ المسترد إلى حسابك خلال 5-7 أيام عمل.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'PAYMENT_FAILED',
    'Payment Failed',
    'payment',
    'Payment Failed - Action Required',
    'فشل الدفع - مطلوب إجراء',
    'Dear {{customerName}},\n\nYour payment for contract {{contractNumber}} could not be processed.\n\nAmount: AED {{amount}}\nReason: {{failureReason}}\n\nPlease update your payment method or contact us to arrange alternative payment.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nلم يتم معالجة دفعتك للعقد {{contractNumber}}.\n\nالمبلغ: {{amount}} درهم\nالسبب: {{failureReason}}\n\nيرجى تحديث طريقة الدفع أو الاتصال بنا لترتيب دفع بديل.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  // ===== DOCUMENT EVENTS (6 templates) =====
  emailTemplate(
    'LICENSE_EXPIRING_30DAYS',
    'Driving License Expiring in 30 Days',
    'document',
    'Important: Your Driving License Expires Soon',
    'مهم: رخصة القيادة الخاصة بك تنتهي قريباً',
    'Dear {{customerName}},\n\nYour driving license ({{licenseNumber}}) will expire in 30 days on {{expiryDate}}.\n\nPlease renew your license to continue using our rental services.\n\nContact us if you have questions.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nرخصة القيادة الخاصة بك ({{licenseNumber}}) ستنتهي خلال 30 يوماً في {{expiryDate}}.\n\nيرجى تجديد رخصتك لمواصلة استخدام خدمات التأجير لدينا.\n\nاتصل بنا إذا كان لديك أسئلة.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  smsTemplate(
    'LICENSE_EXPIRING_7DAYS',
    'Driving License Expiring in 7 Days - Urgent',
    'document',
    'URGENT: Your driving license {{licenseNumber}} expires in 7 days ({{expiryDate}}). Renew immediately to avoid service interruption. - {{companyName}}',
    'عاجل: رخصة القيادة {{licenseNumber}} تنتهي خلال 7 أيام ({{expiryDate}}). جدد فوراً لتجنب انقطاع الخدمة. - {{companyName}}'
  ),

  smsTemplate(
    'LICENSE_EXPIRED',
    'Driving License Expired',
    'document',
    'ALERT: Your driving license {{licenseNumber}} has EXPIRED. You cannot rent vehicles until you provide a valid license. Contact us urgently. - {{companyName}}',
    'تنبيه: رخصة القيادة {{licenseNumber}} انتهت. لا يمكنك استئجار مركبات حتى تقدم رخصة صالحة. اتصل بنا بشكل عاجل. - {{companyName}}'
  ),

  emailTemplate(
    'EMIRATES_ID_EXPIRING',
    'Emirates ID Expiring Soon',
    'document',
    'Emirates ID Expiration Reminder',
    'تذكير بانتهاء الهوية الإماراتية',
    'Dear {{customerName}},\n\nYour Emirates ID ({{emiratesIdNumber}}) will expire on {{expiryDate}}.\n\nPlease update your records with your renewed Emirates ID.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nالهوية الإماراتية ({{emiratesIdNumber}}) ستنتهي في {{expiryDate}}.\n\nيرجى تحديث سجلاتك بالهوية الإماراتية المجددة.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'INSURANCE_EXPIRING',
    'Insurance Expiring Soon',
    'document',
    'Vehicle Insurance Renewal Reminder',
    'تذكير بتجديد تأمين المركبة',
    'Dear Customer,\n\nInsurance for vehicle {{vehiclePlate}} expires on {{expiryDate}}.\n\nRenewal is in progress. You will be notified once the new insurance is active.\n\nBest regards,\n{{companyName}}',
    'عزيزي العميل،\n\nتأمين المركبة {{vehiclePlate}} ينتهي في {{expiryDate}}.\n\nالتجديد جار. سيتم إعلامك عند تفعيل التأمين الجديد.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'DOCUMENT_UPLOADED',
    'Document Upload Confirmation',
    'document',
    'Document Received - {{documentType}}',
    'تم استلام المستند - {{documentType}}',
    'Dear {{customerName}},\n\nWe confirm receipt of your document:\n\nDocument Type: {{documentType}}\nUpload Date: {{uploadDate}}\n\nOur team will review it shortly.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nنؤكد استلام مستندك:\n\nنوع المستند: {{documentType}}\nتاريخ الرفع: {{uploadDate}}\n\nسيقوم فريقنا بمراجعته قريباً.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  // ===== OPERATIONAL EVENTS (6 templates) =====
  emailTemplate(
    'INSPECTION_REQUIRED',
    'Vehicle Inspection Required',
    'operational',
    'Vehicle Inspection Reminder - {{vehiclePlate}}',
    'تذكير بفحص المركبة - {{vehiclePlate}}',
    'Dear {{customerName}},\n\nVehicle {{vehiclePlate}} requires inspection.\n\nScheduled Date: {{inspectionDate}}\nLocation: {{branchName}}\n\nPlease bring the vehicle to our location at the scheduled time.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nالمركبة {{vehiclePlate}} تحتاج إلى فحص.\n\nالتاريخ المحدد: {{inspectionDate}}\nالموقع: {{branchName}}\n\nيرجى إحضار المركبة إلى موقعنا في الوقت المحدد.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  smsTemplate(
    'DRIVER_ASSIGNED',
    'Driver Assigned to Your Contract',
    'operational',
    'Driver {{driverName}} ({{driverMobile}}) has been assigned to your contract {{contractNumber}}. Pickup time: {{pickupTime}}. - {{companyName}}',
    'تم تعيين السائق {{driverName}} ({{driverMobile}}) لعقدك {{contractNumber}}. وقت الاستلام: {{pickupTime}}. - {{companyName}}'
  ),

  emailTemplate(
    'TOLL_CHARGE_ADDED',
    'Toll Charge Added',
    'operational',
    'Toll Charges - Contract {{contractNumber}}',
    'رسوم ساليك - العقد {{contractNumber}}',
    'Dear {{customerName}},\n\nToll charges have been added to your contract {{contractNumber}}:\n\nGate: {{tollGate}}\nDate: {{tollDate}}\nAmount: AED {{tollAmount}}\n\nThis will be added to your final invoice.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nتمت إضافة رسوم ساليك إلى عقدك {{contractNumber}}:\n\nالبوابة: {{tollGate}}\nالتاريخ: {{tollDate}}\nالمبلغ: {{tollAmount}} درهم\n\nسيتم إضافة هذا إلى فاتورتك النهائية.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'TRAFFIC_FINE_ADDED',
    'Traffic Fine Alert',
    'operational',
    'Traffic Fine - Contract {{contractNumber}}',
    'مخالفة مرورية - العقد {{contractNumber}}',
    'Dear {{customerName}},\n\nA traffic fine has been recorded on contract {{contractNumber}}:\n\nViolation: {{violationType}}\nDate: {{fineDate}}\nLocation: {{fineLocation}}\nFine Amount: AED {{fineAmount}}\n\nPlease settle this fine at your earliest convenience.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nتم تسجيل مخالفة مرورية على العقد {{contractNumber}}:\n\nالمخالفة: {{violationType}}\nالتاريخ: {{fineDate}}\nالموقع: {{fineLocation}}\nمبلغ الغرامة: {{fineAmount}} درهم\n\nيرجى تسوية هذه الغرامة في أقرب وقت ممكن.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'ACCIDENT_REPORTED',
    'Accident Report Notification',
    'operational',
    'Accident Report - Contract {{contractNumber}}',
    'تقرير حادث - العقد {{contractNumber}}',
    'Dear {{customerName}},\n\nAn accident has been reported for vehicle {{vehiclePlate}} under contract {{contractNumber}}.\n\nDate: {{accidentDate}}\nLocation: {{accidentLocation}}\nPolice Report: {{policeReport}}\n\nOur team will contact you shortly to discuss next steps.\n\nBest regards,\n{{companyName}}',
    'عزيزي {{customerNameAr}}،\n\nتم الإبلاغ عن حادث للمركبة {{vehiclePlate}} بموجب العقد {{contractNumber}}.\n\nالتاريخ: {{accidentDate}}\nالموقع: {{accidentLocation}}\nتقرير الشرطة: {{policeReport}}\n\nسيتصل بك فريقنا قريباً لمناقشة الخطوات التالية.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),

  emailTemplate(
    'BRANCH_TRANSFER_COMPLETE',
    'Vehicle Transfer Completed',
    'operational',
    'Vehicle Transfer Confirmation - {{vehiclePlate}}',
    'تأكيد نقل المركبة - {{vehiclePlate}}',
    'Dear Team,\n\nVehicle {{vehiclePlate}} has been successfully transferred:\n\nFrom: {{fromBranch}}\nTo: {{toBranch}}\nTransfer Date: {{transferDate}}\nDriver: {{driverName}}\n\nThe vehicle is now available at the destination branch.\n\nBest regards,\n{{companyName}}',
    'عزيزي الفريق،\n\nتم نقل المركبة {{vehiclePlate}} بنجاح:\n\nمن: {{fromBranch}}\nإلى: {{toBranch}}\nتاريخ النقل: {{transferDate}}\nالسائق: {{driverName}}\n\nالمركبة متاحة الآن في الفرع الوجهة.\n\nمع أطيب التحيات،\n{{companyName}}'
  ),
];

export async function seedNotificationTemplates() {
  try {
    console.log('[Notification Templates] Starting seed...');
    
    // Get superadmin user for createdBy field
    const superadmin = await storage.getUserByUsername("superadmin");
    if (!superadmin) {
      console.error('[Notification Templates] Superadmin user not found - cannot seed templates');
      return;
    }
    
    // Check which of our system templates already exist
    const existingTemplates = await storage.getNotificationTemplates();
    const existingCodes = new Set(existingTemplates.map(t => t.templateCode));
    
    // Filter templates that need to be created
    const templatesToCreate = notificationTemplates.filter(t => !existingCodes.has(t.templateCode));
    
    if (templatesToCreate.length === 0) {
      console.log(`[Notification Templates] All ${notificationTemplates.length} system templates already exist`);
      return;
    }
    
    console.log(`[Notification Templates] Seeding ${templatesToCreate.length} new templates (${existingTemplates.length} already exist)...`);
    
    // Insert templates that don't exist yet
    let createdCount = 0;
    for (const template of templatesToCreate) {
      try {
        await storage.createNotificationTemplate({
          ...template,
          createdBy: superadmin.id as string,
          isSystemTemplate: true, // Mark as system template
        });
        createdCount++;
      } catch (error: any) {
        console.error(`[Notification Templates] Error creating template ${template.templateCode}:`, error.message);
      }
    }
    
    console.log(`[Notification Templates] ✓ Successfully seeded ${createdCount}/${templatesToCreate.length} new templates`);
    console.log(`[Notification Templates] Total templates in database: ${existingTemplates.length + createdCount}`);
  } catch (error) {
    console.error('[Notification Templates] Error during seed:', error);
    throw error;
  }
}

import {
  users,
  contracts,
  auditLogs,
  accessLogs,
  contractEdits,
  contractCounter,
  systemErrors,
  companySettings,
  customers,
  vehicles,
  sponsors,
  companies,
  payments,
  vehicleInspections,
  insuranceClaims,
  renewalRequests,
  documentApprovals,
  supportTickets,
  pushNotificationTokens,
  branches,
  branchTransfers,
  publicHolidays,
  drivers,
  driverOutsourceCompanies,
  driverRateCards,
  driverScheduleBlocks,
  driverAssignments,
  tollSystems,
  tollGates,
  tollPasses,
  trafficFines,
  incidents,
  documentRegistry,
  vehicleServiceRecords,
  rentalRatePlans,
  vehicleAccessories,
  contractAccessories,
  driverSchedules,
  driverAttendance,
  automatedReminders,
  approvalRequests,
  approvalLogs,
  customerRiskScores,
  communicationProviders,
  communicationLogs,
  notificationTemplates,
  claimProgressUpdates,
  notificationCampaigns,
  campaignRecipients,
  templateAnalytics,
  abTestVariants,
  notificationChannelPreferences,
  type User,
  type UpsertUser,
  type Contract,
  type ContractWithDetails,
  type InsertContract,
  type InsertAuditLog,
  type AuditLog,
  type AccessLog,
  type InsertAccessLog,
  type InsertContractEdit,
  type ContractEdit,
  type SystemError,
  type InsertSystemError,
  type CompanySettings,
  type InsertCompanySettings,
  type Customer,
  type Vehicle,
  type InsertCustomer,
  type InsertVehicle,
  type Sponsor,
  type InsertSponsor,
  type Company,
  type InsertCompany,
  type Payment,
  type InsertPayment,
  type VehicleInspection,
  type InsertVehicleInspection,
  type InsuranceClaim,
  type InsertInsuranceClaim,
  type RenewalRequest,
  type InsertRenewalRequest,
  type DocumentApproval,
  type InsertDocumentApproval,
  type SupportTicket,
  type InsertSupportTicket,
  type PushNotificationToken,
  type InsertPushNotificationToken,
  type Branch,
  type InsertBranch,
  type BranchTransfer,
  type InsertBranchTransfer,
  type PublicHoliday,
  type InsertPublicHoliday,
  type Driver,
  type InsertDriver,
  type DriverOutsourceCompany,
  type InsertDriverOutsourceCompany,
  type DriverRateCard,
  type InsertDriverRateCard,
  type DriverScheduleBlock,
  type InsertDriverScheduleBlock,
  type DriverAssignment,
  type InsertDriverAssignment,
  type TollSystem,
  type InsertTollSystem,
  type TollGate,
  type InsertTollGate,
  type TollPass,
  type InsertTollPass,
  type TrafficFine,
  type InsertTrafficFine,
  type Incident,
  type InsertIncident,
  type DocumentRegistryEntry,
  type InsertDocumentRegistry,
  type VehicleServiceRecord,
  type InsertVehicleServiceRecord,
  type RentalRatePlan,
  type InsertRentalRatePlan,
  type VehicleAccessory,
  type InsertVehicleAccessory,
  type ContractAccessory,
  type InsertContractAccessory,
  type DriverSchedule,
  type InsertDriverSchedule,
  type DriverAttendance,
  type InsertDriverAttendance,
  type AutomatedReminder,
  type InsertAutomatedReminder,
  type ApprovalRequest,
  type InsertApprovalRequest,
  type ApprovalLog,
  type InsertApprovalLog,
  type CustomerRiskScore,
  type InsertCustomerRiskScore,
  type CommunicationProvider,
  type InsertCommunicationProvider,
  type CommunicationLog,
  type InsertCommunicationLog,
  type NotificationTemplate,
  type InsertNotificationTemplate,
  type ClaimProgressUpdate,
  type InsertClaimProgressUpdate,
  type Campaign,
  type InsertCampaign,
  type CampaignRecipient,
  type InsertCampaignRecipient,
  type TemplateAnalytics,
  type InsertTemplateAnalytics,
  type AbTest,
  type InsertAbTest,
  type ChannelPreference,
  type InsertChannelPreference,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, like, sql, and, not, lt, gt, ne, ilike, getTableColumns, count, sum, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Internal authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getDisabledUsers(): Promise<User[]>;
  updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isImmutable' | 'username'>>): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User>;
  updateUserPassword(userId: string, passwordHash: string): Promise<User>;
  updateLastLogin(userId: string): Promise<User>;
  disableUser(userId: string, disabledBy: string): Promise<User>;
  enableUser(userId: string): Promise<User>;
  
  // Contract operations
  getContract(id: string): Promise<Contract | undefined>;
  getAllContracts(): Promise<ContractWithDetails[]>;
  getDisabledContracts(): Promise<ContractWithDetails[]>;
  searchContracts(query: string): Promise<Contract[]>;
  createContract(contract: InsertContract, tx?: any): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract>;
  // Legacy finalizeContract removed - use confirmContract instead
  disableContract(id: string, userId: string): Promise<Contract>;
  enableContract(id: string): Promise<Contract>;
  
  // Contract counter
  getNextContractNumber(): Promise<number>;
  
  // Customer operations
  getCustomers(includeDisabled?: boolean): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  getCustomerByNationalId(nationalId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer, tx?: any): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  disableCustomer(id: string, disabledBy: string): Promise<void>;
  enableCustomer(id: string): Promise<void>;
  searchCustomers(query: string): Promise<Customer[]>;
  
  // Vehicle operations
  getVehicles(includeDisabled?: boolean): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | undefined>;
  getVehicleByRegistration(registration: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle, tx?: any): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  disableVehicle(id: string, disabledBy: string): Promise<void>;
  enableVehicle(id: string): Promise<void>;
  checkVehicleAvailability(vehicleId: string, startDate: Date, endDate: Date, excludeContractId?: string): Promise<boolean>;
  searchVehicles(query: string): Promise<Vehicle[]>;
  
  // Sponsor operations (individual sponsors)
  getSponsors(includeDisabled?: boolean): Promise<Sponsor[]>;
  getSponsorById(id: string): Promise<Sponsor | undefined>;
  getSponsorByPassportId(passportId: string): Promise<Sponsor | undefined>;
  createSponsor(sponsor: InsertSponsor, tx?: any): Promise<Sponsor>;
  updateSponsor(id: string, sponsor: Partial<InsertSponsor>): Promise<Sponsor>;
  disableSponsor(id: string, disabledBy: string): Promise<void>;
  enableSponsor(id: string): Promise<void>;
  searchSponsors(query: string): Promise<Sponsor[]>;
  
  // Company operations (corporate sponsors)
  getCompanies(includeDisabled?: boolean): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company | undefined>;
  getCompanyByRegistrationNumber(registrationNumber: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany, tx?: any): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company>;
  disableCompany(id: string, disabledBy: string): Promise<void>;
  enableCompany(id: string): Promise<void>;
  searchCompanies(query: string): Promise<Company[]>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByContract(contractId: string): Promise<Payment[]>;
  getPaymentById(id: string): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<void>;
  
  // Vehicle inspection operations
  createVehicleInspection(inspection: InsertVehicleInspection): Promise<VehicleInspection>;
  getVehicleInspections(filters?: { vehicleId?: string; contractId?: string; inspectionType?: string }): Promise<VehicleInspection[]>;
  getVehicleInspectionsByContract(contractId: string): Promise<VehicleInspection[]>;
  getVehicleInspection(id: string): Promise<VehicleInspection | undefined>;
  updateVehicleInspection(id: string, data: Partial<InsertVehicleInspection>): Promise<VehicleInspection>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAllAuditLogs(): Promise<AuditLog[]>;
  getRecentAuditLogs(limit: number): Promise<AuditLog[]>;
  
  // Contract edit operations
  createContractEdit(edit: InsertContractEdit): Promise<ContractEdit>;
  getContractEdits(contractId: string): Promise<ContractEdit[]>;
  
  // Contract audit logs (lifecycle events)
  getContractAuditLogs(contractId: string): Promise<any[]>;
  
  // System error operations
  createSystemError(error: InsertSystemError): Promise<SystemError>;
  getAllSystemErrors(): Promise<SystemError[]>;
  getUnacknowledgedSystemErrors(): Promise<SystemError[]>;
  acknowledgeSystemError(id: string, acknowledgedBy: string): Promise<SystemError>;
  markErrorSentToSupport(id: string): Promise<SystemError>;
  
  // Analytics operations
  getRevenueAnalytics(): Promise<{
    totalRevenue: number;
    averageContractValue: number;
    monthlyRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: number;
  }>;
  getOperationalAnalytics(): Promise<{
    averageRentalDuration: number;
    contractsThisMonth: number;
    contractsLastMonth: number;
    contractGrowth: number;
    mostActiveUser: { name: string; count: number } | null;
  }>;
  getCustomerAnalytics(): Promise<{
    totalCustomers: number;
    repeatCustomers: number;
    repeatCustomerRate: number;
    newCustomersThisMonth: number;
  }>;
  
  // Dashboard analytics operations
  getFleetStatusDistribution(): Promise<{
    available: number;
    rented: number;
    maintenance: number;
    damaged: number;
  }>;
  getGeographicDistribution(): Promise<{
    customersByAuthority: { authority: string; count: number }[];
    vehiclesByAuthority: { authority: string; count: number }[];
  }>;
  getGeographicDistributionUAE(): Promise<{
    customersByEmirate: { emirate: string; count: number }[];
    vehiclesByEmirate: { emirate: string; count: number }[];
    sponsorsByEmirate: { emirate: string; count: number }[];
    companiesByEmirate: { emirate: string; count: number }[];
  }>;
  getPendingActions(): Promise<{
    overdueReturns: number;
    pendingRefunds: number;
    unclosedContracts: number;
  }>;
  getTopPerformers(): Promise<{
    topVehiclesByRevenue: { vehicleId: string; registration: string; make: string; model: string; totalRevenue: number }[];
    mostActiveStaff: { userId: string; username: string; firstName: string; lastName: string; contractCount: number }[];
  }>;
  
  // Company settings operations
  getCompanySettings(): Promise<CompanySettings>;
  updateCompanySettings(settings: Partial<InsertCompanySettings>, updatedBy: string): Promise<CompanySettings>;
  
  // Insurance Claims operations
  getInsuranceClaims(filters?: { contractId?: string; vehicleId?: string; status?: string }): Promise<InsuranceClaim[]>;
  getInsuranceClaimById(id: string): Promise<InsuranceClaim | undefined>;
  createInsuranceClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim>;
  updateInsuranceClaim(id: string, claim: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim>;
  disableInsuranceClaim(id: string): Promise<void>;
  
  // Renewal Requests operations
  getRenewalRequests(filters?: { status?: string; customerId?: string; contractId?: string }): Promise<RenewalRequest[]>;
  getRenewalRequest(id: string): Promise<RenewalRequest | undefined>;
  createRenewalRequest(request: InsertRenewalRequest): Promise<RenewalRequest>;
  updateRenewalRequest(id: string, request: Partial<InsertRenewalRequest>): Promise<RenewalRequest>;
  deleteRenewalRequest(id: string, disabledBy: string): Promise<void>;
  
  // Document Approvals operations
  getDocumentApprovals(filters?: { status?: string; customerId?: string; documentType?: string }): Promise<DocumentApproval[]>;
  getDocumentApproval(id: string): Promise<DocumentApproval | undefined>;
  createDocumentApproval(approval: InsertDocumentApproval): Promise<DocumentApproval>;
  updateDocumentApproval(id: string, approval: Partial<InsertDocumentApproval>): Promise<DocumentApproval>;
  deleteDocumentApproval(id: string, disabledBy: string): Promise<void>;
  
  // Support Tickets operations
  getSupportTickets(filters?: { status?: string; priority?: string; category?: string; customerId?: string; assignedTo?: string }): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  deleteSupportTicket(id: string, disabledBy: string): Promise<void>;
  
  // Push Notification Tokens operations
  getPushNotificationTokens(filters?: { userId?: string; customerId?: string; platform?: string; isActive?: boolean }): Promise<PushNotificationToken[]>;
  getPushNotificationToken(id: string): Promise<PushNotificationToken | undefined>;
  createPushNotificationToken(token: InsertPushNotificationToken): Promise<PushNotificationToken>;
  updatePushNotificationToken(id: string, token: Partial<InsertPushNotificationToken>): Promise<PushNotificationToken>;
  deletePushNotificationToken(id: string): Promise<void>;
  
  // Access log operations - Track app access and login attempts
  createAccessLog(log: InsertAccessLog): Promise<AccessLog>;
  getAccessLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    outcome?: string;
    username?: string;
    ipAddress?: string;
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AccessLog[]; total: number }>;
  purgeAccessLogs(beforeDate: Date): Promise<number>;
  
  // Branch operations
  getBranches(includeDisabled?: boolean): Promise<Branch[]>;
  getBranchById(id: string): Promise<Branch | undefined>;
  getBranchByCode(branchCode: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch>;
  disableBranch(id: string, disabledBy: string): Promise<void>;
  enableBranch(id: string): Promise<void>;
  
  // Branch Transfer operations
  getBranchTransfers(filters?: { status?: string; vehicleId?: string; sourceBranchId?: string; destinationBranchId?: string }): Promise<BranchTransfer[]>;
  getBranchTransferById(id: string): Promise<BranchTransfer | undefined>;
  createBranchTransfer(transfer: InsertBranchTransfer): Promise<BranchTransfer>;
  approveBranchTransfer(id: string, approvedBy: string): Promise<BranchTransfer>;
  rejectBranchTransfer(id: string, approvedBy: string, rejectedReason: string): Promise<BranchTransfer>;
  completeBranchTransfer(id: string): Promise<BranchTransfer>;
  
  // Driver Outsource Company operations
  getDriverOutsourceCompanies(includeDisabled?: boolean): Promise<DriverOutsourceCompany[]>;
  getDriverOutsourceCompanyById(id: string): Promise<DriverOutsourceCompany | undefined>;
  createDriverOutsourceCompany(company: InsertDriverOutsourceCompany): Promise<DriverOutsourceCompany>;
  updateDriverOutsourceCompany(id: string, company: Partial<InsertDriverOutsourceCompany>): Promise<DriverOutsourceCompany>;
  disableDriverOutsourceCompany(id: string, disabledBy: string): Promise<void>;
  enableDriverOutsourceCompany(id: string): Promise<void>;
  
  // Driver operations
  getDrivers(filters?: { availability?: string; employmentType?: string; includeDisabled?: boolean }): Promise<Driver[]>;
  getDriverById(id: string): Promise<Driver | undefined>;
  getDriverByCode(driverCode: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver>;
  updateDriverAvailability(id: string, availability: string): Promise<Driver>;
  disableDriver(id: string, disabledBy: string): Promise<void>;
  enableDriver(id: string): Promise<void>;
  
  // Driver Rate Card operations
  getDriverRateCards(driverId: string): Promise<DriverRateCard[]>;
  getActiveDriverRateCard(driverId: string, rateType: string): Promise<DriverRateCard | undefined>;
  createDriverRateCard(rateCard: InsertDriverRateCard): Promise<DriverRateCard>;
  updateDriverRateCard(id: string, rateCard: Partial<InsertDriverRateCard>): Promise<DriverRateCard>;
  
  // Driver Schedule Block operations
  getDriverScheduleBlocks(driverId: string, startDate?: Date, endDate?: Date): Promise<DriverScheduleBlock[]>;
  createDriverScheduleBlock(block: InsertDriverScheduleBlock): Promise<DriverScheduleBlock>;
  deleteDriverScheduleBlock(id: string): Promise<void>;
  checkDriverAvailability(driverId: string, startDateTime: Date, endDateTime: Date): Promise<boolean>;
  
  // Driver Assignment operations
  getDriverAssignments(filters?: { contractId?: string; driverId?: string; status?: string }): Promise<DriverAssignment[]>;
  getDriverAssignmentById(id: string): Promise<DriverAssignment | undefined>;
  createDriverAssignment(assignment: InsertDriverAssignment): Promise<DriverAssignment>;
  updateDriverAssignment(id: string, assignment: Partial<InsertDriverAssignment>): Promise<DriverAssignment>;
  completeDriverAssignment(id: string, completionNotes: string): Promise<DriverAssignment>;
  
  // Public Holiday operations
  getPublicHolidays(filters?: { isActive?: boolean; year?: number }): Promise<PublicHoliday[]>;
  getPublicHolidayById(id: string): Promise<PublicHoliday | undefined>;
  createPublicHoliday(holiday: InsertPublicHoliday): Promise<PublicHoliday>;
  updatePublicHoliday(id: string, holiday: Partial<InsertPublicHoliday>): Promise<PublicHoliday>;
  deletePublicHoliday(id: string): Promise<void>;
  getHolidayByDate(date: Date): Promise<PublicHoliday | undefined>;
  
  // ==================== WAVE 1: COMPLIANCE & OPERATIONS ====================
  
  // Toll System operations
  getTollSystems(filters?: { emirate?: string; isActive?: boolean }): Promise<any[]>;
  getTollSystemById(id: string): Promise<any | undefined>;
  createTollSystem(system: any): Promise<any>;
  updateTollSystem(id: string, system: any): Promise<any>;
  deleteTollSystem(id: string): Promise<void>;
  
  // Toll Gate operations  
  getTollGates(filters?: { tollSystemId?: string; isActive?: boolean }): Promise<any[]>;
  getTollGateById(id: string): Promise<any | undefined>;
  createTollGate(gate: any): Promise<any>;
  updateTollGate(id: string, gate: any): Promise<any>;
  deleteTollGate(id: string): Promise<void>;
  
  // Toll Pass operations
  getTollPasses(filters?: { vehicleId?: string; contractId?: string; paymentStatus?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getTollPassById(id: string): Promise<any | undefined>;
  createTollPass(pass: any): Promise<any>;
  updateTollPass(id: string, pass: any): Promise<any>;
  deleteTollPass(id: string): Promise<void>;
  
  // Traffic Fine operations
  getTrafficFines(filters?: { vehicleId?: string; customerId?: string; contractId?: string; paymentStatus?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getTrafficFineById(id: string): Promise<any | undefined>;
  createTrafficFine(fine: any): Promise<any>;
  updateTrafficFine(id: string, fine: any): Promise<any>;
  deleteTrafficFine(id: string): Promise<void>;
  
  // Incident operations
  getIncidents(filters?: { contractId?: string; vehicleId?: string; customerId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getIncidentById(id: string): Promise<any | undefined>;
  createIncident(incident: any): Promise<any>;
  updateIncident(id: string, incident: any): Promise<any>;
  deleteIncident(id: string): Promise<void>;
  
  // Document Registry operations
  getDocuments(filters?: { entityType?: string; entityId?: string; documentType?: string; status?: string }): Promise<any[]>;
  getDocumentById(id: string): Promise<any | undefined>;
  createDocument(document: any): Promise<any>;
  updateDocument(id: string, document: any): Promise<any>;
  deleteDocument(id: string): Promise<void>;
  getExpiringDocuments(daysAhead?: number): Promise<any[]>;
  getExpiredDocuments(): Promise<any[]>;
  verifyDocument(id: string, verifiedBy: string): Promise<any>;
  seedDocumentRegistry(): Promise<{ seeded: number; skipped: number }>;
  
  // Notification Templates operations
  getNotificationTemplates(filters?: { category?: string; isActive?: boolean; isSystemTemplate?: boolean }): Promise<any[]>;
  getNotificationTemplateById(id: string): Promise<any | undefined>;
  getNotificationTemplateByCode(code: string): Promise<any | undefined>;
  createNotificationTemplate(template: any): Promise<any>;
  updateNotificationTemplate(id: string, template: any): Promise<any>;
  deleteNotificationTemplate(id: string): Promise<void>;
  seedNotificationTemplates(): Promise<{ seeded: number; skipped: number }>;
  
  // Communication Provider operations
  getCommunicationProviders(filters?: { type?: string; isActive?: boolean }): Promise<CommunicationProvider[]>;
  getCommunicationProviderById(id: string): Promise<CommunicationProvider | undefined>;
  getActiveSmsProviders(): Promise<CommunicationProvider[]>;
  getActiveEmailProviders(): Promise<CommunicationProvider[]>;
  createCommunicationProvider(provider: InsertCommunicationProvider, userId: string): Promise<CommunicationProvider>;
  updateCommunicationProvider(id: string, provider: Partial<InsertCommunicationProvider>): Promise<CommunicationProvider>;
  deleteCommunicationProvider(id: string): Promise<void>;
  updateProviderHealth(id: string, healthStatus: string, lastError?: string): Promise<void>;
  incrementProviderUsage(id: string, success: boolean): Promise<void>;
  
  // Communication Log operations
  getCommunicationLogs(filters?: { channel?: string; status?: string; recipientId?: string; startDate?: Date; endDate?: Date; limit?: number }): Promise<CommunicationLog[]>;
  getCommunicationLogById(id: string): Promise<CommunicationLog | undefined>;
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  updateCommunicationLogStatus(id: string, status: string, metadata?: any): Promise<CommunicationLog>;
  
  // Automated Reminders operations
  getAutomatedReminders(filters?: { entityType?: string; entityId?: string; reminderType?: string; isActive?: boolean }): Promise<any[]>;
  getAutomatedReminderById(id: string): Promise<any | undefined>;
  createAutomatedReminder(reminder: any): Promise<any>;
  updateAutomatedReminder(id: string, reminder: any): Promise<any>;
  deleteAutomatedReminder(id: string): Promise<void>;
  seedAutomatedReminders(): Promise<{ seeded: number; skipped: number }>;
  
  // ==================== PHASE 4-5: CLAIMS PROGRESS TRACKING ====================
  
  getClaimProgressUpdates(claimId: string): Promise<any[]>;
  createClaimProgressUpdate(update: any): Promise<any>;
  
  // ==================== PHASE 4-5: CAMPAIGN MANAGEMENT ====================
  
  getCampaigns(user: any, filters?: { status?: string; scope?: string; branchId?: string }): Promise<any[]>;
  getCampaignById(id: string, user: any): Promise<any | undefined>;
  createCampaign(campaign: any): Promise<any>;
  updateCampaign(id: string, campaign: any): Promise<any>;
  deleteCampaign(id: string): Promise<void>;
  approveCampaign(id: string, approvedBy: string): Promise<any>;
  rejectCampaign(id: string, rejectedBy: string, rejectionReason: string): Promise<any>;
  sendCampaign(id: string): Promise<any>;
  
  // Campaign Recipients operations
  estimateCampaignRecipients(params: {
    recipientFilter: any;
    scope: string;
    branchId?: string | null;
    selectedBranches?: string[] | null;
    userRole: string;
    userBranchId?: string | null;
    channel?: string;
  }): Promise<{ count: number; estimatedCost: string }>;
  getCampaignRecipients(campaignId: string, filters?: any): Promise<any[]>;
  createCampaignRecipient(recipient: any): Promise<any>;
  updateCampaignRecipient(id: string, recipient: any): Promise<any>;
  
  // ==================== PHASE 4-5: TEMPLATE ANALYTICS ====================
  
  getTemplateAnalytics(filters?: { templateId?: string; periodType?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getTemplateAnalyticsSummary(filters?: { templateId?: string; periodType?: string }): Promise<any>;
  generateTemplateAnalytics(params: { periodType: string; periodStart: Date; periodEnd: Date }): Promise<{ generated: number }>;
  
  // ==================== PHASE 4-5: A/B TESTING ====================
  
  getAbTests(filters?: { status?: string }): Promise<any[]>;
  getAbTestById(id: string): Promise<any | undefined>;
  createAbTest(test: any): Promise<any>;
  updateAbTest(id: string, test: any): Promise<any>;
  startAbTest(id: string): Promise<any>;
  completeAbTest(id: string): Promise<any>;
  
  // ==================== PHASE 4-5: CHANNEL PREFERENCES ====================
  
  getChannelPreferences(filters?: { category?: string; isActive?: boolean }): Promise<any[]>;
  getChannelPreferenceById(id: string): Promise<any | undefined>;
  getChannelPreferenceByType(notificationType: string): Promise<any | undefined>;
  createChannelPreference(preference: any): Promise<any>;
  updateChannelPreference(id: string, preference: any): Promise<any>;
  toggleChannelPreference(id: string, channel: 'email' | 'sms', enabled: boolean, userId: string): Promise<any>;
  calculateNotificationCost(notificationType: string, recipientCount: number): Promise<{ emailCost: string; smsCost: string; totalCost: string }>;
  seedChannelPreferences(): Promise<{ seeded: number; skipped: number }>;
  
  // ==================== BULK IMPORT OPERATIONS ====================
  
  importCustomers(records: any[]): Promise<any[]>;
  importVehicles(records: any[]): Promise<any[]>;
  importSponsors(records: any[]): Promise<any[]>;
  importCompanies(records: any[]): Promise<any[]>;
  importContracts(records: any[]): Promise<any[]>;
  
  // ==================== WAVE 2: FLEET ECONOMICS ====================
  
  // Vehicle Service Record operations
  getVehicleServiceRecords(filters?: { vehicleId?: string; serviceType?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getVehicleServiceRecordById(id: string): Promise<any | undefined>;
  createVehicleServiceRecord(record: any): Promise<any>;
  updateVehicleServiceRecord(id: string, record: any): Promise<any>;
  deleteVehicleServiceRecord(id: string): Promise<void>;
  
  // Rental Rate Plan operations
  getRentalRatePlans(filters?: { planType?: string; isActive?: boolean; vehicleCategory?: string }): Promise<any[]>;
  getRentalRatePlanById(id: string): Promise<any | undefined>;
  createRentalRatePlan(plan: any): Promise<any>;
  updateRentalRatePlan(id: string, plan: any): Promise<any>;
  deleteRentalRatePlan(id: string): Promise<void>;
  
  // Vehicle Accessory operations
  getVehicleAccessories(filters?: { category?: string; isActive?: boolean }): Promise<any[]>;
  getVehicleAccessoryById(id: string): Promise<any | undefined>;
  createVehicleAccessory(accessory: any): Promise<any>;
  updateVehicleAccessory(id: string, accessory: any): Promise<any>;
  deleteVehicleAccessory(id: string): Promise<void>;
  
  // Contract Accessory operations
  getContractAccessories(contractId: string): Promise<any[]>;
  getContractAccessoryById(id: string): Promise<any | undefined>;
  createContractAccessory(contractAccessory: any): Promise<any>;
  updateContractAccessory(id: string, contractAccessory: any): Promise<any>;
  deleteContractAccessory(id: string): Promise<void>;
  
  // ==================== WAVE 3: WORKFORCE & AUTOMATION ====================
  
  // Driver Schedule operations
  getDriverSchedules(filters?: { driverId?: string; branchId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getDriverScheduleById(id: string): Promise<any | undefined>;
  createDriverSchedule(schedule: any): Promise<any>;
  updateDriverSchedule(id: string, schedule: any): Promise<any>;
  deleteDriverSchedule(id: string): Promise<void>;
  
  // Driver Attendance operations
  getDriverAttendance(filters?: { driverId?: string; scheduleId?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getDriverAttendanceById(id: string): Promise<any | undefined>;
  createDriverAttendance(attendance: any): Promise<any>;
  updateDriverAttendance(id: string, attendance: any): Promise<any>;
  checkOutDriver(id: string): Promise<any>;
  deleteDriverAttendance(id: string): Promise<void>;
  
  // Automated Reminder operations
  getAutomatedReminders(filters?: { entityType?: string; entityId?: string; reminderType?: string; isSent?: boolean; isActive?: boolean }): Promise<any[]>;
  getAutomatedReminderById(id: string): Promise<any | undefined>;
  createAutomatedReminder(reminder: any): Promise<any>;
  updateAutomatedReminder(id: string, reminder: any): Promise<any>;
  markReminderAsSent(id: string): Promise<any>;
  deleteAutomatedReminder(id: string): Promise<void>;
  
  // Approval Request operations
  getApprovalRequests(filters?: { entityType?: string; requestedBy?: string; status?: string; requiredLevel?: string }): Promise<any[]>;
  getApprovalRequestById(id: string): Promise<any | undefined>;
  createApprovalRequest(request: any): Promise<any>;
  approveRequest(id: string, approvedBy: string): Promise<any>;
  rejectRequest(id: string, rejectedBy: string, rejectionReason: string): Promise<any>;
  deleteApprovalRequest(id: string): Promise<void>;
  
  // Approval Log operations
  getApprovalLogs(approvalId: string): Promise<any[]>;
  createApprovalLog(log: any): Promise<any>;
  
  // Customer Risk Score operations
  getCustomerRiskScores(customerId: string): Promise<any[]>;
  getLatestCustomerRiskScore(customerId: string): Promise<any | undefined>;
  createCustomerRiskScore(score: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.disabled, false)).orderBy(desc(users.createdAt));
  }

  async getDisabledUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.disabled, true)).orderBy(desc(users.disabledAt));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isImmutable' | 'username'>>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.isImmutable) {
      const allowedFields = ['firstName', 'lastName', 'email', 'passwordHash', 'lastPasswordChange'];
      const attemptedFields = Object.keys(updates);
      const disallowedFields = attemptedFields.filter(field => !allowedFields.includes(field));
      
      if (disallowedFields.length > 0) {
        throw new Error(`Cannot modify immutable user: ${disallowedFields.join(', ')} fields are protected`);
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        passwordHash, 
        lastPasswordChange: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateLastLogin(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        lastLoginAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async disableUser(userId: string, disabledBy: string): Promise<User> {
    // Check if user is immutable before disabling
    const user = await this.getUser(userId);
    if (user?.isImmutable) {
      throw new Error("Cannot disable immutable user");
    }
    const [updatedUser] = await db
      .update(users)
      .set({ 
        disabled: true, 
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async enableUser(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        disabled: false, 
        disabledBy: null,
        disabledAt: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Contract operations
  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractWithDetails(id: string): Promise<ContractWithDetails | undefined> {
    const [result] = await db
      .select({
        ...getTableColumns(contracts),
        customerNameEn: customers.nameEn,
        customerNameAr: customers.nameAr,
        vehicleRegistration: vehicles.registration,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        sponsor: sponsors as any,
        companySponsor: companies as any,
        creatorName: users.username,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .leftJoin(sponsors, eq(contracts.sponsorId, sponsors.id))
      .leftJoin(companies, eq(contracts.companySponsorId, companies.id))
      .leftJoin(users, eq(contracts.createdBy, users.id))
      .where(eq(contracts.id, id));
    
    return result as ContractWithDetails | undefined;
  }

  async getAllContracts(): Promise<ContractWithDetails[]> {
    const results = await db
      .select({
        ...getTableColumns(contracts),
        customerNameEn: customers.nameEn,
        customerNameAr: customers.nameAr,
        vehicleRegistration: vehicles.registration,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        sponsor: sponsors as any,
        companySponsor: companies as any,
        creatorName: users.username,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .leftJoin(sponsors, eq(contracts.sponsorId, sponsors.id))
      .leftJoin(companies, eq(contracts.companySponsorId, companies.id))
      .leftJoin(users, eq(contracts.createdBy, users.id))
      .where(eq(contracts.disabled, false))
      .orderBy(desc(contracts.createdAt));
    
    return results as ContractWithDetails[];
  }

  async getDisabledContracts(): Promise<ContractWithDetails[]> {
    const results = await db
      .select({
        ...getTableColumns(contracts),
        customerNameEn: customers.nameEn,
        customerNameAr: customers.nameAr,
        vehicleRegistration: vehicles.registration,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        sponsor: sponsors as any,
        companySponsor: companies as any,
        creatorName: users.username,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .leftJoin(sponsors, eq(contracts.sponsorId, sponsors.id))
      .leftJoin(companies, eq(contracts.companySponsorId, companies.id))
      .leftJoin(users, eq(contracts.createdBy, users.id))
      .where(eq(contracts.disabled, true))
      .orderBy(desc(contracts.disabledAt));
    
    return results as ContractWithDetails[];
  }

  async searchContracts(query: string): Promise<Contract[]> {
    const searchTerm = `%${query}%`;
    const results = await db
      .select({ contract: contracts })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .where(
        or(
          like(sql`CAST(${contracts.contractNumber} AS TEXT)`, searchTerm),
          ilike(customers.nameEn, searchTerm),
          ilike(customers.nameAr, searchTerm),
          ilike(vehicles.registration, searchTerm),
          ilike(vehicles.make, searchTerm),
          ilike(vehicles.model, searchTerm)
        )
      )
      .orderBy(desc(contracts.createdAt));
    
    return results.map(r => r.contract);
  }

  async createContract(contract: InsertContract, tx?: any): Promise<Contract> {
    const contractNumber = await this.getNextContractNumber();
    const dbConn = tx || db;
    
    const [newContract] = await dbConn
      .insert(contracts)
      .values({
        ...contract,
        contractNumber,
      })
      .returning();
    
    return newContract;
  }

  async updateContract(id: string, contractData: Partial<InsertContract>, expectedVersion?: number): Promise<Contract> {
    // Optimistic locking implementation - Per Master Spec Part 6.5.2 and A.3
    if (expectedVersion !== undefined) {
      const [updated] = await db
        .update(contracts)
        .set({
          ...contractData,
          updatedAt: new Date(),
          version: sql`${contracts.version} + 1`,
        })
        .where(and(
          eq(contracts.id, id),
          eq(contracts.version, expectedVersion)
        ))
        .returning();
      
      if (!updated) {
        throw new Error('Contract was modified by another user. Please refresh and try again.');
      }
      
      return updated;
    }
    
    // Without version check (backward compatible)
    const [updated] = await db
      .update(contracts)
      .set({
        ...contractData,
        updatedAt: new Date(),
        version: sql`${contracts.version} + 1`,
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return updated;
  }

  // Legacy finalizeContract method removed - use new state machine methods below

  // Phase 2.1: State transition methods
  async activateContract(id: string, userId: string, timeOut?: string, expectedVersion?: number): Promise<Contract> {
    // Per Master Spec Part 6.5.2: Conditional update with version check
    const whereConditions = expectedVersion !== undefined
      ? and(eq(contracts.id, id), eq(contracts.version, expectedVersion))
      : eq(contracts.id, id);
    
    const [activated] = await db
      .update(contracts)
      .set({
        status: 'active',
        activatedBy: userId,
        activatedAt: new Date(),
        timeOut: timeOut, // Capture actual vehicle handover time
        updatedAt: new Date(),
        version: sql`${contracts.version} + 1`,
      })
      .where(whereConditions)
      .returning();
    
    if (!activated && expectedVersion !== undefined) {
      throw new Error('Contract has been modified by another user. Please refresh and try again.');
    }
    
    return activated;
  }

  async completeContract(id: string, userId: string, chargeData: {
    extraKmCharge?: string;
    extraKmDriven?: number;
    fuelCharge?: string;
    damageCharge?: string;
    trafficFineCharge?: string;
    otherCharges?: string;
    totalExtraCharges?: string;
    outstandingBalance?: string;
  }, expectedVersion?: number): Promise<Contract> {
    // Per Master Spec Part 6.5.2: Conditional update with version check
    const whereConditions = expectedVersion !== undefined
      ? and(eq(contracts.id, id), eq(contracts.version, expectedVersion))
      : eq(contracts.id, id);
    
    const [completed] = await db
      .update(contracts)
      .set({
        status: 'completed',
        completedBy: userId,
        completedAt: new Date(),
        ...chargeData,
        updatedAt: new Date(),
        version: sql`${contracts.version} + 1`,
      })
      .where(whereConditions)
      .returning();
    
    if (!completed && expectedVersion !== undefined) {
      throw new Error('Contract has been modified by another user. Please refresh and try again.');
    }
    
    return completed;
  }

  async closeContract(id: string, userId: string, closureRemark?: string, expectedVersion?: number): Promise<Contract> {
    // Per Master Spec Part 6.5.2: Conditional update with version check
    const whereConditions = expectedVersion !== undefined
      ? and(eq(contracts.id, id), eq(contracts.version, expectedVersion))
      : eq(contracts.id, id);
    
    const [closed] = await db
      .update(contracts)
      .set({
        status: 'closed',
        closedBy: userId,
        closedAt: new Date(),
        closureRemark: closureRemark || null,
        paymentStatus: 'paid', // Mark as fully paid when closing
        updatedAt: new Date(),
        version: sql`${contracts.version} + 1`,
      })
      .where(whereConditions)
      .returning();
    
    if (!closed && expectedVersion !== undefined) {
      throw new Error('Contract has been modified by another user. Please refresh and try again.');
    }
    
    return closed;
  }

  // Phase 2.4: Payment recording methods
  async recordDepositPayment(id: string, method: string): Promise<Contract> {
    const [updated] = await db
      .update(contracts)
      .set({
        depositPaid: true,
        depositPaidDate: new Date(),
        depositPaidMethod: method,
        paymentStatus: 'partial',
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return updated;
  }

  async recordFinalPayment(id: string, method: string): Promise<Contract> {
    const [updated] = await db
      .update(contracts)
      .set({
        finalPaymentReceived: true,
        finalPaymentDate: new Date(),
        finalPaymentMethod: method,
        paymentStatus: 'paid',
        outstandingBalance: '0',
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return updated;
  }

  async recordDepositRefund(id: string): Promise<Contract> {
    const [updated] = await db
      .update(contracts)
      .set({
        depositRefunded: true,
        depositRefundedDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return updated;
  }

  async disableContract(id: string, userId: string): Promise<Contract> {
    const [disabled] = await db
      .update(contracts)
      .set({
        disabled: true,
        disabledBy: userId,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return disabled;
  }

  async enableContract(id: string): Promise<Contract> {
    const [enabled] = await db
      .update(contracts)
      .set({
        disabled: false,
        disabledBy: null,
        disabledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return enabled;
  }

  // Contract counter
  async getNextContractNumber(): Promise<number> {
    // Initialize counter if it doesn't exist
    const [counter] = await db.select().from(contractCounter);
    
    if (!counter) {
      await db.insert(contractCounter).values({
        id: 'singleton',
        currentNumber: 15500,
      });
      return 15500;
    }

    // Increment and return
    const [updated] = await db
      .update(contractCounter)
      .set({ currentNumber: sql`${contractCounter.currentNumber} + 1` })
      .where(eq(contractCounter.id, 'singleton'))
      .returning();
    
    return updated.currentNumber;
  }

  // Customer operations
  async getCustomers(includeDisabled: boolean = false): Promise<Customer[]> {
    if (includeDisabled) {
      return await db.select().from(customers).orderBy(desc(customers.createdAt));
    }
    return await db.select().from(customers).where(eq(customers.disabled, false)).orderBy(desc(customers.createdAt));
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer, tx?: any): Promise<Customer> {
    const dbConn = tx || db;
    const [newCustomer] = await dbConn.insert(customers).values(customer as any).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customerData: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set({
        ...customerData,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();
    
    return updated;
  }

  async disableCustomer(id: string, disabledBy: string): Promise<void> {
    await db
      .update(customers)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id));
  }

  async enableCustomer(id: string): Promise<void> {
    await db
      .update(customers)
      .set({
        disabled: false,
        disabledBy: null,
        disabledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id));
  }

  async getCustomerByNationalId(nationalId: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.nationalId, nationalId));
    return customer;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.disabled, false),
          or(
            ilike(customers.nameEn, searchTerm),
            ilike(customers.nameAr, searchTerm),
            ilike(customers.phone, searchTerm),
            ilike(customers.nationalId, searchTerm)
          )
        )
      )
      .orderBy(desc(customers.createdAt));
  }

  // Vehicle operations
  async getVehicles(includeDisabled: boolean = false): Promise<Vehicle[]> {
    if (includeDisabled) {
      return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
    }
    return await db.select().from(vehicles).where(eq(vehicles.disabled, false)).orderBy(desc(vehicles.createdAt));
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(vehicle: InsertVehicle, tx?: any): Promise<Vehicle> {
    const dbConn = tx || db;
    const [newVehicle] = await dbConn.insert(vehicles).values(vehicle as any).returning();
    return newVehicle;
  }

  async updateVehicle(id: string, vehicleData: Partial<InsertVehicle>): Promise<Vehicle> {
    const [updated] = await db
      .update(vehicles)
      .set({
        ...vehicleData,
        updatedAt: new Date(),
      })
      .where(eq(vehicles.id, id))
      .returning();
    
    return updated;
  }

  async disableVehicle(id: string, disabledBy: string): Promise<void> {
    await db
      .update(vehicles)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vehicles.id, id));
  }

  async enableVehicle(id: string): Promise<void> {
    await db
      .update(vehicles)
      .set({
        disabled: false,
        disabledBy: null,
        disabledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(vehicles.id, id));
  }

  async getVehicleByRegistration(registration: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.registration, registration));
    return vehicle;
  }

  async checkVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    excludeContractId?: string
  ): Promise<boolean> {
    const baseConditions = and(
      eq(contracts.vehicleId, vehicleId),
      or(
        eq(contracts.status, 'active'),
        eq(contracts.status, 'completed')
      ),
      not(
        or(
          lt(contracts.rentalEndDate, startDate),
          gt(contracts.rentalStartDate, endDate)
        )!
      )
    );
    
    const finalCondition = excludeContractId
      ? and(baseConditions!, ne(contracts.id, excludeContractId))
      : baseConditions;
    
    const conflicts = await db
      .select()
      .from(contracts)
      .where(finalCondition);
    
    return conflicts.length === 0;
  }

  async searchVehicles(query: string): Promise<Vehicle[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.disabled, false),
          or(
            ilike(vehicles.registration, searchTerm),
            ilike(vehicles.make, searchTerm),
            ilike(vehicles.model, searchTerm)
          )
        )
      )
      .orderBy(desc(vehicles.createdAt));
  }

  // Sponsor operations (individual sponsors)
  async getSponsors(includeDisabled = false): Promise<Sponsor[]> {
    if (includeDisabled) {
      return await db.select().from(sponsors).orderBy(desc(sponsors.createdAt));
    }
    return await db.select().from(sponsors).where(eq(sponsors.disabled, false)).orderBy(desc(sponsors.createdAt));
  }

  async getSponsorById(id: string): Promise<Sponsor | undefined> {
    const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, id));
    return sponsor;
  }

  async createSponsor(sponsorData: InsertSponsor & { createdBy: string }, tx?: any): Promise<Sponsor> {
    const dbConn = tx || db;
    const [sponsor] = await dbConn.insert(sponsors).values([sponsorData]).returning();
    return sponsor;
  }

  async updateSponsor(id: string, sponsorData: Partial<InsertSponsor>): Promise<Sponsor> {
    const [sponsor] = await db
      .update(sponsors)
      .set({ ...sponsorData, updatedAt: new Date() })
      .where(eq(sponsors.id, id))
      .returning();
    return sponsor;
  }

  async disableSponsor(id: string, disabledBy: string): Promise<void> {
    await db
      .update(sponsors)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sponsors.id, id));
  }

  async enableSponsor(id: string): Promise<void> {
    await db
      .update(sponsors)
      .set({
        disabled: false,
        disabledBy: null,
        disabledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(sponsors.id, id));
  }

  async getSponsorByPassportId(passportId: string): Promise<Sponsor | undefined> {
    const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.passportId, passportId));
    return sponsor;
  }

  async searchSponsors(query: string): Promise<Sponsor[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(sponsors)
      .where(
        and(
          eq(sponsors.disabled, false),
          or(
            ilike(sponsors.nameEn, searchTerm),
            ilike(sponsors.nameAr, searchTerm),
            ilike(sponsors.passportId, searchTerm),
            ilike(sponsors.mobile, searchTerm)
          )
        )
      )
      .orderBy(desc(sponsors.createdAt));
  }

  // Company operations (corporate sponsors)
  async getCompanies(includeDisabled = false): Promise<Company[]> {
    if (includeDisabled) {
      return await db.select().from(companies).orderBy(desc(companies.createdAt));
    }
    return await db.select().from(companies).where(eq(companies.disabled, false)).orderBy(desc(companies.createdAt));
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(companyData: InsertCompany & { createdBy: string }, tx?: any): Promise<Company> {
    const dbConn = tx || db;
    const [company] = await dbConn.insert(companies).values([companyData]).returning();
    return company;
  }

  async updateCompany(id: string, companyData: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ ...companyData, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async disableCompany(id: string, disabledBy: string): Promise<void> {
    await db
      .update(companies)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id));
  }

  async enableCompany(id: string): Promise<void> {
    await db
      .update(companies)
      .set({
        disabled: false,
        disabledBy: null,
        disabledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id));
  }

  async getCompanyByRegistrationNumber(registrationNumber: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.registrationNumber, registrationNumber));
    return company;
  }

  async searchCompanies(query: string): Promise<Company[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(companies)
      .where(
        and(
          eq(companies.disabled, false),
          or(
            ilike(companies.nameEn, searchTerm),
            ilike(companies.nameAr, searchTerm),
            ilike(companies.registrationNumber, searchTerm),
            ilike(companies.taxId, searchTerm),
            ilike(companies.contactPerson, searchTerm),
            ilike(companies.phone, searchTerm)
          )
        )
      )
      .orderBy(desc(companies.createdAt));
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment & { createdBy: string }): Promise<Payment> {
    const [payment] = await db.insert(payments).values([paymentData]).returning();
    return payment;
  }

  async getPaymentsByContract(contractId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.contractId, contractId))
      .orderBy(desc(payments.paidAt));
  }

  async getPaymentById(id: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    await db.delete(payments).where(eq(payments.id, id));
  }

  // Vehicle inspection operations
  async createVehicleInspection(inspectionData: InsertVehicleInspection & { createdBy: string }): Promise<VehicleInspection> {
    const [inspection] = await db
      .insert(vehicleInspections)
      .values([inspectionData])
      .returning();
    return inspection;
  }

  async getVehicleInspectionsByContract(contractId: string): Promise<VehicleInspection[]> {
    return await db
      .select()
      .from(vehicleInspections)
      .where(eq(vehicleInspections.contractId, contractId))
      .orderBy(desc(vehicleInspections.createdAt));
  }

  async getVehicleInspection(id: string): Promise<VehicleInspection | undefined> {
    const [inspection] = await db
      .select()
      .from(vehicleInspections)
      .where(eq(vehicleInspections.id, id))
      .limit(1);
    return inspection;
  }

  async getVehicleInspections(filters?: { vehicleId?: string; contractId?: string; inspectionType?: string }): Promise<VehicleInspection[]> {
    const conditions = [];
    if (filters?.vehicleId) conditions.push(eq(vehicleInspections.vehicleId, filters.vehicleId));
    if (filters?.contractId) conditions.push(eq(vehicleInspections.contractId, filters.contractId));
    if (filters?.inspectionType) conditions.push(eq(vehicleInspections.inspectionType, filters.inspectionType));
    
    return await db
      .select()
      .from(vehicleInspections)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vehicleInspections.createdAt));
  }

  async updateVehicleInspection(id: string, data: Partial<InsertVehicleInspection>): Promise<VehicleInspection> {
    const [updated] = await db
      .update(vehicleInspections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vehicleInspections.id, id))
      .returning();
    return updated;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    
    return newLog;
  }

  async getAllAuditLogs(): Promise<any[]> {
    return await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        contractId: auditLogs.contractId,
        ipAddress: auditLogs.ipAddress,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        // Include user info
        userName: users.username,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt));
  }

  async getRecentAuditLogs(limit: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  // Contract edit operations
  async createContractEdit(edit: InsertContractEdit): Promise<ContractEdit> {
    const [newEdit] = await db
      .insert(contractEdits)
      .values(edit)
      .returning();
    
    return newEdit;
  }

  async getContractEdits(contractId: string): Promise<any[]> {
    const edits = await db
      .select({
        id: contractEdits.id,
        contractId: contractEdits.contractId,
        editedBy: contractEdits.editedBy,
        editedAt: contractEdits.editedAt,
        editReason: contractEdits.editReason,
        changesSummary: contractEdits.changesSummary,
        fieldsBefore: contractEdits.fieldsBefore,
        fieldsAfter: contractEdits.fieldsAfter,
        ipAddress: contractEdits.ipAddress,
        editorUsername: users.username,
        editorFirstName: users.firstName,
        editorLastName: users.lastName,
      })
      .from(contractEdits)
      .leftJoin(users, eq(contractEdits.editedBy, users.id))
      .where(eq(contractEdits.contractId, contractId))
      .orderBy(desc(contractEdits.editedAt));
    
    return edits;
  }

  async getContractAuditLogs(contractId: string): Promise<any[]> {
    const logs = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        contractId: auditLogs.contractId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.contractId, contractId))
      .orderBy(desc(auditLogs.createdAt));
    
    return logs;
  }

  // Access log operations
  async createAccessLog(log: InsertAccessLog): Promise<AccessLog> {
    const [newLog] = await db
      .insert(accessLogs)
      .values(log)
      .returning();
    
    return newLog;
  }

  async getAccessLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    outcome?: string;
    username?: string;
    ipAddress?: string;
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AccessLog[]; total: number }> {
    const conditions = [];
    
    if (filters?.startDate) {
      conditions.push(gte(accessLogs.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(accessLogs.createdAt, filters.endDate));
    }
    if (filters?.outcome) {
      conditions.push(eq(accessLogs.outcome, filters.outcome));
    }
    if (filters?.username) {
      conditions.push(ilike(accessLogs.usernameAttempted, `%${filters.username}%`));
    }
    if (filters?.ipAddress) {
      conditions.push(eq(accessLogs.ipAddress, filters.ipAddress));
    }
    if (filters?.country) {
      conditions.push(ilike(accessLogs.country, `%${filters.country}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(accessLogs)
      .where(whereClause);

    // Get logs with pagination
    const logs = await db
      .select()
      .from(accessLogs)
      .where(whereClause)
      .orderBy(desc(accessLogs.createdAt))
      .limit(filters?.limit || 100)
      .offset(filters?.offset || 0);

    return {
      logs,
      total: Number(total),
    };
  }

  async purgeAccessLogs(beforeDate: Date): Promise<number> {
    const result = await db
      .delete(accessLogs)
      .where(lt(accessLogs.createdAt, beforeDate));
    
    return result.rowCount || 0;
  }

  // System error operations
  async createSystemError(error: InsertSystemError): Promise<SystemError> {
    const [newError] = await db.insert(systemErrors).values(error).returning();
    return newError;
  }

  async getAllSystemErrors(): Promise<SystemError[]> {
    return await db.select().from(systemErrors).orderBy(desc(systemErrors.createdAt));
  }

  async getUnacknowledgedSystemErrors(): Promise<SystemError[]> {
    return await db
      .select()
      .from(systemErrors)
      .where(eq(systemErrors.acknowledged, false))
      .orderBy(desc(systemErrors.createdAt));
  }

  async acknowledgeSystemError(id: string, acknowledgedBy: string): Promise<SystemError> {
    const [acknowledged] = await db
      .update(systemErrors)
      .set({
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date(),
      })
      .where(eq(systemErrors.id, id))
      .returning();
    
    return acknowledged;
  }

  async markErrorSentToSupport(id: string): Promise<SystemError> {
    const [updated] = await db
      .update(systemErrors)
      .set({
        sentToSupport: true,
      })
      .where(eq(systemErrors.id, id))
      .returning();
    
    return updated;
  }

  // Analytics operations
  async getRevenueAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // PERFORMANCE FIX: Use database aggregation with conditional SUM using CASE
    const [result] = await db
      .select({
        totalRevenue: sql<string>`
          COALESCE(
            SUM(
              CAST(${contracts.totalAmount} AS DECIMAL) + 
              COALESCE(CAST(${contracts.totalExtraCharges} AS DECIMAL), 0) +
              COALESCE(CAST(${contracts.dropOffCharge} AS DECIMAL), 0) +
              COALESCE(CAST(${contracts.pickUpCharge} AS DECIMAL), 0)
            ), 
            0
          )
        `,
        contractCount: count(),
        monthlyRevenue: sql<string>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${contracts.createdAt} >= ${startOfMonth} 
                THEN CAST(${contracts.totalAmount} AS DECIMAL) + COALESCE(CAST(${contracts.totalExtraCharges} AS DECIMAL), 0) + COALESCE(CAST(${contracts.dropOffCharge} AS DECIMAL), 0) + COALESCE(CAST(${contracts.pickUpCharge} AS DECIMAL), 0)
                ELSE 0 
              END
            ),
            0
          )
        `,
        lastMonthRevenue: sql<string>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${contracts.createdAt} >= ${startOfLastMonth} AND ${contracts.createdAt} <= ${endOfLastMonth}
                THEN CAST(${contracts.totalAmount} AS DECIMAL) + COALESCE(CAST(${contracts.totalExtraCharges} AS DECIMAL), 0) + COALESCE(CAST(${contracts.dropOffCharge} AS DECIMAL), 0) + COALESCE(CAST(${contracts.pickUpCharge} AS DECIMAL), 0)
                ELSE 0 
              END
            ),
            0
          )
        `,
      })
      .from(contracts)
      .where(or(
        eq(contracts.status, 'active'),
        eq(contracts.status, 'completed'),
        eq(contracts.status, 'closed')
      ));

    const totalRevenue = parseFloat(result.totalRevenue) || 0;
    const contractCount = result.contractCount || 0;
    const monthlyRevenue = parseFloat(result.monthlyRevenue) || 0;
    const lastMonthRevenue = parseFloat(result.lastMonthRevenue) || 0;

    return {
      totalRevenue,
      averageContractValue: contractCount > 0 ? totalRevenue / contractCount : 0,
      monthlyRevenue,
      lastMonthRevenue,
      revenueGrowth: lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0,
    };
  }

  async getOperationalAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // PERFORMANCE FIX: Use database aggregation
    const [result] = await db
      .select({
        totalDays: sum(contracts.totalDays),
        contractCount: count(),
        contractsThisMonth: sql<string>`
          COALESCE(SUM(CASE WHEN ${contracts.createdAt} >= ${startOfMonth} THEN 1 ELSE 0 END), 0)
        `,
        contractsLastMonth: sql<string>`
          COALESCE(SUM(CASE WHEN ${contracts.createdAt} >= ${startOfLastMonth} AND ${contracts.createdAt} <= ${endOfLastMonth} THEN 1 ELSE 0 END), 0)
        `,
      })
      .from(contracts);

    const totalDays = parseInt(result.totalDays || '0') || 0;
    const contractCount = result.contractCount || 0;
    const contractsThisMonth = parseInt(result.contractsThisMonth) || 0;
    const contractsLastMonth = parseInt(result.contractsLastMonth) || 0;

    const averageRentalDuration = contractCount > 0 ? totalDays / contractCount : 0;
    const contractGrowth = contractsLastMonth > 0 
      ? ((contractsThisMonth - contractsLastMonth) / contractsLastMonth) * 100 
      : 0;

    // Find most active user using GROUP BY
    const mostActiveResult = await db
      .select({
        userId: contracts.createdBy,
        contractCount: count(),
      })
      .from(contracts)
      .groupBy(contracts.createdBy)
      .orderBy(desc(count()))
      .limit(1);

    let mostActiveUser: { name: string; count: number } | null = null;
    if (mostActiveResult.length > 0) {
      const user = await this.getUser(mostActiveResult[0].userId);
      if (user) {
        mostActiveUser = {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          count: mostActiveResult[0].contractCount
        };
      }
    }

    return {
      averageRentalDuration,
      contractsThisMonth,
      contractsLastMonth,
      contractGrowth,
      mostActiveUser,
    };
  }

  async getCustomerAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // PERFORMANCE FIX: Use database aggregation
    // Count total unique customers
    const [totalResult] = await db
      .select({
        totalCustomers: sql<string>`COUNT(DISTINCT ${contracts.customerId})`,
      })
      .from(contracts);

    const totalCustomers = parseInt(totalResult.totalCustomers) || 0;

    // Count repeat customers (customers with 2+ contracts)
    const repeatResult = await db
      .select({
        customerId: contracts.customerId,
      })
      .from(contracts)
      .groupBy(contracts.customerId)
      .having(sql`COUNT(*) >= 2`);

    const repeatCustomers = repeatResult.length;
    const repeatCustomerRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    // Find new customers this month (customers whose first contract was this month)
    const newCustomersResult = await db
      .select({
        customerId: contracts.customerId,
        firstContractDate: sql<Date>`MIN(${contracts.createdAt})`,
      })
      .from(contracts)
      .groupBy(contracts.customerId)
      .having(sql`MIN(${contracts.createdAt}) >= ${startOfMonth}`);

    const newCustomersThisMonth = newCustomersResult.length;

    return {
      totalCustomers,
      repeatCustomers,
      repeatCustomerRate,
      newCustomersThisMonth,
    };
  }

  async getFleetStatusDistribution() {
    const results = await db
      .select({
        status: vehicles.status,
        count: count(),
      })
      .from(vehicles)
      .where(eq(vehicles.disabled, false))
      .groupBy(vehicles.status);

    const statusMap: Record<string, number> = {
      available: 0,
      rented: 0,
      maintenance: 0,
      damaged: 0,
    };

    results.forEach(row => {
      if (row.status in statusMap) {
        statusMap[row.status] = Number(row.count);
      }
    });

    return statusMap;
  }

  async getGeographicDistribution() {
    // Customer distribution by license licensing authority
    const customerResults = await db
      .select({
        authority: customers.licenseLicensingAuthority,
        count: count(),
      })
      .from(customers)
      .where(
        and(
          eq(customers.disabled, false),
          sql`${customers.licenseLicensingAuthority} IS NOT NULL AND ${customers.licenseLicensingAuthority} != ''`
        )
      )
      .groupBy(customers.licenseLicensingAuthority)
      .orderBy(desc(count()))
      .limit(10);

    // Vehicle distribution by licensing authority
    const vehicleResults = await db
      .select({
        authority: vehicles.licensingAuthority,
        count: count(),
      })
      .from(vehicles)
      .where(
        and(
          eq(vehicles.disabled, false),
          sql`${vehicles.licensingAuthority} IS NOT NULL AND ${vehicles.licensingAuthority} != ''`
        )
      )
      .groupBy(vehicles.licensingAuthority)
      .orderBy(desc(count()))
      .limit(10);

    return {
      customersByAuthority: customerResults.map(r => ({
        authority: r.authority || 'Unknown',
        count: Number(r.count),
      })),
      vehiclesByAuthority: vehicleResults.map(r => ({
        authority: r.authority || 'Unknown',
        count: Number(r.count),
      })),
    };
  }

  async getGeographicDistributionUAE() {
    // Customer distribution by UAE emirate
    const customersByEmirate = await db
      .select({
        emirate: customers.emirate,
        count: count(),
      })
      .from(customers)
      .where(
        and(
          eq(customers.disabled, false),
          sql`${customers.emirate} IS NOT NULL`
        )
      )
      .groupBy(customers.emirate)
      .orderBy(desc(count()));

    // Vehicle distribution by UAE emirate
    const vehiclesByEmirate = await db
      .select({
        emirate: vehicles.emirate,
        count: count(),
      })
      .from(vehicles)
      .where(
        and(
          eq(vehicles.disabled, false),
          sql`${vehicles.emirate} IS NOT NULL`
        )
      )
      .groupBy(vehicles.emirate)
      .orderBy(desc(count()));

    // Sponsor distribution by UAE emirate
    const sponsorsByEmirate = await db
      .select({
        emirate: sponsors.emirate,
        count: count(),
      })
      .from(sponsors)
      .where(
        and(
          eq(sponsors.disabled, false),
          sql`${sponsors.emirate} IS NOT NULL`
        )
      )
      .groupBy(sponsors.emirate)
      .orderBy(desc(count()));

    // Company distribution by UAE emirate
    const companiesByEmirate = await db
      .select({
        emirate: companies.emirate,
        count: count(),
      })
      .from(companies)
      .where(
        and(
          eq(companies.disabled, false),
          sql`${companies.emirate} IS NOT NULL`
        )
      )
      .groupBy(companies.emirate)
      .orderBy(desc(count()));

    return {
      customersByEmirate: customersByEmirate.map(r => ({
        emirate: r.emirate || 'Unknown',
        count: Number(r.count),
      })),
      vehiclesByEmirate: vehiclesByEmirate.map(r => ({
        emirate: r.emirate || 'Unknown',
        count: Number(r.count),
      })),
      sponsorsByEmirate: sponsorsByEmirate.map(r => ({
        emirate: r.emirate || 'Unknown',
        count: Number(r.count),
      })),
      companiesByEmirate: companiesByEmirate.map(r => ({
        emirate: r.emirate || 'Unknown',
        count: Number(r.count),
      })),
    };
  }

  async getPendingActions() {
    const now = new Date();

    // Overdue returns: active contracts where rentalEndDate has passed (with details)
    const overdueReturns = await db
      .select({
        id: contracts.id,
        contractNumber: contracts.contractNumber,
        customerNameEn: customers.nameEn,
        rentalEndDate: contracts.rentalEndDate,
        vehicleRegistration: vehicles.registration,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .where(
        and(
          eq(contracts.status, 'active'),
          lt(contracts.rentalEndDate, now)
        )
      )
      .orderBy(contracts.rentalEndDate)
      .limit(10);

    // Calculate days overdue
    const overdueWithDays = overdueReturns.map(contract => ({
      ...contract,
      daysOverdue: Math.floor((now.getTime() - new Date(contract.rentalEndDate).getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Pending refunds: contracts with deposit not yet refunded (with details)
    const pendingRefunds = await db
      .select({
        id: contracts.id,
        contractNumber: contracts.contractNumber,
        customerNameEn: customers.nameEn,
        securityDeposit: contracts.securityDeposit,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .where(
        and(
          or(
            eq(contracts.status, 'completed'),
            eq(contracts.status, 'active')
          ),
          eq(contracts.depositRefunded, false),
          sql`CAST(${contracts.securityDeposit} AS DECIMAL) > 0`
        )
      )
      .orderBy(desc(contracts.securityDeposit))
      .limit(10);

    // Unclosed contracts: completed contracts not yet closed (just count)
    const [unclosedResult] = await db
      .select({
        count: count(),
      })
      .from(contracts)
      .where(eq(contracts.status, 'completed'));

    return {
      overdueReturns: overdueWithDays,
      pendingRefunds: pendingRefunds.map(r => ({
        ...r,
        depositAmount: r.securityDeposit,
      })),
      unclosedContracts: Number(unclosedResult.count),
    };
  }

  async getTopPerformers() {
    // Top 5 vehicles by total revenue
    const topVehicles = await db
      .select({
        vehicleId: contracts.vehicleId,
        registration: vehicles.registration,
        make: vehicles.make,
        model: vehicles.model,
        totalRevenue: sql<string>`
          COALESCE(
            SUM(
              CAST(${contracts.totalAmount} AS DECIMAL) + 
              COALESCE(CAST(${contracts.totalExtraCharges} AS DECIMAL), 0) +
              COALESCE(CAST(${contracts.dropOffCharge} AS DECIMAL), 0) +
              COALESCE(CAST(${contracts.pickUpCharge} AS DECIMAL), 0)
            ), 
            0
          )
        `,
      })
      .from(contracts)
      .innerJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .where(
        or(
          eq(contracts.status, 'active'),
          eq(contracts.status, 'completed'),
          eq(contracts.status, 'closed')
        )
      )
      .groupBy(contracts.vehicleId, vehicles.registration, vehicles.make, vehicles.model)
      .orderBy(desc(sql`SUM(CAST(${contracts.totalAmount} AS DECIMAL))`))
      .limit(5);

    // Most active staff by contract count WITH revenue
    const topStaff = await db
      .select({
        userId: contracts.createdBy,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        contractCount: count(),
        totalRevenue: sql<string>`
          COALESCE(
            SUM(
              CAST(${contracts.totalAmount} AS DECIMAL) + 
              COALESCE(CAST(${contracts.totalExtraCharges} AS DECIMAL), 0) +
              COALESCE(CAST(${contracts.dropOffCharge} AS DECIMAL), 0) +
              COALESCE(CAST(${contracts.pickUpCharge} AS DECIMAL), 0)
            ), 
            0
          )
        `,
      })
      .from(contracts)
      .innerJoin(users, eq(contracts.createdBy, users.id))
      .where(
        or(
          eq(contracts.status, 'active'),
          eq(contracts.status, 'completed'),
          eq(contracts.status, 'closed')
        )
      )
      .groupBy(contracts.createdBy, users.username, users.firstName, users.lastName)
      .orderBy(desc(count()))
      .limit(5);

    return {
      topVehiclesByRevenue: topVehicles.map(v => ({
        vehicleId: v.vehicleId,
        registration: v.registration,
        make: v.make,
        model: v.model,
        totalRevenue: parseFloat(v.totalRevenue),
      })),
      mostActiveStaff: topStaff.map(s => ({
        userId: s.userId,
        username: s.username,
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        contractCount: Number(s.contractCount),
        totalRevenue: parseFloat(s.totalRevenue),
      })),
    };
  }

  async getRevenueTrend(months: number = 12) {
    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    const results = await db
      .select({
        month: sql<string>`TO_CHAR(${contracts.createdAt}, 'YYYY-MM')`,
        totalRevenue: sql<string>`
          COALESCE(
            SUM(
              CAST(${contracts.totalAmount} AS DECIMAL) + 
              COALESCE(CAST(${contracts.totalExtraCharges} AS DECIMAL), 0) +
              COALESCE(CAST(${contracts.dropOffCharge} AS DECIMAL), 0) +
              COALESCE(CAST(${contracts.pickUpCharge} AS DECIMAL), 0)
            ), 
            0
          )
        `,
        rentalFees: sql<string>`COALESCE(SUM(CAST(${contracts.totalAmount} AS DECIMAL)), 0)`,
        extraCharges: sql<string>`COALESCE(SUM(CAST(${contracts.totalExtraCharges} AS DECIMAL)), 0)`,
        deliveryFees: sql<string>`COALESCE(SUM(COALESCE(CAST(${contracts.dropOffCharge} AS DECIMAL), 0) + COALESCE(CAST(${contracts.pickUpCharge} AS DECIMAL), 0)), 0)`,
        contractCount: count(),
      })
      .from(contracts)
      .where(
        and(
          sql`${contracts.createdAt} >= ${monthsAgo}`,
          or(
            eq(contracts.status, 'active'),
            eq(contracts.status, 'completed'),
            eq(contracts.status, 'closed')
          )
        )
      )
      .groupBy(sql`TO_CHAR(${contracts.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${contracts.createdAt}, 'YYYY-MM')`);
    
    return results.map(row => ({
      month: row.month,
      totalRevenue: parseFloat(row.totalRevenue) || 0,
      rentalFees: parseFloat(row.rentalFees) || 0,
      extraCharges: parseFloat(row.extraCharges) || 0,
      deliveryFees: parseFloat(row.deliveryFees) || 0,
      contractCount: row.contractCount || 0,
    }));
  }

  async getContractVolumeTrend(months: number = 6) {
    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    const results = await db
      .select({
        month: sql<string>`TO_CHAR(${contracts.createdAt}, 'YYYY-MM')`,
        draft: sql<string>`SUM(CASE WHEN ${contracts.status} = 'draft' THEN 1 ELSE 0 END)`,
        active: sql<string>`SUM(CASE WHEN ${contracts.status} = 'active' THEN 1 ELSE 0 END)`,
        completed: sql<string>`SUM(CASE WHEN ${contracts.status} = 'completed' THEN 1 ELSE 0 END)`,
        completedPendingAccident: sql<string>`SUM(CASE WHEN ${contracts.status} = 'completed_pending_accident' THEN 1 ELSE 0 END)`,
        closed: sql<string>`SUM(CASE WHEN ${contracts.status} = 'closed' THEN 1 ELSE 0 END)`,
      })
      .from(contracts)
      .where(sql`${contracts.createdAt} >= ${monthsAgo}`)
      .groupBy(sql`TO_CHAR(${contracts.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${contracts.createdAt}, 'YYYY-MM')`);
    
    return results.map(row => ({
      month: row.month,
      draft: parseInt(row.draft) || 0,
      active: parseInt(row.active) || 0,
      completed: parseInt(row.completed) || 0,
      completedPendingAccident: parseInt(row.completedPendingAccident) || 0,
      closed: parseInt(row.closed) || 0,
    }));
  }

  // Reports - Financial
  async getFinancialReport(startDate?: Date, endDate?: Date) {
    const allContracts = await db.select().from(contracts);
    const allPayments = await db.select().from(payments);
    const allCustomers = await db.select().from(customers);
    
    // Create customer lookup map
    const customerMap = new Map(allCustomers.map(c => [c.id, c]));
    
    // Filter by date range if provided
    const filteredContracts = allContracts.filter(c => {
      if (!startDate && !endDate) return true;
      if (!c.createdAt) return false;
      const contractDate = new Date(c.createdAt);
      if (startDate && contractDate < startDate) return false;
      if (endDate && contractDate > endDate) return false;
      return true;
    });

    // Revenue contracts (only active, completed, completed_pending_accident, and closed - these have earned revenue)
    // CRITICAL FIX: Exclude 'confirmed' status - those haven't started yet
    const revenueContracts = filteredContracts.filter(c => 
      c.status === 'active' || c.status === 'completed' || 
      c.status === 'completed_pending_accident' || c.status === 'closed'
    );

    // Total revenue (contract amount + extra charges + delivery charges)
    const totalRevenue = revenueContracts.reduce((sum, c) => {
      return sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0') + parseFloat(c.dropOffCharge || '0') + parseFloat(c.pickUpCharge || '0');
    }, 0);
    
    // All-time revenue (no date filter) - only active, completed, closed
    const allTimeRevenue = allContracts
      .filter(c => c.status === 'active' || c.status === 'completed' || c.status === 'closed')
      .reduce((sum, c) => sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0') + parseFloat(c.dropOffCharge || '0') + parseFloat(c.pickUpCharge || '0'), 0);

    // Total payments collected
    const totalCollected = allPayments
      .filter(p => {
        const contract = filteredContracts.find(c => c.id === p.contractId);
        return contract !== undefined;
      })
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Finalized contracts (completed + closed) - these are the only ones with final amounts due
    const finalizedContracts = filteredContracts.filter(c => 
      c.status === 'completed' || c.status === 'closed'
    );
    
    const finalizedRevenue = finalizedContracts.reduce((sum, c) => {
      return sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0') + parseFloat(c.dropOffCharge || '0') + parseFloat(c.pickUpCharge || '0');
    }, 0);

    // Outstanding amount (total revenue - total collected across all revenue-earning contracts)
    const totalOutstanding = totalRevenue - totalCollected;

    // Payment collection rate - CRITICAL FIX: Compare against finalized contracts only
    // This shows what % of finalized amounts have been collected
    const collectionRate = finalizedRevenue > 0 ? (totalCollected / finalizedRevenue) * 100 : 0;

    // Monthly revenue breakdown
    const monthlyRevenue = new Map<string, { revenue: number; count: number }>();
    revenueContracts.forEach(contract => {
      if (contract.createdAt) {
        const date = new Date(contract.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const revenue = parseFloat(contract.totalAmount) + parseFloat(contract.totalExtraCharges || '0');
        const existing = monthlyRevenue.get(monthKey) || { revenue: 0, count: 0 };
        monthlyRevenue.set(monthKey, {
          revenue: existing.revenue + revenue,
          count: existing.count + 1,
        });
      }
    });

    const monthlyBreakdown = Array.from(monthlyRevenue.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        contractCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Revenue by contract status
    const revenueByStatus = {
      active: 0,
      completed: 0,
      closed: 0,
    };
    revenueContracts.forEach(contract => {
      const revenue = parseFloat(contract.totalAmount) + parseFloat(contract.totalExtraCharges || '0');
      if (contract.status in revenueByStatus) {
        revenueByStatus[contract.status as keyof typeof revenueByStatus] += revenue;
      }
    });

    // Payment method breakdown
    const paymentMethods = new Map<string, number>();
    allPayments
      .filter(p => {
        const contract = filteredContracts.find(c => c.id === p.contractId);
        return contract !== undefined;
      })
      .forEach(payment => {
        const method = payment.paymentMethod || 'unknown';
        paymentMethods.set(method, (paymentMethods.get(method) || 0) + parseFloat(payment.amount));
      });

    const methodBreakdown = Array.from(paymentMethods.entries())
      .map(([method, amount]) => ({
        method,
        amount,
      }));

    // Recent payments (all payments sorted by date)
    const recentPayments = allPayments
      .filter(p => {
        const contract = filteredContracts.find(c => c.id === p.contractId);
        return contract !== undefined;
      })
      .sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt || 0);
        const dateB = new Date(b.paidAt || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .map(payment => {
        const contract = allContracts.find(c => c.id === payment.contractId);
        return {
          id: payment.id,
          amount: parseFloat(payment.amount),
          method: payment.paymentMethod || 'unknown',
          date: payment.paidAt || payment.createdAt,
          contractNumber: contract?.contractNumber || 0,
          contractId: payment.contractId,
        };
      });

    // Outstanding payments list - CRITICAL FIX: Only show completed and closed contracts
    // Active contracts are still ongoing
    const outstandingPayments = finalizedContracts.map(contract => {
      const contractRevenue = parseFloat(contract.totalAmount) + parseFloat(contract.totalExtraCharges || '0');
      const contractPayments = allPayments
        .filter(p => p.contractId === contract.id)
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const outstanding = contractRevenue - contractPayments;
      
      const customer = customerMap.get(contract.customerId);

      return {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        customerName: customer?.nameEn || 'Unknown',
        totalAmount: contractRevenue,
        collected: contractPayments,
        outstanding: outstanding,
        status: contract.status,
        dueDate: contract.rentalEndDate,
      };
    })
    .filter(p => p.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding); // Sort by outstanding amount (highest first)

    return {
      summary: {
        totalRevenue,
        allTimeRevenue,
        totalCollected,
        totalOutstanding,
        collectionRate,
      },
      monthlyBreakdown,
      revenueByStatus,
      methodBreakdown,
      recentPayments,
      outstandingPayments,
    };
  }

  // Reports - Operational
  async getOperationalReport(startDate?: Date, endDate?: Date) {
    const allContracts = await db.select().from(contracts);
    const allVehicles = await db.select().from(vehicles);
    const allCustomers = await db.select().from(customers);
    
    // Create customer lookup map
    const customerMap = new Map(allCustomers.map(c => [c.id, c]));
    
    // Filter by date range if provided
    const filteredContracts = allContracts.filter(c => {
      if (!startDate && !endDate) return true;
      if (!c.createdAt) return false;
      const contractDate = new Date(c.createdAt);
      if (startDate && contractDate < startDate) return false;
      if (endDate && contractDate > endDate) return false;
      return true;
    });

    // Vehicle utilization - CRITICAL FIX: Calculate based on date range
    // Formula: (total rental days in period / total available vehicle-days in period) * 100
    let utilizationRate = 0;
    let totalRentalDays = 0;
    
    if (startDate && endDate && allVehicles.length > 0) {
      // Calculate period length in days
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalAvailableDays = allVehicles.length * periodDays;
      
      // Sum up rental days for all contracts in the period
      totalRentalDays = filteredContracts
        .filter(c => c.status !== 'draft') // Only count actual rentals
        .reduce((sum, c) => sum + (c.totalDays || 0), 0);
      
      utilizationRate = totalAvailableDays > 0 ? (totalRentalDays / totalAvailableDays) * 100 : 0;
    } else {
      // If no date range, show current instant utilization (currently active vehicles)
      const activeContracts = allContracts.filter(c => c.status === 'active');
      const activeVehicleIds = new Set(activeContracts.map(c => c.vehicleId));
      utilizationRate = allVehicles.length > 0 ? (activeVehicleIds.size / allVehicles.length) * 100 : 0;
    }
    
    // Get currently active vehicles for display
    const activeContracts = allContracts.filter(c => c.status === 'active');
    const activeVehicleIds = new Set(activeContracts.map(c => c.vehicleId));

    // Vehicle usage stats
    const vehicleStats = allVehicles.map(vehicle => {
      const vehicleContracts = filteredContracts.filter(c => c.vehicleId === vehicle.id);
      const totalRevenue = vehicleContracts
        .filter(c => c.status !== 'draft')
        .reduce((sum, c) => sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0') + parseFloat(c.dropOffCharge || '0') + parseFloat(c.pickUpCharge || '0'), 0);
      const totalDays = vehicleContracts.reduce((sum, c) => sum + (c.totalDays || 0), 0);
      const isActive = activeContracts.some(c => c.vehicleId === vehicle.id);

      return {
        vehicleId: vehicle.id,
        registration: vehicle.registration,
        make: vehicle.make,
        model: vehicle.model,
        contractCount: vehicleContracts.length,
        totalRevenue,
        totalDays,
        isActive,
      };
    });

    // Contract status summary
    const statusSummary = {
      draft: filteredContracts.filter(c => c.status === 'draft').length,
      active: filteredContracts.filter(c => c.status === 'active').length,
      completed: filteredContracts.filter(c => c.status === 'completed').length,
      closed: filteredContracts.filter(c => c.status === 'closed').length,
    };

    // Extra charges analysis
    const extraCharges = filteredContracts
      .filter(c => c.totalExtraCharges && parseFloat(c.totalExtraCharges) > 0)
      .map(c => {
        const customer = customerMap.get(c.customerId);
        return {
          contractId: c.id,
          contractNumber: c.contractNumber,
          customerName: customer?.nameEn || 'Unknown',
          extraCharges: parseFloat(c.totalExtraCharges || '0'),
          status: c.status,
        };
      });

    const totalExtraCharges = extraCharges.reduce((sum, e) => sum + e.extraCharges, 0);
    const avgExtraCharges = extraCharges.length > 0 ? totalExtraCharges / extraCharges.length : 0;

    return {
      utilization: {
        utilizationRate,
        activeVehicles: activeVehicleIds.size,
        totalVehicles: allVehicles.length,
      },
      vehicleStats,
      statusSummary,
      extraCharges: {
        total: totalExtraCharges,
        average: avgExtraCharges,
        contracts: extraCharges,
      },
    };
  }

  // Reports - Customer
  async getCustomerReport(startDate?: Date, endDate?: Date) {
    const allContracts = await db.select().from(contracts);
    const allCustomers = await db.select().from(customers);
    
    // Filter by date range if provided
    const filteredContracts = allContracts.filter(c => {
      if (!startDate && !endDate) return true;
      if (!c.createdAt) return false;
      const contractDate = new Date(c.createdAt);
      if (startDate && contractDate < startDate) return false;
      if (endDate && contractDate > endDate) return false;
      return true;
    });

    // Customer activity
    const customerActivity = allCustomers.map(customer => {
      const customerContracts = filteredContracts.filter(c => c.customerId === customer.id);
      const totalRevenue = customerContracts
        .filter(c => c.status !== 'draft')
        .reduce((sum, c) => sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0'), 0);
      const totalDays = customerContracts.reduce((sum, c) => sum + (c.totalDays || 0), 0);

      // Calculate last rental date safely
      const contractDates = customerContracts
        .filter(c => c.createdAt)
        .map(c => new Date(c.createdAt!).getTime());
      const lastRental = contractDates.length > 0 
        ? new Date(Math.max(...contractDates))
        : null;

      return {
        customerId: customer.id,
        nameEn: customer.nameEn,
        nameAr: customer.nameAr,
        contractCount: customerContracts.length,
        totalRevenue,
        totalDays,
        lastRental,
      };
    }).filter(c => c.contractCount > 0);

    // Repeat customers - CRITICAL FIX: Customers who had 2+ contracts in the period (returned during period)
    // This shows true retention WITHIN the selected timeframe
    const repeatCustomers = customerActivity.filter(c => c.contractCount >= 2);

    // New customers in period - CRITICAL FIX: Customers whose FIRST EVER contract was in this period
    const newCustomers = customerActivity.filter(customer => {
      const allCustomerContracts = allContracts.filter(c => c.customerId === customer.customerId);
      if (allCustomerContracts.length === 0) return false;
      
      // Get first contract date across ALL time (not just filtered period)
      const allContractDates = allCustomerContracts
        .filter(c => c.createdAt)
        .map(c => new Date(c.createdAt!).getTime());
      
      if (allContractDates.length === 0) return false;
      
      const firstEverContractDate = new Date(Math.min(...allContractDates));
      
      // Customer is "new" if their first ever contract falls within the selected period
      if (startDate && firstEverContractDate < startDate) return false;
      if (endDate && firstEverContractDate > endDate) return false;
      
      return true;
    });

    return {
      customerActivity: customerActivity.sort((a, b) => b.totalRevenue - a.totalRevenue),
      repeatCustomers: repeatCustomers.sort((a, b) => b.contractCount - a.contractCount),
      newCustomers: newCustomers.sort((a, b) => {
        const aDate = a.lastRental ? a.lastRental.getTime() : 0;
        const bDate = b.lastRental ? b.lastRental.getTime() : 0;
        return bDate - aDate;
      }),
    };
  }

  // Helper function to transform JSONB snapshots into individual field changes
  private transformContractEditToFieldChanges(edit: any, userName: string): any[] {
    const fieldChanges: any[] = [];
    
    if (!edit.fieldsBefore || !edit.fieldsAfter) {
      return fieldChanges;
    }
    
    const before = edit.fieldsBefore as Record<string, any>;
    const after = edit.fieldsAfter as Record<string, any>;
    
    // Compare all fields and create individual change records
    const allFields = new Set([...Object.keys(before), ...Object.keys(after)]);
    
    for (const field of Array.from(allFields)) {
      const oldValue = before[field];
      const newValue = after[field];
      
      // Skip if values are identical
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        continue;
      }
      
      fieldChanges.push({
        id: `${edit.id}-${field}`,
        contractId: edit.contractId,
        editedBy: edit.editedBy,
        editedAt: edit.editedAt,
        fieldChanged: field,
        oldValue: oldValue != null ? String(oldValue) : null,
        newValue: newValue != null ? String(newValue) : null,
        reason: edit.editReason,
        userName,
      });
    }
    
    return fieldChanges;
  }

  // Reports - Audit
  async getAuditReport(startDate?: Date, endDate?: Date) {
    // Contract modifications
    const modifications = await db.select().from(contractEdits);
    const filteredModifications = modifications.filter(m => {
      if (!startDate && !endDate) return true;
      if (!m.editedAt) return false;
      const modDate = new Date(m.editedAt);
      if (startDate && modDate < startDate) return false;
      if (endDate && modDate > endDate) return false;
      return true;
    });

    // Business operations audit logs (exclude system-level operations)
    // Business operations include: contracts, master data, payments, inspections
    const businessOperationActions = [
      // Contract lifecycle (using actual database action names)
      'create', 'confirm', 'activate', 'complete', 'close',
      // Master data - Customers
      'create_customer', 'update_customer', 'disable_customer', 'enable_customer',
      // Master data - Vehicles
      'create_vehicle', 'update_vehicle', 'disable_vehicle', 'enable_vehicle',
      // Master data - Sponsors
      'create_sponsor', 'update_sponsor', 'disable_sponsor', 'enable_sponsor',
      // Master data - Companies
      'create_company', 'update_company', 'disable_company', 'enable_company',
      // Other master data
      'create_person', 'update_settings',
      // Payments
      'payment',
      // Inspections
      'inspection'
    ];
    
    const allAuditLogs = await this.getAllAuditLogs();
    const filteredAuditLogs = allAuditLogs.filter(log => {
      // Filter by business operations only
      if (!businessOperationActions.includes(log.action)) return false;
      
      // Filter by date range
      if (!startDate && !endDate) return true;
      if (!log.createdAt) return false;
      const logDate = new Date(log.createdAt);
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
      return true;
    });

    // Get user names from BOTH modifications and audit logs
    const modificationUserIds = new Set(filteredModifications.map(m => m.editedBy));
    const auditLogUserIds = new Set(filteredAuditLogs.map(log => log.userId).filter(id => id !== null) as string[]);
    const allUserIds = new Set([...Array.from(modificationUserIds), ...Array.from(auditLogUserIds)]);
    
    const usersData = await Promise.all(
      Array.from(allUserIds).map(id => this.getUser(id))
    );
    const userMap = new Map(usersData.filter(u => u).map(u => [u!.id, `${u!.firstName || ''} ${u!.lastName || ''}`.trim() || u!.username]));

    // CRITICAL FIX: Transform JSONB snapshots into individual field changes
    const transformedModifications = filteredModifications.flatMap(m => {
      const userName = userMap.get(m.editedBy) || 'Unknown';
      return this.transformContractEditToFieldChanges(m, userName);
    });

    // Calculate statistics using transformed modifications
    const uniqueContracts = new Set(transformedModifications.map(m => m.contractId));
    const totalModifications = transformedModifications.length;
    const avgModificationsPerContract = uniqueContracts.size > 0 
      ? totalModifications / uniqueContracts.size 
      : 0;
    
    // Most frequently modified contracts
    const contractModCounts = new Map<string, number>();
    transformedModifications.forEach(m => {
      contractModCounts.set(m.contractId, (contractModCounts.get(m.contractId) || 0) + 1);
    });
    
    const mostModifiedContracts = Array.from(contractModCounts.entries())
      .map(([contractId, count]) => ({ contractId, modificationCount: count }))
      .sort((a, b) => b.modificationCount - a.modificationCount);
    
    // User activity breakdown - COMPLETE VERSION: Count from BOTH modifications AND audit logs
    const userActivityMap = new Map<string, { modifications: number; auditActions: number; total: number }>();
    
    // Count modifications (from transformed data)
    transformedModifications.forEach(m => {
      const userId = m.editedBy;
      const current = userActivityMap.get(userId) || { modifications: 0, auditActions: 0, total: 0 };
      current.modifications += 1;
      current.total += 1;
      userActivityMap.set(userId, current);
    });
    
    // Count audit log actions (create, confirm, activate, complete, close, etc.)
    filteredAuditLogs.forEach(log => {
      if (log.userId) {
        const current = userActivityMap.get(log.userId) || { modifications: 0, auditActions: 0, total: 0 };
        current.auditActions += 1;
        current.total += 1;
        userActivityMap.set(log.userId, current);
      }
    });
    
    const userActivity = Array.from(userActivityMap.entries())
      .map(([userId, counts]) => ({
        userId,
        userName: userMap.get(userId) || 'Unknown',
        modificationCount: counts.modifications,
        auditActionCount: counts.auditActions,
        totalActions: counts.total,
      }))
      .sort((a, b) => b.totalActions - a.totalActions);

    // Categorize audit logs by operation type for clearer reporting
    const contractOperations = filteredAuditLogs.filter(log => 
      ['create', 'confirm', 'activate', 'complete', 'close'].includes(log.action)
    );
    
    const masterDataOperations = filteredAuditLogs.filter(log => 
      ['create_customer', 'update_customer', 'disable_customer', 'enable_customer',
       'create_vehicle', 'update_vehicle', 'disable_vehicle', 'enable_vehicle',
       'create_sponsor', 'update_sponsor', 'disable_sponsor', 'enable_sponsor',
       'create_company', 'update_company', 'disable_company', 'enable_company',
       'create_person', 'update_settings'].includes(log.action)
    );
    
    const paymentOperations = filteredAuditLogs.filter(log => log.action === 'payment');
    
    const inspectionOperations = filteredAuditLogs.filter(log => log.action === 'inspection');

    return {
      summary: {
        totalModifications,
        totalAuditLogs: filteredAuditLogs.length,
        uniqueContracts: uniqueContracts.size,
        avgModificationsPerContract,
        activeUsers: allUserIds.size, // Total users from both modifications and audit logs
        // Operation breakdown
        contractOperationsCount: contractOperations.length,
        masterDataOperationsCount: masterDataOperations.length,
        paymentOperationsCount: paymentOperations.length,
        inspectionOperationsCount: inspectionOperations.length,
      },
      // CRITICAL FIX: Return transformed modifications with individual field changes
      modifications: transformedModifications.sort((a, b) => {
        const aTime = a.editedAt ? new Date(a.editedAt).getTime() : 0;
        const bTime = b.editedAt ? new Date(b.editedAt).getTime() : 0;
        return bTime - aTime;
      }),
      auditLogs: filteredAuditLogs, // All business operations (for backward compatibility)
      // Categorized operations for clearer reporting
      categories: {
        contractOperations: contractOperations.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }),
        masterDataOperations: masterDataOperations.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }),
        paymentOperations: paymentOperations.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }),
        inspectionOperations: inspectionOperations.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }),
      },
      userActivity,
      mostModifiedContracts,
    };
  }

  // Analytics - Driver Availability Summary (lightweight for dashboard)
  async getDriverAvailabilitySummary() {
    const allDrivers = await db.select().from(drivers).where(eq(drivers.isActive, true));
    const allAssignments = await db.select().from(driverAssignments);
    
    // Calculate current availability based on active assignments
    const driversOnAssignment = new Set<string>();
    const now = new Date();
    allAssignments.forEach(a => {
      if (a.status === 'active' || a.status === 'scheduled') {
        const start = new Date(a.startDateTime);
        const end = new Date(a.endDateTime);
        if (start <= now && now <= end) {
          driversOnAssignment.add(a.driverId);
        }
      }
    });

    const totalDrivers = allDrivers.length;
    const onAssignment = driversOnAssignment.size;
    const activeDrivers = totalDrivers - onAssignment;
    const averageUtilization = totalDrivers > 0 ? (onAssignment / totalDrivers) * 100 : 0;

    return {
      totalDrivers,
      activeDrivers,
      onAssignment,
      averageUtilization,
    };
  }

  // Reports - Driver Utilization
  async getDriverUtilizationReport(startDate?: Date, endDate?: Date) {
    const allDrivers = await db.select().from(drivers).where(eq(drivers.isActive, true));
    const allAssignments = await db.select().from(driverAssignments);
    const allContracts = await db.select().from(contracts);
    const allRateCards = await db.select().from(driverRateCards);
    
    // Create Set of active driver IDs for filtering assignments
    const activeDriverIds = new Set(allDrivers.map(d => d.id));
    
    // Create lookup maps
    const rateCardsByDriver = new Map<string, typeof allRateCards>();
    allRateCards.forEach(rc => {
      if (!rateCardsByDriver.has(rc.driverId)) {
        rateCardsByDriver.set(rc.driverId, []);
      }
      rateCardsByDriver.get(rc.driverId)!.push(rc);
    });
    
    // Filter assignments by active drivers AND date range
    const filteredAssignments = allAssignments.filter(a => {
      // Only include assignments for active drivers
      if (!activeDriverIds.has(a.driverId)) return false;
      
      // Apply date range filter if provided
      if (!startDate && !endDate) return true;
      if (!a.startDateTime) return false;
      const assignmentDate = new Date(a.startDateTime);
      if (startDate && assignmentDate < startDate) return false;
      if (endDate && assignmentDate > endDate) return false;
      return true;
    });

    // Calculate which drivers are currently on assignment (in the filtered period)
    const driversOnAssignment = new Set<string>();
    const now = new Date();
    filteredAssignments.forEach(a => {
      if (a.status === 'active' || a.status === 'scheduled') {
        const start = new Date(a.startDateTime);
        const end = new Date(a.endDateTime);
        if (start <= now && now <= end) {
          driversOnAssignment.add(a.driverId);
        }
      }
    });

    // Calculate driver statistics
    const driverStats = allDrivers.map(driver => {
      const driverAssignments = filteredAssignments.filter(a => a.driverId === driver.id);
      
      // Calculate total days worked
      const totalDaysWorked = driverAssignments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => {
          const start = new Date(a.startDateTime);
          const end = new Date(a.endDateTime);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return sum + days;
        }, 0);

      // Calculate total revenue from contracts (authoritative source)
      const totalRevenue = driverAssignments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => {
          if (!a.contractId) return sum + parseFloat(a.totalCharge || '0');
          const contract = allContracts.find(c => c.id === a.contractId);
          if (!contract) return sum + parseFloat(a.totalCharge || '0');
          
          // Use driverServiceTotal from contract as authoritative revenue
          const driverCharge = contract.driverServiceTotal 
            ? parseFloat(contract.driverServiceTotal) 
            : parseFloat(a.totalCharge || '0');
          
          return sum + driverCharge;
        }, 0);

      // Calculate total cost using applicable rate cards
      const totalCost = driverAssignments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => {
          const start = new Date(a.startDateTime);
          const end = new Date(a.endDateTime);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Get applicable rate card for this assignment period
          const applicableRates = rateCardsByDriver.get(driver.id) || [];
          const rateCard = applicableRates.find(rc => {
            const validFrom = new Date(rc.effectiveFrom);
            const validTo = rc.effectiveTo ? new Date(rc.effectiveTo) : new Date('2099-12-31');
            return start >= validFrom && start <= validTo && rc.isActive;
          });

          // Use rate from card, or fall back to driver's default cost rate
          const dailyRate = rateCard 
            ? parseFloat(rateCard.baseRate || '0')
            : parseFloat(driver.costRate || '0');
          
          return sum + (dailyRate * days);
        }, 0);

      // Count assignments by status
      const assignmentsByStatus = {
        scheduled: driverAssignments.filter(a => a.status === 'scheduled').length,
        active: driverAssignments.filter(a => a.status === 'active').length,
        completed: driverAssignments.filter(a => a.status === 'completed').length,
        cancelled: driverAssignments.filter(a => a.status === 'cancelled').length,
      };

      return {
        driverId: driver.id,
        driverCode: driver.driverCode,
        driverName: driver.nameEn,
        driverNameAr: driver.nameAr,
        employmentType: driver.employmentType,
        availability: driver.availability,
        totalAssignments: driverAssignments.length,
        completedAssignments: assignmentsByStatus.completed,
        activeAssignments: assignmentsByStatus.active,
        totalDaysWorked,
        totalRevenue,
        totalCost,
        profitMargin: totalRevenue - totalCost,
        assignmentsByStatus,
        isActive: driver.isActive,
      };
    });

    // Calculate summary statistics based on actual assignment data
    const totalDrivers = allDrivers.filter(d => d.isActive).length;
    const onAssignment = driversOnAssignment.size;
    const activeDrivers = totalDrivers - onAssignment; // Available = total - on assignment
    const totalAssignments = filteredAssignments.length;
    const completedAssignments = filteredAssignments.filter(a => a.status === 'completed').length;
    const totalRevenue = driverStats.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalCost = driverStats.reduce((sum, d) => sum + d.totalCost, 0);

    return {
      summary: {
        totalDrivers,
        activeDrivers,
        onAssignment,
        totalAssignments,
        completedAssignments,
        totalRevenue,
        totalCost,
        totalProfit: totalRevenue - totalCost,
        averageUtilization: totalDrivers > 0 ? (onAssignment / totalDrivers) * 100 : 0,
      },
      driverStats: driverStats.sort((a, b) => b.totalRevenue - a.totalRevenue),
    };
  }

  // Reports - Driver Revenue vs Cost Analysis
  async getDriverRevenueCostReport(startDate?: Date, endDate?: Date) {
    const allDrivers = await db.select().from(drivers).where(eq(drivers.isActive, true));
    const allAssignments = await db.select().from(driverAssignments);
    const allContracts = await db.select().from(contracts);
    const allRateCards = await db.select().from(driverRateCards);
    
    // Create Set of active driver IDs for filtering assignments
    const activeDriverIds = new Set(allDrivers.map(d => d.id));
    
    // Create lookup maps
    const contractMap = new Map(allContracts.map(c => [c.id, c]));
    const rateCardsByDriver = new Map<string, typeof allRateCards>();
    allRateCards.forEach(rc => {
      if (!rateCardsByDriver.has(rc.driverId)) {
        rateCardsByDriver.set(rc.driverId, []);
      }
      rateCardsByDriver.get(rc.driverId)!.push(rc);
    });
    
    // Filter assignments by active drivers AND date range
    const filteredAssignments = allAssignments.filter(a => {
      // Only include assignments for active drivers
      if (!activeDriverIds.has(a.driverId)) return false;
      
      // Apply date range filter if provided
      if (!startDate && !endDate) return true;
      if (!a.startDateTime) return false;
      const assignmentDate = new Date(a.startDateTime);
      if (startDate && assignmentDate < startDate) return false;
      if (endDate && assignmentDate > endDate) return false;
      return true;
    });

    // Revenue vs Cost analysis per driver
    const driverAnalysis = allDrivers.map(driver => {
      const driverAssignments = filteredAssignments.filter(a => a.driverId === driver.id && a.status === 'completed');
      
      // Calculate revenue from contracts (authoritative source)
      const totalRevenue = driverAssignments.reduce((sum, a) => {
        if (!a.contractId) return sum;
        const contract = contractMap.get(a.contractId);
        if (!contract) return sum;
        
        // Use driverServiceTotal from contract as authoritative revenue source
        const driverCharge = contract.driverServiceTotal 
          ? parseFloat(contract.driverServiceTotal) 
          : parseFloat(a.totalCharge || '0'); // Fallback to assignment charge
        
        return sum + driverCharge;
      }, 0);
      
      const baseRevenue = driverAssignments.reduce((sum, a) => sum + (parseFloat(a.baseRate) * parseFloat(a.quantity)), 0);
      const surchargeRevenue = driverAssignments.reduce((sum, a) => sum + parseFloat(a.totalSurcharges || '0'), 0);
      
      // Calculate costs using rate cards (authoritative source)
      const totalDaysWorked = driverAssignments.reduce((sum, a) => {
        const start = new Date(a.startDateTime);
        const end = new Date(a.endDateTime);
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }, 0);
      
      // Calculate total cost using applicable rate cards
      const totalCost = driverAssignments.reduce((sum, a) => {
        const start = new Date(a.startDateTime);
        const end = new Date(a.endDateTime);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Get applicable rate card for this assignment period
        const applicableRates = rateCardsByDriver.get(driver.id) || [];
        const rateCard = applicableRates.find(rc => {
          const validFrom = new Date(rc.effectiveFrom);
          const validTo = rc.effectiveTo ? new Date(rc.effectiveTo) : new Date('2099-12-31');
          return start >= validFrom && start <= validTo && rc.isActive;
        });

        // Use rate from card, or fall back to driver's default cost rate
        const dailyRate = rateCard 
          ? parseFloat(rateCard.baseRate || '0')
          : parseFloat(driver.costRate || '0');
        
        return sum + (dailyRate * days);
      }, 0);
      
      // Calculate profit metrics
      const profit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
      
      return {
        driverId: driver.id,
        driverCode: driver.driverCode,
        driverName: driver.nameEn,
        driverNameAr: driver.nameAr,
        employmentType: driver.employmentType,
        costRate: driver.costRate || '0',
        totalAssignments: driverAssignments.length,
        totalDaysWorked,
        totalRevenue,
        baseRevenue,
        surchargeRevenue,
        totalCost,
        profit,
        profitMargin,
        roi,
        revenuePerDay: totalDaysWorked > 0 ? totalRevenue / totalDaysWorked : 0,
        costPerDay: totalDaysWorked > 0 ? totalCost / totalDaysWorked : 0,
        isActive: driver.isActive,
      };
    });

    // Top performers
    const topPerformers = [...driverAnalysis]
      .filter(d => d.totalAssignments > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    // Summary metrics
    const totalRevenue = driverAnalysis.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalCost = driverAnalysis.reduce((sum, d) => sum + d.totalCost, 0);
    const totalProfit = totalRevenue - totalCost;
    const overallProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        overallProfitMargin,
        totalAssignments: filteredAssignments.filter(a => a.status === 'completed').length,
        averageRevenuePerDriver: driverAnalysis.length > 0 ? totalRevenue / driverAnalysis.length : 0,
        averageCostPerDriver: driverAnalysis.length > 0 ? totalCost / driverAnalysis.length : 0,
      },
      driverAnalysis: driverAnalysis.sort((a, b) => b.totalRevenue - a.totalRevenue),
      topPerformers,
    };
  }

  // Predictive Reports - Revenue Forecasting
  async getRevenueForecastReport(months: number = 12, forecastMonths: number = 3) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const allPayments = await db.select().from(payments);
    const filteredPayments = allPayments.filter(p => p.paidAt && new Date(p.paidAt) >= cutoffDate);
    
    // Group payments by month
    const monthlyRevenue = new Map<string, number>();
    filteredPayments.forEach(p => {
      if (!p.paidAt) return;
      const month = new Date(p.paidAt).toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + parseFloat(p.amount));
    });
    
    // Convert to array and sort by month
    const historicalData = Array.from(monthlyRevenue.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Simple moving average forecast
    const forecastData: { month: string; forecast: number; lowerBound: number; upperBound: number }[] = [];
    let trendValue = 0;
    
    if (historicalData.length >= 3) {
      const avgRevenue = historicalData.reduce((sum, d) => sum + d.revenue, 0) / historicalData.length;
      trendValue = historicalData.length > 1 
        ? (historicalData[historicalData.length - 1].revenue - historicalData[0].revenue) / historicalData.length
        : 0;
      
      const lastMonth = new Date(historicalData[historicalData.length - 1].month + '-01');
      for (let i = 1; i <= forecastMonths; i++) {
        const forecastMonth = new Date(lastMonth);
        forecastMonth.setMonth(forecastMonth.getMonth() + i);
        const monthStr = forecastMonth.toISOString().substring(0, 7);
        const forecast = avgRevenue + (trendValue * (historicalData.length + i));
        const variance = avgRevenue * 0.15; // 15% variance
        
        forecastData.push({
          month: monthStr,
          forecast: Math.max(0, forecast),
          lowerBound: Math.max(0, forecast - variance),
          upperBound: forecast + variance,
        });
      }
    }
    
    // Warning if forecast shows >20% drop
    const lastHistoricalRevenue = historicalData.length > 0 ? historicalData[historicalData.length - 1].revenue : 0;
    const firstForecast = forecastData.length > 0 ? forecastData[0].forecast : 0;
    const dropPercentage = lastHistoricalRevenue > 0 ? ((lastHistoricalRevenue - firstForecast) / lastHistoricalRevenue) * 100 : 0;
    const hasWarning = dropPercentage > 20;
    
    return {
      historicalData,
      forecastData,
      summary: {
        averageMonthlyRevenue: historicalData.reduce((sum, d) => sum + d.revenue, 0) / (historicalData.length || 1),
        trend: trendValue > 0 ? 'increasing' : trendValue < 0 ? 'decreasing' : 'stable',
        trendValue,
        forecastedTotal: forecastData.reduce((sum, d) => sum + d.forecast, 0),
        hasWarning,
        warningMessage: hasWarning ? `Revenue forecast shows ${dropPercentage.toFixed(1)}% drop` : null,
      },
    };
  }

  // Predictive Reports - Fleet Utilization Forecast
  async getFleetUtilizationForecastReport(months: number = 6, vehicleType?: string) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const allVehicles = await db.select().from(vehicles).where(eq(vehicles.disabled, false));
    const allContracts = await db.select().from(contracts);
    const filteredContracts = allContracts.filter(c => new Date(c.rentalStartDate) >= cutoffDate);
    
    // Filter vehicles by vehicle type if specified
    const relevantVehicles = vehicleType 
      ? allVehicles.filter(v => v.vehicleType === vehicleType)
      : allVehicles;
    
    // Calculate utilization by vehicle type over time
    const typeUtilization = new Map<string, Map<string, { totalDays: number; rentedDays: number }>>();
    
    relevantVehicles.forEach(vehicle => {
      const vType = vehicle.vehicleType || 'Uncategorized';
      if (!typeUtilization.has(vType)) {
        typeUtilization.set(vType, new Map());
      }
      
      const monthStats = typeUtilization.get(vType)!;
      
      // Count rental days per month
      filteredContracts
        .filter(c => c.vehicleId === vehicle.id && c.status !== 'cancelled')
        .forEach(contract => {
          const start = new Date(contract.rentalStartDate);
          const end = new Date(contract.rentalEndDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          const month = start.toISOString().substring(0, 7);
          if (!monthStats.has(month)) {
            monthStats.set(month, { totalDays: 30, rentedDays: 0 });
          }
          const stats = monthStats.get(month)!;
          stats.rentedDays += days;
        });
    });
    
    // Calculate utilization rates and forecast
    const categoryForecasts = Array.from(typeUtilization.entries()).map(([vType, monthMap]) => {
      const monthlyData = Array.from(monthMap.entries())
        .map(([month, stats]) => ({
          month,
          utilizationRate: (stats.rentedDays / stats.totalDays) * 100,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      const avgUtilization = monthlyData.reduce((sum, d) => sum + d.utilizationRate, 0) / (monthlyData.length || 1);
      const expectedIdlePercentage = 100 - avgUtilization;
      const hasWarning = expectedIdlePercentage > 30;
      
      return {
        category: vType,
        vehicleCount: relevantVehicles.filter(v => (v.vehicleType || 'Uncategorized') === vType).length,
        monthlyData,
        avgUtilization,
        expectedIdlePercentage,
        hasWarning,
        warningMessage: hasWarning ? `Expected ${expectedIdlePercentage.toFixed(1)}% idle time next month` : null,
      };
    });
    
    return {
      categoryForecasts: categoryForecasts.sort((a, b) => b.avgUtilization - a.avgUtilization),
      summary: {
        totalVehicles: relevantVehicles.length,
        averageUtilization: categoryForecasts.reduce((sum, c) => sum + c.avgUtilization, 0) / (categoryForecasts.length || 1),
        categoriesWithLowUtilization: categoryForecasts.filter(c => c.avgUtilization < 50).length,
      },
    };
  }

  // Predictive Reports - Customer Churn Risk
  async getCustomerChurnRiskReport(inactiveDays: number = 90, minRentals: number = 3) {
    const allCustomers = await db.select().from(customers).where(eq(customers.disabled, false));
    const allContracts = await db.select().from(contracts);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    
    const customerAnalysis = allCustomers.map(customer => {
      const customerContracts = allContracts
        .filter(c => c.customerId === customer.id)
        .sort((a, b) => new Date(b.rentalStartDate).getTime() - new Date(a.rentalStartDate).getTime());
      
      const totalRentals = customerContracts.length;
      const lastRental = customerContracts[0];
      const lastRentalDate = lastRental ? new Date(lastRental.rentalStartDate) : null;
      const daysSinceLastRental = lastRentalDate 
        ? Math.floor((new Date().getTime() - lastRentalDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      const totalRevenue = customerContracts.reduce((sum, c) => sum + parseFloat(c.totalAmount), 0);
      const avgRentalValue = totalRentals > 0 ? totalRevenue / totalRentals : 0;
      
      // Calculate churn risk score (0-100)
      let churnScore = 0;
      if (totalRentals >= minRentals) {
        // High-value customer showing signs of churn
        if (daysSinceLastRental > inactiveDays) {
          churnScore = Math.min(100, 50 + (daysSinceLastRental - inactiveDays) / 2);
        } else if (daysSinceLastRental > inactiveDays * 0.7) {
          churnScore = 30;
        }
        
        // Increase risk if declining rental frequency
        if (customerContracts.length >= 3) {
          const recent3 = customerContracts.slice(0, 3);
          const previous3 = customerContracts.slice(3, 6);
          if (previous3.length === 3) {
            const recentAvgGap = recent3.reduce((sum, c, i) => {
              if (i === 0) return sum;
              return sum + (new Date(recent3[i-1].rentalStartDate).getTime() - new Date(c.rentalStartDate).getTime());
            }, 0) / 2;
            const previousAvgGap = previous3.reduce((sum, c, i) => {
              if (i === 0) return sum;
              return sum + (new Date(previous3[i-1].rentalStartDate).getTime() - new Date(c.rentalStartDate).getTime());
            }, 0) / 2;
            
            if (recentAvgGap > previousAvgGap * 1.5) {
              churnScore += 20;
            }
          }
        }
      }
      
      return {
        customerId: customer.id,
        customerCode: customer.customerCode,
        nameEn: customer.nameEn,
        nameAr: customer.nameAr || null,
        totalRentals,
        totalRevenue,
        avgRentalValue,
        lastRentalDate: lastRentalDate ? lastRentalDate.toISOString().split('T')[0] : null,
        daysSinceLastRental,
        churnScore: Math.min(100, Math.max(0, churnScore)),
        riskLevel: churnScore >= 70 ? 'high' : churnScore >= 40 ? 'medium' : churnScore > 0 ? 'low' : 'none',
      };
    });
    
    const highRiskCustomers = customerAnalysis.filter(c => c.churnScore >= 70 && c.totalRentals >= minRentals);
    const atRiskRevenue = highRiskCustomers.reduce((sum, c) => sum + c.totalRevenue, 0);
    
    return {
      customerAnalysis: customerAnalysis
        .filter(c => c.totalRentals >= minRentals)
        .sort((a, b) => b.churnScore - a.churnScore),
      highRiskCustomers,
      summary: {
        totalCustomers: allCustomers.length,
        qualifiedCustomers: customerAnalysis.filter(c => c.totalRentals >= minRentals).length,
        highRiskCount: highRiskCustomers.length,
        atRiskRevenue,
        hasWarning: highRiskCustomers.length > 0,
        warningMessage: highRiskCustomers.length > 0 
          ? `${highRiskCustomers.length} high-value customers at risk of churning` 
          : null,
      },
    };
  }

  // Predictive Reports - Maintenance Cost Forecast
  async getMaintenanceCostForecastReport(months: number = 12, forecastMonths: number = 3, vehicleId?: string) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const allMaintenanceRecords = await db.select().from(vehicleServiceRecords);
    const allVehicles = await db.select().from(vehicles).where(eq(vehicles.disabled, false));
    
    const relevantVehicles = vehicleId 
      ? allVehicles.filter(v => v.id === vehicleId)
      : allVehicles;
    
    const filteredRecords = allMaintenanceRecords.filter(r => 
      new Date(r.serviceDate) >= cutoffDate &&
      (!vehicleId || r.vehicleId === vehicleId)
    );
    
    // Group by month
    const monthlyCosts = new Map<string, number>();
    filteredRecords.forEach(r => {
      const month = new Date(r.serviceDate).toISOString().substring(0, 7);
      monthlyCosts.set(month, (monthlyCosts.get(month) || 0) + parseFloat(r.cost));
    });
    
    const historicalData = Array.from(monthlyCosts.entries())
      .map(([month, cost]) => ({ month, cost }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Forecast using moving average with age factor
    const forecastData: { month: string; forecast: number; lowerBound: number; upperBound: number }[] = [];
    if (historicalData.length >= 3) {
      const avgCost = historicalData.reduce((sum, d) => sum + d.cost, 0) / historicalData.length;
      const trend = historicalData.length > 1 
        ? (historicalData[historicalData.length - 1].cost - historicalData[0].cost) / historicalData.length
        : 0;
      
      const lastMonth = new Date(historicalData[historicalData.length - 1].month + '-01');
      for (let i = 1; i <= forecastMonths; i++) {
        const forecastMonth = new Date(lastMonth);
        forecastMonth.setMonth(forecastMonth.getMonth() + i);
        const monthStr = forecastMonth.toISOString().substring(0, 7);
        
        // Factor in age-based cost increase (2% per month as fleet ages)
        const ageFactor = 1 + (i * 0.02);
        const forecast = (avgCost + (trend * (historicalData.length + i))) * ageFactor;
        const variance = forecast * 0.20; // 20% variance
        
        forecastData.push({
          month: monthStr,
          forecast: Math.max(0, forecast),
          lowerBound: Math.max(0, forecast - variance),
          upperBound: forecast + variance,
        });
      }
    }
    
    // Identify high-cost vehicles
    const vehicleCosts = new Map<string, number>();
    filteredRecords.forEach(r => {
      vehicleCosts.set(r.vehicleId, (vehicleCosts.get(r.vehicleId) || 0) + parseFloat(r.cost));
    });
    
    const highCostVehicles = Array.from(vehicleCosts.entries())
      .map(([vId, cost]) => {
        const vehicle = relevantVehicles.find(v => v.id === vId);
        return {
          vehicleId: vId,
          registration: vehicle?.registration || 'Unknown',
          make: vehicle?.make || '',
          model: vehicle?.model || '',
          totalCost: cost,
          avgMonthly: cost / months,
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);
    
    const avgHistoricalCost = historicalData.reduce((sum, d) => sum + d.cost, 0) / (historicalData.length || 1);
    const forecastedTotal = forecastData.reduce((sum, d) => sum + d.forecast, 0);
    const costIncrease = avgHistoricalCost > 0 ? ((forecastedTotal / forecastMonths - avgHistoricalCost) / avgHistoricalCost) * 100 : 0;
    
    return {
      historicalData,
      forecastData,
      highCostVehicles,
      summary: {
        avgMonthlyCost: avgHistoricalCost,
        forecastedTotal,
        forecastedMonthly: forecastData.length > 0 ? forecastedTotal / forecastData.length : 0,
        costIncrease,
        hasWarning: costIncrease > 15,
        warningMessage: costIncrease > 15 ? `Maintenance costs forecasted to increase by ${costIncrease.toFixed(1)}%` : null,
      },
    };
  }

  // Predictive Reports - Payment Default Prediction
  async getPaymentDefaultPredictionReport(riskThreshold: number = 50) {
    const allContracts = await db.select().from(contracts);
    const allPayments = await db.select().from(payments);
    const allRiskScores = await db.select().from(customerRiskScores);
    const allCustomers = await db.select().from(customers).where(eq(customers.disabled, false));
    
    // Create lookup maps
    const riskScoreMap = new Map(allRiskScores.map(r => [r.customerId, r.finalScore]));
    const customerMap = new Map(allCustomers.map(c => [c.id, c]));
    
    // Analyze active/upcoming contracts
    const today = new Date();
    const upcomingContracts = allContracts.filter(c => 
      c.status === 'active' || 
      (c.status === 'confirmed' && new Date(c.rentalStartDate) > today)
    );
    
    const contractAnalysis = upcomingContracts.map(contract => {
      const customer = customerMap.get(contract.customerId);
      const riskScore = riskScoreMap.get(contract.customerId) || 0;
      const contractPayments = allPayments.filter(p => p.contractId === contract.id);
      
      const totalPaid = contractPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalCost = parseFloat(contract.totalAmount);
      const outstandingAmount = totalCost - totalPaid;
      const paymentProgress = totalCost > 0 ? (totalPaid / totalCost) * 100 : 0;
      
      // Calculate default probability based on risk score and payment behavior
      let defaultProbability = riskScore;
      
      // Adjust for payment behavior
      if (contract.status === 'active') {
        const daysSincePickup = Math.floor((today.getTime() - new Date(contract.rentalStartDate).getTime()) / (1000 * 60 * 60 * 24));
        const expectedProgress = Math.min(100, (daysSincePickup / ((new Date(contract.rentalEndDate).getTime() - new Date(contract.rentalStartDate).getTime()) / (1000 * 60 * 60 * 24))) * 100);
        
        if (paymentProgress < expectedProgress - 20) {
          defaultProbability += 20; // Behind on payments
        }
      }
      
      // High outstanding amounts increase risk
      if (outstandingAmount > 5000) {
        defaultProbability += 10;
      }
      
      defaultProbability = Math.min(100, Math.max(0, defaultProbability));
      
      return {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        customerId: contract.customerId,
        customerName: customer?.nameEn || 'Unknown',
        customerRiskScore: riskScore,
        totalCost,
        totalPaid,
        outstandingAmount,
        paymentProgress,
        defaultProbability,
        riskLevel: defaultProbability >= 70 ? 'high' : defaultProbability >= 40 ? 'medium' : 'low',
        status: contract.status,
        pickupDate: contract.rentalStartDate.toISOString().split('T')[0],
        returnDate: contract.rentalEndDate.toISOString().split('T')[0],
      };
    });
    
    const highRiskContracts = contractAnalysis.filter(c => c.defaultProbability >= riskThreshold);
    const totalAtRisk = highRiskContracts.reduce((sum, c) => sum + c.outstandingAmount, 0);
    
    return {
      contractAnalysis: contractAnalysis.sort((a, b) => b.defaultProbability - a.defaultProbability),
      highRiskContracts,
      summary: {
        totalContracts: contractAnalysis.length,
        highRiskCount: highRiskContracts.length,
        totalOutstanding: contractAnalysis.reduce((sum, c) => sum + c.outstandingAmount, 0),
        totalAtRisk,
        avgDefaultProbability: contractAnalysis.reduce((sum, c) => sum + c.defaultProbability, 0) / (contractAnalysis.length || 1),
        hasWarning: highRiskContracts.length > 0,
        warningMessage: highRiskContracts.length > 0 
          ? `${highRiskContracts.length} contracts at high risk of default (AED ${totalAtRisk.toFixed(2)} at risk)` 
          : null,
      },
    };
  }

  // Predictive Reports - Demand Forecasting (Location-Based)
  async getDemandForecastReport(months: number = 6, emirate?: string) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const allContracts = await db.select().from(contracts);
    const allCustomers = await db.select().from(customers).where(eq(customers.disabled, false));
    
    const filteredContracts = allContracts.filter(c => new Date(c.rentalStartDate) >= cutoffDate);
    
    // Create customer lookup map
    const customerMap = new Map(allCustomers.map(c => [c.id, c]));
    
    // Group contracts by emirate and month
    const emirateDemand = new Map<string, Map<string, number>>();
    
    filteredContracts.forEach(contract => {
      const customer = customerMap.get(contract.customerId);
      const customerEmirate = customer?.emirate || 'unknown';
      
      if (emirate && customerEmirate !== emirate) {
        return; // Skip if filtering by specific emirate
      }
      
      if (!emirateDemand.has(customerEmirate)) {
        emirateDemand.set(customerEmirate, new Map());
      }
      
      const month = new Date(contract.rentalStartDate).toISOString().substring(0, 7);
      const monthMap = emirateDemand.get(customerEmirate)!;
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    });
    
    // Calculate trends and forecasts per emirate
    const emirateForecasts = Array.from(emirateDemand.entries()).map(([em, monthMap]) => {
      const monthlyData = Array.from(monthMap.entries())
        .map(([month, demand]) => ({ month, demand }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      const avgDemand = monthlyData.reduce((sum, d) => sum + d.demand, 0) / (monthlyData.length || 1);
      const trend = monthlyData.length > 1 
        ? (monthlyData[monthlyData.length - 1].demand - monthlyData[0].demand) / monthlyData.length
        : 0;
      
      // Forecast next 3 months
      const nextMonthForecast = Math.max(0, avgDemand + trend);
      const forecastedGrowth = avgDemand > 0 ? (trend / avgDemand) * 100 : 0;
      
      return {
        emirate: em,
        monthlyData,
        avgDemand,
        trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        trendValue: trend,
        nextMonthForecast,
        forecastedGrowth,
        hasHighDemand: nextMonthForecast > avgDemand * 1.2,
      };
    });
    
    // Sort by forecasted demand
    const sortedForecasts = emirateForecasts.sort((a, b) => b.nextMonthForecast - a.nextMonthForecast);
    const hotspots = sortedForecasts.filter(e => e.hasHighDemand);
    
    return {
      emirateForecasts: sortedForecasts,
      hotspots,
      summary: {
        totalDemand: filteredContracts.length,
        avgMonthlyDemand: filteredContracts.length / months,
        topEmirate: sortedForecasts[0]?.emirate || 'N/A',
        topEmirateForecast: sortedForecasts[0]?.nextMonthForecast || 0,
        hasHotspots: hotspots.length > 0,
        warningMessage: hotspots.length > 0 
          ? `${hotspots.length} emirates showing high demand forecast` 
          : null,
      },
    };
  }

  // Company settings operations
  async getCompanySettings(): Promise<CompanySettings> {
    const [settings] = await db.select().from(companySettings).where(eq(companySettings.id, "singleton"));
    
    // If no settings exist, create default ones
    if (!settings) {
      const [newSettings] = await db
        .insert(companySettings)
        .values({ id: "singleton" })
        .returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateCompanySettings(settingsData: Partial<InsertCompanySettings>, updatedBy: string): Promise<CompanySettings> {
    const [updated] = await db
      .update(companySettings)
      .set({
        ...settingsData,
        updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(companySettings.id, "singleton"))
      .returning();
    
    return updated;
  }

  // Insurance Report operations
  async getInsuranceReport(startDate?: Date, endDate?: Date) {
    const allClaims = await db.select().from(insuranceClaims).where(eq(insuranceClaims.disabled, false));
    const allContracts = await db.select().from(contracts);
    
    // Filter by date range if provided (using claimDate)
    const filteredClaims = allClaims.filter(c => {
      if (!startDate && !endDate) return true;
      if (!c.claimDate) return false;
      const claimDate = new Date(c.claimDate);
      if (startDate && claimDate < startDate) return false;
      if (endDate && claimDate > endDate) return false;
      return true;
    });

    // Summary statistics
    const totalClaims = filteredClaims.length;
    const pendingClaims = filteredClaims.filter(c => c.claimStatus === 'pending').length;
    const approvedClaims = filteredClaims.filter(c => c.claimStatus === 'approved').length;
    const rejectedClaims = filteredClaims.filter(c => c.claimStatus === 'rejected').length;
    const settledClaims = filteredClaims.filter(c => c.claimStatus === 'settled').length;
    
    const totalClaimAmount = filteredClaims.reduce((sum, c) => sum + parseFloat(c.claimAmount), 0);
    const totalApprovedAmount = filteredClaims
      .filter(c => c.approvedAmount)
      .reduce((sum, c) => sum + parseFloat(c.approvedAmount || '0'), 0);
    const totalSettledAmount = filteredClaims
      .filter(c => c.settledAmount)
      .reduce((sum, c) => sum + parseFloat(c.settledAmount || '0'), 0);

    // Claims by status
    const statusMap = new Map<string, { count: number; totalAmount: number }>();
    filteredClaims.forEach(claim => {
      const existing = statusMap.get(claim.claimStatus) || { count: 0, totalAmount: 0 };
      statusMap.set(claim.claimStatus, {
        count: existing.count + 1,
        totalAmount: existing.totalAmount + parseFloat(claim.claimAmount),
      });
    });

    const claimsByStatus = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      totalAmount: data.totalAmount,
    }));

    // Monthly trend
    const monthlyMap = new Map<string, { claimCount: number; claimAmount: number }>();
    filteredClaims.forEach(claim => {
      if (claim.claimDate) {
        const date = new Date(claim.claimDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthlyMap.get(monthKey) || { claimCount: 0, claimAmount: 0 };
        monthlyMap.set(monthKey, {
          claimCount: existing.claimCount + 1,
          claimAmount: existing.claimAmount + parseFloat(claim.claimAmount),
        });
      }
    });

    const monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        claimCount: data.claimCount,
        claimAmount: data.claimAmount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Claims by insurance company
    const insurerMap = new Map<string, { claimCount: number; totalAmount: number }>();
    filteredClaims.forEach(claim => {
      const existing = insurerMap.get(claim.insuranceCompany) || { claimCount: 0, totalAmount: 0 };
      insurerMap.set(claim.insuranceCompany, {
        claimCount: existing.claimCount + 1,
        totalAmount: existing.totalAmount + parseFloat(claim.claimAmount),
      });
    });

    const claimsByInsurer = Array.from(insurerMap.entries())
      .map(([insuranceCompany, data]) => ({
        insuranceCompany,
        claimCount: data.claimCount,
        totalAmount: data.totalAmount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Recent claims with contract information
    const contractMap = new Map(allContracts.map(c => [c.id, c]));
    const recentClaims = filteredClaims
      .slice(0, 20)
      .map(claim => {
        const contract = contractMap.get(claim.contractId);
        return {
          id: claim.id,
          claimNumber: claim.claimNumber,
          contractNumber: contract?.contractNumber || 0,
          contractId: claim.contractId,
          claimDate: claim.claimDate.toISOString(),
          incidentDate: claim.incidentDate.toISOString(),
          claimStatus: claim.claimStatus,
          claimAmount: parseFloat(claim.claimAmount),
          insuranceCompany: claim.insuranceCompany,
          claimantName: claim.claimantName,
        };
      })
      .sort((a, b) => new Date(b.claimDate).getTime() - new Date(a.claimDate).getTime());

    return {
      summary: {
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        settledClaims,
        totalClaimAmount,
        totalApprovedAmount,
        totalSettledAmount,
      },
      claimsByStatus,
      monthlyTrend,
      claimsByInsurer,
      recentClaims,
    };
  }

  // Insurance Claims operations
  async getInsuranceClaims(filters?: { contractId?: string; vehicleId?: string; status?: string }): Promise<InsuranceClaim[]> {
    const conditions: any[] = [eq(insuranceClaims.disabled, false)];
    
    if (filters?.contractId) {
      conditions.push(eq(insuranceClaims.contractId, filters.contractId));
    }
    if (filters?.status) {
      conditions.push(eq(insuranceClaims.claimStatus, filters.status));
    }
    
    const results = await db
      .select()
      .from(insuranceClaims)
      .where(and(...conditions))
      .orderBy(desc(insuranceClaims.createdAt));
    
    return results;
  }

  async getInsuranceClaimById(id: string): Promise<InsuranceClaim | undefined> {
    const [claim] = await db
      .select()
      .from(insuranceClaims)
      .where(and(eq(insuranceClaims.id, id), eq(insuranceClaims.disabled, false)));
    
    return claim;
  }

  async createInsuranceClaim(claimData: InsertInsuranceClaim): Promise<InsuranceClaim> {
    // Generate claim number: CLM-YYYY-NNNN
    const year = new Date().getFullYear();
    
    // Get the count of claims for this year
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);
    
    const existingClaims = await db
      .select()
      .from(insuranceClaims)
      .where(
        and(
          sql`${insuranceClaims.createdAt} >= ${yearStart}`,
          sql`${insuranceClaims.createdAt} <= ${yearEnd}`
        )
      );
    
    const nextNumber = existingClaims.length + 1;
    const claimNumber = `CLM-${year}-${nextNumber.toString().padStart(4, '0')}`;
    
    const [newClaim] = await db
      .insert(insuranceClaims)
      .values({
        ...claimData,
        claimNumber,
      } as any)
      .returning();
    
    return newClaim;
  }

  async updateInsuranceClaim(id: string, claimData: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim> {
    const [updated] = await db
      .update(insuranceClaims)
      .set({
        ...claimData,
        updatedAt: new Date(),
      })
      .where(eq(insuranceClaims.id, id))
      .returning();
    
    return updated;
  }

  async disableInsuranceClaim(id: string): Promise<void> {
    await db
      .update(insuranceClaims)
      .set({
        disabled: true,
        updatedAt: new Date(),
      })
      .where(eq(insuranceClaims.id, id));
  }

  async deleteInsuranceClaim(id: string, disabledBy: string): Promise<void> {
    await db
      .update(insuranceClaims)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(insuranceClaims.id, id));
  }

  // Renewal Requests operations
  async getRenewalRequests(filters?: { status?: string; customerId?: string; contractId?: string }): Promise<RenewalRequest[]> {
    const conditions: any[] = [eq(renewalRequests.disabled, false)];
    
    if (filters?.status) {
      conditions.push(eq(renewalRequests.status, filters.status));
    }
    if (filters?.customerId) {
      conditions.push(eq(renewalRequests.customerId, filters.customerId));
    }
    if (filters?.contractId) {
      conditions.push(eq(renewalRequests.contractId, filters.contractId));
    }
    
    const results = await db
      .select()
      .from(renewalRequests)
      .where(and(...conditions))
      .orderBy(desc(renewalRequests.createdAt));
    
    return results;
  }

  async getRenewalRequest(id: string): Promise<RenewalRequest | undefined> {
    const [request] = await db
      .select()
      .from(renewalRequests)
      .where(and(eq(renewalRequests.id, id), eq(renewalRequests.disabled, false)));
    
    return request;
  }

  async createRenewalRequest(requestData: InsertRenewalRequest): Promise<RenewalRequest> {
    const [newRequest] = await db
      .insert(renewalRequests)
      .values(requestData)
      .returning();
    
    return newRequest;
  }

  async updateRenewalRequest(id: string, requestData: Partial<InsertRenewalRequest>): Promise<RenewalRequest> {
    const [updated] = await db
      .update(renewalRequests)
      .set({
        ...requestData,
        updatedAt: new Date(),
      })
      .where(eq(renewalRequests.id, id))
      .returning();
    
    return updated;
  }

  async deleteRenewalRequest(id: string, disabledBy: string): Promise<void> {
    await db
      .update(renewalRequests)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(renewalRequests.id, id));
  }

  // Document Approvals operations
  async getDocumentApprovals(filters?: { status?: string; customerId?: string; documentType?: string }): Promise<DocumentApproval[]> {
    const conditions: any[] = [eq(documentApprovals.disabled, false)];
    
    if (filters?.status) {
      conditions.push(eq(documentApprovals.status, filters.status));
    }
    if (filters?.customerId) {
      conditions.push(eq(documentApprovals.customerId, filters.customerId));
    }
    if (filters?.documentType) {
      conditions.push(eq(documentApprovals.documentType, filters.documentType));
    }
    
    const results = await db
      .select()
      .from(documentApprovals)
      .where(and(...conditions))
      .orderBy(desc(documentApprovals.createdAt));
    
    return results;
  }

  async getDocumentApproval(id: string): Promise<DocumentApproval | undefined> {
    const [approval] = await db
      .select()
      .from(documentApprovals)
      .where(and(eq(documentApprovals.id, id), eq(documentApprovals.disabled, false)));
    
    return approval;
  }

  async createDocumentApproval(approvalData: InsertDocumentApproval): Promise<DocumentApproval> {
    const [newApproval] = await db
      .insert(documentApprovals)
      .values(approvalData)
      .returning();
    
    return newApproval;
  }

  async updateDocumentApproval(id: string, approvalData: Partial<InsertDocumentApproval>): Promise<DocumentApproval> {
    const [updated] = await db
      .update(documentApprovals)
      .set({
        ...approvalData,
        updatedAt: new Date(),
      })
      .where(eq(documentApprovals.id, id))
      .returning();
    
    return updated;
  }

  async deleteDocumentApproval(id: string, disabledBy: string): Promise<void> {
    await db
      .update(documentApprovals)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(documentApprovals.id, id));
  }

  // Support Tickets operations
  async getSupportTickets(filters?: { status?: string; priority?: string; category?: string; customerId?: string; assignedTo?: string }): Promise<SupportTicket[]> {
    const conditions: any[] = [eq(supportTickets.disabled, false)];
    
    if (filters?.status) {
      conditions.push(eq(supportTickets.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(supportTickets.priority, filters.priority));
    }
    if (filters?.category) {
      conditions.push(eq(supportTickets.category, filters.category));
    }
    if (filters?.customerId) {
      conditions.push(eq(supportTickets.customerId, filters.customerId));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(supportTickets.assignedTo, filters.assignedTo));
    }
    
    const results = await db
      .select()
      .from(supportTickets)
      .where(and(...conditions))
      .orderBy(desc(supportTickets.createdAt));
    
    return results;
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.disabled, false)));
    
    return ticket;
  }

  async createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket> {
    // Generate ticket number: TKT-YYYY-NNNN
    const year = new Date().getFullYear();
    
    // Get the count of tickets for this year
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);
    
    const existingTickets = await db
      .select()
      .from(supportTickets)
      .where(
        and(
          sql`${supportTickets.createdAt} >= ${yearStart}`,
          sql`${supportTickets.createdAt} <= ${yearEnd}`
        )
      );
    
    const nextNumber = existingTickets.length + 1;
    const ticketNumber = `TKT-${year}-${nextNumber.toString().padStart(5, '0')}`;
    
    const [newTicket] = await db
      .insert(supportTickets)
      .values({
        ...ticketData,
        ticketNumber,
      } as any)
      .returning();
    
    return newTicket;
  }

  async updateSupportTicket(id: string, ticketData: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [updated] = await db
      .update(supportTickets)
      .set({
        ...ticketData,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();
    
    return updated;
  }

  async deleteSupportTicket(id: string, disabledBy: string): Promise<void> {
    await db
      .update(supportTickets)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id));
  }

  // Push Notification Tokens operations
  async getPushNotificationTokens(filters?: { userId?: string; customerId?: string; platform?: string; isActive?: boolean }): Promise<PushNotificationToken[]> {
    const conditions: any[] = [];
    
    if (filters?.userId) {
      conditions.push(eq(pushNotificationTokens.userId, filters.userId));
    }
    if (filters?.customerId) {
      conditions.push(eq(pushNotificationTokens.customerId, filters.customerId));
    }
    if (filters?.platform) {
      conditions.push(eq(pushNotificationTokens.platform, filters.platform));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(pushNotificationTokens.isActive, filters.isActive));
    }
    
    const results = await db
      .select()
      .from(pushNotificationTokens)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(pushNotificationTokens.createdAt));
    
    return results;
  }

  async getPushNotificationToken(id: string): Promise<PushNotificationToken | undefined> {
    const [token] = await db
      .select()
      .from(pushNotificationTokens)
      .where(eq(pushNotificationTokens.id, id));
    
    return token;
  }

  async createPushNotificationToken(tokenData: InsertPushNotificationToken): Promise<PushNotificationToken> {
    const [newToken] = await db
      .insert(pushNotificationTokens)
      .values(tokenData)
      .returning();
    
    return newToken;
  }

  async updatePushNotificationToken(id: string, tokenData: Partial<InsertPushNotificationToken>): Promise<PushNotificationToken> {
    const [updated] = await db
      .update(pushNotificationTokens)
      .set({
        ...tokenData,
        updatedAt: new Date(),
      })
      .where(eq(pushNotificationTokens.id, id))
      .returning();
    
    return updated;
  }

  async deletePushNotificationToken(id: string): Promise<void> {
    await db
      .delete(pushNotificationTokens)
      .where(eq(pushNotificationTokens.id, id));
  }

  // Branch operations implementation
  async getBranches(includeDisabled = false): Promise<Branch[]> {
    const conditions = [];
    if (!includeDisabled) {
      conditions.push(eq(branches.disabled, false));
    }
    return await db
      .select()
      .from(branches)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(branches.isHeadquarters), branches.branchCode);
  }

  async getBranchById(id: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async getBranchByCode(branchCode: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.branchCode, branchCode));
    return branch;
  }

  async createBranch(branchData: InsertBranch): Promise<Branch> {
    const [branch] = await db.insert(branches).values(branchData).returning();
    return branch;
  }

  async updateBranch(id: string, branchData: Partial<InsertBranch>): Promise<Branch> {
    const [updated] = await db
      .update(branches)
      .set({ ...branchData, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return updated;
  }

  async disableBranch(id: string, disabledBy: string): Promise<void> {
    await db
      .update(branches)
      .set({ disabled: true, disabledBy, disabledAt: new Date() })
      .where(eq(branches.id, id));
  }

  async enableBranch(id: string): Promise<void> {
    await db
      .update(branches)
      .set({ disabled: false, disabledBy: null, disabledAt: null })
      .where(eq(branches.id, id));
  }

  // Branch Transfer operations implementation
  async getBranchTransfers(filters?: { status?: string; vehicleId?: string; sourceBranchId?: string; destinationBranchId?: string }): Promise<BranchTransfer[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(branchTransfers.status, filters.status));
    if (filters?.vehicleId) conditions.push(eq(branchTransfers.vehicleId, filters.vehicleId));
    if (filters?.sourceBranchId) conditions.push(eq(branchTransfers.sourceBranchId, filters.sourceBranchId));
    if (filters?.destinationBranchId) conditions.push(eq(branchTransfers.destinationBranchId, filters.destinationBranchId));
    
    return await db
      .select()
      .from(branchTransfers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(branchTransfers.createdAt));
  }

  async getBranchTransferById(id: string): Promise<BranchTransfer | undefined> {
    const [transfer] = await db.select().from(branchTransfers).where(eq(branchTransfers.id, id));
    return transfer;
  }

  async createBranchTransfer(transferData: InsertBranchTransfer): Promise<BranchTransfer> {
    const [transfer] = await db.insert(branchTransfers).values(transferData).returning();
    return transfer;
  }

  async approveBranchTransfer(id: string, approvedBy: string): Promise<BranchTransfer> {
    const [updated] = await db
      .update(branchTransfers)
      .set({ status: 'approved', approvedBy, approvedAt: new Date(), updatedAt: new Date() })
      .where(eq(branchTransfers.id, id))
      .returning();
    return updated;
  }

  async rejectBranchTransfer(id: string, approvedBy: string, rejectedReason: string): Promise<BranchTransfer> {
    const [updated] = await db
      .update(branchTransfers)
      .set({ status: 'rejected', approvedBy, rejectedReason, approvedAt: new Date(), updatedAt: new Date() })
      .where(eq(branchTransfers.id, id))
      .returning();
    return updated;
  }

  async completeBranchTransfer(id: string): Promise<BranchTransfer> {
    const transfer = await this.getBranchTransferById(id);
    if (!transfer) throw new Error('Transfer not found');
    
    const [updated] = await db.transaction(async (tx) => {
      await tx
        .update(vehicles)
        .set({ branchId: transfer.destinationBranchId, updatedAt: new Date() })
        .where(eq(vehicles.id, transfer.vehicleId));
      
      const [result] = await tx
        .update(branchTransfers)
        .set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
        .where(eq(branchTransfers.id, id))
        .returning();
      
      return [result];
    });
    return updated;
  }

  // Driver Outsource Company operations implementation
  async getDriverOutsourceCompanies(includeDisabled = false): Promise<DriverOutsourceCompany[]> {
    const conditions = [];
    if (!includeDisabled) {
      conditions.push(eq(driverOutsourceCompanies.isActive, true));
    }
    return await db
      .select()
      .from(driverOutsourceCompanies)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(driverOutsourceCompanies.nameEn);
  }

  async getDriverOutsourceCompanyById(id: string): Promise<DriverOutsourceCompany | undefined> {
    const [company] = await db.select().from(driverOutsourceCompanies).where(eq(driverOutsourceCompanies.id, id));
    return company;
  }

  async createDriverOutsourceCompany(companyData: InsertDriverOutsourceCompany): Promise<DriverOutsourceCompany> {
    const [company] = await db.insert(driverOutsourceCompanies).values(companyData).returning();
    return company;
  }

  async updateDriverOutsourceCompany(id: string, companyData: Partial<InsertDriverOutsourceCompany>): Promise<DriverOutsourceCompany> {
    const [updated] = await db
      .update(driverOutsourceCompanies)
      .set({ ...companyData, updatedAt: new Date() })
      .where(eq(driverOutsourceCompanies.id, id))
      .returning();
    return updated;
  }

  async disableDriverOutsourceCompany(id: string, disabledBy: string): Promise<void> {
    await db
      .update(driverOutsourceCompanies)
      .set({ isActive: false })
      .where(eq(driverOutsourceCompanies.id, id));
  }

  async enableDriverOutsourceCompany(id: string): Promise<void> {
    await db
      .update(driverOutsourceCompanies)
      .set({ isActive: true })
      .where(eq(driverOutsourceCompanies.id, id));
  }

  // Driver operations implementation
  async getDrivers(filters?: { availability?: string; employmentType?: string; includeDisabled?: boolean }): Promise<Driver[]> {
    const conditions = [];
    if (filters?.availability) conditions.push(eq(drivers.availability, filters.availability));
    if (filters?.employmentType) conditions.push(eq(drivers.employmentType, filters.employmentType));
    if (!filters?.includeDisabled) conditions.push(eq(drivers.disabled, false));
    
    return await db
      .select()
      .from(drivers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(drivers.driverCode);
  }

  async getDriverById(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async getDriverByCode(driverCode: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.driverCode, driverCode));
    return driver;
  }

  async createDriver(driverData: InsertDriver): Promise<Driver> {
    // Auto-generate driverCode if not provided
    let driverCode = (driverData as any).driverCode;
    if (!driverCode) {
      // Get the latest driver code to generate next sequential code
      const latestDriver = await db
        .select({ driverCode: drivers.driverCode })
        .from(drivers)
        .orderBy(desc(drivers.driverCode))
        .limit(1);
      
      if (latestDriver.length > 0 && latestDriver[0].driverCode) {
        // Extract number from code like "DRV001" -> "001"
        const lastCode = latestDriver[0].driverCode;
        const match = lastCode.match(/DRV(\d+)/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          driverCode = `DRV${nextNumber.toString().padStart(3, '0')}`;
        } else {
          driverCode = 'DRV001';
        }
      } else {
        driverCode = 'DRV001';
      }
    }

    const [driver] = await db.insert(drivers).values({ ...driverData, driverCode } as any).returning();
    return driver;
  }

  async updateDriver(id: string, driverData: Partial<InsertDriver>): Promise<Driver> {
    const [updated] = await db
      .update(drivers)
      .set({ ...driverData, updatedAt: new Date() })
      .where(eq(drivers.id, id))
      .returning();
    return updated;
  }

  async updateDriverAvailability(id: string, availability: string): Promise<Driver> {
    const [updated] = await db
      .update(drivers)
      .set({ availability, updatedAt: new Date() })
      .where(eq(drivers.id, id))
      .returning();
    return updated;
  }

  async disableDriver(id: string, disabledBy: string): Promise<void> {
    await db
      .update(drivers)
      .set({ disabled: true, disabledBy, disabledAt: new Date(), isActive: false })
      .where(eq(drivers.id, id));
  }

  async enableDriver(id: string): Promise<void> {
    await db
      .update(drivers)
      .set({ disabled: false, disabledBy: null, disabledAt: null, isActive: true })
      .where(eq(drivers.id, id));
  }

  // Driver Rate Card operations implementation
  async getDriverRateCards(driverId: string): Promise<DriverRateCard[]> {
    return await db
      .select()
      .from(driverRateCards)
      .where(eq(driverRateCards.driverId, driverId))
      .orderBy(desc(driverRateCards.effectiveFrom));
  }

  async getActiveDriverRateCard(driverId: string, rateType: string): Promise<DriverRateCard | undefined> {
    const now = new Date();
    const [card] = await db
      .select()
      .from(driverRateCards)
      .where(
        and(
          eq(driverRateCards.driverId, driverId),
          eq(driverRateCards.rateType, rateType),
          eq(driverRateCards.isActive, true),
          lte(driverRateCards.effectiveFrom, now),
          or(
            isNull(driverRateCards.effectiveTo),
            gte(driverRateCards.effectiveTo, now)
          )
        )
      )
      .orderBy(desc(driverRateCards.effectiveFrom))
      .limit(1);
    return card;
  }

  async createDriverRateCard(rateCardData: InsertDriverRateCard): Promise<DriverRateCard> {
    const [card] = await db.insert(driverRateCards).values(rateCardData).returning();
    return card;
  }

  async updateDriverRateCard(id: string, rateCardData: Partial<InsertDriverRateCard>): Promise<DriverRateCard> {
    const [updated] = await db
      .update(driverRateCards)
      .set({ ...rateCardData, updatedAt: new Date() })
      .where(eq(driverRateCards.id, id))
      .returning();
    return updated;
  }

  // Driver Schedule Block operations implementation
  async getDriverScheduleBlocks(driverId: string, startDate?: Date, endDate?: Date): Promise<DriverScheduleBlock[]> {
    const conditions = [eq(driverScheduleBlocks.driverId, driverId)];
    if (startDate) conditions.push(gte(driverScheduleBlocks.endDateTime, startDate));
    if (endDate) conditions.push(lte(driverScheduleBlocks.startDateTime, endDate));
    
    return await db
      .select()
      .from(driverScheduleBlocks)
      .where(and(...conditions))
      .orderBy(driverScheduleBlocks.startDateTime);
  }

  async createDriverScheduleBlock(blockData: InsertDriverScheduleBlock): Promise<DriverScheduleBlock> {
    const [block] = await db.insert(driverScheduleBlocks).values(blockData).returning();
    return block;
  }

  async deleteDriverScheduleBlock(id: string): Promise<void> {
    await db.delete(driverScheduleBlocks).where(eq(driverScheduleBlocks.id, id));
  }

  async checkDriverAvailability(driverId: string, startDateTime: Date, endDateTime: Date): Promise<boolean> {
    const blocks = await this.getDriverScheduleBlocks(driverId, startDateTime, endDateTime);
    const assignments = await db
      .select()
      .from(driverAssignments)
      .where(
        and(
          eq(driverAssignments.driverId, driverId),
          or(
            and(lte(driverAssignments.startDateTime, startDateTime), gte(driverAssignments.endDateTime, startDateTime)),
            and(lte(driverAssignments.startDateTime, endDateTime), gte(driverAssignments.endDateTime, endDateTime)),
            and(gte(driverAssignments.startDateTime, startDateTime), lte(driverAssignments.endDateTime, endDateTime))
          )
        )
      );
    
    return blocks.length === 0 && assignments.length === 0;
  }

  // Driver Assignment operations implementation
  async getDriverAssignments(filters?: { contractId?: string; driverId?: string; status?: string }): Promise<DriverAssignment[]> {
    const conditions = [];
    if (filters?.contractId) conditions.push(eq(driverAssignments.contractId, filters.contractId));
    if (filters?.driverId) conditions.push(eq(driverAssignments.driverId, filters.driverId));
    if (filters?.status) conditions.push(eq(driverAssignments.status, filters.status));
    
    return await db
      .select()
      .from(driverAssignments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(driverAssignments.createdAt));
  }

  async getDriverAssignmentById(id: string): Promise<DriverAssignment | undefined> {
    const [assignment] = await db.select().from(driverAssignments).where(eq(driverAssignments.id, id));
    return assignment;
  }

  async createDriverAssignment(assignmentData: InsertDriverAssignment): Promise<DriverAssignment> {
    const [assignment] = await db.insert(driverAssignments).values(assignmentData).returning();
    return assignment;
  }

  async updateDriverAssignment(id: string, assignmentData: Partial<InsertDriverAssignment>): Promise<DriverAssignment> {
    const [updated] = await db
      .update(driverAssignments)
      .set({ ...assignmentData, updatedAt: new Date() })
      .where(eq(driverAssignments.id, id))
      .returning();
    return updated;
  }

  async completeDriverAssignment(id: string, completionNotes: string): Promise<DriverAssignment> {
    const [updated] = await db
      .update(driverAssignments)
      .set({
        status: 'completed',
        completionNotes,
        completionDateTime: new Date(),
        updatedAt: new Date()
      })
      .where(eq(driverAssignments.id, id))
      .returning();
    return updated;
  }

  // Public Holiday operations implementation
  async getPublicHolidays(filters?: { isActive?: boolean; year?: number }): Promise<PublicHoliday[]> {
    const conditions = [];
    if (filters?.isActive !== undefined) conditions.push(eq(publicHolidays.isActive, filters.isActive));
    if (filters?.year) {
      const startOfYear = new Date(filters.year, 0, 1);
      const endOfYear = new Date(filters.year, 11, 31, 23, 59, 59);
      conditions.push(
        and(
          gte(publicHolidays.holidayDate, startOfYear),
          lte(publicHolidays.holidayDate, endOfYear)
        )
      );
    }
    
    return await db
      .select()
      .from(publicHolidays)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(publicHolidays.holidayDate);
  }

  async getPublicHolidayById(id: string): Promise<PublicHoliday | undefined> {
    const [holiday] = await db.select().from(publicHolidays).where(eq(publicHolidays.id, id));
    return holiday;
  }

  async createPublicHoliday(holidayData: InsertPublicHoliday): Promise<PublicHoliday> {
    const [holiday] = await db.insert(publicHolidays).values(holidayData).returning();
    return holiday;
  }

  async updatePublicHoliday(id: string, holidayData: Partial<InsertPublicHoliday>): Promise<PublicHoliday> {
    const [updated] = await db
      .update(publicHolidays)
      .set({ ...holidayData, updatedAt: new Date() })
      .where(eq(publicHolidays.id, id))
      .returning();
    return updated;
  }

  async deletePublicHoliday(id: string): Promise<void> {
    await db.delete(publicHolidays).where(eq(publicHolidays.id, id));
  }

  async getHolidayByDate(date: Date): Promise<PublicHoliday | undefined> {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const [holiday] = await db
      .select()
      .from(publicHolidays)
      .where(
        and(
          eq(publicHolidays.isActive, true),
          sql`DATE(${publicHolidays.holidayDate}) = DATE(${dateOnly})`
        )
      );
    return holiday;
  }

  // ==================== WAVE 1: COMPLIANCE & OPERATIONS IMPLEMENTATIONS ====================

  // Toll System operations
  async getTollSystems(filters?: { emirate?: string; isActive?: boolean }): Promise<TollSystem[]> {
    const conditions = [];
    if (filters?.emirate) conditions.push(eq(tollSystems.emirate, filters.emirate as any));
    if (filters?.isActive !== undefined) conditions.push(eq(tollSystems.isActive, filters.isActive));

    return await db
      .select()
      .from(tollSystems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tollSystems.createdAt));
  }

  async getTollSystemById(id: string): Promise<TollSystem | undefined> {
    const [system] = await db.select().from(tollSystems).where(eq(tollSystems.id, id));
    return system;
  }

  async createTollSystem(systemData: InsertTollSystem): Promise<TollSystem> {
    const [system] = await db.insert(tollSystems).values(systemData).returning();
    return system;
  }

  async updateTollSystem(id: string, systemData: Partial<InsertTollSystem>): Promise<TollSystem> {
    const [updated] = await db
      .update(tollSystems)
      .set({ ...systemData, updatedAt: new Date() })
      .where(eq(tollSystems.id, id))
      .returning();
    return updated;
  }

  async deleteTollSystem(id: string): Promise<void> {
    await db.delete(tollSystems).where(eq(tollSystems.id, id));
  }

  // Toll Gate operations
  async getTollGates(filters?: { tollSystemId?: string; isActive?: boolean }): Promise<TollGate[]> {
    const conditions = [];
    if (filters?.tollSystemId) conditions.push(eq(tollGates.tollSystemId, filters.tollSystemId));
    if (filters?.isActive !== undefined) conditions.push(eq(tollGates.isActive, filters.isActive));

    return await db
      .select()
      .from(tollGates)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(tollGates.gateName);
  }

  async getTollGateById(id: string): Promise<TollGate | undefined> {
    const [gate] = await db.select().from(tollGates).where(eq(tollGates.id, id));
    return gate;
  }

  async createTollGate(gateData: InsertTollGate): Promise<TollGate> {
    const [gate] = await db.insert(tollGates).values(gateData).returning();
    return gate;
  }

  async updateTollGate(id: string, gateData: Partial<InsertTollGate>): Promise<TollGate> {
    const [updated] = await db
      .update(tollGates)
      .set(gateData)
      .where(eq(tollGates.id, id))
      .returning();
    return updated;
  }

  async deleteTollGate(id: string): Promise<void> {
    await db.delete(tollGates).where(eq(tollGates.id, id));
  }

  // Toll Pass operations
  async getTollPasses(filters?: { vehicleId?: string; contractId?: string; paymentStatus?: string; startDate?: Date; endDate?: Date }): Promise<TollPass[]> {
    const conditions = [];
    if (filters?.vehicleId) conditions.push(eq(tollPasses.vehicleId, filters.vehicleId));
    if (filters?.contractId) conditions.push(eq(tollPasses.contractId, filters.contractId));
    if (filters?.paymentStatus) conditions.push(eq(tollPasses.paymentStatus, filters.paymentStatus));
    if (filters?.startDate) conditions.push(gte(tollPasses.passDateTime, filters.startDate));
    if (filters?.endDate) conditions.push(lte(tollPasses.passDateTime, filters.endDate));

    return await db
      .select()
      .from(tollPasses)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tollPasses.passDateTime));
  }

  async getTollPassById(id: string): Promise<TollPass | undefined> {
    const [pass] = await db.select().from(tollPasses).where(eq(tollPasses.id, id));
    return pass;
  }

  async createTollPass(passData: InsertTollPass): Promise<TollPass> {
    const [pass] = await db.insert(tollPasses).values(passData).returning();
    return pass;
  }

  async updateTollPass(id: string, passData: Partial<InsertTollPass>): Promise<TollPass> {
    const [updated] = await db
      .update(tollPasses)
      .set(passData)
      .where(eq(tollPasses.id, id))
      .returning();
    return updated;
  }

  async deleteTollPass(id: string): Promise<void> {
    await db.delete(tollPasses).where(eq(tollPasses.id, id));
  }

  // Traffic Fine operations
  async getTrafficFines(filters?: { vehicleId?: string; customerId?: string; contractId?: string; paymentStatus?: string; startDate?: Date; endDate?: Date }): Promise<TrafficFine[]> {
    const conditions = [];
    if (filters?.vehicleId) conditions.push(eq(trafficFines.vehicleId, filters.vehicleId));
    if (filters?.customerId) conditions.push(eq(trafficFines.customerId, filters.customerId));
    if (filters?.contractId) conditions.push(eq(trafficFines.contractId, filters.contractId));
    if (filters?.paymentStatus) conditions.push(eq(trafficFines.paymentStatus, filters.paymentStatus));
    if (filters?.startDate) conditions.push(gte(trafficFines.fineDate, filters.startDate));
    if (filters?.endDate) conditions.push(lte(trafficFines.fineDate, filters.endDate));

    return await db
      .select()
      .from(trafficFines)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(trafficFines.fineDate));
  }

  async getTrafficFineById(id: string): Promise<TrafficFine | undefined> {
    const [fine] = await db.select().from(trafficFines).where(eq(trafficFines.id, id));
    return fine;
  }

  async createTrafficFine(fineData: InsertTrafficFine): Promise<TrafficFine> {
    const [fine] = await db.insert(trafficFines).values(fineData).returning();
    return fine;
  }

  async updateTrafficFine(id: string, fineData: Partial<InsertTrafficFine>): Promise<TrafficFine> {
    const [updated] = await db
      .update(trafficFines)
      .set({ ...fineData, updatedAt: new Date() })
      .where(eq(trafficFines.id, id))
      .returning();
    return updated;
  }

  async deleteTrafficFine(id: string): Promise<void> {
    await db.delete(trafficFines).where(eq(trafficFines.id, id));
  }

  // Incident operations
  async getIncidents(filters?: { contractId?: string; vehicleId?: string; customerId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<Incident[]> {
    const conditions = [];
    if (filters?.contractId) conditions.push(eq(incidents.contractId, filters.contractId));
    if (filters?.vehicleId) conditions.push(eq(incidents.vehicleId, filters.vehicleId));
    if (filters?.customerId) conditions.push(eq(incidents.customerId, filters.customerId));
    if (filters?.status) conditions.push(eq(incidents.status, filters.status));
    if (filters?.startDate) conditions.push(gte(incidents.incidentDate, filters.startDate));
    if (filters?.endDate) conditions.push(lte(incidents.incidentDate, filters.endDate));

    return await db
      .select()
      .from(incidents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(incidents.incidentDate));
  }

  async getIncidentById(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values(incidentData).returning();
    return incident;
  }

  async updateIncident(id: string, incidentData: Partial<InsertIncident>): Promise<Incident> {
    const [updated] = await db
      .update(incidents)
      .set({ ...incidentData, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return updated;
  }

  async deleteIncident(id: string): Promise<void> {
    await db.delete(incidents).where(eq(incidents.id, id));
  }

  // Document Registry operations
  async getDocuments(filters?: { entityType?: string; entityId?: string; documentType?: string; status?: string }): Promise<DocumentRegistryEntry[]> {
    const conditions = [];
    if (filters?.entityType) conditions.push(eq(documentRegistry.entityType, filters.entityType));
    if (filters?.entityId) conditions.push(eq(documentRegistry.entityId, filters.entityId));
    if (filters?.documentType) conditions.push(eq(documentRegistry.documentType, filters.documentType));
    if (filters?.status) conditions.push(eq(documentRegistry.status, filters.status));

    return await db
      .select()
      .from(documentRegistry)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(documentRegistry.createdAt));
  }

  async getDocumentById(id: string): Promise<DocumentRegistryEntry | undefined> {
    const [document] = await db.select().from(documentRegistry).where(eq(documentRegistry.id, id));
    return document;
  }

  async createDocument(documentData: InsertDocumentRegistry): Promise<DocumentRegistryEntry> {
    const [document] = await db.insert(documentRegistry).values(documentData).returning();
    return document;
  }

  async updateDocument(id: string, documentData: Partial<InsertDocumentRegistry>): Promise<DocumentRegistryEntry> {
    const [updated] = await db
      .update(documentRegistry)
      .set({ ...documentData, updatedAt: new Date() })
      .where(eq(documentRegistry.id, id))
      .returning();
    return updated;
  }

  async verifyDocument(id: string, verifiedBy: string): Promise<DocumentRegistryEntry> {
    const [verified] = await db
      .update(documentRegistry)
      .set({
        isVerified: true,
        verifiedBy,
        verifiedDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(documentRegistry.id, id))
      .returning();
    return verified;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documentRegistry).where(eq(documentRegistry.id, id));
  }

  async getExpiringDocuments(daysAhead: number = 30): Promise<DocumentRegistryEntry[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return await db
      .select()
      .from(documentRegistry)
      .where(
        and(
          gte(documentRegistry.expiryDate, today),
          lte(documentRegistry.expiryDate, futureDate)
        )
      )
      .orderBy(asc(documentRegistry.expiryDate));
  }

  async getExpiredDocuments(): Promise<DocumentRegistryEntry[]> {
    const today = new Date();
    
    return await db
      .select()
      .from(documentRegistry)
      .where(lt(documentRegistry.expiryDate, today))
      .orderBy(desc(documentRegistry.expiryDate));
  }

  /**
   * Seed document registry from all existing entities
   * Auto-populates documents from customers, drivers, vehicles, contracts, sponsors
   */
  async seedDocumentRegistry(): Promise<{ seeded: number; skipped: number }> {
    let seeded = 0;
    let skipped = 0;

    // Helper: Check if document already exists
    const documentExists = async (entityType: string, entityId: string, documentType: string): Promise<boolean> => {
      const [existing] = await db
        .select()
        .from(documentRegistry)
        .where(
          and(
            eq(documentRegistry.entityType, entityType),
            eq(documentRegistry.entityId, entityId),
            eq(documentRegistry.documentType, documentType)
          )
        )
        .limit(1);
      return !!existing;
    };

    // Helper: Create document if not exists
    const createIfNotExists = async (doc: InsertDocumentRegistry): Promise<boolean> => {
      if (await documentExists(doc.entityType, doc.entityId, doc.documentType)) {
        skipped++;
        return false;
      }
      await db.insert(documentRegistry).values(doc);
      seeded++;
      return true;
    };

    // 1. Seed from Customers
    const customersData = await db.select().from(customers).where(eq(customers.isDisabled, false));
    for (const customer of customersData) {
      // Driver License
      if (customer.licenseNumber) {
        await createIfNotExists({
          entityType: 'customer',
          entityId: customer.id,
          documentType: 'driver_license',
          documentNumber: customer.licenseNumber,
          expiryDate: customer.licenseExpiry ? new Date(customer.licenseExpiry) : null,
          status: customer.licenseExpiry && new Date(customer.licenseExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Passport
      if (customer.passportNumber) {
        await createIfNotExists({
          entityType: 'customer',
          entityId: customer.id,
          documentType: 'passport',
          documentNumber: customer.passportNumber,
          expiryDate: customer.passportExpiry ? new Date(customer.passportExpiry) : null,
          status: customer.passportExpiry && new Date(customer.passportExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Emirates ID
      if (customer.emiratesId) {
        await createIfNotExists({
          entityType: 'customer',
          entityId: customer.id,
          documentType: 'emirates_id',
          documentNumber: customer.emiratesId,
          expiryDate: customer.emiratesIdExpiry ? new Date(customer.emiratesIdExpiry) : null,
          status: customer.emiratesIdExpiry && new Date(customer.emiratesIdExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Visa
      if (customer.visaNumber) {
        await createIfNotExists({
          entityType: 'customer',
          entityId: customer.id,
          documentType: 'visa',
          documentNumber: customer.visaNumber,
          expiryDate: customer.visaExpiry ? new Date(customer.visaExpiry) : null,
          status: customer.visaExpiry && new Date(customer.visaExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
    }

    // 2. Seed from Drivers
    const driversData = await db.select().from(drivers).where(eq(drivers.isDisabled, false));
    for (const driver of driversData) {
      // Driver License
      if (driver.licenseNumber) {
        await createIfNotExists({
          entityType: 'driver',
          entityId: driver.id,
          documentType: 'driver_license',
          documentNumber: driver.licenseNumber,
          expiryDate: driver.licenseExpiry ? new Date(driver.licenseExpiry) : null,
          status: driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Passport
      if (driver.passportNumber) {
        await createIfNotExists({
          entityType: 'driver',
          entityId: driver.id,
          documentType: 'passport',
          documentNumber: driver.passportNumber,
          expiryDate: driver.passportExpiry ? new Date(driver.passportExpiry) : null,
          status: driver.passportExpiry && new Date(driver.passportExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Emirates ID
      if (driver.emiratesId) {
        await createIfNotExists({
          entityType: 'driver',
          entityId: driver.id,
          documentType: 'emirates_id',
          documentNumber: driver.emiratesId,
          expiryDate: driver.emiratesIdExpiry ? new Date(driver.emiratesIdExpiry) : null,
          status: driver.emiratesIdExpiry && new Date(driver.emiratesIdExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Visa
      if (driver.visaNumber) {
        await createIfNotExists({
          entityType: 'driver',
          entityId: driver.id,
          documentType: 'visa',
          documentNumber: driver.visaNumber,
          expiryDate: driver.visaExpiry ? new Date(driver.visaExpiry) : null,
          status: driver.visaExpiry && new Date(driver.visaExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
    }

    // 3. Seed from Vehicles
    const vehiclesData = await db.select().from(vehicles).where(eq(vehicles.isDisabled, false));
    for (const vehicle of vehiclesData) {
      // Vehicle Registration
      if (vehicle.registrationNumber) {
        await createIfNotExists({
          entityType: 'vehicle',
          entityId: vehicle.id,
          documentType: 'vehicle_registration',
          documentNumber: vehicle.registrationNumber,
          expiryDate: vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry) : null,
          status: vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Insurance
      if (vehicle.insurancePolicyNumber) {
        await createIfNotExists({
          entityType: 'vehicle',
          entityId: vehicle.id,
          documentType: 'insurance_policy',
          documentNumber: vehicle.insurancePolicyNumber,
          expiryDate: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry) : null,
          status: vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
    }

    // 4. Seed from Contracts
    const contractsData = await db.select().from(contracts).where(eq(contracts.isDisabled, false));
    for (const contract of contractsData) {
      await createIfNotExists({
        entityType: 'contract',
        entityId: contract.id,
        documentType: 'rental_agreement',
        documentNumber: contract.contractNumber,
        expiryDate: contract.endDate ? new Date(contract.endDate) : null,
        status: contract.state === 'closed' ? 'completed' : 'active',
        uploadedBy: 'system_seed',
      });
    }

    // 5. Seed from Sponsors
    const sponsorsData = await db.select().from(sponsors).where(eq(sponsors.isDisabled, false));
    for (const sponsor of sponsorsData) {
      // Passport
      if (sponsor.passportNumber) {
        await createIfNotExists({
          entityType: 'sponsor',
          entityId: sponsor.id,
          documentType: 'passport',
          documentNumber: sponsor.passportNumber,
          expiryDate: sponsor.passportExpiry ? new Date(sponsor.passportExpiry) : null,
          status: sponsor.passportExpiry && new Date(sponsor.passportExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Emirates ID
      if (sponsor.emiratesId) {
        await createIfNotExists({
          entityType: 'sponsor',
          entityId: sponsor.id,
          documentType: 'emirates_id',
          documentNumber: sponsor.emiratesId,
          expiryDate: sponsor.emiratesIdExpiry ? new Date(sponsor.emiratesIdExpiry) : null,
          status: sponsor.emiratesIdExpiry && new Date(sponsor.emiratesIdExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
      // Visa
      if (sponsor.visaNumber) {
        await createIfNotExists({
          entityType: 'sponsor',
          entityId: sponsor.id,
          documentType: 'visa',
          documentNumber: sponsor.visaNumber,
          expiryDate: sponsor.visaExpiry ? new Date(sponsor.visaExpiry) : null,
          status: sponsor.visaExpiry && new Date(sponsor.visaExpiry) < new Date() ? 'expired' : 'active',
          uploadedBy: 'system_seed',
        });
      }
    }

    return { seeded, skipped };
  }

  // ==================== NOTIFICATION TEMPLATES & AUTOMATED REMINDERS ====================

  async getNotificationTemplates(filters?: { category?: string; isActive?: boolean; isSystemTemplate?: boolean }): Promise<NotificationTemplate[]> {
    const conditions = [];
    if (filters?.category) conditions.push(eq(notificationTemplates.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(notificationTemplates.isActive, filters.isActive));
    if (filters?.isSystemTemplate !== undefined) conditions.push(eq(notificationTemplates.isSystemTemplate, filters.isSystemTemplate));

    return await db
      .select()
      .from(notificationTemplates)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(notificationTemplates.createdAt));
  }

  async getNotificationTemplateById(id: string): Promise<NotificationTemplate | undefined> {
    const [template] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, id));
    return template;
  }

  async getNotificationTemplateByCode(code: string): Promise<NotificationTemplate | undefined> {
    const [template] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.templateCode, code));
    return template;
  }

  async createNotificationTemplate(templateData: InsertNotificationTemplate): Promise<NotificationTemplate> {
    const [template] = await db.insert(notificationTemplates).values(templateData).returning();
    return template;
  }

  async updateNotificationTemplate(id: string, templateData: Partial<InsertNotificationTemplate>): Promise<NotificationTemplate> {
    const [updated] = await db
      .update(notificationTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(eq(notificationTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    await db.delete(notificationTemplates).where(eq(notificationTemplates.id, id));
  }

  /**
   * Seed 12 system notification templates (bilingual EN/AR)
   * These templates are editable by admins
   */
  async seedNotificationTemplates(): Promise<{ seeded: number; skipped: number }> {
    let seeded = 0;
    let skipped = 0;

    const templates: Omit<InsertNotificationTemplate, 'createdBy'>[] = [
      {
        templateCode: 'CONTRACT_EXPIRY_REMINDER',
        category: 'contract',
        name: 'Contract Expiry Reminder',
        description: 'Sent 7 days before contract ends',
        subjectEn: 'Your Rental Contract is Expiring Soon',
        subjectAr: 'عقد الإيجار الخاص بك سينتهي قريباً',
        bodyEn: 'Dear {{customerName}},\n\nYour rental contract {{contractNumber}} for {{vehicleMake}} {{vehicleModel}} ({{plateNumber}}) will expire on {{endDate}}.\n\nPlease contact us to renew or return the vehicle.\n\nThank you,\nKarāraOS Team',
        bodyAr: 'عزيزي {{customerName}}،\n\nعقد الإيجار {{contractNumber}} لـ {{vehicleMake}} {{vehicleModel}} ({{plateNumber}}) سينتهي في {{endDate}}.\n\nيرجى الاتصال بنا لتجديد أو إعادة المركبة.\n\nشكراً لكم،\nفريق KarāraOS',
        variables: ['customerName', 'contractNumber', 'vehicleMake', 'vehicleModel', 'plateNumber', 'endDate'],
        supportsSms: true,
        supportsEmail: true,
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'DOCUMENT_RENEWAL_REMINDER',
        category: 'document',
        name: 'Document Renewal Reminder',
        description: 'Sent when customer/driver documents are about to expire',
        subjectEn: 'Document Expiry Alert',
        subjectAr: 'تنبيه انتهاء صلاحية الوثيقة',
        bodyEn: 'Dear {{entityName}},\n\nYour {{documentType}} ({{documentNumber}}) will expire on {{expiryDate}}.\n\nPlease renew it to avoid service interruption.\n\nThank you,\nKarāraOS Team',
        bodyAr: 'عزيزي {{entityName}}،\n\nستنتهي صلاحية {{documentType}} ({{documentNumber}}) في {{expiryDate}}.\n\nيرجى تجديدها لتجنب انقطاع الخدمة.\n\nشكراً لكم،\nفريق KarāraOS',
        variables: ['entityName', 'documentType', 'documentNumber', 'expiryDate'],
        supportsSms: true,
        supportsEmail: true,
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'PAYMENT_DUE_REMINDER',
        category: 'payment',
        name: 'Payment Due Reminder',
        description: 'Sent when payment is due',
        subjectEn: 'Payment Due - Contract {{contractNumber}}',
        subjectAr: 'دفعة مستحقة - عقد {{contractNumber}}',
        bodyEn: 'Dear {{customerName}},\n\nA payment of AED {{amount}} is due for contract {{contractNumber}}.\n\nDue Date: {{dueDate}}\n\nPlease make the payment to avoid late fees.\n\nThank you,\nKarāraOS Team',
        bodyAr: 'عزيزي {{customerName}}،\n\nدفعة بقيمة {{amount}} درهم مستحقة للعقد {{contractNumber}}.\n\nتاريخ الاستحقاق: {{dueDate}}\n\nيرجى سداد الدفعة لتجنب الرسوم المتأخرة.\n\nشكراً لكم،\nفريق KarāraOS',
        variables: ['customerName', 'contractNumber', 'amount', 'dueDate'],
        supportsSms: true,
        supportsEmail: true,
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'PAYMENT_OVERDUE_ALERT',
        category: 'payment',
        name: 'Payment Overdue Alert',
        description: 'Sent when payment is overdue',
        subjectEn: 'URGENT: Overdue Payment - Contract {{contractNumber}}',
        subjectAr: 'عاجل: دفعة متأخرة - عقد {{contractNumber}}',
        bodyEn: 'Dear {{customerName}},\n\nYour payment of AED {{amount}} for contract {{contractNumber}} is OVERDUE.\n\nPlease make the payment immediately to avoid service suspension.\n\nThank you,\nKarāraOS Team',
        bodyAr: 'عزيزي {{customerName}}،\n\nدفعتك بقيمة {{amount}} درهم للعقد {{contractNumber}} متأخرة.\n\nيرجى سداد الدفعة فوراً لتجنب تعليق الخدمة.\n\nشكراً لكم،\nفريق KarāraOS',
        variables: ['customerName', 'contractNumber', 'amount'],
        supportsSms: true,
        supportsEmail: true,
        priority: 'high',
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'VEHICLE_SERVICE_DUE',
        category: 'fleet',
        name: 'Vehicle Service Due',
        description: 'Sent when vehicle requires maintenance',
        subjectEn: 'Vehicle Service Required - {{plateNumber}}',
        subjectAr: 'صيانة المركبة مطلوبة - {{plateNumber}}',
        bodyEn: 'Vehicle {{vehicleMake}} {{vehicleModel}} ({{plateNumber}}) is due for {{serviceType}} service.\n\nOdometer: {{odometer}} km\nNext Service: {{nextServiceDate}}\n\nPlease schedule maintenance.\n\nKarāraOS Fleet Team',
        bodyAr: 'المركبة {{vehicleMake}} {{vehicleModel}} ({{plateNumber}}) تحتاج إلى صيانة {{serviceType}}.\n\nعداد المسافات: {{odometer}} كم\nالصيانة القادمة: {{nextServiceDate}}\n\nيرجى جدولة الصيانة.\n\nفريق الأسطول KarāraOS',
        variables: ['vehicleMake', 'vehicleModel', 'plateNumber', 'serviceType', 'odometer', 'nextServiceDate'],
        supportsSms: false,
        supportsEmail: true,
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'INSURANCE_EXPIRY_REMINDER',
        category: 'compliance',
        name: 'Insurance Expiry Reminder',
        description: 'Sent when vehicle insurance is about to expire',
        subjectEn: 'Vehicle Insurance Expiring - {{plateNumber}}',
        subjectAr: 'تأمين المركبة ينتهي - {{plateNumber}}',
        bodyEn: 'Insurance for vehicle {{plateNumber}} expires on {{expiryDate}}.\n\nPolicy Number: {{policyNumber}}\n\nPlease renew immediately to maintain compliance.\n\nKarāraOS Compliance Team',
        bodyAr: 'تأمين المركبة {{plateNumber}} ينتهي في {{expiryDate}}.\n\nرقم البوليصة: {{policyNumber}}\n\nيرجى التجديد فوراً للحفاظ على الامتثال.\n\nفريق الامتثال KarāraOS',
        variables: ['plateNumber', 'expiryDate', 'policyNumber'],
        supportsSms: false,
        supportsEmail: true,
        priority: 'high',
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'LICENSE_EXPIRY_REMINDER',
        category: 'compliance',
        name: 'License Expiry Reminder',
        description: 'Sent when driver license is about to expire',
        subjectEn: 'Driver License Expiring Soon',
        subjectAr: 'رخصة القيادة ستنتهي قريباً',
        bodyEn: 'Dear {{driverName}},\n\nYour driver license ({{licenseNumber}}) will expire on {{expiryDate}}.\n\nPlease renew it to continue driving.\n\nKarāraOS Team',
        bodyAr: 'عزيزي {{driverName}}،\n\nرخصة القيادة الخاصة بك ({{licenseNumber}}) ستنتهي في {{expiryDate}}.\n\nيرجى تجديدها لمواصلة القيادة.\n\nفريق KarāraOS',
        variables: ['driverName', 'licenseNumber', 'expiryDate'],
        supportsSms: true,
        supportsEmail: true,
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'VISA_EXPIRY_REMINDER',
        category: 'compliance',
        name: 'Visa Expiry Reminder',
        description: 'Sent when visa is about to expire',
        subjectEn: 'Visa Expiry Alert',
        subjectAr: 'تنبيه انتهاء التأشيرة',
        bodyEn: 'Dear {{entityName}},\n\nYour visa ({{visaNumber}}) will expire on {{expiryDate}}.\n\nPlease renew it to avoid legal issues.\n\nKarāraOS Team',
        bodyAr: 'عزيزي {{entityName}}،\n\nستنتهي تأشيرتك ({{visaNumber}}) في {{expiryDate}}.\n\nيرجى تجديدها لتجنب المشاكل القانونية.\n\nفريق KarāraOS',
        variables: ['entityName', 'visaNumber', 'expiryDate'],
        supportsSms: true,
        supportsEmail: true,
        priority: 'high',
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'CONTRACT_COMPLETION_REMINDER',
        category: 'contract',
        name: 'Contract Completion Reminder',
        description: 'Sent 3 days before contract ends',
        subjectEn: 'Contract Ending Soon - Action Required',
        subjectAr: 'العقد ينتهي قريباً - إجراء مطلوب',
        bodyEn: 'Dear {{customerName}},\n\nYour rental contract {{contractNumber}} ends in 3 days ({{endDate}}).\n\nPlease return the vehicle or contact us to extend.\n\nReturn Location: {{returnLocation}}\n\nThank you,\nKarāraOS Team',
        bodyAr: 'عزيزي {{customerName}}،\n\nعقد الإيجار {{contractNumber}} ينتهي خلال 3 أيام ({{endDate}}).\n\nيرجى إعادة المركبة أو الاتصال بنا للتمديد.\n\nموقع الإرجاع: {{returnLocation}}\n\nشكراً لكم،\nفريق KarāraOS',
        variables: ['customerName', 'contractNumber', 'endDate', 'returnLocation'],
        supportsSms: true,
        supportsEmail: true,
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'WELCOME_NEW_CUSTOMER',
        category: 'contract',
        name: 'Welcome New Customer',
        description: 'Sent when new contract is activated',
        subjectEn: 'Welcome to KarāraOS - Contract {{contractNumber}}',
        subjectAr: 'مرحباً بك في KarāraOS - عقد {{contractNumber}}',
        bodyEn: 'Dear {{customerName}},\n\nWelcome to KarāraOS! Your rental contract {{contractNumber}} is now active.\n\nVehicle: {{vehicleMake}} {{vehicleModel}} ({{plateNumber}})\nPeriod: {{startDate}} to {{endDate}}\n\nFor support, call {{supportHotline}} or visit {{websiteUrl}}\n\nThank you for choosing us!\nKarāraOS Team',
        bodyAr: 'عزيزي {{customerName}}،\n\nمرحباً بك في KarāraOS! عقد الإيجار {{contractNumber}} الآن نشط.\n\nالمركبة: {{vehicleMake}} {{vehicleModel}} ({{plateNumber}})\nالمدة: {{startDate}} إلى {{endDate}}\n\nللدعم، اتصل على {{supportHotline}} أو قم بزيارة {{websiteUrl}}\n\nشكراً لاختياركم لنا!\nفريق KarāraOS',
        variables: ['customerName', 'contractNumber', 'vehicleMake', 'vehicleModel', 'plateNumber', 'startDate', 'endDate', 'supportHotline', 'websiteUrl'],
        supportsSms: true,
        supportsEmail: true,
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'PAYMENT_RECEIVED_CONFIRMATION',
        category: 'payment',
        name: 'Payment Received Confirmation',
        description: 'Sent after payment is received',
        subjectEn: 'Payment Received - Contract {{contractNumber}}',
        subjectAr: 'تم استلام الدفعة - عقد {{contractNumber}}',
        bodyEn: 'Dear {{customerName}},\n\nWe have received your payment of AED {{amount}} for contract {{contractNumber}}.\n\nPayment Date: {{paymentDate}}\nPayment Method: {{paymentMethod}}\nReceipt: {{receiptNumber}}\n\nThank you,\nKarāraOS Team',
        bodyAr: 'عزيزي {{customerName}}،\n\nلقد استلمنا دفعتك بقيمة {{amount}} درهم للعقد {{contractNumber}}.\n\nتاريخ الدفع: {{paymentDate}}\nطريقة الدفع: {{paymentMethod}}\nالإيصال: {{receiptNumber}}\n\nشكراً لكم،\nفريق KarāraOS',
        variables: ['customerName', 'contractNumber', 'amount', 'paymentDate', 'paymentMethod', 'receiptNumber'],
        supportsSms: true,
        supportsEmail: true,
        isSystemTemplate: true,
        isActive: true,
      },
      {
        templateCode: 'RISK_SCORE_ALERT',
        category: 'compliance',
        name: 'Risk Score Alert',
        description: 'Sent when customer risk score crosses critical threshold',
        subjectEn: 'Account Risk Alert - Action Required',
        subjectAr: 'تنبيه مخاطر الحساب - إجراء مطلوب',
        bodyEn: 'Dear {{customerName}},\n\nYour account risk level has been elevated to {{riskLevel}} (Score: {{riskScore}}).\n\nReason: {{riskReason}}\n\nPlease contact us immediately to resolve any outstanding issues.\n\nKarāraOS Compliance Team',
        bodyAr: 'عزيزي {{customerName}}،\n\nمستوى مخاطر حسابك ارتفع إلى {{riskLevel}} (النقاط: {{riskScore}}).\n\nالسبب: {{riskReason}}\n\nيرجى الاتصال بنا فوراً لحل أي مشاكل معلقة.\n\nفريق الامتثال KarāraOS',
        variables: ['customerName', 'riskLevel', 'riskScore', 'riskReason'],
        supportsSms: false,
        supportsEmail: true,
        priority: 'high',
        isSystemTemplate: true,
        isActive: true,
      },
    ];

    for (const template of templates) {
      const existing = await this.getNotificationTemplateByCode(template.templateCode);
      if (existing) {
        skipped++;
      } else {
        await db.insert(notificationTemplates).values({
          ...template,
          createdBy: 'system',
        });
        seeded++;
      }
    }

    return { seeded, skipped };
  }

  // Automated Reminders operations
  async getAutomatedReminders(filters?: { entityType?: string; entityId?: string; reminderType?: string; isActive?: boolean }): Promise<AutomatedReminder[]> {
    const conditions = [];
    if (filters?.entityType) conditions.push(eq(automatedReminders.entityType, filters.entityType));
    if (filters?.entityId) conditions.push(eq(automatedReminders.entityId, filters.entityId));
    if (filters?.reminderType) conditions.push(eq(automatedReminders.reminderType, filters.reminderType));
    if (filters?.isActive !== undefined) conditions.push(eq(automatedReminders.isActive, filters.isActive));

    return await db
      .select()
      .from(automatedReminders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(automatedReminders.reminderDate));
  }

  async getAutomatedReminderById(id: string): Promise<AutomatedReminder | undefined> {
    const [reminder] = await db.select().from(automatedReminders).where(eq(automatedReminders.id, id));
    return reminder;
  }

  async createAutomatedReminder(reminderData: InsertAutomatedReminder): Promise<AutomatedReminder> {
    const [reminder] = await db.insert(automatedReminders).values(reminderData).returning();
    return reminder;
  }

  async updateAutomatedReminder(id: string, reminderData: Partial<InsertAutomatedReminder>): Promise<AutomatedReminder> {
    const [updated] = await db
      .update(automatedReminders)
      .set({ ...reminderData, updatedAt: new Date() })
      .where(eq(automatedReminders.id, id))
      .returning();
    return updated;
  }

  async deleteAutomatedReminder(id: string): Promise<void> {
    await db.delete(automatedReminders).where(eq(automatedReminders.id, id));
  }

  /**
   * Seed system-owned automated reminders (linked to notification templates)
   * Creates default reminder configurations for each template
   */
  async seedAutomatedReminders(): Promise<{ seeded: number; skipped: number }> {
    // This will be populated by the automation orchestrator
    // System-owned reminders are created dynamically for each entity/contract
    return { seeded: 0, skipped: 0 };
  }

  // ==================== PHASE 4-5: CLAIMS PROGRESS TRACKING ====================

  async getClaimProgressUpdates(claimId: string): Promise<ClaimProgressUpdate[]> {
    return await db
      .select()
      .from(claimProgressUpdates)
      .where(eq(claimProgressUpdates.claimId, claimId))
      .orderBy(desc(claimProgressUpdates.createdAt));
  }

  async createClaimProgressUpdate(updateData: InsertClaimProgressUpdate): Promise<ClaimProgressUpdate> {
    const [update] = await db.insert(claimProgressUpdates).values(updateData).returning();
    return update;
  }

  // ==================== PHASE 4-5: CAMPAIGN MANAGEMENT ====================

  async getCampaigns(user: User, filters?: { status?: string; scope?: string; branchId?: string }): Promise<Campaign[]> {
    const conditions = [];
    
    // RBAC filtering: Non-admins can only see campaigns in their scope
    if (user.role !== 'admin') {
      if (user.branchId) {
        conditions.push(
          or(
            eq(notificationCampaigns.branchId, user.branchId),
            eq(notificationCampaigns.createdBy, user.id)
          )
        );
      } else {
        conditions.push(eq(notificationCampaigns.createdBy, user.id));
      }
    }
    
    if (filters?.status) conditions.push(eq(notificationCampaigns.status, filters.status));
    if (filters?.scope) conditions.push(eq(notificationCampaigns.scope, filters.scope));
    if (filters?.branchId) conditions.push(eq(notificationCampaigns.branchId, filters.branchId));

    return await db
      .select()
      .from(notificationCampaigns)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(notificationCampaigns.createdAt));
  }

  async getCampaignById(id: string, user: User): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(notificationCampaigns)
      .where(eq(notificationCampaigns.id, id));
    
    if (!campaign) return undefined;
    
    // RBAC check: Non-admins can only access campaigns in their scope
    if (user.role !== 'admin') {
      if (campaign.branchId !== user.branchId && campaign.createdBy !== user.id) {
        return undefined;
      }
    }
    
    return campaign;
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(notificationCampaigns)
      .values(campaignData)
      .returning();
    return campaign;
  }

  async updateCampaign(id: string, campaignData: Partial<InsertCampaign>): Promise<Campaign> {
    const [updated] = await db
      .update(notificationCampaigns)
      .set({ ...campaignData, updatedAt: new Date() })
      .where(eq(notificationCampaigns.id, id))
      .returning();
    return updated;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(notificationCampaigns).where(eq(notificationCampaigns.id, id));
  }

  async approveCampaign(id: string, approvedBy: string): Promise<Campaign> {
    const [approved] = await db
      .update(notificationCampaigns)
      .set({
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notificationCampaigns.id, id))
      .returning();
    return approved;
  }

  async rejectCampaign(id: string, rejectedBy: string, rejectionReason: string): Promise<Campaign> {
    const [rejected] = await db
      .update(notificationCampaigns)
      .set({
        status: 'cancelled',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(notificationCampaigns.id, id))
      .returning();
    return rejected;
  }

  async sendCampaign(id: string): Promise<Campaign> {
    const [campaign] = await db
      .update(notificationCampaigns)
      .set({
        status: 'scheduled',
        scheduledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notificationCampaigns.id, id))
      .returning();
    return campaign;
  }

  async estimateCampaignRecipients(params: {
    recipientFilter: any;
    scope: string;
    branchId?: string | null;
    selectedBranches?: string[] | null;
    userRole: string;
    userBranchId?: string | null;
    channel?: string;
  }): Promise<{ count: number; estimatedCost: string }> {
    const { recipientFilter, scope, branchId, selectedBranches, userRole, userBranchId, channel } = params;
    
    // Build query conditions based on recipient filter
    const conditions = [];
    
    // Branch filtering based on scope
    if (scope === 'branch' && branchId) {
      // For branch-specific campaigns, filter customers by branch
      // (Assuming customers table will have branchId field in future)
      // For now, count all active customers
    } else if (scope === 'selected_branches' && selectedBranches && selectedBranches.length > 0) {
      // For selected branches campaigns
      // Filter by selected branches
    }
    
    // Filter by customer attributes from recipientFilter
    if (recipientFilter.emirate) {
      conditions.push(eq(customers.emirate, recipientFilter.emirate));
    }
    
    if (recipientFilter.area) {
      conditions.push(eq(customers.area, recipientFilter.area));
    }
    
    if (recipientFilter.riskScoreMin !== undefined || recipientFilter.riskScoreMax !== undefined) {
      // Join with risk scores and filter
      // For now, estimate based on all customers
    }
    
    // Count active customers matching filters
    const result = await db
      .select({ count: count() })
      .from(customers)
      .where(
        and(
          eq(customers.isDisabled, false),
          conditions.length > 0 ? and(...conditions) : undefined
        )
      );
    
    const recipientCount = result[0]?.count || 0;
    
    // Server-side cost calculation - never trust client
    // Rates: SMS = AED 0.15, Email = AED 0.02, Both = sum
    const smsRate = 0.15; // AED per SMS in UAE
    const emailRate = 0.02; // AED per email
    
    let costPerRecipient = 0;
    if (channel === 'sms') {
      costPerRecipient = smsRate;
    } else if (channel === 'email') {
      costPerRecipient = emailRate;
    } else if (channel === 'both') {
      costPerRecipient = smsRate + emailRate;
    } else {
      costPerRecipient = emailRate; // Default to email
    }
    
    const estimatedCost = (recipientCount * costPerRecipient).toFixed(2);
    
    return {
      count: recipientCount,
      estimatedCost: estimatedCost,
    };
  }

  async getCampaignRecipients(campaignId: string, filters?: any): Promise<CampaignRecipient[]> {
    const conditions = [eq(campaignRecipients.campaignId, campaignId)];
    
    if (filters?.status) conditions.push(eq(campaignRecipients.status, filters.status));
    if (filters?.recipientType) conditions.push(eq(campaignRecipients.recipientType, filters.recipientType));
    
    return await db
      .select()
      .from(campaignRecipients)
      .where(and(...conditions))
      .orderBy(desc(campaignRecipients.createdAt));
  }

  async createCampaignRecipient(recipientData: InsertCampaignRecipient): Promise<CampaignRecipient> {
    const [recipient] = await db
      .insert(campaignRecipients)
      .values(recipientData)
      .returning();
    return recipient;
  }

  async updateCampaignRecipient(id: string, recipientData: Partial<InsertCampaignRecipient>): Promise<CampaignRecipient> {
    const [updated] = await db
      .update(campaignRecipients)
      .set(recipientData)
      .where(eq(campaignRecipients.id, id))
      .returning();
    return updated;
  }

  // ==================== PHASE 4-5: TEMPLATE ANALYTICS ====================

  async getTemplateAnalytics(filters?: { templateId?: string; periodType?: string; startDate?: Date; endDate?: Date }): Promise<TemplateAnalytics[]> {
    const conditions = [];
    
    if (filters?.templateId) conditions.push(eq(templateAnalytics.templateId, filters.templateId));
    if (filters?.periodType) conditions.push(eq(templateAnalytics.periodType, filters.periodType));
    if (filters?.startDate) conditions.push(gte(templateAnalytics.periodStart, filters.startDate));
    if (filters?.endDate) conditions.push(lte(templateAnalytics.periodEnd, filters.endDate));
    
    return await db
      .select()
      .from(templateAnalytics)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(templateAnalytics.periodStart));
  }

  async getTemplateAnalyticsSummary(filters?: { templateId?: string; periodType?: string }): Promise<any> {
    const conditions = [];
    
    if (filters?.templateId) conditions.push(eq(templateAnalytics.templateId, filters.templateId));
    if (filters?.periodType) conditions.push(eq(templateAnalytics.periodType, filters.periodType));
    
    const result = await db
      .select({
        totalSent: sum(templateAnalytics.sendCount),
        totalDelivered: sum(templateAnalytics.deliverySuccessCount),
        totalFailed: sum(templateAnalytics.deliveryFailureCount),
        totalOpened: sum(templateAnalytics.emailOpenCount),
        totalClicked: sum(templateAnalytics.emailClickCount),
      })
      .from(templateAnalytics)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const data = result[0] || {};
    const totalSent = Number(data.totalSent) || 0;
    const totalDelivered = Number(data.totalDelivered) || 0;
    const totalOpened = Number(data.totalOpened) || 0;
    
    return {
      totalSent,
      totalDelivered,
      totalFailed: Number(data.totalFailed) || 0,
      totalOpened,
      totalClicked: Number(data.totalClicked) || 0,
      deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) + '%' : '0%',
      openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(2) + '%' : '0%',
    };
  }

  async generateTemplateAnalytics(params: { periodType: string; periodStart: Date; periodEnd: Date }): Promise<{ generated: number }> {
    // This would aggregate communication logs and generate analytics records
    // For now, return a stub
    return { generated: 0 };
  }

  // ==================== PHASE 4-5: A/B TESTING ====================

  async getAbTests(filters?: { status?: string }): Promise<AbTest[]> {
    const conditions = [];
    
    if (filters?.status) conditions.push(eq(abTestVariants.status, filters.status));
    
    return await db
      .select()
      .from(abTestVariants)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(abTestVariants.createdAt));
  }

  async getAbTestById(id: string): Promise<AbTest | undefined> {
    const [test] = await db
      .select()
      .from(abTestVariants)
      .where(eq(abTestVariants.id, id));
    return test;
  }

  async createAbTest(testData: InsertAbTest): Promise<AbTest> {
    const [test] = await db
      .insert(abTestVariants)
      .values(testData)
      .returning();
    return test;
  }

  async updateAbTest(id: string, testData: Partial<InsertAbTest>): Promise<AbTest> {
    const [updated] = await db
      .update(abTestVariants)
      .set({ ...testData, updatedAt: new Date() })
      .where(eq(abTestVariants.id, id))
      .returning();
    return updated;
  }

  async startAbTest(id: string): Promise<AbTest> {
    const [started] = await db
      .update(abTestVariants)
      .set({
        status: 'active',
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(abTestVariants.id, id))
      .returning();
    return started;
  }

  async completeAbTest(id: string): Promise<AbTest> {
    const [test] = await db
      .select()
      .from(abTestVariants)
      .where(eq(abTestVariants.id, id));
    
    if (!test) {
      throw new Error('A/B test not found');
    }
    
    // Calculate winner based on success rates
    const variantARate = test.variantASendCount > 0 
      ? (test.variantASuccessCount / test.variantASendCount) * 100 
      : 0;
    const variantBRate = test.variantBSendCount > 0 
      ? (test.variantBSuccessCount / test.variantBSendCount) * 100 
      : 0;
    
    let winner: string | null = null;
    if (Math.abs(variantARate - variantBRate) < 2) {
      winner = 'tie';
    } else {
      winner = variantARate > variantBRate ? 'A' : 'B';
    }
    
    const [completed] = await db
      .update(abTestVariants)
      .set({
        status: 'completed',
        completedAt: new Date(),
        winner,
        confidenceLevel: Math.abs(variantARate - variantBRate) > 10 ? '95%' : '80%',
        updatedAt: new Date(),
      })
      .where(eq(abTestVariants.id, id))
      .returning();
    
    return completed;
  }

  // ==================== PHASE 4-5: CHANNEL PREFERENCES ====================

  async getChannelPreferences(filters?: { category?: string; isActive?: boolean }): Promise<ChannelPreference[]> {
    const conditions = [];
    
    if (filters?.category) conditions.push(eq(notificationChannelPreferences.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(notificationChannelPreferences.isActive, filters.isActive));
    
    return await db
      .select()
      .from(notificationChannelPreferences)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(notificationChannelPreferences.category, notificationChannelPreferences.notificationType);
  }

  async getChannelPreferenceById(id: string): Promise<ChannelPreference | undefined> {
    const [preference] = await db
      .select()
      .from(notificationChannelPreferences)
      .where(eq(notificationChannelPreferences.id, id));
    return preference;
  }

  async getChannelPreferenceByType(notificationType: string): Promise<ChannelPreference | undefined> {
    const [preference] = await db
      .select()
      .from(notificationChannelPreferences)
      .where(eq(notificationChannelPreferences.notificationType, notificationType));
    return preference;
  }

  async createChannelPreference(preferenceData: InsertChannelPreference): Promise<ChannelPreference> {
    const [preference] = await db
      .insert(notificationChannelPreferences)
      .values(preferenceData)
      .returning();
    return preference;
  }

  async updateChannelPreference(id: string, preferenceData: Partial<InsertChannelPreference>): Promise<ChannelPreference> {
    const [updated] = await db
      .update(notificationChannelPreferences)
      .set({ ...preferenceData, updatedAt: new Date() })
      .where(eq(notificationChannelPreferences.id, id))
      .returning();
    return updated;
  }

  async toggleChannelPreference(id: string, channel: 'email' | 'sms', enabled: boolean, userId: string): Promise<ChannelPreference> {
    const updateData: any = {
      updatedBy: userId,
      updatedAt: new Date(),
    };
    
    if (channel === 'email') {
      updateData.emailEnabled = enabled;
    } else if (channel === 'sms') {
      updateData.smsEnabled = enabled;
    }
    
    const [updated] = await db
      .update(notificationChannelPreferences)
      .set(updateData)
      .where(eq(notificationChannelPreferences.id, id))
      .returning();
    
    return updated;
  }

  async calculateNotificationCost(notificationType: string, recipientCount: number): Promise<{ emailCost: string; smsCost: string; totalCost: string }> {
    const preference = await this.getChannelPreferenceByType(notificationType);
    
    if (!preference) {
      // Default costs if preference not found
      const emailCost = (recipientCount * 0.02).toFixed(2);
      const smsCost = (recipientCount * 0.15).toFixed(2);
      return {
        emailCost,
        smsCost,
        totalCost: emailCost,
      };
    }
    
    const emailRate = parseFloat(preference.emailCostPerSend || '0.02');
    const smsRate = parseFloat(preference.smsCostPerSend || '0.15');
    
    let emailCost = '0.00';
    let smsCost = '0.00';
    let totalCost = 0;
    
    if (preference.emailEnabled) {
      emailCost = (recipientCount * emailRate).toFixed(2);
      totalCost += parseFloat(emailCost);
    }
    
    if (preference.smsEnabled) {
      smsCost = (recipientCount * smsRate).toFixed(2);
      totalCost += parseFloat(smsCost);
    }
    
    return {
      emailCost,
      smsCost,
      totalCost: totalCost.toFixed(2),
    };
  }

  async seedChannelPreferences(): Promise<{ seeded: number; skipped: number }> {
    let seeded = 0;
    let skipped = 0;
    
    const defaultPreferences = [
      // Customer Deliverables
      {
        notificationType: 'contract_copy',
        nameEn: 'Contract Copy',
        nameAr: 'نسخة العقد',
        descriptionEn: 'Send rental contract copy to customer',
        descriptionAr: 'إرسال نسخة عقد الإيجار للعميل',
        category: 'customer_deliverables',
        emailEnabled: true,
        smsEnabled: false,
        priority: 'normal',
      },
      {
        notificationType: 'invoice',
        nameEn: 'Invoice',
        nameAr: 'الفاتورة',
        descriptionEn: 'Send invoice to customer',
        descriptionAr: 'إرسال الفاتورة للعميل',
        category: 'customer_deliverables',
        emailEnabled: true,
        smsEnabled: false,
        priority: 'normal',
      },
      {
        notificationType: 'receipt',
        nameEn: 'Payment Receipt',
        nameAr: 'إيصال الدفع',
        descriptionEn: 'Send payment receipt to customer',
        descriptionAr: 'إرسال إيصال الدفع للعميل',
        category: 'customer_deliverables',
        emailEnabled: true,
        smsEnabled: false,
        priority: 'normal',
      },
      {
        notificationType: 'qr_verification',
        nameEn: 'QR Code Verification',
        nameAr: 'التحقق من رمز الاستجابة السريعة',
        descriptionEn: 'Send QR code for contract verification',
        descriptionAr: 'إرسال رمز QR للتحقق من العقد',
        category: 'customer_deliverables',
        emailEnabled: true,
        smsEnabled: true,
        priority: 'high',
      },
      
      // Payment Notices (Centralized)
      {
        notificationType: 'payment_reminder',
        nameEn: 'Payment Reminder',
        nameAr: 'تذكير بالدفع',
        descriptionEn: 'Automated payment due reminder',
        descriptionAr: 'تذكير تلقائي بموعد الدفع',
        category: 'payment_notices',
        emailEnabled: true,
        smsEnabled: true,
        priority: 'critical',
        isSystemManaged: true,
        isCentralized: true,
      },
      {
        notificationType: 'payment_overdue',
        nameEn: 'Payment Overdue',
        nameAr: 'تأخر الدفع',
        descriptionEn: 'Overdue payment notification',
        descriptionAr: 'إشعار بتأخر الدفع',
        category: 'payment_notices',
        emailEnabled: true,
        smsEnabled: true,
        priority: 'critical',
        isSystemManaged: true,
        isCentralized: true,
      },
      
      // System Alerts
      {
        notificationType: 'contract_expiry',
        nameEn: 'Contract Expiry Alert',
        nameAr: 'تنبيه انتهاء العقد',
        descriptionEn: 'Upcoming contract expiry notification',
        descriptionAr: 'إشعار بقرب انتهاء العقد',
        category: 'system_alerts',
        emailEnabled: true,
        smsEnabled: true,
        priority: 'high',
      },
      {
        notificationType: 'document_expiry',
        nameEn: 'Document Expiry Alert',
        nameAr: 'تنبيه انتهاء الوثيقة',
        descriptionEn: 'Document expiring soon notification',
        descriptionAr: 'إشعار بقرب انتهاء الوثيقة',
        category: 'system_alerts',
        emailEnabled: true,
        smsEnabled: false,
        priority: 'normal',
      },
      
      // Campaigns
      {
        notificationType: 'campaign',
        nameEn: 'Marketing Campaign',
        nameAr: 'حملة تسويقية',
        descriptionEn: 'Marketing and promotional campaigns',
        descriptionAr: 'الحملات التسويقية والترويجية',
        category: 'campaigns',
        emailEnabled: true,
        smsEnabled: false,
        priority: 'normal',
      },
    ];
    
    for (const pref of defaultPreferences) {
      try {
        const existing = await this.getChannelPreferenceByType(pref.notificationType);
        if (existing) {
          skipped++;
        } else {
          await this.createChannelPreference(pref as InsertChannelPreference);
          seeded++;
        }
      } catch (error) {
        console.error(`Failed to seed channel preference ${pref.notificationType}:`, error);
        skipped++;
      }
    }
    
    return { seeded, skipped };
  }

  // ==================== COMMUNICATION INFRASTRUCTURE ====================

  // Communication Provider operations
  async getCommunicationProviders(filters?: { type?: string; isActive?: boolean }): Promise<CommunicationProvider[]> {
    const conditions = [];
    if (filters?.type) conditions.push(eq(communicationProviders.type, filters.type));
    if (filters?.isActive !== undefined) conditions.push(eq(communicationProviders.isActive, filters.isActive));

    return await db
      .select()
      .from(communicationProviders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(communicationProviders.priority);
  }

  async getCommunicationProviderById(id: string): Promise<CommunicationProvider | undefined> {
    const [provider] = await db.select().from(communicationProviders).where(eq(communicationProviders.id, id));
    return provider;
  }

  async getActiveSmsProviders(): Promise<CommunicationProvider[]> {
    return await db
      .select()
      .from(communicationProviders)
      .where(and(eq(communicationProviders.type, 'sms'), eq(communicationProviders.isActive, true)))
      .orderBy(communicationProviders.priority);
  }

  async getActiveEmailProviders(): Promise<CommunicationProvider[]> {
    return await db
      .select()
      .from(communicationProviders)
      .where(and(eq(communicationProviders.type, 'email'), eq(communicationProviders.isActive, true)))
      .orderBy(communicationProviders.priority);
  }

  async createCommunicationProvider(providerData: InsertCommunicationProvider, userId: string): Promise<CommunicationProvider> {
    const [provider] = await db
      .insert(communicationProviders)
      .values({ ...providerData, createdBy: userId })
      .returning();
    return provider;
  }

  async updateCommunicationProvider(id: string, providerData: Partial<InsertCommunicationProvider>): Promise<CommunicationProvider> {
    const [updated] = await db
      .update(communicationProviders)
      .set({ ...providerData, updatedAt: new Date() })
      .where(eq(communicationProviders.id, id))
      .returning();
    return updated;
  }

  async deleteCommunicationProvider(id: string): Promise<void> {
    await db.delete(communicationProviders).where(eq(communicationProviders.id, id));
  }

  async updateProviderHealth(id: string, healthStatus: string, lastError?: string): Promise<void> {
    await db
      .update(communicationProviders)
      .set({
        healthStatus,
        lastError: lastError || null,
        lastHealthCheck: new Date(),
      })
      .where(eq(communicationProviders.id, id));
  }

  async incrementProviderUsage(id: string, success: boolean): Promise<void> {
    const [provider] = await db
      .select()
      .from(communicationProviders)
      .where(eq(communicationProviders.id, id));

    if (!provider) return;

    await db
      .update(communicationProviders)
      .set({
        totalSent: success ? (provider.totalSent || 0) + 1 : provider.totalSent,
        totalFailed: !success ? (provider.totalFailed || 0) + 1 : provider.totalFailed,
        lastUsed: new Date(),
      })
      .where(eq(communicationProviders.id, id));
  }

  // Communication Log operations
  async getCommunicationLogs(filters?: {
    channel?: string;
    status?: string;
    recipientId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<CommunicationLog[]> {
    const conditions = [];
    if (filters?.channel) conditions.push(eq(communicationLogs.channel, filters.channel));
    if (filters?.status) conditions.push(eq(communicationLogs.status, filters.status));
    if (filters?.recipientId) conditions.push(eq(communicationLogs.recipientId, filters.recipientId));
    if (filters?.startDate) conditions.push(gte(communicationLogs.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(communicationLogs.createdAt, filters.endDate));

    let query = db
      .select()
      .from(communicationLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(communicationLogs.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }

    return await query;
  }

  async getCommunicationLogById(id: string): Promise<CommunicationLog | undefined> {
    const [log] = await db.select().from(communicationLogs).where(eq(communicationLogs.id, id));
    return log;
  }

  async createCommunicationLog(logData: InsertCommunicationLog): Promise<CommunicationLog> {
    const [log] = await db.insert(communicationLogs).values(logData).returning();
    return log;
  }

  async updateCommunicationLogStatus(id: string, status: string, metadata?: any): Promise<CommunicationLog> {
    const updateData: any = {
      status,
      ...(status === 'sent' && { sentAt: new Date() }),
      ...(status === 'delivered' && { deliveredAt: new Date() }),
      ...(status === 'failed' && { failedAt: new Date() }),
      ...(metadata && { deliveryMetadata: metadata }),
    };

    const [updated] = await db
      .update(communicationLogs)
      .set(updateData)
      .where(eq(communicationLogs.id, id))
      .returning();
    return updated;
  }

  // ==================== WAVE 2: FLEET ECONOMICS ====================

  // Vehicle Service Record operations
  async getVehicleServiceRecords(filters?: { vehicleId?: string; serviceType?: string; startDate?: Date; endDate?: Date }): Promise<VehicleServiceRecord[]> {
    const conditions = [];
    if (filters?.vehicleId) conditions.push(eq(vehicleServiceRecords.vehicleId, filters.vehicleId));
    if (filters?.serviceType) conditions.push(eq(vehicleServiceRecords.serviceType, filters.serviceType));
    if (filters?.startDate) conditions.push(gte(vehicleServiceRecords.serviceDate, filters.startDate));
    if (filters?.endDate) conditions.push(lte(vehicleServiceRecords.serviceDate, filters.endDate));

    return await db
      .select()
      .from(vehicleServiceRecords)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vehicleServiceRecords.serviceDate));
  }

  async getVehicleServiceRecordById(id: string): Promise<VehicleServiceRecord | undefined> {
    const [record] = await db.select().from(vehicleServiceRecords).where(eq(vehicleServiceRecords.id, id));
    return record;
  }

  async createVehicleServiceRecord(recordData: InsertVehicleServiceRecord): Promise<VehicleServiceRecord> {
    const [record] = await db.insert(vehicleServiceRecords).values(recordData).returning();
    return record;
  }

  async updateVehicleServiceRecord(id: string, recordData: Partial<InsertVehicleServiceRecord>): Promise<VehicleServiceRecord> {
    const [updated] = await db
      .update(vehicleServiceRecords)
      .set({ ...recordData, updatedAt: new Date() })
      .where(eq(vehicleServiceRecords.id, id))
      .returning();
    return updated;
  }

  async deleteVehicleServiceRecord(id: string): Promise<void> {
    await db.delete(vehicleServiceRecords).where(eq(vehicleServiceRecords.id, id));
  }

  // Rental Rate Plan operations
  async getRentalRatePlans(filters?: { planType?: string; isActive?: boolean; vehicleCategory?: string }): Promise<RentalRatePlan[]> {
    const conditions = [];
    if (filters?.planType) conditions.push(eq(rentalRatePlans.planType, filters.planType));
    if (filters?.isActive !== undefined) conditions.push(eq(rentalRatePlans.isActive, filters.isActive));
    if (filters?.vehicleCategory) conditions.push(eq(rentalRatePlans.vehicleCategory, filters.vehicleCategory));

    return await db
      .select()
      .from(rentalRatePlans)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(rentalRatePlans.createdAt));
  }

  async getRentalRatePlanById(id: string): Promise<RentalRatePlan | undefined> {
    const [plan] = await db.select().from(rentalRatePlans).where(eq(rentalRatePlans.id, id));
    return plan;
  }

  async createRentalRatePlan(planData: InsertRentalRatePlan): Promise<RentalRatePlan> {
    const [plan] = await db.insert(rentalRatePlans).values(planData).returning();
    return plan;
  }

  async updateRentalRatePlan(id: string, planData: Partial<InsertRentalRatePlan>): Promise<RentalRatePlan> {
    const [updated] = await db
      .update(rentalRatePlans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(rentalRatePlans.id, id))
      .returning();
    return updated;
  }

  async deleteRentalRatePlan(id: string): Promise<void> {
    await db.delete(rentalRatePlans).where(eq(rentalRatePlans.id, id));
  }

  // Vehicle Accessory operations
  async getVehicleAccessories(filters?: { category?: string; isActive?: boolean }): Promise<VehicleAccessory[]> {
    const conditions = [];
    if (filters?.category) conditions.push(eq(vehicleAccessories.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(vehicleAccessories.isActive, filters.isActive));

    return await db
      .select()
      .from(vehicleAccessories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vehicleAccessories.createdAt));
  }

  async getVehicleAccessoryById(id: string): Promise<VehicleAccessory | undefined> {
    const [accessory] = await db.select().from(vehicleAccessories).where(eq(vehicleAccessories.id, id));
    return accessory;
  }

  async createVehicleAccessory(accessoryData: InsertVehicleAccessory): Promise<VehicleAccessory> {
    const [accessory] = await db.insert(vehicleAccessories).values(accessoryData).returning();
    return accessory;
  }

  async updateVehicleAccessory(id: string, accessoryData: Partial<InsertVehicleAccessory>): Promise<VehicleAccessory> {
    const [updated] = await db
      .update(vehicleAccessories)
      .set({ ...accessoryData, updatedAt: new Date() })
      .where(eq(vehicleAccessories.id, id))
      .returning();
    return updated;
  }

  async deleteVehicleAccessory(id: string): Promise<void> {
    await db.delete(vehicleAccessories).where(eq(vehicleAccessories.id, id));
  }

  // Contract Accessory operations
  async getContractAccessories(contractId: string): Promise<ContractAccessory[]> {
    return await db
      .select()
      .from(contractAccessories)
      .where(eq(contractAccessories.contractId, contractId))
      .orderBy(desc(contractAccessories.createdAt));
  }

  async getContractAccessoryById(id: string): Promise<ContractAccessory | undefined> {
    const [accessory] = await db.select().from(contractAccessories).where(eq(contractAccessories.id, id));
    return accessory;
  }

  async createContractAccessory(accessoryData: InsertContractAccessory): Promise<ContractAccessory> {
    const [accessory] = await db.insert(contractAccessories).values(accessoryData).returning();
    return accessory;
  }

  async updateContractAccessory(id: string, accessoryData: Partial<InsertContractAccessory>): Promise<ContractAccessory> {
    const [updated] = await db
      .update(contractAccessories)
      .set(accessoryData)
      .where(eq(contractAccessories.id, id))
      .returning();
    return updated;
  }

  async deleteContractAccessory(id: string): Promise<void> {
    await db.delete(contractAccessories).where(eq(contractAccessories.id, id));
  }

  // ==================== WAVE 3: WORKFORCE & AUTOMATION ====================

  // Driver Schedule operations
  async getDriverSchedules(filters?: { driverId?: string; branchId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<DriverSchedule[]> {
    const conditions = [];
    if (filters?.driverId) conditions.push(eq(driverSchedules.driverId, filters.driverId));
    if (filters?.branchId) conditions.push(eq(driverSchedules.branchId, filters.branchId));
    if (filters?.status) conditions.push(eq(driverSchedules.status, filters.status));
    if (filters?.startDate) conditions.push(gte(driverSchedules.scheduleDate, filters.startDate));
    if (filters?.endDate) conditions.push(lte(driverSchedules.scheduleDate, filters.endDate));

    return await db
      .select()
      .from(driverSchedules)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(driverSchedules.scheduleDate));
  }

  async getDriverScheduleById(id: string): Promise<DriverSchedule | undefined> {
    const [schedule] = await db.select().from(driverSchedules).where(eq(driverSchedules.id, id));
    return schedule;
  }

  async createDriverSchedule(scheduleData: InsertDriverSchedule): Promise<DriverSchedule> {
    const [schedule] = await db.insert(driverSchedules).values(scheduleData).returning();
    return schedule;
  }

  async updateDriverSchedule(id: string, scheduleData: Partial<InsertDriverSchedule>): Promise<DriverSchedule> {
    const [updated] = await db
      .update(driverSchedules)
      .set({ ...scheduleData, updatedAt: new Date() })
      .where(eq(driverSchedules.id, id))
      .returning();
    return updated;
  }

  async deleteDriverSchedule(id: string): Promise<void> {
    await db.delete(driverSchedules).where(eq(driverSchedules.id, id));
  }

  // Driver Attendance operations
  async getDriverAttendance(filters?: { driverId?: string; scheduleId?: string; startDate?: Date; endDate?: Date }): Promise<DriverAttendance[]> {
    const conditions = [];
    if (filters?.driverId) conditions.push(eq(driverAttendance.driverId, filters.driverId));
    if (filters?.scheduleId) conditions.push(eq(driverAttendance.scheduleId, filters.scheduleId));
    if (filters?.startDate) conditions.push(gte(driverAttendance.checkIn, filters.startDate));
    if (filters?.endDate) conditions.push(lte(driverAttendance.checkIn, filters.endDate));

    return await db
      .select()
      .from(driverAttendance)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(driverAttendance.checkIn));
  }

  async getDriverAttendanceById(id: string): Promise<DriverAttendance | undefined> {
    const [attendance] = await db.select().from(driverAttendance).where(eq(driverAttendance.id, id));
    return attendance;
  }

  async createDriverAttendance(attendanceData: InsertDriverAttendance): Promise<DriverAttendance> {
    const [attendance] = await db.insert(driverAttendance).values(attendanceData).returning();
    return attendance;
  }

  async updateDriverAttendance(id: string, attendanceData: Partial<InsertDriverAttendance>): Promise<DriverAttendance> {
    const [updated] = await db
      .update(driverAttendance)
      .set(attendanceData)
      .where(eq(driverAttendance.id, id))
      .returning();
    return updated;
  }

  async checkOutDriver(id: string): Promise<DriverAttendance> {
    const attendance = await this.getDriverAttendanceById(id);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn);
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    
    const [updated] = await db
      .update(driverAttendance)
      .set({
        checkOut: checkOutTime,
        hoursWorked: hoursWorked.toFixed(2),
      })
      .where(eq(driverAttendance.id, id))
      .returning();
    return updated;
  }

  async deleteDriverAttendance(id: string): Promise<void> {
    await db.delete(driverAttendance).where(eq(driverAttendance.id, id));
  }

  // Automated Reminder operations
  async getAutomatedReminders(filters?: { entityType?: string; entityId?: string; reminderType?: string; isSent?: boolean; isActive?: boolean }): Promise<AutomatedReminder[]> {
    const conditions = [];
    if (filters?.entityType) conditions.push(eq(automatedReminders.entityType, filters.entityType));
    if (filters?.entityId) conditions.push(eq(automatedReminders.entityId, filters.entityId));
    if (filters?.reminderType) conditions.push(eq(automatedReminders.reminderType, filters.reminderType));
    if (filters?.isSent !== undefined) conditions.push(eq(automatedReminders.isSent, filters.isSent));
    if (filters?.isActive !== undefined) conditions.push(eq(automatedReminders.isActive, filters.isActive));

    return await db
      .select()
      .from(automatedReminders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(automatedReminders.reminderDate));
  }

  async getAutomatedReminderById(id: string): Promise<AutomatedReminder | undefined> {
    const [reminder] = await db.select().from(automatedReminders).where(eq(automatedReminders.id, id));
    return reminder;
  }

  async createAutomatedReminder(reminderData: InsertAutomatedReminder): Promise<AutomatedReminder> {
    const [reminder] = await db.insert(automatedReminders).values(reminderData).returning();
    return reminder;
  }

  async updateAutomatedReminder(id: string, reminderData: Partial<InsertAutomatedReminder>): Promise<AutomatedReminder> {
    const [updated] = await db
      .update(automatedReminders)
      .set({ ...reminderData, updatedAt: new Date() })
      .where(eq(automatedReminders.id, id))
      .returning();
    return updated;
  }

  async markReminderAsSent(id: string): Promise<AutomatedReminder> {
    const [updated] = await db
      .update(automatedReminders)
      .set({
        isSent: true,
        sentTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(automatedReminders.id, id))
      .returning();
    return updated;
  }

  async deleteAutomatedReminder(id: string): Promise<void> {
    await db.delete(automatedReminders).where(eq(automatedReminders.id, id));
  }

  // Approval Request operations
  async getApprovalRequests(filters?: { entityType?: string; requestedBy?: string; status?: string; requiredLevel?: string }): Promise<ApprovalRequest[]> {
    const conditions = [];
    if (filters?.entityType) conditions.push(eq(approvalRequests.entityType, filters.entityType));
    if (filters?.requestedBy) conditions.push(eq(approvalRequests.requestedBy, filters.requestedBy));
    if (filters?.status) conditions.push(eq(approvalRequests.status, filters.status));
    if (filters?.requiredLevel) conditions.push(eq(approvalRequests.requiredLevel, filters.requiredLevel));

    return await db
      .select()
      .from(approvalRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(approvalRequests.createdAt));
  }

  async getApprovalRequestById(id: string): Promise<ApprovalRequest | undefined> {
    const [request] = await db.select().from(approvalRequests).where(eq(approvalRequests.id, id));
    return request;
  }

  async createApprovalRequest(requestData: InsertApprovalRequest): Promise<ApprovalRequest> {
    const [request] = await db.insert(approvalRequests).values(requestData).returning();
    return request;
  }

  async approveRequest(id: string, approvedBy: string): Promise<ApprovalRequest> {
    const [updated] = await db
      .update(approvalRequests)
      .set({
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, id))
      .returning();
    return updated;
  }

  async rejectRequest(id: string, rejectedBy: string, rejectionReason: string): Promise<ApprovalRequest> {
    const [updated] = await db
      .update(approvalRequests)
      .set({
        status: 'rejected',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, id))
      .returning();
    return updated;
  }

  async deleteApprovalRequest(id: string): Promise<void> {
    await db.delete(approvalRequests).where(eq(approvalRequests.id, id));
  }

  // Approval Log operations
  async getApprovalLogs(approvalId: string): Promise<ApprovalLog[]> {
    return await db
      .select()
      .from(approvalLogs)
      .where(eq(approvalLogs.approvalId, approvalId))
      .orderBy(desc(approvalLogs.actionDate));
  }

  async createApprovalLog(logData: InsertApprovalLog): Promise<ApprovalLog> {
    const [log] = await db.insert(approvalLogs).values(logData).returning();
    return log;
  }

  // Customer Risk Score operations
  async getCustomerRiskScores(customerId: string): Promise<CustomerRiskScore[]> {
    return await db
      .select()
      .from(customerRiskScores)
      .where(eq(customerRiskScores.customerId, customerId))
      .orderBy(desc(customerRiskScores.scoringDate));
  }

  async getLatestCustomerRiskScore(customerId: string): Promise<CustomerRiskScore | undefined> {
    const [score] = await db
      .select()
      .from(customerRiskScores)
      .where(eq(customerRiskScores.customerId, customerId))
      .orderBy(desc(customerRiskScores.scoringDate))
      .limit(1);
    return score;
  }

  async createCustomerRiskScore(scoreData: InsertCustomerRiskScore): Promise<CustomerRiskScore> {
    const [score] = await db.insert(customerRiskScores).values(scoreData).returning();
    return score;
  }


  // ==================== BULK IMPORT OPERATIONS ====================

  async importCustomers(records: InsertCustomer[]): Promise<Customer[]> {
    const imported: Customer[] = [];
    for (const record of records) {
      try {
        const customer = await this.createCustomer(record);
        imported.push(customer);
      } catch (error) {
        console.error(`Failed to import customer:`, error);
      }
    }
    return imported;
  }

  async importVehicles(records: InsertVehicle[]): Promise<Vehicle[]> {
    const imported: Vehicle[] = [];
    for (const record of records) {
      try {
        const vehicle = await this.createVehicle(record);
        imported.push(vehicle);
      } catch (error) {
        console.error(`Failed to import vehicle:`, error);
      }
    }
    return imported;
  }

  async importSponsors(records: InsertSponsor[]): Promise<Sponsor[]> {
    const imported: Sponsor[] = [];
    for (const record of records) {
      try {
        const sponsor = await this.createSponsor(record);
        imported.push(sponsor);
      } catch (error) {
        console.error(`Failed to import sponsor:`, error);
      }
    }
    return imported;
  }

  async importCompanies(records: InsertCompany[]): Promise<Company[]> {
    const imported: Company[] = [];
    for (const record of records) {
      try {
        const company = await this.createCompany(record);
        imported.push(company);
      } catch (error) {
        console.error(`Failed to import company:`, error);
      }
    }
    return imported;
  }

  async importContracts(records: InsertContract[]): Promise<Contract[]> {
    const imported: Contract[] = [];
    for (const record of records) {
      try {
        const contract = await this.createContract(record);
        imported.push(contract);
      } catch (error) {
        console.error(`Failed to import contract:`, error);
      }
    }
    return imported;
  }
}

export const storage = new DatabaseStorage();

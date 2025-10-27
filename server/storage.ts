import {
  users,
  contracts,
  auditLogs,
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
  type User,
  type UpsertUser,
  type Contract,
  type ContractWithDetails,
  type InsertContract,
  type InsertAuditLog,
  type AuditLog,
  type InsertContractEdit,
  type ContractEdit,
  type SystemError,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, like, sql, and, not, lt, gt, ne, ilike } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Internal authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getDisabledUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  updateUserPassword(userId: string, passwordHash: string): Promise<User>;
  disableUser(userId: string, disabledBy: string): Promise<User>;
  enableUser(userId: string): Promise<User>;
  
  // Contract operations
  getContract(id: string): Promise<Contract | undefined>;
  getAllContracts(): Promise<ContractWithDetails[]>;
  getDisabledContracts(): Promise<ContractWithDetails[]>;
  searchContracts(query: string): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract>;
  // Legacy finalizeContract removed - use confirmContract instead
  disableContract(id: string, userId: string): Promise<Contract>;
  enableContract(id: string): Promise<Contract>;
  
  // Contract counter
  getNextContractNumber(): Promise<number>;
  
  // Customer operations
  getCustomers(includeDisabled?: boolean): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  disableCustomer(id: string, disabledBy: string): Promise<void>;
  enableCustomer(id: string): Promise<void>;
  searchCustomers(query: string): Promise<Customer[]>;
  
  // Vehicle operations
  getVehicles(includeDisabled?: boolean): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  disableVehicle(id: string, disabledBy: string): Promise<void>;
  enableVehicle(id: string): Promise<void>;
  checkVehicleAvailability(vehicleId: string, startDate: Date, endDate: Date, excludeContractId?: string): Promise<boolean>;
  searchVehicles(query: string): Promise<Vehicle[]>;
  
  // Sponsor operations (individual sponsors)
  getSponsors(includeDisabled?: boolean): Promise<Sponsor[]>;
  getSponsorById(id: string): Promise<Sponsor | undefined>;
  createSponsor(sponsor: InsertSponsor): Promise<Sponsor>;
  updateSponsor(id: string, sponsor: Partial<InsertSponsor>): Promise<Sponsor>;
  disableSponsor(id: string, disabledBy: string): Promise<void>;
  enableSponsor(id: string): Promise<void>;
  searchSponsors(query: string): Promise<Sponsor[]>;
  
  // Company operations (corporate sponsors)
  getCompanies(includeDisabled?: boolean): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
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
  getVehicleInspectionsByContract(contractId: string): Promise<VehicleInspection[]>;
  getVehicleInspection(id: string): Promise<VehicleInspection | undefined>;
  
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
  getAllSystemErrors(): Promise<SystemError[]>;
  getUnacknowledgedSystemErrors(): Promise<SystemError[]>;
  acknowledgeSystemError(id: string, acknowledgedBy: string): Promise<SystemError>;
  
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
  
  // Company settings operations
  getCompanySettings(): Promise<CompanySettings>;
  updateCompanySettings(settings: Partial<InsertCompanySettings>, updatedBy: string): Promise<CompanySettings>;
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
        ...contracts,
        customerNameEn: customers.nameEn,
        customerNameAr: customers.nameAr,
        vehicleRegistration: vehicles.registration,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        sponsor: sponsors,
        companySponsor: companies,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .leftJoin(sponsors, eq(contracts.sponsorId, sponsors.id))
      .leftJoin(companies, eq(contracts.companySponsorId, companies.id))
      .where(eq(contracts.id, id));
    
    return result as ContractWithDetails | undefined;
  }

  async getAllContracts(): Promise<ContractWithDetails[]> {
    const results = await db
      .select({
        ...contracts,
        customerNameEn: customers.nameEn,
        customerNameAr: customers.nameAr,
        vehicleRegistration: vehicles.registration,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        sponsor: sponsors,
        companySponsor: companies,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .leftJoin(sponsors, eq(contracts.sponsorId, sponsors.id))
      .leftJoin(companies, eq(contracts.companySponsorId, companies.id))
      .where(eq(contracts.disabled, false))
      .orderBy(desc(contracts.createdAt));
    
    return results as ContractWithDetails[];
  }

  async getDisabledContracts(): Promise<ContractWithDetails[]> {
    const results = await db
      .select({
        ...contracts,
        customerNameEn: customers.nameEn,
        customerNameAr: customers.nameAr,
        vehicleRegistration: vehicles.registration,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        sponsor: sponsors,
        companySponsor: companies,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
      .leftJoin(sponsors, eq(contracts.sponsorId, sponsors.id))
      .leftJoin(companies, eq(contracts.companySponsorId, companies.id))
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

  async createContract(contract: InsertContract): Promise<Contract> {
    const contractNumber = await this.getNextContractNumber();
    
    const [newContract] = await db
      .insert(contracts)
      .values({
        ...contract,
        contractNumber,
      })
      .returning();
    
    return newContract;
  }

  async updateContract(id: string, contractData: Partial<InsertContract>): Promise<Contract> {
    const [updated] = await db
      .update(contracts)
      .set({
        ...contractData,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return updated;
  }

  // Legacy finalizeContract method removed - use new state machine methods below

  // Phase 2.1: State transition methods
  async confirmContract(id: string, userId: string): Promise<Contract> {
    const [confirmed] = await db
      .update(contracts)
      .set({
        status: 'confirmed',
        confirmedBy: userId,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return confirmed;
  }

  async activateContract(id: string, userId: string): Promise<Contract> {
    const [activated] = await db
      .update(contracts)
      .set({
        status: 'active',
        activatedBy: userId,
        activatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return activated;
  }

  async completeContract(id: string, userId: string, chargeData: {
    extraKmCharge?: string;
    extraKmDriven?: number;
    fuelCharge?: string;
    damageCharge?: string;
    otherCharges?: string;
    totalExtraCharges?: string;
    outstandingBalance?: string;
  }): Promise<Contract> {
    const [completed] = await db
      .update(contracts)
      .set({
        status: 'completed',
        completedBy: userId,
        completedAt: new Date(),
        ...chargeData,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return completed;
  }

  async closeContract(id: string, userId: string): Promise<Contract> {
    const [closed] = await db
      .update(contracts)
      .set({
        status: 'closed',
        closedBy: userId,
        closedAt: new Date(),
        paymentStatus: 'paid', // Mark as fully paid when closing
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
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

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer as any).returning();
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

  async searchCustomers(query: string): Promise<Customer[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(customers)
      .where(
        or(
          ilike(customers.nameEn, searchTerm),
          ilike(customers.nameAr, searchTerm),
          ilike(customers.phone, searchTerm),
          ilike(customers.nationalId, searchTerm)
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

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle as any).returning();
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

  async checkVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    excludeContractId?: string
  ): Promise<boolean> {
    const baseConditions = and(
      eq(contracts.vehicleId, vehicleId),
      or(
        eq(contracts.status, 'confirmed'),
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
        or(
          ilike(vehicles.registration, searchTerm),
          ilike(vehicles.make, searchTerm),
          ilike(vehicles.model, searchTerm)
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

  async createSponsor(sponsorData: InsertSponsor): Promise<Sponsor> {
    const [sponsor] = await db.insert(sponsors).values(sponsorData).returning();
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

  async searchSponsors(query: string): Promise<Sponsor[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(sponsors)
      .where(
        or(
          ilike(sponsors.nameEn, searchTerm),
          ilike(sponsors.nameAr, searchTerm),
          ilike(sponsors.passportId, searchTerm),
          ilike(sponsors.mobile, searchTerm)
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

  async createCompany(companyData: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(companyData).returning();
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

  async searchCompanies(query: string): Promise<Company[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(companies)
      .where(
        or(
          ilike(companies.nameEn, searchTerm),
          ilike(companies.nameAr, searchTerm),
          ilike(companies.registrationNumber, searchTerm),
          ilike(companies.taxId, searchTerm),
          ilike(companies.contactPerson, searchTerm),
          ilike(companies.phone, searchTerm)
        )
      )
      .orderBy(desc(companies.createdAt));
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
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
  async createVehicleInspection(inspectionData: InsertVehicleInspection): Promise<VehicleInspection> {
    const [inspection] = await db
      .insert(vehicleInspections)
      .values(inspectionData)
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

  // System error operations
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

  // Analytics operations
  async getRevenueAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get all contracts with revenue (confirmed, active, completed, closed - not draft)
    const allContracts = await db.select().from(contracts);
    const revenueContracts = allContracts.filter(c => 
      c.status === 'confirmed' || c.status === 'active' || c.status === 'completed' || c.status === 'closed'
    );

    // Calculate total revenue including extra charges
    const totalRevenue = revenueContracts.reduce((sum, contract) => {
      const amount = parseFloat(contract.totalAmount) || 0;
      const extras = parseFloat(contract.totalExtraCharges || '0') || 0;
      return sum + amount + extras;
    }, 0);

    // Calculate average contract value
    const averageContractValue = revenueContracts.length > 0 
      ? totalRevenue / revenueContracts.length 
      : 0;

    // Calculate monthly revenue (based on createdAt for this month)
    const monthlyRevenue = revenueContracts
      .filter(contract => contract.createdAt && new Date(contract.createdAt) >= startOfMonth)
      .reduce((sum, contract) => {
        const amount = parseFloat(contract.totalAmount) || 0;
        const extras = parseFloat(contract.totalExtraCharges || '0') || 0;
        return sum + amount + extras;
      }, 0);

    // Calculate last month revenue
    const lastMonthRevenue = revenueContracts
      .filter(contract => {
        if (!contract.createdAt) return false;
        const date = new Date(contract.createdAt);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      })
      .reduce((sum, contract) => {
        const amount = parseFloat(contract.totalAmount) || 0;
        const extras = parseFloat(contract.totalExtraCharges || '0') || 0;
        return sum + amount + extras;
      }, 0);

    // Calculate growth percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      averageContractValue,
      monthlyRevenue,
      lastMonthRevenue,
      revenueGrowth,
    };
  }

  async getOperationalAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get all contracts
    const allContracts = await db.select().from(contracts);

    // Calculate average rental duration
    const totalDays = allContracts.reduce((sum, contract) => sum + (contract.totalDays || 0), 0);
    const averageRentalDuration = allContracts.length > 0 ? totalDays / allContracts.length : 0;

    // Count contracts this month
    const contractsThisMonth = allContracts.filter(
      contract => contract.createdAt && new Date(contract.createdAt) >= startOfMonth
    ).length;

    // Count contracts last month
    const contractsLastMonth = allContracts.filter(contract => {
      if (!contract.createdAt) return false;
      const date = new Date(contract.createdAt);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    }).length;

    // Calculate growth
    const contractGrowth = contractsLastMonth > 0 
      ? ((contractsThisMonth - contractsLastMonth) / contractsLastMonth) * 100 
      : 0;

    // Find most active user
    const userCounts = new Map<string, number>();
    allContracts.forEach(contract => {
      const count = userCounts.get(contract.createdBy) || 0;
      userCounts.set(contract.createdBy, count + 1);
    });

    let mostActiveUser: { name: string; count: number } | null = null;
    let maxCount = 0;
    for (const [userId, count] of Array.from(userCounts.entries())) {
      if (count > maxCount) {
        const user = await this.getUser(userId);
        if (user) {
          mostActiveUser = {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
            count
          };
          maxCount = count;
        }
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

    // Get all contracts
    const allContracts = await db.select().from(contracts);

    // Count unique customers by customerId
    const customerIds = new Set(allContracts.map(c => c.customerId));
    const totalCustomers = customerIds.size;

    // Count repeat customers (customers with 2+ contracts)
    const customerContractCounts = new Map<string, number>();
    allContracts.forEach(contract => {
      const customerId = contract.customerId;
      customerContractCounts.set(customerId, (customerContractCounts.get(customerId) || 0) + 1);
    });

    const repeatCustomers = Array.from(customerContractCounts.values()).filter(count => count >= 2).length;
    const repeatCustomerRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    // Count new customers this month (customers whose first contract was this month)
    const customersThisMonth = new Set(
      allContracts
        .filter(contract => contract.createdAt && new Date(contract.createdAt) >= startOfMonth)
        .map(c => c.customerId)
    );

    // Find customers who only appear in contracts created this month
    const newCustomersThisMonth = Array.from(customersThisMonth).filter(customerId => {
      const allCustomerContracts = allContracts.filter(c => c.customerId === customerId);
      return allCustomerContracts.every(c => c.createdAt && new Date(c.createdAt) >= startOfMonth);
    }).length;

    return {
      totalCustomers,
      repeatCustomers,
      repeatCustomerRate,
      newCustomersThisMonth,
    };
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

    // Revenue contracts (only active, completed, and closed - these have earned revenue)
    // CRITICAL FIX: Exclude 'confirmed' status - those haven't started yet
    const revenueContracts = filteredContracts.filter(c => 
      c.status === 'active' || c.status === 'completed' || c.status === 'closed'
    );

    // Total revenue (contract amount + extra charges)
    const totalRevenue = revenueContracts.reduce((sum, c) => {
      return sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0');
    }, 0);
    
    // All-time revenue (no date filter) - only active, completed, closed
    const allTimeRevenue = allContracts
      .filter(c => c.status === 'active' || c.status === 'completed' || c.status === 'closed')
      .reduce((sum, c) => sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0'), 0);

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
      return sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0');
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
      confirmed: 0,
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

    // Recent payments (last 10)
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
      .slice(0, 10)
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
    // Active contracts are still ongoing, confirmed haven't started yet
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
        .reduce((sum, c) => sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges || '0'), 0);
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
      confirmed: filteredContracts.filter(c => c.status === 'confirmed').length,
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

    // Audit logs (all CRUD actions)
    const allAuditLogs = await this.getAllAuditLogs();
    const filteredAuditLogs = allAuditLogs.filter(log => {
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
    const allUserIds = new Set([...modificationUserIds, ...auditLogUserIds]);
    
    const usersData = await Promise.all(
      Array.from(allUserIds).map(id => this.getUser(id))
    );
    const userMap = new Map(usersData.filter(u => u).map(u => [u!.id, `${u!.firstName || ''} ${u!.lastName || ''}`.trim() || u!.username]));

    const modificationsWithUser = filteredModifications.map(m => ({
      ...m,
      userName: userMap.get(m.editedBy) || 'Unknown',
    }));

    // CRITICAL FIX: Add summary statistics for audit report
    const uniqueContracts = new Set(filteredModifications.map(m => m.contractId));
    const totalModifications = filteredModifications.length;
    const avgModificationsPerContract = uniqueContracts.size > 0 
      ? totalModifications / uniqueContracts.size 
      : 0;
    
    // Most frequently modified contracts
    const contractModCounts = new Map<number, number>();
    filteredModifications.forEach(m => {
      contractModCounts.set(m.contractId, (contractModCounts.get(m.contractId) || 0) + 1);
    });
    
    const mostModifiedContracts = Array.from(contractModCounts.entries())
      .map(([contractId, count]) => ({ contractId, modificationCount: count }))
      .sort((a, b) => b.modificationCount - a.modificationCount)
      .slice(0, 10); // Top 10
    
    // User activity breakdown - COMPLETE VERSION: Count from BOTH modifications AND audit logs
    const userActivityMap = new Map<string, { modifications: number; auditActions: number; total: number }>();
    
    // Count modifications
    filteredModifications.forEach(m => {
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

    return {
      summary: {
        totalModifications,
        totalAuditLogs: filteredAuditLogs.length,
        uniqueContracts: uniqueContracts.size,
        avgModificationsPerContract,
        activeUsers: allUserIds.size, // Total users from both modifications and audit logs
      },
      modifications: modificationsWithUser.sort((a, b) => {
        const aTime = a.editedAt ? new Date(a.editedAt).getTime() : 0;
        const bTime = b.editedAt ? new Date(b.editedAt).getTime() : 0;
        return bTime - aTime;
      }),
      auditLogs: filteredAuditLogs,
      userActivity,
      mostModifiedContracts,
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
}

export const storage = new DatabaseStorage();

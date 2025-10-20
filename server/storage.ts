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
  persons,
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
  type Person,
  type InsertPerson,
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
  
  // Person operations (sponsors/drivers)
  getPersons(includeDisabled?: boolean): Promise<Person[]>;
  getPersonById(id: string): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: string, person: Partial<InsertPerson>): Promise<Person>;
  disablePerson(id: string, disabledBy: string): Promise<void>;
  enablePerson(id: string): Promise<void>;
  searchPersons(query: string): Promise<Person[]>;
  
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

  async getAllContracts(): Promise<ContractWithDetails[]> {
    const results = await db
      .select({
        ...contracts,
        customerNameEn: customers.nameEn,
        customerNameAr: customers.nameAr,
        vehicleRegistration: vehicles.registration,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
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
      })
      .from(contracts)
      .leftJoin(customers, eq(contracts.customerId, customers.id))
      .leftJoin(vehicles, eq(contracts.vehicleId, vehicles.id))
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

  // Person operations (sponsors/drivers)
  async getPersons(includeDisabled = false): Promise<Person[]> {
    if (includeDisabled) {
      return await db.select().from(persons).orderBy(desc(persons.createdAt));
    }
    return await db.select().from(persons).where(eq(persons.disabled, false)).orderBy(desc(persons.createdAt));
  }

  async getPersonById(id: string): Promise<Person | undefined> {
    const [person] = await db.select().from(persons).where(eq(persons.id, id));
    return person;
  }

  async createPerson(personData: InsertPerson): Promise<Person> {
    const [person] = await db.insert(persons).values(personData).returning();
    return person;
  }

  async updatePerson(id: string, personData: Partial<InsertPerson>): Promise<Person> {
    const [person] = await db
      .update(persons)
      .set({ ...personData, updatedAt: new Date() })
      .where(eq(persons.id, id))
      .returning();
    return person;
  }

  async disablePerson(id: string, disabledBy: string): Promise<void> {
    await db
      .update(persons)
      .set({
        disabled: true,
        disabledBy,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(persons.id, id));
  }

  async enablePerson(id: string): Promise<void> {
    await db
      .update(persons)
      .set({
        disabled: false,
        disabledBy: null,
        disabledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(persons.id, id));
  }

  async searchPersons(query: string): Promise<Person[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(persons)
      .where(
        or(
          ilike(persons.nameEn, searchTerm),
          ilike(persons.nameAr, searchTerm),
          ilike(persons.passportId, searchTerm),
          ilike(persons.mobile, searchTerm)
        )
      )
      .orderBy(desc(persons.createdAt));
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

    // Get all finalized contracts
    const finalizedContracts = await db
      .select()
      .from(contracts)
      .where(eq(contracts.status, 'finalized'));

    // Calculate total revenue
    const totalRevenue = finalizedContracts.reduce((sum, contract) => {
      const amount = parseFloat(contract.totalAmount) || 0;
      return sum + amount;
    }, 0);

    // Calculate average contract value
    const averageContractValue = finalizedContracts.length > 0 
      ? totalRevenue / finalizedContracts.length 
      : 0;

    // Calculate monthly revenue (this month)
    const monthlyRevenue = finalizedContracts
      .filter(contract => contract.finalizedAt && new Date(contract.finalizedAt) >= startOfMonth)
      .reduce((sum, contract) => sum + (parseFloat(contract.totalAmount) || 0), 0);

    // Calculate last month revenue
    const lastMonthRevenue = finalizedContracts
      .filter(contract => {
        if (!contract.finalizedAt) return false;
        const date = new Date(contract.finalizedAt);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      })
      .reduce((sum, contract) => sum + (parseFloat(contract.totalAmount) || 0), 0);

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

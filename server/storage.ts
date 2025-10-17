import {
  users,
  contracts,
  auditLogs,
  contractCounter,
  systemErrors,
  type User,
  type UpsertUser,
  type Contract,
  type InsertContract,
  type InsertAuditLog,
  type AuditLog,
  type SystemError,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, like, sql } from "drizzle-orm";

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
  getAllContracts(): Promise<Contract[]>;
  getDisabledContracts(): Promise<Contract[]>;
  searchContracts(query: string): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract>;
  finalizeContract(id: string, userId: string): Promise<Contract>;
  disableContract(id: string, userId: string): Promise<Contract>;
  enableContract(id: string): Promise<Contract>;
  
  // Contract counter
  getNextContractNumber(): Promise<number>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAllAuditLogs(): Promise<AuditLog[]>;
  getRecentAuditLogs(limit: number): Promise<AuditLog[]>;
  
  // System error operations
  getAllSystemErrors(): Promise<SystemError[]>;
  getUnacknowledgedSystemErrors(): Promise<SystemError[]>;
  acknowledgeSystemError(id: string, acknowledgedBy: string): Promise<SystemError>;
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

  async getAllContracts(): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.disabled, false)).orderBy(desc(contracts.createdAt));
  }

  async getDisabledContracts(): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.disabled, true)).orderBy(desc(contracts.disabledAt));
  }

  async searchContracts(query: string): Promise<Contract[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(contracts)
      .where(
        or(
          like(sql`CAST(${contracts.contractNumber} AS TEXT)`, searchTerm),
          like(contracts.customerNameEn, searchTerm),
          like(contracts.customerNameAr, searchTerm)
        )
      )
      .orderBy(desc(contracts.createdAt));
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

  async finalizeContract(id: string, userId: string): Promise<Contract> {
    const [finalized] = await db
      .update(contracts)
      .set({
        status: 'finalized',
        finalizedBy: userId,
        finalizedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return finalized;
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

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    
    return newLog;
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  async getRecentAuditLogs(limit: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
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
}

export const storage = new DatabaseStorage();

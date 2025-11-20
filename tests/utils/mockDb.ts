/**
 * Mock Database for Integration Tests
 * In-memory storage implementation for testing business logic without real database
 */

import type {
  InsertUser, User,
  InsertCustomer, Customer,
  InsertVehicle, Vehicle,
  InsertContract, Contract,
  InsertPayment, Payment,
  InsertBranch, Branch,
} from '../../shared/schema';

/**
 * Mock Database State
 */
interface MockDbState {
  users: Map<string, User>;
  customers: Map<string, Customer>;
  vehicles: Map<string, Vehicle>;
  contracts: Map<string, Contract>;
  payments: Map<string, Payment>;
  branches: Map<string, Branch>;
}

/**
 * Create fresh mock database instance
 */
export function createMockDb(): MockDbState {
  return {
    users: new Map(),
    customers: new Map(),
    vehicles: new Map(),
    contracts: new Map(),
    payments: new Map(),
    branches: new Map(),
  };
}

let mockDb: MockDbState = createMockDb();

/**
 * Reset mock database - call in beforeEach()
 */
export function resetMockDb(): void {
  mockDb = createMockDb();
}

/**
 * Get current mock database state
 */
export function getMockDb(): MockDbState {
  return mockDb;
}

/**
 * Mock User Operations
 */
export const mockUserOps = {
  create: (user: InsertUser): User => {
    const newUser: User = {
      ...user,
      createdAt: user.createdAt || new Date(),
      updatedAt: new Date(),
    };
    mockDb.users.set(newUser.id, newUser);
    return newUser;
  },

  findById: (id: string): User | undefined => {
    return mockDb.users.get(id);
  },

  findByUsername: (username: string): User | undefined => {
    return Array.from(mockDb.users.values()).find(u => u.username === username);
  },

  findAll: (): User[] => {
    return Array.from(mockDb.users.values());
  },

  update: (id: string, updates: Partial<User>): User | undefined => {
    const user = mockDb.users.get(id);
    if (!user) return undefined;
    const updated: User = { ...user, ...updates, updatedAt: new Date() };
    mockDb.users.set(id, updated);
    return updated;
  },

  delete: (id: string): boolean => {
    return mockDb.users.delete(id);
  },
};

/**
 * Mock Customer Operations
 */
export const mockCustomerOps = {
  create: (customer: InsertCustomer): Customer => {
    const newCustomer: Customer = {
      ...customer,
      createdAt: customer.createdAt || new Date(),
      updatedAt: new Date(),
    };
    mockDb.customers.set(newCustomer.id, newCustomer);
    return newCustomer;
  },

  findById: (id: string): Customer | undefined => {
    return mockDb.customers.get(id);
  },

  findAll: (): Customer[] => {
    return Array.from(mockDb.customers.values());
  },

  update: (id: string, updates: Partial<Customer>): Customer | undefined => {
    const customer = mockDb.customers.get(id);
    if (!customer) return undefined;
    const updated: Customer = { ...customer, ...updates, updatedAt: new Date() };
    mockDb.customers.set(id, updated);
    return updated;
  },
};

/**
 * Mock Vehicle Operations
 */
export const mockVehicleOps = {
  create: (vehicle: InsertVehicle): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicle,
      createdAt: vehicle.createdAt || new Date(),
      updatedAt: new Date(),
    };
    mockDb.vehicles.set(newVehicle.id, newVehicle);
    return newVehicle;
  },

  findById: (id: string): Vehicle | undefined => {
    return mockDb.vehicles.get(id);
  },

  findAll: (): Vehicle[] => {
    return Array.from(mockDb.vehicles.values());
  },

  findByStatus: (status: string): Vehicle[] => {
    return Array.from(mockDb.vehicles.values()).filter(v => v.status === status);
  },

  update: (id: string, updates: Partial<Vehicle>): Vehicle | undefined => {
    const vehicle = mockDb.vehicles.get(id);
    if (!vehicle) return undefined;
    const updated: Vehicle = { ...vehicle, ...updates, updatedAt: new Date() };
    mockDb.vehicles.set(id, updated);
    return updated;
  },
};

/**
 * Mock Contract Operations
 */
export const mockContractOps = {
  create: (contract: InsertContract): Contract => {
    const newContract: Contract = {
      ...contract,
      createdAt: contract.createdAt || new Date(),
      updatedAt: new Date(),
    };
    mockDb.contracts.set(newContract.id, newContract);
    return newContract;
  },

  findById: (id: string): Contract | undefined => {
    return mockDb.contracts.get(id);
  },

  findAll: (): Contract[] => {
    return Array.from(mockDb.contracts.values());
  },

  findByCustomer: (customerId: string): Contract[] => {
    return Array.from(mockDb.contracts.values()).filter(c => c.customerId === customerId);
  },

  findByVehicle: (vehicleId: string): Contract[] => {
    return Array.from(mockDb.contracts.values()).filter(c => c.vehicleId === vehicleId);
  },

  findByStatus: (status: string): Contract[] => {
    return Array.from(mockDb.contracts.values()).filter(c => c.status === status);
  },

  update: (id: string, updates: Partial<Contract>): Contract | undefined => {
    const contract = mockDb.contracts.get(id);
    if (!contract) return undefined;
    const updated: Contract = { ...contract, ...updates, updatedAt: new Date() };
    mockDb.contracts.set(id, updated);
    return updated;
  },
};

/**
 * Mock Payment Operations
 */
export const mockPaymentOps = {
  create: (payment: InsertPayment): Payment => {
    const newPayment: Payment = {
      ...payment,
      createdAt: payment.createdAt || new Date(),
      updatedAt: new Date(),
    };
    mockDb.payments.set(newPayment.id, newPayment);
    return newPayment;
  },

  findById: (id: string): Payment | undefined => {
    return mockDb.payments.get(id);
  },

  findByContract: (contractId: string): Payment[] => {
    return Array.from(mockDb.payments.values()).filter(p => p.contractId === contractId);
  },

  findAll: (): Payment[] => {
    return Array.from(mockDb.payments.values());
  },

  getTotalPaid: (contractId: string): number => {
    const payments = mockPaymentOps.findByContract(contractId);
    return payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  },
};

/**
 * Mock Branch Operations
 */
export const mockBranchOps = {
  create: (branch: InsertBranch): Branch => {
    const newBranch: Branch = {
      ...branch,
      createdAt: branch.createdAt || new Date(),
      updatedAt: new Date(),
    };
    mockDb.branches.set(newBranch.id, newBranch);
    return newBranch;
  },

  findById: (id: string): Branch | undefined => {
    return mockDb.branches.get(id);
  },

  findAll: (): Branch[] => {
    return Array.from(mockDb.branches.values());
  },
};

/**
 * Bulk operations
 */
export const mockBulkOps = {
  createUsers: (users: InsertUser[]): User[] => {
    return users.map(u => mockUserOps.create(u));
  },

  createCustomers: (customers: InsertCustomer[]): Customer[] => {
    return customers.map(c => mockCustomerOps.create(c));
  },

  createVehicles: (vehicles: InsertVehicle[]): Vehicle[] => {
    return vehicles.map(v => mockVehicleOps.create(v));
  },

  createContracts: (contracts: InsertContract[]): Contract[] => {
    return contracts.map(c => mockContractOps.create(c));
  },

  createPayments: (payments: InsertPayment[]): Payment[] => {
    return payments.map(p => mockPaymentOps.create(p));
  },
};

/**
 * Snapshot operations for testing state changes
 */
export const mockSnapshotOps = {
  saveSnapshot: (): string => {
    return JSON.stringify({
      users: Array.from(mockDb.users.entries()),
      customers: Array.from(mockDb.customers.entries()),
      vehicles: Array.from(mockDb.vehicles.entries()),
      contracts: Array.from(mockDb.contracts.entries()),
      payments: Array.from(mockDb.payments.entries()),
      branches: Array.from(mockDb.branches.entries()),
    });
  },

  loadSnapshot: (snapshot: string): void => {
    const data = JSON.parse(snapshot);
    mockDb.users = new Map(data.users);
    mockDb.customers = new Map(data.customers);
    mockDb.vehicles = new Map(data.vehicles);
    mockDb.contracts = new Map(data.contracts);
    mockDb.payments = new Map(data.payments);
    mockDb.branches = new Map(data.branches);
  },
};

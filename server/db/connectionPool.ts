import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';

/**
 * Configure Neon connection pooling for optimal performance
 * 
 * Neon serverless already includes connection pooling, but we can optimize it:
 * - fetchConnectionCache: true (reuse connections within same isolate)
 * - pooling: true (enable connection pooling)
 */

// Enable connection pooling
neonConfig.fetchConnectionCache = true;

// Create pooled database connection
const sql = neon(process.env.DATABASE_URL!);
export const pooledDb = drizzle(sql, { schema });

/**
 * Connection pool stats (Neon handles this internally)
 * This is a monitoring utility
 */
export function getConnectionPoolStats() {
  return {
    poolingEnabled: neonConfig.fetchConnectionCache,
    databaseUrl: process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing',
    note: 'Neon serverless handles connection pooling automatically',
  };
}

console.log('✅ Database connection pool configured');
console.log('   - Pooling enabled:', neonConfig.fetchConnectionCache);
console.log('   - Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Missing');

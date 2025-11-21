import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { companySettings } from '@/shared/schema';

/**
 * QR Code Service for KarāraOS
 * 
 * Generates QR codes for rental contracts with signed JWT tokens
 * QR contains: verification URL, payment link, support hotline
 * JWT expires in 30 days and includes contract metadata
 * 
 * PRODUCTION-READY: Fetches support hotline from company settings database
 */

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'kararaos-jwt-secret-change-in-production';
const JWT_EXPIRY = '30d'; // 30 days
const BASE_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : 'http://localhost:5000';

export interface ContractQRPayload {
  contractId: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  vehiclePlate: string;
  issuedAt: string;
}

export interface ContractQRData {
  verificationUrl: string;
  paymentUrl: string;
  supportHotline: string;
  qrCodeDataUrl: string;
  token: string;
  expiresAt: Date;
}

/**
 * Fetch company support hotline from database
 * Falls back to default if not found
 */
async function getSupportHotline(): Promise<string> {
  try {
    const [settings] = await db.select().from(companySettings).limit(1);
    // Use mobile number as support hotline (more commonly used in UAE)
    return settings?.mobile || settings?.phone || '+971 50 000 0000';
  } catch (error) {
    console.error('Failed to fetch support hotline from company settings:', error);
    return '+971 50 000 0000'; // Fallback default
  }
}

/**
 * Generate QR code for a rental contract
 * Returns QR image data URL + verification/payment URLs
 */
export async function generateContractQR(contractData: {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  vehiclePlate: string;
}): Promise<ContractQRData> {
  // Create JWT payload with contract metadata
  const payload: ContractQRPayload = {
    contractId: contractData.id,
    contractNumber: contractData.contractNumber,
    customerId: contractData.customerId,
    customerName: contractData.customerName,
    vehiclePlate: contractData.vehiclePlate,
    issuedAt: new Date().toISOString(),
  };

  // Sign JWT token with 30-day expiry
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Fetch support hotline from company settings
  const supportHotline = await getSupportHotline();

  // Build URLs
  const verificationUrl = `${BASE_URL}/verify-contract/${token}`;
  const paymentUrl = `${BASE_URL}/payments?contract=${contractData.id}`;

  // Create QR data payload (user scans this)
  const qrPayload = {
    type: 'KARARAOS_CONTRACT',
    contract: contractData.contractNumber,
    verify: verificationUrl,
    payment: paymentUrl,
    support: supportHotline,
  };

  // Generate QR code as data URL (can be embedded in PDF/HTML)
  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return {
    verificationUrl,
    paymentUrl,
    supportHotline,
    qrCodeDataUrl,
    token,
    expiresAt,
  };
}

/**
 * Verify a contract JWT token
 * Returns decoded payload or throws error if invalid/expired
 */
export function verifyContractToken(token: string): ContractQRPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ContractQRPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Contract QR code has expired. Please request a new one.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid contract QR code.');
    }
    throw error;
  }
}

/**
 * Generate QR code as buffer (for PDF embedding)
 */
export async function generateContractQRBuffer(contractData: {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  vehiclePlate: string;
}): Promise<{ buffer: Buffer; token: string; expiresAt: Date }> {
  const payload: ContractQRPayload = {
    contractId: contractData.id,
    contractNumber: contractData.contractNumber,
    customerId: contractData.customerId,
    customerName: contractData.customerName,
    vehiclePlate: contractData.vehiclePlate,
    issuedAt: new Date().toISOString(),
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Fetch support hotline from company settings
  const supportHotline = await getSupportHotline();

  const verificationUrl = `${BASE_URL}/verify-contract/${token}`;
  const paymentUrl = `${BASE_URL}/payments?contract=${contractData.id}`;

  const qrPayload = {
    type: 'KARARAOS_CONTRACT',
    contract: contractData.contractNumber,
    verify: verificationUrl,
    payment: paymentUrl,
    support: supportHotline,
  };

  const buffer = await QRCode.toBuffer(JSON.stringify(qrPayload), {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 300,
  });

  return { buffer, token, expiresAt };
}

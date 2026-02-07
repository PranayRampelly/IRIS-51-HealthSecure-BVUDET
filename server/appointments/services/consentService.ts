import crypto from 'crypto';

let consentLedger: any[] = [];

export function logConsent(appointmentId: string, patientId: string, action: string, consentData: any) {
  const prevHash = consentLedger.length ? consentLedger[consentLedger.length - 1].hash : '';
  const record = {
    appointmentId,
    patientId,
    action,
    consentData,
    timestamp: new Date().toISOString(),
    prevHash,
  };
  record.hash = crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex');
  consentLedger.push(record);
  return record;
} 
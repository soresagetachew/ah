import { pool } from '../config/database';

export const generateSerialNumber = async (prefix: string, tableName: string): Promise<string> => {
  const year = new Date().getFullYear();

  const result = await pool.query(`
    SELECT serial_no 
    FROM ${tableName} 
    WHERE serial_no LIKE ?
    ORDER BY serial_no DESC 
    LIMIT 1
  `, [`${prefix}-${year}-%`]);

  let nextSequence = 1;
  if (result.rows.length > 0) {
    const lastSerial = (result.rows[0] as any).serial_no;
    const parts = lastSerial.split('-');
    if (parts.length === 3) {
      nextSequence = parseInt(parts[2], 10) + 1;
    }
  }

  const paddedSequence = nextSequence.toString().padStart(4, '0');
  return `${prefix}-${year}-${paddedSequence}`;
};

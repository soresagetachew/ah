import { pool } from '../config/database';

export const generateSerialNumber = async (documentType: string, tableName: string): Promise<string> => {
  const year = new Date().getFullYear();

  // Atomically get and increment the next number
  const { rows } = await pool.query(
    'UPDATE document_sequences SET last_number = last_number + 1 WHERE document_type = ? RETURNING *',
    [documentType]
  );

  if (rows.length === 0) {
    // Fallback or initialization if type doesn't exist
    await pool.query('INSERT INTO document_sequences (document_type, prefix, last_number) VALUES (?, ?, 1)', [documentType, documentType]);
    return `${documentType}-${year}-0001`;
  }

  const seq = rows[0];
  const nextNum = seq.last_number;
  const padding = seq.padding || 4;
  const prefix = seq.prefix || documentType;
  const includeYear = seq.include_year !== false;

  const paddedSequence = nextNum.toString().padStart(padding, '0');
  
  if (includeYear) {
    return `${prefix}-${year}-${paddedSequence}`;
  } else {
    return `${prefix}-${paddedSequence}`;
  }
};

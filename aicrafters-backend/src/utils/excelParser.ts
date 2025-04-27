import * as XLSX from 'xlsx';

interface UserData {
  fullName: string;
  phone: string;
  email: string;
}

export const parseExcelUsers = (buffer: Buffer): UserData[] => {
  try {
    // Read the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Find the header row (row 6)
    const headerRow = 6;
    const headers: { [key: string]: string } = {};
    
    // Get the headers from row 6
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        headers[col] = cell.v.toString();
      }
    }
    
    
    const users: UserData[] = [];
    
    // Start reading from row 7
    for (let row = headerRow; row <= range.e.r; row++) {
      const userData: any = {};
      
      // Read each column for this row
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        if (cell && headers[col]) {
          userData[headers[col]] = cell.v?.toString().trim() || '';
        }
      }
      
      
      // Skip empty rows
      if (!userData.Nom && !userData.Prénom && !userData.Email && !userData.Gsm) {
        continue;
      }
      
      // Validate required fields
      if (!userData.Nom || !userData.Prénom || !userData.Email) {
        throw new Error(`Row ${row + 1}: Missing required fields. Need Nom, Prénom, and Email`);
      }
      
      // Validate email format
      if (!userData.Email.includes('@') || !userData.Email.split('@')[1]?.includes('.')) {
        throw new Error(`Row ${row + 1}: Invalid email format - ${userData.Email}`);
      }
      
      users.push({
        fullName: `${userData.Prénom} ${userData.Nom}`.trim(),
        phone: userData.Gsm || '',
        email: userData.Email.toLowerCase()
      });
    }
    
    return users;
    
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw error;
  }
}; 
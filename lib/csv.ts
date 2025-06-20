/**
 * Converts an array of objects into a CSV formatted string.
 * @param data An array of objects to be converted.
 * @returns A string in CSV format.
 */
export function generateCsv(data: Record<string, any>[]): string {
    if (data.length === 0) {
      return '';
    }
  
    // Get headers from the keys of the first object
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',') + '\n';
  
    // Convert each object to a comma-separated string
    const rows = data.map(obj => {
      return headers.map(header => {
        let value = obj[header];
        if (value === null || value === undefined) {
          return '';
        }
        // If a value contains a comma, wrap it in double quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
    }).join('\n');
  
    return headerRow + rows;
  }
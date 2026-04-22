/**
 * Field Converter Utility
 * Converts between camelCase (frontend) and snake_case (backend)
 */

/**
 * Convert a string from camelCase to snake_case
 */
export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert a string from snake_case to camelCase
 */
export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively convert all object keys from camelCase to snake_case
 */
export const convertToSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertToSnakeCase);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = toSnakeCase(key);
    result[snakeKey] = convertToSnakeCase(obj[key]);
    return result;
  }, {} as any);
};

/**
 * Recursively convert all object keys from snake_case to camelCase
 */
export const convertFromSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertFromSnakeCase);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = toCamelCase(key);
    result[camelKey] = convertFromSnakeCase(obj[key]);
    return result;
  }, {} as any);
};

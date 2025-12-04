import { describe, it, expect } from '@jest/globals';

/**
 * Database utility functions for testing
 */

export const validateConnectionString = (connectionString) => {
  if (!connectionString || typeof connectionString !== 'string') {
    return false;
  }
  
  // Basic validation for postgres connection string
  const pgRegex = /^postgres(ql)?:\/\/.+/;
  return pgRegex.test(connectionString);
};

export const parseDbConfig = (config) => {
  return {
    host: config.DB_HOST || 'localhost',
    port: parseInt(config.DB_PORT || '5432', 10),
    database: config.DB_NAME || 'postgres',
    user: config.DB_USER || 'postgres',
    password: config.DB_PASSWORD || '',
  };
};

export const isValidPort = (port) => {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
};

describe('Database Utilities', () => {
  describe('validateConnectionString', () => {
    it('should validate correct postgres connection string', () => {
      const validString = 'postgres://user:pass@localhost:5432/dbname';
      expect(validateConnectionString(validString)).toBe(true);
    });

    it('should validate postgresql connection string', () => {
      const validString = 'postgresql://user:pass@localhost:5432/dbname';
      expect(validateConnectionString(validString)).toBe(true);
    });

    it('should reject invalid connection string', () => {
      expect(validateConnectionString('invalid')).toBe(false);
      expect(validateConnectionString('')).toBe(false);
      expect(validateConnectionString(null)).toBe(false);
      expect(validateConnectionString(undefined)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validateConnectionString(123)).toBe(false);
      expect(validateConnectionString({})).toBe(false);
      expect(validateConnectionString([])).toBe(false);
    });
  });

  describe('parseDbConfig', () => {
    it('should parse database configuration correctly', () => {
      const config = {
        DB_HOST: 'db.example.com',
        DB_PORT: '5432',
        DB_NAME: 'mydb',
        DB_USER: 'admin',
        DB_PASSWORD: 'secret',
      };

      const parsed = parseDbConfig(config);

      expect(parsed.host).toBe('db.example.com');
      expect(parsed.port).toBe(5432);
      expect(parsed.database).toBe('mydb');
      expect(parsed.user).toBe('admin');
      expect(parsed.password).toBe('secret');
    });

    it('should use default values when config is empty', () => {
      const parsed = parseDbConfig({});

      expect(parsed.host).toBe('localhost');
      expect(parsed.port).toBe(5432);
      expect(parsed.database).toBe('postgres');
      expect(parsed.user).toBe('postgres');
      expect(parsed.password).toBe('');
    });

    it('should parse port as integer', () => {
      const config = { DB_PORT: '3000' };
      const parsed = parseDbConfig(config);

      expect(typeof parsed.port).toBe('number');
      expect(parsed.port).toBe(3000);
    });
  });

  describe('isValidPort', () => {
    it('should validate standard database ports', () => {
      expect(isValidPort(5432)).toBe(true);
      expect(isValidPort(3306)).toBe(true);
      expect(isValidPort(27017)).toBe(true);
    });

    it('should accept valid port range', () => {
      expect(isValidPort(1)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
      expect(isValidPort(8080)).toBe(true);
    });

    it('should reject invalid ports', () => {
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(-1)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort(99999)).toBe(false);
    });

    it('should handle string ports', () => {
      expect(isValidPort('5432')).toBe(true);
      expect(isValidPort('invalid')).toBe(false);
    });
  });
});

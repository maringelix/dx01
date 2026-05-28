import { describe, it, expect } from '@jest/globals';
import { sanitizeMessage, sanitizeMeta, sanitizeError } from '../utils/sanitizeLogs.js';

describe('sanitizeLogs', () => {
  describe('sanitizeMessage', () => {
    it('masks password=value pairs', () => {
      expect(sanitizeMessage('connect failed password=hunter2')).toBe('connect failed password=***');
    });

    it('masks token in URL form', () => {
      expect(sanitizeMessage('token: abc123xyz extra')).toBe('token=*** extra');
    });

    it('masks JWT-shaped strings', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.abcDEF123';
      expect(sanitizeMessage(`auth header ${jwt} ok`)).toBe('auth header ***JWT*** ok');
    });

    it('masks credentials in postgres URL', () => {
      expect(sanitizeMessage('postgres://user:supersecret@host/db')).toBe('postgres://user:***@host/db');
    });

    it('returns null/undefined unchanged', () => {
      expect(sanitizeMessage(null)).toBeNull();
      expect(sanitizeMessage(undefined)).toBeUndefined();
    });
  });

  describe('sanitizeMeta', () => {
    it('masks sensitive keys at top level', () => {
      const out = sanitizeMeta({ user: 'marina', password: 'hunter2', token: 'abc' });
      expect(out).toEqual({ user: 'marina', password: '***', token: '***' });
    });

    it('walks nested objects', () => {
      const out = sanitizeMeta({ db: { host: 'h', password: 'p' } });
      expect(out.db.password).toBe('***');
      expect(out.db.host).toBe('h');
    });

    it('walks arrays', () => {
      const out = sanitizeMeta([{ password: 'x' }, { ok: 1 }]);
      expect(out[0].password).toBe('***');
      expect(out[1].ok).toBe(1);
    });
  });

  describe('sanitizeError', () => {
    it('returns null for null', () => {
      expect(sanitizeError(null)).toBeNull();
    });

    it('extracts safe fields and sanitizes message', () => {
      const err = new Error('failed with password=hunter2');
      err.code = 'EAUTH';
      const out = sanitizeError(err);
      expect(out).toEqual({ message: 'failed with password=***', name: 'Error', code: 'EAUTH' });
    });
  });
});

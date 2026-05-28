// Tiny log-sanitization helpers used to mask sensitive substrings before
// they reach winston / morgan. Designed to be cheap and side-effect free.
//
// We mask:
//   - any querystring/body key that looks like a secret (password, token,
//     secret, apikey, authorization, bearer, ssn, cpf)
//   - JWT-shaped strings (three base64url segments separated by dots)
//   - postgres connection strings ('postgres://user:pass@host')
//
// Use `sanitizeMessage()` for free-form strings (e.g. error.message) and
// `sanitizeMeta()` for structured objects (winston meta).

const SECRET_KEY_REGEX = /\b(password|passwd|pwd|secret|api[_-]?key|token|authorization|bearer|access[_-]?key|refresh[_-]?token|ssn|cpf)\s*[=:]\s*([^\s,;&"']+)/gi;
const JWT_REGEX = /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const URL_CREDENTIALS_REGEX = /(\b\w+:\/\/[^/:]+:)([^@\s]+)(@)/g;

const SENSITIVE_KEY_PATTERN = /(password|passwd|pwd|secret|token|authorization|bearer|api[_-]?key|access[_-]?key|refresh[_-]?token|ssn|cpf)/i;

export function sanitizeMessage(input) {
  if (input == null) return input;
  let s = String(input);
  s = s.replace(SECRET_KEY_REGEX, (_m, key) => `${key}=***`);
  s = s.replace(JWT_REGEX, '***JWT***');
  s = s.replace(URL_CREDENTIALS_REGEX, '$1***$3');
  return s;
}

export function sanitizeMeta(meta) {
  if (meta == null || typeof meta !== 'object') return meta;
  if (Array.isArray(meta)) return meta.map(sanitizeMeta);
  const out = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE_KEY_PATTERN.test(k)) {
      out[k] = '***';
    } else if (typeof v === 'string') {
      out[k] = sanitizeMessage(v);
    } else if (v && typeof v === 'object') {
      out[k] = sanitizeMeta(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Convenience wrapper to build a sanitized log payload from an Error.
export function sanitizeError(err) {
  if (!err) return err;
  return {
    message: sanitizeMessage(err.message),
    name: err.name,
    code: err.code,
  };
}

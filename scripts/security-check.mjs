import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const MAX_SOURCE_LINES = 500;

const FORBIDDEN_TRACKED_FILES = new Set([
  '.env',
  '.env.local',
  '.env.development.local',
  '.env.production.local',
  '.env.test.local',
]);

const FORBIDDEN_EXTENSIONS = ['.jks', '.keystore', '.p12', '.p8', '.key', '.pem', '.mobileprovision'];

const SECRET_RULES = [
  { name: 'PRIVATE_KEY_HEADER', regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'GOOGLE_API_KEY', regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'GOOGLE_OAUTH_CLIENT_SECRET', regex: /GOCSPX-[0-9A-Za-z\-_]{20,}/ },
  { name: 'AWS_ACCESS_KEY_ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GITHUB_TOKEN', regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}|github_pat_[A-Za-z0-9_]{22,}/ },
  { name: 'STRIPE_KEY', regex: /(?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{16,}/ },
  { name: 'MONGODB_CREDENTIAL_URI', regex: /mongodb(?:\+srv)?:\/\/[^/\s:@]+:[^/\s@]+@/ },
  { name: 'JWT_LITERAL', regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'SLACK_TOKEN', regex: /xox[baprs]-[0-9A-Za-z\-]{10,}/ },
  {
    name: 'EXPO_PUBLIC_PRIVATE_SECRET_NAME',
    regex: /EXPO_PUBLIC_(?:[A-Z0-9_]*?(?:SECRET|PRIVATE_KEY|PASSWORD|GEMINI_API_KEY|RAZORPAY_KEY_SECRET|DATABASE_URL|MONGO_URI)[A-Z0-9_]*)\b/,
  },
  {
    name: 'SECRET_VALUE_ASSIGNMENT',
    regex: /(?:jwt_secret|gemini_api_key|razorpay_key_secret|client_secret|db_password|private_key)\s*[:=]\s*['"][^'"${}\s]{8,}['"]/i,
  },
];

const BINARY_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.ico', '.ttf', '.otf', '.woff', '.pdf', '.apk', '.jar', '.so']);

function getTrackedFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf-8' });
  return out.split('\0').filter(Boolean);
}

function checkTrackedFilesAndSecrets(trackedFiles) {
  const errors = [];

  for (const relPath of trackedFiles) {
    const normalized = relPath.replace(/\\/g, '/');
    const base = path.posix.basename(normalized);
    const ext = path.posix.extname(normalized).toLowerCase();

    if (FORBIDDEN_TRACKED_FILES.has(normalized) || FORBIDDEN_TRACKED_FILES.has(base)) {
      errors.push(`Forbidden environment file is tracked in Git: ${normalized}`);
      continue;
    }

    if (FORBIDDEN_EXTENSIONS.includes(ext)) {
      errors.push(`Forbidden key/certificate artifact is tracked in Git: ${normalized}`);
      continue;
    }

    if (BINARY_EXTENSIONS.has(ext)) {
      continue;
    }

    const fullPath = path.join(ROOT, relPath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const buf = fs.readFileSync(fullPath);
    if (buf.subarray(0, 4096).includes(0)) {
      continue;
    }

    const content = buf.toString('utf-8');
    const lines = content.split(/\r?\n/);

    // Enforce 500-line file limit on src/ and plugins/
    if ((normalized.startsWith('src/') || normalized.startsWith('plugins/')) && lines.length > MAX_SOURCE_LINES) {
      errors.push(`File exceeds ${MAX_SOURCE_LINES}-line limit (${lines.length} lines): ${normalized}`);
    }

    // Skip self-definition lines inside scripts/security-check.mjs and docs/
    if (normalized === 'scripts/security-check.mjs' || normalized.startsWith('docs/') || normalized.startsWith('.agents/')) {
      continue;
    }

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      for (const rule of SECRET_RULES) {
        if (rule.regex.test(line)) {
          // Redacted output: NEVER print the matched line or secret value
          errors.push(`Potential secret match [${rule.name}] at ${normalized}:${i + 1} (value redacted)`);
        }
      }
    }
  }

  return errors;
}

function checkEasReleaseProfiles() {
  const errors = [];
  const easPath = path.join(ROOT, 'eas.json');
  if (!fs.existsSync(easPath)) {
    return ['eas.json is missing'];
  }

  const eas = JSON.parse(fs.readFileSync(easPath, 'utf-8'));
  for (const profileName of ['preview', 'production']) {
    const profile = eas?.build?.[profileName];
    if (!profile) {
      errors.push(`Missing EAS build profile: ${profileName}`);
      continue;
    }
    const env = profile.env || {};
    if (env.EXPO_PUBLIC_ALLOW_CLEARTEXT !== 'false') {
      errors.push(`eas.json ${profileName}.env.EXPO_PUBLIC_ALLOW_CLEARTEXT must be "false"`);
    }
    if (env.EXPO_PUBLIC_ENABLE_DEMO_TOPUP !== 'false') {
      errors.push(`eas.json ${profileName}.env.EXPO_PUBLIC_ENABLE_DEMO_TOPUP must be "false"`);
    }
    if (typeof env.EXPO_PUBLIC_API_URL !== 'string' || !env.EXPO_PUBLIC_API_URL.startsWith('https://')) {
      errors.push(`eas.json ${profileName}.env.EXPO_PUBLIC_API_URL must use https://`);
    }
  }

  return errors;
}

function main() {
  const trackedFiles = getTrackedFiles();
  const errors = [
    ...checkTrackedFilesAndSecrets(trackedFiles),
    ...checkEasReleaseProfiles(),
  ];

  if (errors.length > 0) {
    console.error(`Security check failed with ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(`Security hygiene check passed (${trackedFiles.length} tracked files scanned, values redacted).`);
}

main();

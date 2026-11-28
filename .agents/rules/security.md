# PitchMint Mobile — AI Agent Security & Engineering Rules

All AI coding agents operating in `PitchMint-mobile` must obey these security rules, engineering principles, and workflow requirements alongside [`AGENTS.md`](../../AGENTS.md) and [`docs/SECURITY.md`](../../docs/SECURITY.md).

---

## 1. Mandatory Security Rules for AI Agents

1. **Treat the mobile app as a public client:** Distributed binaries and Hermes JS bundles can be decompiled and inspected by anyone.
2. **Never embed private server credentials:** Never place `JWT_SECRET`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, database URIs, OAuth client secrets (`GOCSPX-...`), or signing keys in source code, `app.json`, `eas.json`, or `.env*` files.
3. **Never commit real `.env` files or private local configuration:** Keep `.env` and `.env*.local` ignored in `.gitignore` and untracked in Git; keep only safe placeholder defaults in `.env.example`.
4. **Never log sensitive data:** Never log passwords, JWTs, Google ID tokens, OTPs, reset tokens, emails, or private user startup ideas. Use `logDevWarning` (`src/utils/logger.ts`) for sanitized `__DEV__`-only diagnostics.
5. **Use `expo-secure-store` for native auth tokens:** Store session JWTs exclusively via `src/services/storage/tokenStorage.ts`.
6. **Never introduce plaintext native token-storage fallbacks:** On iOS and Android, SecureStore failures must fail closed (`TokenStorageError`) rather than falling back to AsyncStorage, global variables, or JS memory.
7. **Use HTTPS for release networking:** `preview` and `production` profiles must use `https://` and disallow cleartext HTTP (`EXPO_PUBLIC_ALLOW_CLEARTEXT="false"`, `plugins/withCleartextTraffic.js`, and `!__DEV__` enforcement in `src/config/env.ts`).
8. **Never weaken TLS validation:** Never disable certificate verification, add trust-all SSL handlers, or bypass TLS errors.
9. **Treat backend authorization and credit deductions as authoritative:** Client credit balances, premium flags, and confirmation modals are UX safeguards only.
10. **Never assume client-side validation is a security boundary:** Input checks, disabled buttons, and hidden UI elements do not enforce server security.
11. **Validate untrusted input and safely render untrusted output:** Enforce input bounds, validate external URLs via `openSafeExternalUrl` (`src/utils/safeLinking.ts`), and escape HTML in generated PDFs (`escapeHtml`).
12. **Avoid exposing sensitive data in errors, screenshots, and test fixtures:** Use clearly synthetic dummy values in tests; never include real credentials or user data in outputs.
13. **Review Android permissions and exported components:** Maintain least-privilege permissions (`plugins/withAndroidSecurityHardening.js`), keep `FileProvider`s non-exported, and preserve `SecureStore` backup exclusion rules.
14. **Avoid unnecessary dependencies:** Prefer built-in primitives and existing libraries over speculative packages; verify SDK compatibility with `npx expo install --check` and `npx expo-doctor`.
15. **Preserve existing repository boundaries:** Work exclusively within `PitchMint-mobile`. Never inspect, depend on, or modify `PitchMint-Backend` or `PitchMint-frontend`.
16. **Add regression tests for security-sensitive changes:** Every security fix or hardening change must include co-located Jest tests.
17. **Run the required security and quality checks:** Execute `npm run security:check`, `npm run typecheck`, `npm test`, `npm run doctor`, `npx expo install --check`, `npm run export:android`, and `npm audit --audit-level=high` as applicable.
18. **Report unverified assumptions honestly:** Never claim OWASP compliance or device/OAuth verification without direct observed evidence; explicitly document what remains unverified (e.g., pending Google Cloud OAuth setup or physical-device checks).

---

## 2. Engineering & Coding Principles

Keep existing TypeScript and feature-first conventions while enforcing:
- **Single responsibility & clear separation of concerns** across `features/`, `components/`, `services/`, `config/`, and `utils/`.
- **Small, focused changes** without unnecessary abstraction, boilerplate, or duplicated business logic.
- **Strong typing** (`strict: true`, zero `any`, explicit `null`/`undefined` handling).
- **Explicit error handling & fail-safe behavior** with no silent failures on security-sensitive paths.
- **No dead code or hardcoded environment-specific values** (no LAN IPs or ad-hoc API URLs).
- **Secure defaults & defense in depth** (HTTPS-first, least privilege, URL scheme allowlisting, HTML escaping).
- **Meaningful tests** covering edge cases and security regressions.

---

## 3. Standard Agent Coding Workflow & Governance

Every coding task must follow this sequence:
1. Inspect the Git working tree (`git status --short --branch`, `git status --porcelain=v1`).
2. Read relevant rules (`.agents/rules/*`) and architecture docs (`docs/ARCHITECTURE.md`, `docs/SECURITY.md`).
3. Understand the existing implementation directly from source files.
4. Establish expected behavior and acceptance criteria.
5. Identify security, privacy, and trust-boundary implications.
6. Implement the smallest appropriate change.
7. Add or update co-located Jest regression tests.
8. Run quality and security verification commands.
9. Review the complete Git diff (`git diff`, `git status`).
10. Report exactly what changed, exact command results, and what remains unverified.

### Strict Autonomous Restrictions
No AI agent may autonomously:
- Merge or close pull requests.
- Deploy or publish builds (`eas build` / store submissions).
- Rotate or revoke external credentials or OAuth clients.
- Rewrite Git history (`filter-repo`, `rebase`, `reset --hard`, `push --force`).

🎯 **What:**
Fixed an Unauthenticated Access vulnerability in `getCashFlowData`. The function was retrieving and returning sensitive financial data without checking if the user was authenticated. Additionally, fixed an Information Disclosure issue where the original error message was directly returned to the client in the `catch` block.

⚠️ **Risk:**
If left unfixed, unauthenticated attackers could potentially access sensitive cash flow and financial data, leading to a significant data breach. Additionally, returning raw database error messages could expose internal system details (Information Disclosure) that an attacker might use to exploit other vulnerabilities.

🛡️ **Solution:**
- Imported `getServerSession` from `next-auth` and `authOptions` from `@/lib/auth`.
- Added a session check at the beginning of `getCashFlowData` to throw an "Unauthorized" error if the session is absent.
- Wrapped the database call in a `try-catch` block where the error is logged to `console.error` and a generic "An internal error occurred" message is returned.
- Updated typing to remove `any` usages introduced by my edits, aligning with Next.js linting rules.

🎯 **What:**
- Added a `getServerSession` authorization check to the `getIssues` Server Action in `src/lib/actions/issues.ts`.
- Updated the `updateIssueStatus` Server Action to safely return a structured error instead of throwing an unhandled exception on missing authorization.
- Modified the catch blocks for both functions to log the actual error to `console.error` on the server and return a generic error message to the client.

⚠️ **Risk:**
- Without the authorization check on `getIssues`, an unauthenticated user could query and retrieve sensitive internal system issues and their details (including names of captured and responsible individuals).
- Returning `error.message` directly to the client could expose sensitive database structures or internal application logic to attackers.

🛡️ **Solution:**
- The `getServerSession(authOptions)` check ensures only authenticated users can access the system's issue data.
- Utilizing `console.error` locally keeps errors for internal review, while providing generic '`An internal error occurred`' messages to the client ensures proper security posture and prevents Information Exposure.

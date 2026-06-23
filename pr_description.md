🔒 Fix missing authorization in predictive actions

🎯 **What:**
Added missing `getServerSession` checks using `next-auth` to all exported predictive server actions (`getAdmissionForecast`, `getErrorTrendForecast`, `getSLARiskMatrix`, and `getPredictiveSummary`) in `src/lib/actions/predictive-actions.ts`.

⚠️ **Risk:**
If left unfixed, any unauthenticated user could access sensitive predictive models and patient data forecasts.

🛡️ **Solution:**
A standard `next-auth` session check was added inside each function block that returns a `{ success: false, error: 'Unauthorized' }` object when an active session is missing, bringing these action modules in line with standard authorization procedures across the rest of the application. Tests were also added to verify the proper behavior.

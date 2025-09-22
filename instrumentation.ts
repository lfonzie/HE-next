export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only initialize OpenTelemetry on the server side
    // await import('./lib/telemetry');
  }
}

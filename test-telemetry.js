#!/usr/bin/env node

// Simple test script to verify OpenTelemetry integration
import { createAdminSpan, recordAdminRequest, updateEntityCounts } from './lib/admin-telemetry.ts';

console.log('🧪 Testing OpenTelemetry integration...');

// Test 1: Create a span
console.log('1. Testing span creation...');
const span = createAdminSpan('test.operation', {
  'test.attribute': 'test-value',
  'test.component': 'test-script'
});

// Simulate some work
setTimeout(() => {
  span.setAttributes({
    'test.duration_ms': 100,
    'test.status': 'success'
  });
  span.end();
  console.log('✅ Span created and ended successfully');
}, 100);

// Test 2: Record metrics
console.log('2. Testing metrics recording...');
recordAdminRequest('test.operation', 150, true);
recordAdminRequest('test.operation', 200, false);
updateEntityCounts({
  users: 100,
  schools: 50,
  conversations: 200
});
console.log('✅ Metrics recorded successfully');

// Test 3: Test error handling
console.log('3. Testing error handling...');
try {
  const errorSpan = createAdminSpan('test.error', {
    'test.type': 'error-test'
  });
  
  // Simulate an error
  setTimeout(() => {
    errorSpan.recordException(new Error('Test error'));
    errorSpan.setStatus({ code: 2, message: 'Test error occurred' });
    errorSpan.end();
    console.log('✅ Error handling tested successfully');
  }, 50);
} catch (error) {
  console.log('❌ Error in error handling test:', error.message);
}

console.log('🎉 OpenTelemetry integration test completed!');
console.log('📊 Check your observability backend for traces and metrics.');

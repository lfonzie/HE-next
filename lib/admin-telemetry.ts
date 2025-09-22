import { trace, metrics, context, SpanStatusCode } from '@opentelemetry/api';

// Create a tracer for admin operations
const tracer = trace.getTracer('hubedu-admin', '1.0.0');

// Create a meter for admin metrics
const meter = metrics.getMeter('hubedu-admin', '1.0.0');

// Define custom metrics
const adminRequestCounter = meter.createCounter('admin_requests_total', {
  description: 'Total number of admin requests',
});

const adminRequestDuration = meter.createHistogram('admin_request_duration_ms', {
  description: 'Duration of admin requests in milliseconds',
});

const adminErrorCounter = meter.createCounter('admin_errors_total', {
  description: 'Total number of admin errors',
});

const adminDatabaseOperations = meter.createCounter('admin_database_operations_total', {
  description: 'Total number of database operations in admin',
});

const adminUsersCount = meter.createUpDownCounter('admin_users_count', {
  description: 'Current number of users in the system',
});

const adminSchoolsCount = meter.createUpDownCounter('admin_schools_count', {
  description: 'Current number of schools in the system',
});

const adminConversationsCount = meter.createUpDownCounter('admin_conversations_count', {
  description: 'Current number of conversations in the system',
});

// Helper function to create admin spans
export function createAdminSpan(operationName: string, attributes?: Record<string, string | number | boolean>) {
  return tracer.startSpan(operationName, {
    attributes: {
      'admin.operation': operationName,
      'admin.component': 'admin-panel',
      ...attributes,
    },
  });
}

// Helper function to record admin metrics
export function recordAdminRequest(operation: string, duration: number, success: boolean = true) {
  adminRequestCounter.add(1, { operation, success: success.toString() });
  adminRequestDuration.record(duration, { operation });
  
  if (!success) {
    adminErrorCounter.add(1, { operation });
  }
}

// Helper function to record database operations
export function recordDatabaseOperation(operation: string, table: string, success: boolean = true) {
  adminDatabaseOperations.add(1, { 
    operation, 
    table, 
    success: success.toString() 
  });
}

// Helper function to update entity counts
export function updateEntityCounts(counts: {
  users?: number;
  schools?: number;
  conversations?: number;
}) {
  if (counts.users !== undefined) {
    adminUsersCount.add(counts.users);
  }
  if (counts.schools !== undefined) {
    adminSchoolsCount.add(counts.schools);
  }
  if (counts.conversations !== undefined) {
    adminConversationsCount.add(counts.conversations);
  }
}

// Helper function to wrap admin operations with tracing
export function withAdminTracing<T>(
  operationName: string,
  operation: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return tracer.startActiveSpan(operationName, async (span) => {
    const startTime = Date.now();
    let success = true;
    
    try {
      span.setAttributes({
        'admin.operation': operationName,
        'admin.component': 'admin-panel',
        ...attributes,
      });
      
      const result = await operation();
      
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      success = false;
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      recordAdminRequest(operationName, duration, success);
      span.end();
    }
  });
}

// Helper function to trace database queries
export function withDatabaseTracing<T>(
  operation: string,
  table: string,
  query: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(`db.${operation}`, async (span) => {
    const startTime = Date.now();
    let success = true;
    
    try {
      span.setAttributes({
        'db.operation': operation,
        'db.table': table,
        'db.system': 'prisma',
      });
      
      const result = await query();
      
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      success = false;
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error instanceof Error ? error.message : 'Database error' 
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      recordDatabaseOperation(operation, table, success);
      span.setAttributes({
        'db.duration_ms': duration,
      });
      span.end();
    }
  });
}

export {
  tracer,
  meter,
  adminRequestCounter,
  adminRequestDuration,
  adminErrorCounter,
  adminDatabaseOperations,
  adminUsersCount,
  adminSchoolsCount,
  adminConversationsCount,
};

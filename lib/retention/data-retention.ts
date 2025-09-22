import { prisma } from '@/lib/prisma';

export interface RetentionPolicy {
  table: string;
  retentionDays: number;
  batchSize: number;
  enabled: boolean;
  conditions?: string; // SQL conditions for selective retention
}

export class DataRetentionManager {
  private policies: RetentionPolicy[] = [
    {
      table: 'TraceSpan',
      retentionDays: 30, // 30 dias para traces
      batchSize: 1000,
      enabled: true,
      conditions: 'createdAt < NOW() - INTERVAL \'30 days\''
    },
    {
      table: 'MetricPoint',
      retentionDays: 90, // 90 dias para métricas
      batchSize: 2000,
      enabled: true,
      conditions: 'createdAt < NOW() - INTERVAL \'90 days\''
    },
    {
      table: 'LogRecord',
      retentionDays: 14, // 14 dias para logs
      batchSize: 1000,
      enabled: true,
      conditions: 'createdAt < NOW() - INTERVAL \'14 days\''
    },
    {
      table: 'ai_requests',
      retentionDays: 60, // 60 dias para requests de IA
      batchSize: 1000,
      enabled: true,
      conditions: 'occurred_at < NOW() - INTERVAL \'60 days\''
    },
    {
      table: 'events',
      retentionDays: 45, // 45 dias para eventos
      batchSize: 1000,
      enabled: true,
      conditions: 'occurred_at < NOW() - INTERVAL \'45 days\''
    }
  ];

  async executeRetention(): Promise<{
    totalDeleted: number;
    tableResults: Array<{
      table: string;
      deleted: number;
      error?: string;
    }>;
  }> {
    const results = {
      totalDeleted: 0,
      tableResults: [] as Array<{
        table: string;
        deleted: number;
        error?: string;
      }>
    };

    console.log('🗑️ Starting data retention cleanup...');

    for (const policy of this.policies) {
      if (!policy.enabled) {
        console.log(`⏭️ Skipping ${policy.table} (disabled)`);
        continue;
      }

      try {
        const deleted = await this.cleanupTable(policy);
        results.totalDeleted += deleted;
        results.tableResults.push({
          table: policy.table,
          deleted
        });
        
        console.log(`✅ Cleaned ${deleted} records from ${policy.table}`);
      } catch (error) {
        console.error(`❌ Error cleaning ${policy.table}:`, error);
        results.tableResults.push({
          table: policy.table,
          deleted: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`🎉 Retention cleanup completed. Total deleted: ${results.totalDeleted}`);
    return results;
  }

  private async cleanupTable(policy: RetentionPolicy): Promise<number> {
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      // Usar transação para evitar locks longos
      const deleted = await prisma.$transaction(async (tx) => {
        // Buscar IDs para deletar
        const idsToDelete = await tx.$queryRawUnsafe<any[]>(`
          select id from "${policy.table}"
          where ${policy.conditions}
          limit ${policy.batchSize}
        `);

        if (idsToDelete.length === 0) {
          return 0;
        }

        const ids = idsToDelete.map(row => row.id);

        // Deletar em lote
        const result = await tx.$executeRawUnsafe(`
          delete from "${policy.table}"
          where id = any($1)
        `, ids);

        return result;
      });

      totalDeleted += deleted;
      
      // Se deletou menos que o batch size, não há mais dados
      if (deleted < policy.batchSize) {
        hasMore = false;
      }

      // Pequena pausa para não sobrecarregar o banco
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return totalDeleted;
  }

  async getRetentionStats(): Promise<{
    tableStats: Array<{
      table: string;
      totalRecords: number;
      recordsToDelete: number;
      retentionDays: number;
      lastCleanup?: Date;
    }>;
  }> {
    const tableStats = [];

    for (const policy of this.policies) {
      try {
        const [totalRecords, recordsToDelete] = await Promise.all([
          prisma.$queryRawUnsafe<[{ count: bigint }]>(`
            select count(*) as count from "${policy.table}"
          `).then(result => Number(result[0].count)),
          
          prisma.$queryRawUnsafe<[{ count: bigint }]>(`
            select count(*) as count from "${policy.table}"
            where ${policy.conditions}
          `).then(result => Number(result[0].count))
        ]);

        tableStats.push({
          table: policy.table,
          totalRecords,
          recordsToDelete,
          retentionDays: policy.retentionDays,
          lastCleanup: undefined // TODO: implementar tracking de última limpeza
        });
      } catch (error) {
        console.error(`Error getting stats for ${policy.table}:`, error);
        tableStats.push({
          table: policy.table,
          totalRecords: 0,
          recordsToDelete: 0,
          retentionDays: policy.retentionDays,
          lastCleanup: undefined
        });
      }
    }

    return { tableStats };
  }

  async archiveOldData(): Promise<{
    archived: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let totalArchived = 0;

    try {
      // Criar tabela de arquivo se não existir
      await prisma.$executeRawUnsafe(`
        create table if not exists "TraceSpan_archive" (like "TraceSpan" including all);
      `);

      await prisma.$executeRawUnsafe(`
        create table if not exists "MetricPoint_archive" (like "MetricPoint" including all);
      `);

      // Arquivar traces antigos (mais de 60 dias)
      const archivedTraces = await prisma.$transaction(async (tx) => {
        // Mover para arquivo
        await tx.$executeRawUnsafe(`
          insert into "TraceSpan_archive"
          select * from "TraceSpan"
          where "createdAt" < NOW() - INTERVAL '60 days'
        `);

        // Deletar originais
        const deleted = await tx.$executeRawUnsafe(`
          delete from "TraceSpan"
          where "createdAt" < NOW() - INTERVAL '60 days'
        `);

        return deleted;
      });

      totalArchived += archivedTraces;
      console.log(`📦 Archived ${archivedTraces} trace records`);

    } catch (error) {
      const errorMsg = `Error archiving data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }

    return { archived: totalArchived, errors };
  }

  async optimizeTables(): Promise<{
    optimized: string[];
    errors: string[];
  }> {
    const optimized: string[] = [];
    const errors: string[] = [];

    const tables = ['TraceSpan', 'MetricPoint', 'LogRecord', 'ai_requests', 'events'];

    for (const table of tables) {
      try {
        // VACUUM e ANALYZE para otimizar
        await prisma.$executeRawUnsafe(`VACUUM ANALYZE "${table}";`);
        optimized.push(table);
        console.log(`🔧 Optimized table: ${table}`);
      } catch (error) {
        const errorMsg = `Error optimizing ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return { optimized, errors };
  }
}

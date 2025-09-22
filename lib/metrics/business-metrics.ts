import { prisma } from '@/lib/prisma';

export interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface AIProviderMetrics {
  provider: string;
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  totalCost: number;
  errorRate: number;
  lastRequest: Date;
}

export interface LessonGenerationMetrics {
  totalLessons: number;
  avgGenerationTime: number;
  successRate: number;
  avgTokensUsed: number;
  mostPopularSubjects: Array<{ subject: string; count: number }>;
  timeDistribution: Array<{ hour: number; count: number }>;
}

export interface UserEngagementMetrics {
  activeUsers: number;
  newUsers: number;
  avgSessionDuration: number;
  mostActiveModules: Array<{ module: string; users: number }>;
  retentionRate: number;
}

export class BusinessMetricsCollector {
  
  async collectAIProviderMetrics(since: Date): Promise<AIProviderMetrics[]> {
    const results = await prisma.$queryRawUnsafe<any[]>(`
      select 
        provider,
        count(*) as total_requests,
        avg(case when success then 1.0 else 0.0 end) as success_rate,
        avg(latency_ms) as avg_latency,
        sum(cost_brl::numeric) as total_cost,
        avg(case when success then 0.0 else 1.0 end) as error_rate,
        max(occurred_at) as last_request
      from ai_requests
      where occurred_at > $1
      group by provider
      order by total_requests desc
    `, since);

    return results.map(row => ({
      provider: row.provider,
      totalRequests: parseInt(row.total_requests),
      successRate: parseFloat(row.success_rate),
      avgLatency: parseFloat(row.avg_latency),
      totalCost: parseFloat(row.total_cost),
      errorRate: parseFloat(row.error_rate),
      lastRequest: new Date(row.last_request)
    }));
  }

  async collectLessonGenerationMetrics(since: Date): Promise<LessonGenerationMetrics> {
    // Métricas de geração de aulas
    const basicMetrics = await prisma.$queryRawUnsafe<any[]>(`
      select 
        count(*) as total_lessons,
        avg(case when metadata->>'generation_time_ms' is not null 
            then (metadata->>'generation_time_ms')::int 
            else null end) as avg_generation_time,
        avg(case when success then 1.0 else 0.0 end) as success_rate,
        avg(prompt_tokens + completion_tokens) as avg_tokens_used
      from ai_requests
      where occurred_at > $1
        and (metadata->>'module' = 'aulas' or metadata->>'module' = 'lessons')
    `, since);

    const subjectMetrics = await prisma.$queryRawUnsafe<any[]>(`
      select 
        metadata->>'subject' as subject,
        count(*) as count
      from ai_requests
      where occurred_at > $1
        and (metadata->>'module' = 'aulas' or metadata->>'module' = 'lessons')
        and metadata->>'subject' is not null
      group by metadata->>'subject'
      order by count desc
      limit 10
    `, since);

    const timeDistribution = await prisma.$queryRawUnsafe<any[]>(`
      select 
        extract(hour from occurred_at) as hour,
        count(*) as count
      from ai_requests
      where occurred_at > $1
        and (metadata->>'module' = 'aulas' or metadata->>'module' = 'lessons')
      group by extract(hour from occurred_at)
      order by hour
    `, since);

    const basic = basicMetrics[0] || {};
    
    return {
      totalLessons: parseInt(basic.total_lessons) || 0,
      avgGenerationTime: parseFloat(basic.avg_generation_time) || 0,
      successRate: parseFloat(basic.success_rate) || 0,
      avgTokensUsed: parseFloat(basic.avg_tokens_used) || 0,
      mostPopularSubjects: subjectMetrics.map(row => ({
        subject: row.subject || 'Unknown',
        count: parseInt(row.count)
      })),
      timeDistribution: timeDistribution.map(row => ({
        hour: parseInt(row.hour),
        count: parseInt(row.count)
      }))
    };
  }

  async collectUserEngagementMetrics(since: Date): Promise<UserEngagementMetrics> {
    const userMetrics = await prisma.$queryRawUnsafe<any[]>(`
      select 
        count(distinct user_id) as active_users,
        count(distinct case when created_at > $1 then user_id end) as new_users,
        avg(case when metadata->>'session_duration_ms' is not null 
            then (metadata->>'session_duration_ms')::int 
            else null end) as avg_session_duration
      from events
      where occurred_at > $1
    `, since);

    const moduleMetrics = await prisma.$queryRawUnsafe<any[]>(`
      select 
        module,
        count(distinct user_id) as users
      from events
      where occurred_at > $1
        and module is not null
      group by module
      order by users desc
      limit 10
    `, since);

    // Calcular taxa de retenção (usuários que voltaram nos últimos 7 dias)
    const retentionMetrics = await prisma.$queryRawUnsafe<any[]>(`
      with user_activity as (
        select 
          user_id,
          min(occurred_at) as first_activity,
          max(occurred_at) as last_activity
        from events
        where occurred_at > $1 - interval '30 days'
        group by user_id
      )
      select 
        count(case when last_activity > $1 - interval '7 days' then 1 end)::float / 
        count(*)::float as retention_rate
      from user_activity
    `, since);

    const user = userMetrics[0] || {};
    const retention = retentionMetrics[0] || {};

    return {
      activeUsers: parseInt(user.active_users) || 0,
      newUsers: parseInt(user.new_users) || 0,
      avgSessionDuration: parseFloat(user.avg_session_duration) || 0,
      mostActiveModules: moduleMetrics.map(row => ({
        module: row.module || 'Unknown',
        users: parseInt(row.users)
      })),
      retentionRate: parseFloat(retention.retention_rate) || 0
    };
  }

  async collectSystemHealthMetrics(since: Date): Promise<Record<string, any>> {
    const healthMetrics = await prisma.$queryRawUnsafe<any[]>(`
      select 
        'total_requests' as metric,
        count(*)::int as value
      from "TraceSpan"
      where "startTime" > $1 and kind = 'SERVER'
      
      union all
      
      select 
        'error_rate' as metric,
        (count(case when "statusCode" != 'OK' and "statusCode" != '2' then 1 end)::float / 
         count(*)::float * 100)::float as value
      from "TraceSpan"
      where "startTime" > $1 and kind = 'SERVER'
      
      union all
      
      select 
        'avg_latency' as metric,
        avg(durationms)::float as value
      from "TraceSpan"
      where "startTime" > $1 and kind = 'SERVER'
      
      union all
      
      select 
        'p95_latency' as metric,
        percentile_cont(0.95) within group (order by durationms)::float as value
      from "TraceSpan"
      where "startTime" > $1 and kind = 'SERVER'
    `, since);

    const result: Record<string, any> = {};
    healthMetrics.forEach(row => {
      result[row.metric] = row.value;
    });

    return result;
  }

  async saveBusinessMetric(metric: BusinessMetric): Promise<void> {
    await prisma.metricPoint.create({
      data: {
        name: metric.name,
        time: metric.timestamp,
        value: metric.value,
        unit: metric.unit,
        attr: metric.metadata,
        resource: { source: 'business_metrics' },
        type: 'GAUGE'
      }
    });
  }

  async getBusinessMetricsSummary(since: Date): Promise<{
    aiProviders: AIProviderMetrics[];
    lessonGeneration: LessonGenerationMetrics;
    userEngagement: UserEngagementMetrics;
    systemHealth: Record<string, any>;
  }> {
    const [aiProviders, lessonGeneration, userEngagement, systemHealth] = await Promise.all([
      this.collectAIProviderMetrics(since),
      this.collectLessonGenerationMetrics(since),
      this.collectUserEngagementMetrics(since),
      this.collectSystemHealthMetrics(since)
    ]);

    return {
      aiProviders,
      lessonGeneration,
      userEngagement,
      systemHealth
    };
  }
}

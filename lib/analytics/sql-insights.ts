import { prisma } from '@/lib/prisma';

export interface SQLInsight {
  id: string;
  name: string;
  description: string;
  query: string;
  category: 'performance' | 'business' | 'users' | 'ai' | 'cost';
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  enabled: boolean;
}

export interface InsightResult {
  insight: SQLInsight;
  data: any[];
  executedAt: Date;
  executionTime: number;
  error?: string;
}

export class SQLInsightsEngine {
  private insights: SQLInsight[] = [
    {
      id: 'top-slow-routes',
      name: 'Top 10 Rotas Mais Lentas',
      description: 'Identifica as rotas com maior latência P95',
      query: `
        with route_latency as (
          select 
            (attributes->>'http.route') as route,
            durationms,
            percent_rank() over (partition by (attributes->>'http.route') order by durationms) as pr
          from "TraceSpan"
          where "startTime" > NOW() - INTERVAL '24 hours'
            and (attributes ? 'http.route')
            and kind = 'SERVER'
        ),
        p95_by_route as (
          select 
            route,
            max(durationms) filter (where pr <= 0.95) as p95_ms,
            count(*) as request_count
          from route_latency
          group by route
        )
        select 
          route,
          p95_ms,
          request_count,
          case 
            when p95_ms > 2000 then 'critical'
            when p95_ms > 1000 then 'high'
            when p95_ms > 500 then 'medium'
            else 'low'
          end as severity
        from p95_by_route
        where route is not null
        order by p95_ms desc
        limit 10
      `,
      category: 'performance',
      frequency: 'hourly',
      enabled: true
    },
    {
      id: 'ai-cost-analysis',
      name: 'Análise de Custos por Provider IA',
      description: 'Custo total e médio por provider de IA',
      query: `
        select 
          provider,
          count(*) as total_requests,
          sum(cost_brl::numeric) as total_cost_brl,
          avg(cost_brl::numeric) as avg_cost_per_request,
          avg(case when success then 1.0 else 0.0 end) as success_rate,
          avg(latency_ms) as avg_latency_ms,
          sum(prompt_tokens + completion_tokens) as total_tokens
        from ai_requests
        where occurred_at > NOW() - INTERVAL '7 days'
        group by provider
        order by total_cost_brl desc
      `,
      category: 'cost',
      frequency: 'daily',
      enabled: true
    },
    {
      id: 'user-engagement-trends',
      name: 'Tendências de Engajamento',
      description: 'Análise de engajamento dos usuários por módulo',
      query: `
        with daily_engagement as (
          select 
            date_trunc('day', occurred_at) as day,
            module,
            count(distinct user_id) as unique_users,
            count(*) as total_events
          from events
          where occurred_at > NOW() - INTERVAL '30 days'
            and module is not null
          group by date_trunc('day', occurred_at), module
        )
        select 
          day,
          module,
          unique_users,
          total_events,
          total_events::float / unique_users as events_per_user
        from daily_engagement
        order by day desc, unique_users desc
      `,
      category: 'users',
      frequency: 'daily',
      enabled: true
    },
    {
      id: 'lesson-generation-efficiency',
      name: 'Eficiência na Geração de Aulas',
      description: 'Métricas de eficiência na geração de aulas por matéria',
      query: `
        select 
          metadata->>'subject' as subject,
          count(*) as total_lessons,
          avg(case when metadata->>'generation_time_ms' is not null 
              then (metadata->>'generation_time_ms')::int 
              else null end) as avg_generation_time_ms,
          avg(case when success then 1.0 else 0.0 end) as success_rate,
          avg(prompt_tokens + completion_tokens) as avg_tokens_used,
          sum(cost_brl::numeric) as total_cost_brl
        from ai_requests
        where occurred_at > NOW() - INTERVAL '7 days'
          and (metadata->>'module' = 'aulas' or metadata->>'module' = 'lessons')
          and metadata->>'subject' is not null
        group by metadata->>'subject'
        order by total_lessons desc
      `,
      category: 'business',
      frequency: 'daily',
      enabled: true
    },
    {
      id: 'error-patterns',
      name: 'Padrões de Erro',
      description: 'Análise de padrões de erro no sistema',
      query: `
        select 
          (attributes->>'http.route') as route,
          (attributes->>'http.method') as method,
          "statusCode",
          count(*) as error_count,
          count(distinct "traceId") as unique_traces,
          avg(durationms) as avg_duration_ms,
          min("startTime") as first_occurrence,
          max("startTime") as last_occurrence
        from "TraceSpan"
        where "startTime" > NOW() - INTERVAL '24 hours'
          and ("statusCode" != 'OK' and "statusCode" != '2')
          and (attributes ? 'http.route')
        group by (attributes->>'http.route'), (attributes->>'http.method'), "statusCode"
        order by error_count desc
        limit 20
      `,
      category: 'performance',
      frequency: 'hourly',
      enabled: true
    },
    {
      id: 'peak-usage-hours',
      name: 'Horários de Pico de Uso',
      description: 'Identifica os horários de maior uso do sistema',
      query: `
        select 
          extract(hour from "startTime") as hour,
          count(*) as request_count,
          count(distinct (attributes->>'user.id')) as unique_users,
          avg(durationms) as avg_latency_ms,
          percentile_cont(0.95) within group (order by durationms) as p95_latency_ms
        from "TraceSpan"
        where "startTime" > NOW() - INTERVAL '7 days'
          and kind = 'SERVER'
        group by extract(hour from "startTime")
        order by request_count desc
      `,
      category: 'performance',
      frequency: 'daily',
      enabled: true
    },
    {
      id: 'ai-provider-reliability',
      name: 'Confiabilidade dos Providers IA',
      description: 'Análise de confiabilidade e performance dos providers',
      query: `
        with provider_stats as (
          select 
            provider,
            count(*) as total_requests,
            avg(case when success then 1.0 else 0.0 end) as success_rate,
            avg(latency_ms) as avg_latency,
            percentile_cont(0.95) within group (order by latency_ms) as p95_latency,
            count(case when error_code is not null then 1 end) as error_count,
            array_agg(distinct error_code) filter (where error_code is not null) as error_types
          from ai_requests
          where occurred_at > NOW() - INTERVAL '7 days'
          group by provider
        )
        select 
          provider,
          total_requests,
          success_rate,
          avg_latency,
          p95_latency,
          error_count,
          error_count::float / total_requests as error_rate,
          error_types
        from provider_stats
        order by success_rate desc, avg_latency asc
      `,
      category: 'ai',
      frequency: 'daily',
      enabled: true
    },
    {
      id: 'cost-optimization-opportunities',
      name: 'Oportunidades de Otimização de Custo',
      description: 'Identifica oportunidades para reduzir custos de IA',
      query: `
        with provider_efficiency as (
          select 
            provider,
            count(*) as requests,
            sum(cost_brl::numeric) as total_cost,
            avg(cost_brl::numeric) as avg_cost_per_request,
            avg(case when success then 1.0 else 0.0 end) as success_rate,
            avg(prompt_tokens + completion_tokens) as avg_tokens,
            avg(cost_brl::numeric) / avg(prompt_tokens + completion_tokens) as cost_per_token
          from ai_requests
          where occurred_at > NOW() - INTERVAL '30 days'
          group by provider
        )
        select 
          provider,
          requests,
          total_cost,
          avg_cost_per_request,
          success_rate,
          avg_tokens,
          cost_per_token,
          case 
            when success_rate < 0.8 then 'Low Success Rate'
            when cost_per_token > (select avg(cost_per_token) * 1.5 from provider_efficiency) then 'High Cost per Token'
            when avg_tokens > (select avg(avg_tokens) * 1.2 from provider_efficiency) then 'High Token Usage'
            else 'Efficient'
          end as optimization_opportunity
        from provider_efficiency
        order by total_cost desc
      `,
      category: 'cost',
      frequency: 'weekly',
      enabled: true
    }
  ];

  async executeInsight(insightId: string): Promise<InsightResult> {
    const insight = this.insights.find(i => i.id === insightId);
    if (!insight) {
      throw new Error(`Insight not found: ${insightId}`);
    }

    const startTime = Date.now();
    
    try {
      const data = await prisma.$queryRawUnsafe(insight.query);
      const executionTime = Date.now() - startTime;

      return {
        insight,
        data: data as any[],
        executedAt: new Date(),
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        insight,
        data: [],
        executedAt: new Date(),
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async executeAllInsights(): Promise<InsightResult[]> {
    const results: InsightResult[] = [];
    
    for (const insight of this.insights) {
      if (!insight.enabled) continue;
      
      try {
        const result = await this.executeInsight(insight.id);
        results.push(result);
      } catch (error) {
        console.error(`Error executing insight ${insight.id}:`, error);
        results.push({
          insight,
          data: [],
          executedAt: new Date(),
          executionTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async getInsightById(insightId: string): Promise<SQLInsight | null> {
    return this.insights.find(i => i.id === insightId) || null;
  }

  async getAllInsights(): Promise<SQLInsight[]> {
    return this.insights;
  }

  async getInsightsByCategory(category: string): Promise<SQLInsight[]> {
    return this.insights.filter(i => i.category === category);
  }

  async createCustomInsight(insight: Omit<SQLInsight, 'id'>): Promise<SQLInsight> {
    const newInsight: SQLInsight = {
      ...insight,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.insights.push(newInsight);
    return newInsight;
  }

  async updateInsight(insightId: string, updates: Partial<SQLInsight>): Promise<SQLInsight | null> {
    const index = this.insights.findIndex(i => i.id === insightId);
    if (index === -1) return null;

    this.insights[index] = { ...this.insights[index], ...updates };
    return this.insights[index];
  }

  async deleteInsight(insightId: string): Promise<boolean> {
    const index = this.insights.findIndex(i => i.id === insightId);
    if (index === -1) return false;

    this.insights.splice(index, 1);
    return true;
  }
}

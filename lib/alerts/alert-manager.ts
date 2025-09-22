import { prisma } from '@/lib/prisma';

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  duration: number; // em minutos
  channels: ('slack' | 'email')[];
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export class AlertManager {
  private rules: AlertRule[] = [
    {
      id: 'p95-latency',
      name: 'P95 Latency High',
      condition: 'p95_latency',
      threshold: 1000, // 1000ms
      duration: 5, // 5 minutos
      channels: ['slack', 'email'],
      enabled: true
    },
    {
      id: 'error-rate',
      name: 'Error Rate High',
      condition: 'error_rate',
      threshold: 0.05, // 5%
      duration: 2, // 2 minutos
      channels: ['slack', 'email'],
      enabled: true
    },
    {
      id: 'rps-low',
      name: 'RPS Low',
      condition: 'rps',
      threshold: 10, // 10 req/min
      duration: 10, // 10 minutos
      channels: ['slack'],
      enabled: true
    },
    {
      id: 'ai-provider-failure',
      name: 'AI Provider Failure',
      condition: 'ai_provider_success_rate',
      threshold: 0.8, // 80%
      duration: 3, // 3 minutos
      channels: ['slack', 'email'],
      enabled: true
    }
  ];

  async checkAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const now = new Date();

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        const alert = await this.evaluateRule(rule, now);
        if (alert) {
          alerts.push(alert);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }

    return alerts;
  }

  private async evaluateRule(rule: AlertRule, now: Date): Promise<Alert | null> {
    const since = new Date(now.getTime() - rule.duration * 60 * 1000);

    switch (rule.condition) {
      case 'p95_latency':
        return await this.checkP95Latency(rule, since);
      case 'error_rate':
        return await this.checkErrorRate(rule, since);
      case 'rps':
        return await this.checkRPS(rule, since);
      case 'ai_provider_success_rate':
        return await this.checkAIProviderSuccess(rule, since);
      default:
        return null;
    }
  }

  private async checkP95Latency(rule: AlertRule, since: Date): Promise<Alert | null> {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      with spans as (
        select
          (attributes->>'http.route') as route,
          durationms
        from "TraceSpan"
        where "startTime" > $1
          and (attributes ? 'http.route')
          and kind = 'SERVER'
      ),
      ranked as (
        select route, durationms,
               percent_rank() over (partition by route order by durationms) as pr
        from spans
      ),
      p95_by_route as (
        select route, max(durationms) filter (where pr <= 0.95) as p95_ms
        from ranked
        group by route
      )
      select max(p95_ms) as max_p95
      from p95_by_route
    `, since);

    const maxP95 = result[0]?.max_p95 || 0;
    
    if (maxP95 > rule.threshold) {
      return {
        id: `alert-${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        severity: maxP95 > 2000 ? 'critical' : maxP95 > 1500 ? 'high' : 'medium',
        message: `P95 latency is ${maxP95}ms (threshold: ${rule.threshold}ms)`,
        value: maxP95,
        threshold: rule.threshold,
        timestamp: new Date(),
        resolved: false
      };
    }

    return null;
  }

  private async checkErrorRate(rule: AlertRule, since: Date): Promise<Alert | null> {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      with base as (
        select (attributes->>'http.route') as route,
               (case when "statusCode" = '2' or "statusCode" = 'OK' then 0 else 1 end) as is_err
        from "TraceSpan"
        where "startTime" > $1 and (attributes ? 'http.route') and kind = 'SERVER'
      )
      select avg(is_err)::float as error_rate
      from base
    `, since);

    const errorRate = result[0]?.error_rate || 0;
    
    if (errorRate > rule.threshold) {
      return {
        id: `alert-${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        severity: errorRate > 0.1 ? 'critical' : errorRate > 0.07 ? 'high' : 'medium',
        message: `Error rate is ${(errorRate * 100).toFixed(2)}% (threshold: ${(rule.threshold * 100).toFixed(2)}%)`,
        value: errorRate,
        threshold: rule.threshold,
        timestamp: new Date(),
        resolved: false
      };
    }

    return null;
  }

  private async checkRPS(rule: AlertRule, since: Date): Promise<Alert | null> {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      select count(*)::float / extract(epoch from (now() - $1)) * 60 as rps
      from "TraceSpan"
      where "startTime" > $1 and kind = 'SERVER'
    `, since);

    const rps = result[0]?.rps || 0;
    
    if (rps < rule.threshold) {
      return {
        id: `alert-${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        severity: rps < 5 ? 'high' : 'medium',
        message: `RPS is ${rps.toFixed(2)} (threshold: ${rule.threshold})`,
        value: rps,
        threshold: rule.threshold,
        timestamp: new Date(),
        resolved: false
      };
    }

    return null;
  }

  private async checkAIProviderSuccess(rule: AlertRule, since: Date): Promise<Alert | null> {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      select 
        provider,
        avg(case when success then 1.0 else 0.0 end) as success_rate
      from "ai_requests"
      where "occurred_at" > $1
      group by provider
      having avg(case when success then 1.0 else 0.0 end) < $2
    `, since, rule.threshold);

    if (result.length > 0) {
      const provider = result[0].provider;
      const successRate = result[0].success_rate;
      
      return {
        id: `alert-${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        severity: successRate < 0.5 ? 'critical' : successRate < 0.7 ? 'high' : 'medium',
        message: `AI Provider ${provider} success rate is ${(successRate * 100).toFixed(2)}% (threshold: ${(rule.threshold * 100).toFixed(2)}%)`,
        value: successRate,
        threshold: rule.threshold,
        timestamp: new Date(),
        resolved: false
      };
    }

    return null;
  }

  async sendAlert(alert: Alert): Promise<void> {
    const rule = this.rules.find(r => r.id === alert.ruleId);
    if (!rule) return;

    for (const channel of rule.channels) {
      try {
        if (channel === 'slack') {
          await this.sendSlackAlert(alert);
        } else if (channel === 'email') {
          await this.sendEmailAlert(alert);
        }
      } catch (error) {
        console.error(`Error sending alert via ${channel}:`, error);
      }
    }
  }

  private async sendSlackAlert(alert: Alert): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('SLACK_WEBHOOK_URL not configured');
      return;
    }

    const color = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff6b6b',
      critical: '#8b0000'
    }[alert.severity];

    const payload = {
      text: `🚨 Alert: ${alert.message}`,
      attachments: [{
        color,
        fields: [
          { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
          { title: 'Value', value: alert.value.toString(), short: true },
          { title: 'Threshold', value: alert.threshold.toString(), short: true },
          { title: 'Time', value: alert.timestamp.toISOString(), short: true }
        ]
      }]
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    const emailConfig = {
      to: process.env.ALERT_EMAIL_TO,
      from: process.env.ALERT_EMAIL_FROM,
      subject: `[${alert.severity.toUpperCase()}] ${alert.message}`,
      html: `
        <h2>🚨 Alert: ${alert.message}</h2>
        <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
        <p><strong>Value:</strong> ${alert.value}</p>
        <p><strong>Threshold:</strong> ${alert.threshold}</p>
        <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
        <p><a href="${process.env.NEXTAUTH_URL}/status">View Dashboard</a></p>
      `
    };

    // Implementar envio de email (nodemailer, sendgrid, etc.)
    console.log('Email alert:', emailConfig);
  }
}

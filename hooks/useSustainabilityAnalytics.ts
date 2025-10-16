import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Leaf, 
  Users, 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Target,
  Award,
  Clock,
  Zap,
  Heart,
  Shield,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
  Share2,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Lightbulb,
  Recycle,
  TreePine,
  Droplets,
  Wind,
  Sun
} from 'lucide-react';

// Types for sustainability and inclusivity analytics
interface SustainabilityMetrics {
  id: string;
  category: 'energy' | 'carbon' | 'water' | 'waste' | 'transportation' | 'digital';
  metric: string;
  value: number;
  unit: string;
  baseline: number;
  target: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'positive' | 'negative' | 'neutral';
}

interface InclusivityMetrics {
  id: string;
  category: 'accessibility' | 'diversity' | 'equity' | 'representation' | 'participation';
  metric: string;
  value: number;
  unit: string;
  baseline: number;
  target: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'positive' | 'negative' | 'neutral';
  demographics: Demographics;
}

interface Demographics {
  age: AgeGroup[];
  gender: GenderGroup[];
  ethnicity: EthnicityGroup[];
  location: LocationGroup[];
  socioeconomic: SocioeconomicGroup[];
  disability: DisabilityGroup[];
  education: EducationGroup[];
}

interface AgeGroup {
  range: string;
  count: number;
  percentage: number;
}

interface GenderGroup {
  identity: string;
  count: number;
  percentage: number;
}

interface EthnicityGroup {
  ethnicity: string;
  count: number;
  percentage: number;
}

interface LocationGroup {
  region: string;
  count: number;
  percentage: number;
}

interface SocioeconomicGroup {
  level: string;
  count: number;
  percentage: number;
}

interface DisabilityGroup {
  type: string;
  count: number;
  percentage: number;
}

interface EducationGroup {
  level: string;
  count: number;
  percentage: number;
}

interface EnvironmentalImpact {
  id: string;
  activity: string;
  impact: 'carbon_footprint' | 'energy_consumption' | 'water_usage' | 'waste_generation';
  value: number;
  unit: string;
  reduction: number;
  timestamp: string;
  description: string;
}

interface AccessibilityScore {
  id: string;
  category: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'speech';
  score: number;
  maxScore: number;
  percentage: number;
  improvements: AccessibilityImprovement[];
  timestamp: string;
}

interface AccessibilityImprovement {
  id: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  cost: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  status: 'planned' | 'in_progress' | 'completed';
}

interface DiversityReport {
  id: string;
  title: string;
  period: string;
  metrics: DiversityMetric[];
  recommendations: DiversityRecommendation[];
  timestamp: string;
}

interface DiversityMetric {
  category: string;
  current: number;
  target: number;
  gap: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface DiversityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

interface B2BDashboard {
  id: string;
  clientId: string;
  clientName: string;
  metrics: B2BMetric[];
  reports: B2BReport[];
  lastUpdated: string;
}

interface B2BMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'on_track' | 'behind' | 'ahead';
  trend: 'up' | 'down' | 'stable';
}

interface B2BReport {
  id: string;
  title: string;
  type: 'sustainability' | 'inclusivity' | 'performance' | 'compliance';
  period: string;
  data: any;
  insights: string[];
  recommendations: string[];
  generatedAt: string;
}

// Sustainability and Inclusivity Analytics Hook
export function useSustainabilityAnalytics() {
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState<SustainabilityMetrics[]>([]);
  const [inclusivityMetrics, setInclusivityMetrics] = useState<InclusivityMetrics[]>([]);
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpact[]>([]);
  const [accessibilityScores, setAccessibilityScores] = useState<AccessibilityScore[]>([]);
  const [diversityReports, setDiversityReports] = useState<DiversityReport[]>([]);
  const [b2bDashboards, setB2bDashboards] = useState<B2BDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sustainability metrics
  const fetchSustainabilityMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/sustainability');
      if (!response.ok) {
        throw new Error('Failed to fetch sustainability metrics');
      }

      const data = await response.json();
      setSustainabilityMetrics(data.metrics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sustainability metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch inclusivity metrics
  const fetchInclusivityMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/inclusivity');
      if (!response.ok) {
        throw new Error('Failed to fetch inclusivity metrics');
      }

      const data = await response.json();
      setInclusivityMetrics(data.metrics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inclusivity metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch environmental impact data
  const fetchEnvironmentalImpact = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/environmental-impact');
      if (!response.ok) {
        throw new Error('Failed to fetch environmental impact data');
      }

      const data = await response.json();
      setEnvironmentalImpact(data.impact || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch environmental impact data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch accessibility scores
  const fetchAccessibilityScores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/accessibility');
      if (!response.ok) {
        throw new Error('Failed to fetch accessibility scores');
      }

      const data = await response.json();
      setAccessibilityScores(data.scores || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accessibility scores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch diversity reports
  const fetchDiversityReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/diversity');
      if (!response.ok) {
        throw new Error('Failed to fetch diversity reports');
      }

      const data = await response.json();
      setDiversityReports(data.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diversity reports');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch B2B dashboards
  const fetchB2bDashboards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/b2b-dashboards');
      if (!response.ok) {
        throw new Error('Failed to fetch B2B dashboards');
      }

      const data = await response.json();
      setB2bDashboards(data.dashboards || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch B2B dashboards');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate overall sustainability score
  const calculateSustainabilityScore = useCallback(() => {
    if (sustainabilityMetrics.length === 0) return 0;

    const totalScore = sustainabilityMetrics.reduce((sum, metric) => {
      const progress = (metric.value / metric.target) * 100;
      return sum + Math.min(progress, 100);
    }, 0);

    return Math.round(totalScore / sustainabilityMetrics.length);
  }, [sustainabilityMetrics]);

  // Calculate overall inclusivity score
  const calculateInclusivityScore = useCallback(() => {
    if (inclusivityMetrics.length === 0) return 0;

    const totalScore = inclusivityMetrics.reduce((sum, metric) => {
      const progress = (metric.value / metric.target) * 100;
      return sum + Math.min(progress, 100);
    }, 0);

    return Math.round(totalScore / inclusivityMetrics.length);
  }, [inclusivityMetrics]);

  // Calculate carbon footprint reduction
  const calculateCarbonReduction = useCallback(() => {
    const carbonMetrics = sustainabilityMetrics.filter(
      metric => metric.category === 'carbon'
    );

    if (carbonMetrics.length === 0) return 0;

    const totalReduction = carbonMetrics.reduce((sum, metric) => {
      const reduction = ((metric.baseline - metric.value) / metric.baseline) * 100;
      return sum + Math.max(reduction, 0);
    }, 0);

    return Math.round(totalReduction / carbonMetrics.length);
  }, [sustainabilityMetrics]);

  // Calculate accessibility score
  const calculateOverallAccessibilityScore = useCallback(() => {
    if (accessibilityScores.length === 0) return 0;

    const totalScore = accessibilityScores.reduce((sum, score) => {
      return sum + score.percentage;
    }, 0);

    return Math.round(totalScore / accessibilityScores.length);
  }, [accessibilityScores]);

  // Load all data on mount
  useEffect(() => {
    fetchSustainabilityMetrics();
    fetchInclusivityMetrics();
    fetchEnvironmentalImpact();
    fetchAccessibilityScores();
    fetchDiversityReports();
    fetchB2bDashboards();
  }, [
    fetchSustainabilityMetrics,
    fetchInclusivityMetrics,
    fetchEnvironmentalImpact,
    fetchAccessibilityScores,
    fetchDiversityReports,
    fetchB2bDashboards,
  ]);

  return {
    sustainabilityMetrics,
    inclusivityMetrics,
    environmentalImpact,
    accessibilityScores,
    diversityReports,
    b2bDashboards,
    loading,
    error,
    calculateSustainabilityScore,
    calculateInclusivityScore,
    calculateCarbonReduction,
    calculateOverallAccessibilityScore,
    fetchSustainabilityMetrics,
    fetchInclusivityMetrics,
    fetchEnvironmentalImpact,
    fetchAccessibilityScores,
    fetchDiversityReports,
    fetchB2bDashboards,
  };
}

// Sustainability Metrics Component
interface SustainabilityMetricsProps {
  metrics: SustainabilityMetrics[];
  onRefresh?: () => void;
}

export function SustainabilityMetrics({ metrics, onRefresh }: SustainabilityMetricsProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'carbon': return <TreePine className="w-4 h-4" />;
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'waste': return <Recycle className="w-4 h-4" />;
      case 'transportation': return <Wind className="w-4 h-4" />;
      case 'digital': return <Sun className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'energy': return 'text-yellow-600';
      case 'carbon': return 'text-green-600';
      case 'water': return 'text-blue-600';
      case 'waste': return 'text-purple-600';
      case 'transportation': return 'text-orange-600';
      case 'digital': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Métricas de Sustentabilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map(metric => (
          <div key={metric.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getCategoryColor(metric.category)}`}>
                {getCategoryIcon(metric.category)}
              </div>
              <div>
                <h4 className="font-semibold">{metric.metric}</h4>
                <p className="text-sm text-gray-600">
                  {metric.value} {metric.unit} • {metric.period}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {Math.round((metric.value / metric.target) * 100)}%
                  </span>
                  {getTrendIcon(metric.trend)}
                </div>
                <p className={`text-xs ${getImpactColor(metric.impact)}`}>
                  {metric.impact}
                </p>
              </div>
              
              <div className="w-16 h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${
                    metric.impact === 'positive' ? 'bg-green-500' :
                    metric.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" className="w-full">
            <Activity className="w-4 h-4 mr-2" />
            Atualizar Métricas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Inclusivity Metrics Component
interface InclusivityMetricsProps {
  metrics: InclusivityMetrics[];
  onRefresh?: () => void;
}

export function InclusivityMetrics({ metrics, onRefresh }: InclusivityMetricsProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accessibility': return <Shield className="w-4 h-4" />;
      case 'diversity': return <Users className="w-4 h-4" />;
      case 'equity': return <Award className="w-4 h-4" />;
      case 'representation': return <Globe className="w-4 h-4" />;
      case 'participation': return <Heart className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accessibility': return 'text-blue-600';
      case 'diversity': return 'text-purple-600';
      case 'equity': return 'text-green-600';
      case 'representation': return 'text-orange-600';
      case 'participation': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-600" />
          Métricas de Inclusividade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map(metric => (
          <div key={metric.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getCategoryColor(metric.category)}`}>
                {getCategoryIcon(metric.category)}
              </div>
              <div>
                <h4 className="font-semibold">{metric.metric}</h4>
                <p className="text-sm text-gray-600">
                  {metric.value} {metric.unit} • {metric.period}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {Math.round((metric.value / metric.target) * 100)}%
                  </span>
                  {getTrendIcon(metric.trend)}
                </div>
                <p className={`text-xs ${getImpactColor(metric.impact)}`}>
                  {metric.impact}
                </p>
              </div>
              
              <div className="w-16 h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${
                    metric.impact === 'positive' ? 'bg-green-500' :
                    metric.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" className="w-full">
            <Activity className="w-4 h-4 mr-2" />
            Atualizar Métricas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// B2B Dashboard Component
interface B2BDashboardProps {
  dashboard: B2BDashboard;
  onView?: (dashboard: B2BDashboard) => void;
  onExport?: (dashboard: B2BDashboard) => void;
}

export function B2BDashboard({ dashboard, onView, onExport }: B2BDashboardProps) {
  const handleView = useCallback(() => {
    onView?.(dashboard);
  }, [dashboard, onView]);

  const handleExport = useCallback(() => {
    onExport?.(dashboard);
  }, [dashboard, onExport]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'behind': return 'bg-red-100 text-red-800';
      case 'ahead': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          {dashboard.clientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {dashboard.metrics.map(metric => (
            <div key={metric.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{metric.name}</h4>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{metric.value}</span>
                <span className="text-sm text-gray-600">{metric.unit}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Meta: {metric.target} {metric.unit}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            Atualizado em: {new Date(dashboard.lastUpdated).toLocaleDateString('pt-BR')}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleView}>
              <BarChart3 className="w-4 h-4 mr-1" />
              Ver Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Cache Manager Component
 * Provides UI for managing IndexedDB cache, viewing stats, and controlling cache behavior
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Wifi, 
  WifiOff,
  Download,
  Upload,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useIndexedDBCache, CacheStatus } from '@/hooks/useIndexedDBCache';

interface CacheManagerProps {
  className?: string;
  showAdvanced?: boolean;
}

export function CacheManager({ className = '', showAdvanced = false }: CacheManagerProps) {
  const cache = useIndexedDBCache({
    autoInitialize: true,
    enableOfflineMode: true,
    onCacheUpdate: (key, data) => {
      console.log('Cache updated:', key);
    },
    onCacheError: (error) => {
      console.error('Cache error:', error);
    }
  });

  const [autoCleanup, setAutoCleanup] = useState(true);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Auto cleanup effect
  useEffect(() => {
    if (autoCleanup && cache.status.isInitialized) {
      const interval = setInterval(() => {
        cache.cleanupCache();
      }, 30 * 60 * 1000); // Every 30 minutes

      return () => clearInterval(interval);
    }
  }, [autoCleanup, cache]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getStorageUsageColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCacheStatusIcon = () => {
    if (cache.isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (cache.error) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (cache.status.isInitialized) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Database className="h-4 w-4 text-gray-500" />;
  };

  const getConnectionStatus = () => {
    return cache.status.isOnline ? (
      <div className="flex items-center gap-2 text-green-600">
        <Wifi className="h-4 w-4" />
        <span className="text-sm">Online</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-orange-600">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm">Offline</span>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Cache Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCacheStatusIcon()}
              <span>Cache Manager</span>
            </div>
            {getConnectionStatus()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Storage Usage</span>
              <span className={getStorageUsageColor(formatPercentage(cache.status.storageUsed, cache.status.storageQuota))}>
                {formatBytes(cache.status.storageUsed)} / {formatBytes(cache.status.storageQuota)}
              </span>
            </div>
            <Progress 
              value={formatPercentage(cache.status.storageUsed, cache.status.storageQuota)} 
              className="h-2"
            />
          </div>

          {/* Cache Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(cache.status.stats).reduce((sum, stat) => sum + stat.totalEntries, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(cache.status.stats).reduce((sum, stat) => sum + stat.hitRate, 0) / Object.keys(cache.status.stats).length || 0}%
              </div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={cache.refreshStats}
              variant="outline"
              size="sm"
              disabled={cache.isLoading}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={cache.cleanupCache}
              variant="outline"
              size="sm"
              disabled={cache.isLoading}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Cleanup
            </Button>
            <Button
              onClick={cache.clearCache}
              variant="destructive"
              size="sm"
              disabled={cache.isLoading}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Cache Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-cleanup" className="text-sm">
              Auto Cleanup
            </Label>
            <Switch
              id="auto-cleanup"
              checked={autoCleanup}
              onCheckedChange={setAutoCleanup}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="compression" className="text-sm">
              Compression
            </Label>
            <Switch
              id="compression"
              checked={compressionEnabled}
              onCheckedChange={setCompressionEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-details" className="text-sm">
              Show Details
            </Label>
            <Switch
              id="show-details"
              checked={showDetails}
              onCheckedChange={setShowDetails}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cache Stats */}
      {showDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Detailed Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(cache.status.stats).map(([cacheName, stats]) => (
                <div key={cacheName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {cacheName}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {formatBytes(stats.totalSize)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold">{stats.totalEntries}</div>
                      <div className="text-gray-600">Entries</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{stats.hitRate}%</div>
                      <div className="text-gray-600">Hit Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {new Date(stats.lastCleanup).toLocaleDateString()}
                      </div>
                      <div className="text-gray-600">Last Cleanup</div>
                    </div>
                  </div>
                  
                  {Object.entries(cache.status.stats).length > 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {cache.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Cache Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {cache.error.message}
            </p>
            <Button
              onClick={() => cache.initializeCache()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry Initialization
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline Mode Indicator */}
      {!cache.status.isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              You&apos;re currently offline. Cached content is available for viewing.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CacheManagerCompact({ className = '' }: { className?: string }) {
  const cache = useIndexedDBCache();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {cache.status.isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-orange-500" />
        )}
        <span className="text-xs text-gray-600">
          {formatBytes(cache.status.storageUsed)}
        </span>
      </div>
      
      <Button
        onClick={cache.refreshStats}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        disabled={cache.isLoading}
      >
        <RefreshCw className={`h-3 w-3 ${cache.isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}


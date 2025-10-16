'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Download,
  Share2,
  Bookmark,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Repeat,
  Shuffle,
  Settings,
  Headphones
} from 'lucide-react';
import { Trail, TrailModule } from '@/types/trails';

interface PodcastModeProps {
  trail: Trail;
  userId: string;
  onComplete?: () => void;
  onExit?: () => void;
  className?: string;
}

interface AudioTrack {
  id: string;
  title: string;
  url: string;
  duration: number;
  moduleId: string;
  moduleTitle: string;
  transcript?: string;
  chapters?: Array<{
    title: string;
    startTime: number;
    endTime: number;
  }>;
}

export function PodcastMode({ trail, userId, onComplete, onExit, className = '' }: PodcastModeProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [cachedTracks, setCachedTracks] = useState<Set<string>>(new Set());

  // Convert trail modules to audio tracks
  const audioTracks: AudioTrack[] = trail.modules.map((module, index) => ({
    id: `track-${module.id}`,
    title: module.title,
    url: `/api/audio/generate?text=${encodeURIComponent(module.description)}&moduleId=${module.id}`,
    duration: module.duration * 60, // Convert minutes to seconds
    moduleId: module.id,
    moduleTitle: module.title,
    transcript: module.description,
    chapters: [
      {
        title: 'Introdução',
        startTime: 0,
        endTime: module.duration * 30, // First half
      },
      {
        title: 'Conteúdo Principal',
        startTime: module.duration * 30,
        endTime: module.duration * 60,
      }
    ]
  }));

  const currentTrack = audioTracks[currentTrackIndex];

  // IndexedDB for offline caching
  const openDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PodcastCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('audioTracks')) {
          db.createObjectStore('audioTracks', { keyPath: 'id' });
        }
      };
    });
  }, []);

  const cacheAudioTrack = useCallback(async (track: AudioTrack) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['audioTracks'], 'readwrite');
      const store = transaction.objectStore('audioTracks');
      
      // Check if already cached
      const existing = await new Promise<any>((resolve, reject) => {
        const request = store.get(track.id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!existing) {
        // Fetch and cache the audio
        const response = await fetch(track.url);
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        await new Promise<void>((resolve, reject) => {
          const request = store.add({
            id: track.id,
            url: audioUrl,
            blob: audioBlob,
            track: track,
            cachedAt: new Date().toISOString()
          });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        setCachedTracks(prev => new Set([...prev, track.id]));
      }
    } catch (err) {
      console.error('Error caching audio track:', err);
    }
  }, [openDB]);

  const getCachedTrack = useCallback(async (trackId: string) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['audioTracks'], 'readonly');
      const store = transaction.objectStore('audioTracks');
      
      return new Promise<any>((resolve, reject) => {
        const request = store.get(trackId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Error getting cached track:', err);
      return null;
    }
  }, [openDB]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();
    const handleError = () => {
      setError('Erro ao reproduzir áudio');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Load current track
  useEffect(() => {
    if (!currentTrack) return;

    const loadTrack = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get cached version first
        const cached = await getCachedTrack(currentTrack.id);
        
        if (cached && isOffline) {
          // Use cached version
          if (audioRef.current) {
            audioRef.current.src = cached.url;
          }
        } else {
          // Try online first, fallback to cache
          try {
            if (audioRef.current) {
              audioRef.current.src = currentTrack.url;
            }
            // Cache for offline use
            await cacheAudioTrack(currentTrack);
          } catch (onlineError) {
            // Fallback to cached version
            if (cached) {
              if (audioRef.current) {
                audioRef.current.src = cached.url;
              }
            } else {
              throw new Error('Não é possível reproduzir este áudio offline');
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar áudio');
      } finally {
        setLoading(false);
      }
    };

    loadTrack();
  }, [currentTrack, isOffline, getCachedTrack, cacheAudioTrack]);

  // Update audio properties
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackSpeed;
  }, [volume, isMuted, playbackSpeed]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  }, [currentTrackIndex]);

  const handleNext = useCallback(() => {
    if (currentTrackIndex < audioTracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else if (isRepeat) {
      setCurrentTrackIndex(0);
    } else {
      // Trail completed
      onComplete?.();
    }
  }, [currentTrackIndex, audioTracks.length, isRepeat, onComplete]);

  const handleSeek = useCallback((value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const handleBookmark = useCallback(() => {
    // Implement bookmark functionality
    console.log('Bookmark current position:', currentTime);
  }, [currentTime]);

  const handleShare = useCallback(() => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: currentTrack?.title,
        text: `Ouça: ${currentTrack?.title} - ${trail.title}`,
        url: window.location.href,
      });
    }
  }, [currentTrack, trail]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{trail.title}</CardTitle>
                <p className="text-sm text-gray-600">Modo Podcast</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBookmark}>
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              {onExit && (
                <Button variant="outline" size="sm" onClick={onExit}>
                  Sair
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Offline Indicator */}
      {isOffline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Modo offline ativado. Reproduzindo conteúdo em cache.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Audio Player */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Current Track Info */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{currentTrack?.title}</h3>
              <p className="text-gray-600 mb-4">
                {currentTrackIndex + 1} de {audioTracks.length} • {trail.title}
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                  disabled={loading}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentTrackIndex === 0}
                aria-label="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                size="lg"
                onClick={isPlaying ? handlePause : handlePlay}
                disabled={loading}
                className="w-16 h-16 rounded-full"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentTrackIndex === audioTracks.length - 1 && !isRepeat}
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                    disabled={isMuted}
                  />
                </div>

                {/* Playback Speed */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Velocidade:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={isRepeat ? 'text-blue-600' : ''}
                  aria-label={isRepeat ? 'Disable repeat' : 'Enable repeat'}
                >
                  <Repeat className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={isShuffle ? 'text-blue-600' : ''}
                  aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Cache Status */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{cachedTracks.size} faixas em cache</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Tempo restante: {formatTime(duration - currentTime)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Track List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Playlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {audioTracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentTrackIndex
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentTrackIndex(index)}
                role="button"
                tabIndex={0}
                aria-label={`Play track: ${track.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentTrackIndex(index);
                  }
                }}
              >
                <div className="flex-shrink-0">
                  {index === currentTrackIndex && isPlaying ? (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Pause className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{track.title}</h4>
                  <p className="text-sm text-gray-500">{formatTime(track.duration)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {cachedTracks.has(track.id) && (
                    <Badge variant="outline" className="text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Cache
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}

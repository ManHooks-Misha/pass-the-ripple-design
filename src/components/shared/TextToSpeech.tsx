import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface TextToSpeechProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  className,
  autoPlay = false,
  onStart,
  onEnd,
  onError,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  // Refs for state to avoid stale closures in intervals
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  // Estimate duration based on text length and rate
  const estimateDuration = useCallback((text: string, speechRate: number): number => {
    const words = text.trim().split(/\s+/).length;
    // Average reading speed: 150 words per minute at 1x speed
    const wordsPerMinute = 150 * speechRate;
    const durationInSeconds = (words / wordsPerMinute) * 60;
    return Math.max(durationInSeconds, 1); // Minimum 1 second
  }, []);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      // Use refs for current state to avoid stale closure
      if (isPlayingRef.current && !isPausedRef.current) {
        const now = Date.now();
        const elapsed = elapsedBeforePauseRef.current + (now - startTimestampRef.current);
        const elapsedSeconds = elapsed / 1000;
        
        setCurrentTime(elapsedSeconds);
        
        if (totalDurationRef.current > 0) {
          const newProgress = Math.min((elapsedSeconds / totalDurationRef.current) * 100, 100);
          setProgress(newProgress);
        }
      }
    }, 100); // Update every 100ms for smooth progress
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const createUtterance = useCallback((playText: string = text) => {
    const utterance = new SpeechSynthesisUtterance(playText);
    utterance.rate = rate;
    utterance.volume = isMuted ? 0 : 1;
    utterance.lang = 'en-US';
   
    if (selectedVoice) {
      const voice = voices.find(v => v.voiceURI === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }
    return utterance;
  }, [text, rate, isMuted, selectedVoice, voices]);

  const handleStop = useCallback(() => {
    if (!isSupported) return;
   
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime(0);
    elapsedBeforePauseRef.current = 0;
    startTimestampRef.current = 0;
    stopProgressTracking();
  }, [isSupported, stopProgressTracking]);

  const handlePause = useCallback(() => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      // Quick stop tracking to prevent extra ticks
      stopProgressTracking();
      setIsPaused(true);
      setIsPlaying(false);
      // Defer actual pause to let event handle elapsed calc more accurately
      requestAnimationFrame(() => {
        synth.pause();
      });
    }
  }, [isSupported, stopProgressTracking]);

  const handlePlay = useCallback(() => {
    if (!isSupported || !text) return;

    const synth = window.speechSynthesis;
    if (synth.paused && utteranceRef.current) {
      // Resume existing
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startTimestampRef.current = Date.now();
      startProgressTracking();
      return;
    } 
    // Start new or from stopped
    handleStop(); // Clean up any existing
      
    const estimatedDuration = estimateDuration(text, rate);
    totalDurationRef.current = estimatedDuration;
    elapsedBeforePauseRef.current = 0;
    startTimestampRef.current = 0;
      
    const utterance = createUtterance();
    utteranceRef.current = utterance;
    utterance.onstart = () => {
      startTimestampRef.current = Date.now();
      elapsedBeforePauseRef.current = 0;
      setIsPlaying(true);
      setIsPaused(false);
      startProgressTracking();
      if (onStart) onStart();
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentTime(totalDurationRef.current);
      stopProgressTracking();
      if (onEnd) onEnd();
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      stopProgressTracking();
      if (onError) onError(new Error(`Speech error: ${event.error}`));
    };
    utterance.onpause = (event) => {
      // Accurate elapsed calc on actual pause event
      if (startTimestampRef.current > 0) {
        elapsedBeforePauseRef.current += (Date.now() - startTimestampRef.current);
      }
      setIsPaused(true);
      setIsPlaying(false);
      stopProgressTracking();
    };
    synth.speak(utterance);
  }, [isSupported, text, rate, createUtterance, handleStop, estimateDuration, onStart, onEnd, onError, startProgressTracking, stopProgressTracking]);

  const handleSeek = useCallback((value: number[]) => {
    if (!text) return;
   
    const seekPercent = value[0];
    setProgress(seekPercent);
   
    // Calculate the approximate character position
    const charIndex = Math.floor((seekPercent / 100) * text.length);
    const remainingText = text.substring(charIndex);
   
    // Always stop current to seek
    handleStop();
   
    // Calculate estimated time for seek position
    const estimatedTotalDuration = estimateDuration(text, rate);
    const seekTime = (seekPercent / 100) * estimatedTotalDuration;
    setCurrentTime(seekTime);
   
    // If seeking to very end, just stop
    if (seekPercent >= 99.9) {
      return;
    }
   
    // Start playback from seek position after a small delay
    setTimeout(() => {
      const utterance = createUtterance(remainingText);
      utteranceRef.current = utterance;
      
      // Set up the estimated duration for the remaining text
      const remainingDuration = estimateDuration(remainingText, rate);
      totalDurationRef.current = seekTime + remainingDuration;
      elapsedBeforePauseRef.current = seekTime * 1000; // Start with seek time as "elapsed"
      startTimestampRef.current = Date.now(); // For future deltas
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        startProgressTracking();
        if (onStart) onStart();
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        setCurrentTime(totalDurationRef.current);
        stopProgressTracking();
        if (onEnd) onEnd();
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
        stopProgressTracking();
        if (onError) onError(new Error(`Speech error: ${event.error}`));
      };
      utterance.onpause = (event) => {
        if (startTimestampRef.current > 0) {
          elapsedBeforePauseRef.current += (Date.now() - startTimestampRef.current);
        }
        setIsPaused(true);
        setIsPlaying(false);
        stopProgressTracking();
      };
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [text, rate, createUtterance, handleStop, estimateDuration, startProgressTracking, stopProgressTracking, onStart, onEnd, onError]);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
   
    if (utteranceRef.current) {
      utteranceRef.current.volume = newMutedState ? 0 : 1;
    }
  }, [isMuted]);

  const handleRateChange = useCallback((value: string) => {
    const newRate = parseFloat(value);
    setRate(newRate);
   
    // If currently playing/paused, restart with new rate from current progress
    if (isPlaying || isPaused) {
      const currentProgress = progress;
      handleStop();
      setTimeout(() => {
        setProgress(currentProgress);
        handleSeek([currentProgress]);
      }, 100);
    }
  }, [isPlaying, isPaused, progress, handleStop, handleSeek, setRate]);

  const handleVoiceChange = useCallback((value: string) => {
    setSelectedVoice(value);
   
    // If currently playing/paused, restart with new voice from current progress
    if (isPlaying || isPaused) {
      const currentProgress = progress;
      handleStop();
      setTimeout(() => {
        setProgress(currentProgress);
        handleSeek([currentProgress]);
      }, 100);
    }
  }, [isPlaying, isPaused, progress, handleStop, handleSeek]);

  // Load available voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      console.warn('Text-to-speech is not supported in this browser');
      return;
    }
    const getPreferredFemaleVoice = (availableVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
      // Try to find known female voices by name or language
      const femaleKeywords = ['female', 'woman', 'samantha', 'karen', 'kate', 'emily', 'serena', 'susan', 'linda', 'anna'];
     
      // Priority 1: Look for English female voices
      const enVoices = availableVoices.filter(v => v.lang.startsWith('en'));
     
      // Try matching known female names (case-insensitive)
      for (const voice of enVoices) {
        if (femaleKeywords.some(kw => voice.name.toLowerCase().includes(kw))) {
          return voice;
        }
      }
      // Fallback: first English voice
      return enVoices.length > 0 ? enVoices[0] : availableVoices[0] || null;
    };
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices().filter(v => v.voiceURI); // filter out empty
      setVoices(availableVoices);
      
      if (availableVoices.length > 0 && !selectedVoice) {
        const preferred = getPreferredFemaleVoice(availableVoices);
        if (preferred) {
          setSelectedVoice(preferred.voiceURI);
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      handleStop();
    };
  }, [handleStop]); // Depend on handleStop for cleanup

  useEffect(() => {
    if (autoPlay && text) {
      handlePlay();
    }
  }, [autoPlay, text, handlePlay]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedTotalDuration = estimateDuration(text, rate);

  if (!isSupported) {
    return (
      <div className={cn('text-sm text-muted-foreground p-4 text-center', className)}>
        Text-to-speech is not supported in your browser.
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 p-4 bg-muted/30 rounded-lg border w-full', className)}>
      {/* Progress and Time Display */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground font-medium">
            {formatTime(currentTime)}
          </span>
          <span className="text-muted-foreground font-medium">
            {formatTime(estimatedTotalDuration)}
          </span>
        </div>
        
        <div className="space-y-2">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            // Removed disabled to allow seeking during playback
            className="w-full cursor-pointer"
            onValueChange={handleSeek}
          />
        </div>
      </div>
      {/* Main Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="icon"
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={!text}
            className="h-10 w-10 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : isPaused ? (
              <Play className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
         
          <Button
            variant="outline"
            size="icon"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
         
          <Button
            variant={isMuted ? "default" : "outline"}
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        {/* Speed and Voice Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Speed:</span>
            <Select value={rate.toString()} onValueChange={handleRateChange}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">Normal</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {voices.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Voice:</span>
              <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
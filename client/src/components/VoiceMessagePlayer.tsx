import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface VoiceMessagePlayerProps {
    audioUrl: string;
    duration: number;
    sender: {
        firstName: string;
        lastName: string;
    };
    timestamp: Date;
    isOwnMessage?: boolean;
    onPlay?: () => void;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
    audioUrl,
    duration,
    sender,
    timestamp,
    isOwnMessage = false,
    onPlay
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleLoadedMetadata = () => {
            setAudioDuration(audio.duration);
            setError(null);
        };

        const handleError = () => {
            const errorMsg = audio.error ? `Error: ${audio.error.message || audio.error.code}` : 'Unknown playback error';
            console.error('Audio playback error:', errorMsg);
            setError('Playback failed');
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    const handlePlayPause = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                setError(null);
                await audio.play();
                setIsPlaying(true);
                if (onPlay) onPlay();
            }
        } catch (err: any) {
            console.error('Failed to play audio:', err);
            setError(err.name === 'NotAllowedError' ? 'Click again to play' : 'Cannot play audio');
            setIsPlaying(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatTimestamp = (date: Date): string => {
        const d = new Date(date);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${isOwnMessage
            ? 'bg-health-aqua text-white'
            : 'bg-gray-100 text-health-charcoal'
            }`}>
            <audio ref={audioRef} src={audioUrl} preload="metadata">
                <source src={audioUrl} type="audio/webm" />
                <source src={audioUrl} type="audio/ogg" />
                <source src={audioUrl} type="audio/mp4" />
            </audio>

            {/* Play/Pause Button */}
            <div className="relative">
                <Button
                    onClick={handlePlayPause}
                    size="sm"
                    variant={isOwnMessage ? "secondary" : "outline"}
                    className={`rounded-full w-10 h-10 p-0 ${isOwnMessage ? 'bg-white/20 hover:bg-white/30' : ''
                        }`}
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4" />
                    ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                    )}
                </Button>
                {error && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" title={error}></div>
                )}
            </div>

            {/* Waveform and Progress */}
            <div className="flex-1 min-w-0">
                {/* Sender and Time */}
                <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isOwnMessage ? 'text-white/90' : 'text-health-blue-gray'
                        }`}>
                        {isOwnMessage ? 'You' : `${sender.firstName} ${sender.lastName}`}
                        {error && <span className="ml-2 text-[10px] text-red-500 font-normal">({error})</span>}
                    </span>
                    <a
                        href={audioUrl}
                        download
                        className={`text-[10px] underline ml-2 opacity-50 hover:opacity-100 ${isOwnMessage ? 'text-white' : 'text-health-blue-gray'
                            }`}
                        title="Troubleshooting: Click to download and play manually"
                    >
                        Save
                    </a>
                    <span className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-health-blue-gray'
                        }`}>
                        {formatTimestamp(timestamp)}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                    <div className={`h-1 rounded-full ${isOwnMessage ? 'bg-white/20' : 'bg-gray-300'
                        }`}>
                        <div
                            className={`h-full rounded-full transition-all ${isOwnMessage ? 'bg-white' : 'bg-health-aqua'
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Duration */}
                <div className={`flex items-center justify-between mt-1 text-xs ${isOwnMessage ? 'text-white/70' : 'text-health-blue-gray'
                    }`}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                </div>
            </div>
        </div>
    );
};

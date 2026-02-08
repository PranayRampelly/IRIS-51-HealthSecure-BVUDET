import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Square, Play, Send, X, Pause } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface VoiceRecorderProps {
    onSend: (audioBlob: Blob, duration: number, format: string) => void;
    onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
    const {
        isRecording,
        isPaused,
        recordingTime,
        audioBlob,
        audioUrl,
        error,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        resetRecording,
        hasPermission
    } = useVoiceRecorder();

    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            setAudioElement(audio);

            audio.onended = () => {
                setIsPlaying(false);
            };

            return () => {
                audio.pause();
                audio.src = '';
            };
        }
    }, [audioUrl]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (!audioElement) return;

        if (isPlaying) {
            audioElement.pause();
            setIsPlaying(false);
        } else {
            audioElement.play();
            setIsPlaying(true);
        }
    };

    const handleSend = () => {
        if (!audioBlob) return;

        // Determine audio format from blob type
        const format = audioBlob.type.includes('webm') ? 'webm' :
            audioBlob.type.includes('ogg') ? 'ogg' : 'webm';

        onSend(audioBlob, recordingTime, format);
        resetRecording();
    };

    const handleCancel = () => {
        resetRecording();
        onCancel();
    };

    return (
        <Card className="p-4 space-y-4">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Recording Interface */}
            {!audioBlob && (
                <div className="flex flex-col items-center space-y-4">
                    {/* Recording Timer */}
                    <div className="text-center">
                        <div className="text-4xl font-bold text-health-charcoal">
                            {formatTime(recordingTime)}
                        </div>
                        <div className="text-sm text-health-blue-gray mt-1">
                            {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready to record'}
                        </div>
                        <div className="text-xs text-health-blue-gray mt-1">
                            Maximum duration: 30 seconds
                        </div>
                    </div>

                    {/* Waveform Visualization Placeholder */}
                    {isRecording && !isPaused && (
                        <div className="flex items-center justify-center space-x-1 h-12">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-health-aqua rounded-full animate-pulse"
                                    style={{
                                        height: `${Math.random() * 100}%`,
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex items-center space-x-3">
                        {!isRecording ? (
                            <>
                                <Button
                                    onClick={startRecording}
                                    size="lg"
                                    className="bg-health-aqua hover:bg-health-aqua/90 text-white rounded-full w-16 h-16"
                                >
                                    <Mic className="w-6 h-6" />
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                {!isPaused ? (
                                    <Button
                                        onClick={pauseRecording}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Pause className="w-4 h-4 mr-2" />
                                        Pause
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={resumeRecording}
                                        size="sm"
                                        className="bg-health-aqua hover:bg-health-aqua/90"
                                    >
                                        <Mic className="w-4 h-4 mr-2" />
                                        Resume
                                    </Button>
                                )}
                                <Button
                                    onClick={stopRecording}
                                    size="lg"
                                    variant="destructive"
                                    className="rounded-full w-16 h-16"
                                >
                                    <Square className="w-6 h-6" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Interface */}
            {audioBlob && audioUrl && (
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-health-charcoal">
                            {formatTime(recordingTime)}
                        </div>
                        <div className="text-sm text-health-blue-gray mt-1">
                            Recording complete
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handlePlayPause}
                            size="lg"
                            variant="outline"
                            className="rounded-full w-12 h-12"
                        >
                            <Play className={`w-5 h-5 ${isPlaying ? 'hidden' : 'block'}`} />
                            <Pause className={`w-5 h-5 ${isPlaying ? 'block' : 'hidden'}`} />
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handleSend}
                            size="lg"
                            className="bg-health-aqua hover:bg-health-aqua/90"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send Voice Message
                        </Button>
                        <Button
                            onClick={resetRecording}
                            variant="outline"
                            size="sm"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Re-record
                        </Button>
                    </div>
                </div>
            )}

            {/* Permission Info */}
            {!hasPermission && !isRecording && !error && (
                <div className="text-center text-sm text-health-blue-gray">
                    Click the microphone to start recording. You'll be asked for permission to use your microphone.
                </div>
            )}
        </Card>
    );
};

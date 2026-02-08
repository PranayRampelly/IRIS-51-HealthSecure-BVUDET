import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
    audioUrl: string | null;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    resetRecording: () => void;
    hasPermission: boolean;
}

const MAX_RECORDING_TIME = 30; // 30 seconds

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [cleanup, audioUrl]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            streamRef.current = stream;
            setHasPermission(true);

            // Determine supported MIME type
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4;codecs=aac',
                'audio/mp4',
                'audio/ogg;codecs=opus',
                'audio/ogg'
            ];

            const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

            if (!supportedMimeType) {
                throw new Error('No supported audio format found');
            }

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: supportedMimeType
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            // Handle data available
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Handle recording stop
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: supportedMimeType });
                setAudioBlob(blob);

                // Create URL for preview
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            };

            // Start recording
            mediaRecorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    const newTime = prev + 1;

                    // Auto-stop at max duration
                    if (newTime >= MAX_RECORDING_TIME) {
                        stopRecording();
                        setError('Maximum recording duration reached (30 seconds)');
                    }

                    return newTime;
                });
            }, 1000);

        } catch (err) {
            console.error('Error starting recording:', err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError('Microphone access denied. Please enable microphone permissions in your browser settings.');
                } else if (err.name === 'NotFoundError') {
                    setError('No microphone found. Please connect a microphone and try again.');
                } else {
                    setError(`Failed to start recording: ${err.message}`);
                }
            } else {
                setError('Failed to start recording');
            }
            setHasPermission(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);
    }, []);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);

            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);

            // Resume timer
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    const newTime = prev + 1;

                    if (newTime >= MAX_RECORDING_TIME) {
                        stopRecording();
                        setError('Maximum recording duration reached (30 seconds)');
                    }

                    return newTime;
                });
            }, 1000);
        }
    }, [stopRecording]);

    const resetRecording = useCallback(() => {
        cleanup();
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        setAudioBlob(null);

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }

        setError(null);
        audioChunksRef.current = [];
    }, [cleanup, audioUrl]);

    return {
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
    };
};

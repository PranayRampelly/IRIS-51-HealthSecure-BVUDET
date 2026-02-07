import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';
import { videoConsultationService } from '@/services/videoConsultationService';
import { toast } from 'sonner';

interface VideoConsultationProps {
  appointmentId: string;
  doctorName: string;
  patientName: string;
  isDoctor?: boolean;
  onEndConsultation?: () => void;
}

export const VideoConsultation: React.FC<VideoConsultationProps> = ({
  appointmentId,
  doctorName,
  patientName,
  isDoctor = false,
  onEndConsultation,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  console.log('🔍 VideoConsultation render - State:', { 
    isLoading, 
    isMuted, 
    isVideoOff, 
    containerElement: !!containerElement,
    initializationAttempted 
  });

  // Callback ref to ensure we get the actual DOM element
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    console.log('🔍 Container ref callback called with:', node);
    if (node !== null) {
      console.log('✅ Container DOM element received:', node);
      setContainerElement(node);
    } else {
      console.log('⚠️ Container ref callback called with null');
    }
  }, []);

  // Initialize video call when container is ready
  const initializeVideoCall = async () => {
    if (initializationAttempted) {
      console.log('⚠️ Initialization already attempted, skipping');
      return;
    }

    try {
      console.log('🔍 Initializing video call...');
      
      if (!containerElement) {
        console.error('❌ Container element is null');
        return;
      }
      
      console.log('✅ Container element is available:', containerElement);
      
      // Ensure Jitsi API script ready
      console.log('🔍 Waiting for Jitsi API to be ready...');
      await videoConsultationService.whenReady();
      console.log('✅ Jitsi API is ready');
      
      const roomName = videoConsultationService.generateSecureRoomName(appointmentId);
      const displayName = isDoctor ? doctorName : patientName;
      
      console.log('🔍 Room details:', { roomName, displayName, isDoctor });

      videoConsultationService.initializeCall({
        roomName,
        displayName,
        parentNode: containerElement,
        isDoctor,
        userInfo: {
          displayName,
        },
      });

      console.log('✅ Video call initialized successfully');
      setIsLoading(false);
      setInitializationAttempted(true);
    } catch (error) {
      console.error('❌ Failed to initialize video call:', error);
      toast.error('Failed to initialize video call. Please try again.');
      setInitializationAttempted(true);
    }
  };

  // Effect to initialize when container is ready
  useEffect(() => {
    if (containerElement && !initializationAttempted) {
      console.log('✅ Container ready, initializing video call');
      initializeVideoCall();
    }
  }, [containerElement, initializationAttempted]);

  const toggleMute = () => {
    videoConsultationService.toggleAudio();
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    videoConsultationService.toggleVideo();
    setIsVideoOff(!isVideoOff);
  };

  const endCall = () => {
    videoConsultationService.endCall();
    if (onEndConsultation) {
      onEndConsultation();
    } else {
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex flex-col h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-black">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <span className="text-lg">Initializing video call...</span>
              <div className="mt-4 text-sm text-gray-400">
                <p>Appointment ID: {appointmentId}</p>
                <p>Room: {videoConsultationService.generateSecureRoomName(appointmentId)}</p>
                <p>Display Name: {isDoctor ? doctorName : patientName}</p>
                <p>Container: {containerElement ? 'READY' : 'WAITING'}</p>
                <p>Init Attempted: {initializationAttempted ? 'YES' : 'NO'}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              className="flex-1 bg-black border-2 border-red-500"
              style={{ minHeight: 'calc(100vh - 80px)' }}
              data-testid="video-container"
            />
            <div className="bg-blue-500 text-white p-2 text-center text-sm">
              🎥 Video Container: {containerElement ? 'READY' : 'WAITING'} | 
              Init: {initializationAttempted ? 'ATTEMPTED' : 'PENDING'}
            </div>
            <div className="flex justify-center items-center gap-4 p-4 bg-gray-900 border-t border-gray-700">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className={`${isMuted ? 'bg-red-500 text-white' : 'bg-white text-gray-900'} hover:bg-gray-200`}
              >
                {isMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVideo}
                className={`${isVideoOff ? 'bg-red-500 text-white' : 'bg-white text-gray-900'} hover:bg-gray-200`}
              >
                {isVideoOff ? (
                  <VideoOff className="h-4 w-4" />
                ) : (
                  <VideoIcon className="h-4 w-4" />
                )}
              </Button>
              {isDoctor && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg">
                  <span className="text-sm font-medium">Doctor Mode</span>
                </div>
              )}
              <Button
                variant="destructive"
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDoctor ? 'End Consultation' : 'End Call'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 
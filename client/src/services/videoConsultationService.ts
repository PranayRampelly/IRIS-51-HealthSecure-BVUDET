// Deterministic room naming so doctor and patient join the same room consistently

interface VideoConsultationConfig {
  roomName: string;
  displayName: string;
  subject?: string;
  width?: string | number;
  height?: string | number;
  parentNode?: HTMLElement;
  isDoctor?: boolean;
  configOverwrite?: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    enableClosePage?: boolean;
    disableInviteFunctions?: boolean;
    hideConferenceSubject?: boolean;
  };
  interfaceConfigOverwrite?: {
    TOOLBAR_BUTTONS?: string[];
    SETTINGS_SECTIONS?: string[];
  };
  userInfo?: {
    displayName?: string;
    email?: string;
  };
}

class VideoConsultationService {
  private domain = 'meet.jit.si';
  private api: any = null;
  private apiLoadedPromise: Promise<void>;

  constructor() {
    // Load Jitsi Meet External API script and expose a readiness promise
    this.apiLoadedPromise = new Promise<void>((resolve) => {
      if ((window as any).JitsiMeetExternalAPI) {
        resolve();
        return;
      }
      
      const existing = document.querySelector('script[data-jitsi-external-api]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => resolve());
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.setAttribute('data-jitsi-external-api', 'true');
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.body.appendChild(script);
    });
  }

  generateSecureRoomName(appointmentId: string): string {
    // Deterministic public room so both sides bypass moderator gate and connect instantly
    return `healthsecure-${appointmentId}-public`;
  }

  async whenReady(): Promise<void> {
    await this.apiLoadedPromise;
  }

  initializeCall(config: VideoConsultationConfig): void {
    if (!(window as any).JitsiMeetExternalAPI) {
      console.error('❌ Jitsi Meet API not loaded');
      return;
    }

    const defaultConfig = {
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableClosePage: true,
        disableInviteFunctions: true,
        hideConferenceSubject: true,
        prejoinPageEnabled: false,
        disableRemoteMute: config.isDoctor ? false : true, // Doctors can mute others
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: config.isDoctor ? [
          'camera',
          'chat',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'hangup',
          'microphone',
          'participants-pane',
          'settings',
          'toggle-camera',
          'mute-everyone',
          'mute-video-everyone',
        ] : [
          'camera',
          'chat',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'hangup',
          'microphone',
          'participants-pane',
          'settings',
          'toggle-camera',
        ],
        SETTINGS_SECTIONS: config.isDoctor ? ['devices', 'language', 'moderator', 'admin'] : ['devices', 'language', 'moderator'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#FFFFFF',
        DEFAULT_REMOTE_DISPLAY_NAME: config.isDoctor ? 'Patient' : 'Healthcare Provider',
      },
    };

    const mergedConfig = { ...defaultConfig, ...config };

    console.log('🔍 Creating Jitsi Meet External API instance...');
    this.api = new (window as any).JitsiMeetExternalAPI(
      this.domain,
      {
        ...mergedConfig,
        roomName: mergedConfig.roomName,
      }
    );
    console.log('✅ Jitsi Meet External API instance created');

    // Add event listeners
    this.api.addEventListeners({
      videoConferenceJoined: this.handleVideoConferenceJoined.bind(this),
      participantJoined: this.handleParticipantJoined.bind(this),
      participantLeft: this.handleParticipantLeft.bind(this),
      readyToClose: this.handleReadyToClose.bind(this),
    });
  }

  private handleVideoConferenceJoined(participant: any): void {
    console.log('Joined video conference', participant);
  }

  private handleParticipantJoined(participant: any): void {
    console.log('Participant joined', participant);
  }

  private handleParticipantLeft(participant: any): void {
    console.log('Participant left', participant);
  }

  private handleReadyToClose(): void {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
  }

  // Public methods for video controls
  toggleAudio(): void {
    if (this.api) {
      this.api.executeCommand('toggleAudio');
    }
  }

  toggleVideo(): void {
    if (this.api) {
      this.api.executeCommand('toggleVideo');
    }
  }

  endCall(): void {
    if (this.api) {
      this.api.executeCommand('hangup');
      this.api.dispose();
      this.api = null;
    }
  }
}

export const videoConsultationService = new VideoConsultationService(); 
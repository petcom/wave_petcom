
// Main Mixer Controller - Orchestrates audio engine and UI
import { AudioEngine } from './audioEngine.js';
import { MixerUI } from './ui.js';
import { MixerState, TrackState, EffectType } from './types.js';
import { AUDIO_TRACKS, EFFECTS, MIXER_CONFIG } from './config.js';

export class Mixer {

  private audioEngine: AudioEngine;
  private ui: MixerUI;
  private state: MixerState;
  private heroElement: HTMLElement | null = null;
  private isInitialized = false;
  private manifestFiles: { [key: string]: string[] } = {};

  constructor() {
    this.audioEngine = new AudioEngine();
    this.ui = new MixerUI((trackId, action, value) => this.handleTrackControl(trackId, action, value));
    // State will be initialized after manifests are loaded
        this.state = {
            isVisible: false,
            masterVolume: 0.8,
            tracks: [],
            effects: [...EFFECTS],
            lastInteraction: Date.now()
        };
  }

  // Loads all manifests and initializes state
  private async loadManifestsAndInitState(): Promise<void> {
    this.manifestFiles = {};
    for (const track of AUDIO_TRACKS) {
      try {
        const resp = await fetch(track.manifest);
        const data = await resp.json();
        if (!data.directory) {
          console.error(`Manifest for track '${track.id}' is missing required 'directory' field.`);
          this.manifestFiles[track.id] = [];
          continue;
        }
        const dir = data.directory.replace(/\/+$/, ''); // remove trailing slashes
        this.manifestFiles[track.id] = (data.files || []).map((file: string) => `${dir}/${file}`);
      } catch (e) {
        console.error(`Failed to load manifest for ${track.id}:`, e);
        this.manifestFiles[track.id] = [];
      }
    }
    // Now initialize state.tracks
    this.state.tracks = AUDIO_TRACKS.map(track => ({
      id: track.id,
      isPlaying: false,
      volume: 0.7,
      pan: 0,
      effectsEnabled: false,
      currentFile: (this.manifestFiles[track.id] && this.manifestFiles[track.id][0]) || ''
    }));
  }

  async initialize(heroSelector: string = '.site-header'): Promise<boolean> {
    try {
      // Load manifests and initialize state
      await this.loadManifestsAndInitState();

      // Find hero element
      this.heroElement = document.querySelector(heroSelector);
      if (!this.heroElement) {
        console.warn(`Hero element not found: ${heroSelector}`);
        return false;
      }

      // Check browser compatibility
      if (!this.checkBrowserSupport()) {
        console.warn('Browser not supported for audio mixer');
        return false;
      }

      // NOTE: Don't initialize audio engine here - defer until user interaction
      // This prevents hanging on browsers that require user gesture for AudioContext

      // Expose this mixer instance globally for UI file selector access
      (window as any).mixer = this;

      // Create UI
      const mixerElement = this.ui.create();
      document.body.appendChild(mixerElement);

      // Set up event listeners
      this.setupEventListeners();

      // NOTE: Track nodes will be initialized when audio engine is ready

      this.isInitialized = true;
      console.log('Binaural Relaxation Mixer initialized successfully (audio deferred)');
      return true;

    } catch (error) {
      console.error('Failed to initialize mixer:', error);
      return false;
    }
  }

  private checkBrowserSupport(): boolean {
    // Check for essential APIs
    const hasWebAudio = !!(window.AudioContext || (window as any).webkitAudioContext);
    const hasStereoPanner = 'StereoPannerNode' in window;
    
    if (!hasWebAudio) {
      return false;
    }

    // StereoPanner fallback is handled in audio engine
    if (!hasStereoPanner) {
      console.warn('StereoPanner not supported, using fallback');
    }

    return true;
  }

  private async ensureAudioInitialized(): Promise<boolean> {
// (end of file)
    // If audio is already initialized, return success
    if (this.audioEngine.isInitialized()) {
      return true;
    }

    console.log('Initializing audio engine (user interaction detected)...');

    try {
      // Initialize audio engine
      const audioInitialized = await this.audioEngine.initialize();
      if (!audioInitialized) {
        console.error('Failed to initialize audio engine');
        return false;
      }

      // Initialize track nodes
      this.initializeTrackNodes();

      console.log('Audio engine initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      return false;
    }
  }

  private setupEventListeners(): void {
    if (!this.heroElement) return;

    // Background click to show mixer
    this.heroElement.addEventListener('click', async (e) => {
      // Only trigger on background clicks, not on interactive elements
      const target = e.target as HTMLElement;
      if (target === this.heroElement || target.closest('.site-header-content')) {
        await this.show();
      }
    });

    // Set up UI interaction callback
    this.ui.setOnInteraction(() => {
      this.state.lastInteraction = Date.now();
    });

    // Set up UI hide callback
    this.ui.setOnHide(() => {
      this.state.isVisible = false;
    });

    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllTracks();
      }
    });
  }

  private initializeTrackNodes(): void {
    for (const track of this.state.tracks) {
      this.audioEngine.createTrackNodes(track.id);
    }
  }

  private async handleTrackControl(trackId: string, action: string, value?: number): Promise<void> {
    if (trackId === 'mixer' && action === 'close') {
      this.hide();
      return;
    }

    if (trackId === 'master') {
      this.handleMasterControl(action, value);
      return;
    }

    if (trackId === 'effects') {
      this.handleEffectControl(action);
      return;
    }

    const trackState = this.state.tracks.find(t => t.id === trackId);
    if (!trackState) return;

    switch (action) {
      case 'play':
        await this.toggleTrackPlayback(trackId);
        break;
      case 'volume':
        if (value !== undefined) {
          trackState.volume = value;
          this.audioEngine.setTrackVolume(trackId, value);
        }
        break;
      case 'pan':
        if (value !== undefined) {
          trackState.pan = value;
          this.audioEngine.setTrackPan(trackId, value);
        }
        break;
      case 'effects':
        trackState.effectsEnabled = !trackState.effectsEnabled;
        this.audioEngine.setTrackEffects(trackId, trackState.effectsEnabled);
        break;
      case 'cycleFile':
        if (typeof value === 'number') {
          const files = this.manifestFiles[trackId] || [];
          if (files.length > 0) {
            const currentIdx = (trackState as any).currentFileIndex || 0;
            let newIdx = (currentIdx + value + files.length) % files.length;
            (trackState as any).currentFileIndex = newIdx;
            trackState.currentFile = files[newIdx];
            // If playing, switch file immediately
            if (trackState.isPlaying) {
              await this.audioEngine.stopTrack(trackId);
              const success = await this.audioEngine.playTrack(trackId, trackState.currentFile);
              trackState.isPlaying = success;
            }
          }
        }
        break;
    }
    // Update UI
    this.ui.updateTrackState(trackId, trackState);
  }

  private handleMasterControl(action: string, value?: number): void {
    if (action === 'volume' && value !== undefined) {
      this.state.masterVolume = value;
      this.audioEngine.setMasterVolume(value);
    }
  }

  private handleEffectControl(effectId: string): void {
    const effect = this.state.effects.find(e => e.id === effectId);
    if (!effect) return;

    effect.enabled = !effect.enabled;
    this.audioEngine.toggleEffect(effectId, effect.enabled);
    this.ui.updateEffectState(this.state.effects);
  }

  private async toggleTrackPlayback(trackId: string): Promise<void> {
    const trackState = this.state.tracks.find(t => t.id === trackId);
    const trackConfig = AUDIO_TRACKS.find(t => t.id === trackId);
    
    if (!trackState || !trackConfig) return;

    if (trackState.isPlaying) {
      // Stop track
      this.audioEngine.stopTrack(trackId);
      trackState.isPlaying = false;
    } else {
      // Start track
      const files = this.manifestFiles[trackId] || [];
      const currentFileIndex = (trackState as any).currentFileIndex || 0;
      const filename = files[currentFileIndex] || '';
      const success = await this.audioEngine.playTrack(trackId, filename);
      if (success) {
        trackState.isPlaying = true;
        trackState.currentFile = filename;
      }
    }
  }

  private pauseAllTracks(): void {
    for (const track of this.state.tracks) {
      if (track.isPlaying) {
        this.audioEngine.stopTrack(track.id);
        track.isPlaying = false;
        this.ui.updateTrackState(track.id, track);
      }
    }
  }

  async show(): Promise<void> {
    if (!this.isInitialized || this.state.isVisible) return;

    // Initialize audio engine on first show (user interaction)
    const audioReady = await this.ensureAudioInitialized();
    if (!audioReady) {
      console.error('Cannot show mixer: audio initialization failed');
      return;
    }

    this.state.isVisible = true;
    this.ui.show();
  }

  hide(): void {
    if (!this.state.isVisible) return;

    this.state.isVisible = false;
    this.ui.hide();
  }

  // Public methods for external control
  async switchTrackFile(trackId: string, fileIndex: number): Promise<boolean> {
    const trackConfig = AUDIO_TRACKS.find(t => t.id === trackId);
    const trackState = this.state.tracks.find(t => t.id === trackId);
    
    const files = this.manifestFiles[trackId] || [];
    if (!trackConfig || !trackState || fileIndex >= files.length) {
      return false;
    }

    const wasPlaying = trackState.isPlaying;
    if (wasPlaying) {
      this.audioEngine.stopTrack(trackId);
    }

    (trackState as any).currentFileIndex = fileIndex;
    trackState.currentFile = files[fileIndex];

    if (wasPlaying) {
      const success = await this.audioEngine.playTrack(trackId, trackState.currentFile);
      trackState.isPlaying = success;
      this.ui.updateTrackState(trackId, trackState);
      return success;
    }

    return true;
  }

  getTrackFiles(trackId: string): string[] {
    return this.manifestFiles[trackId] ? [...this.manifestFiles[trackId]] : [];
  }

  isVisible(): boolean {
    return this.state.isVisible;
  }

  dispose(): void {
    this.pauseAllTracks();
    this.audioEngine.dispose();
    this.ui.dispose();
    this.isInitialized = false;
  }
}

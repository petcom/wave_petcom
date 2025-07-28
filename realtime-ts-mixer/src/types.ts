// Types and interfaces for the Binaural Relaxation Mixer

export interface AudioTrack {
  id: string;
  name: string;
  category: 'brainwave1' | 'brainwave2' | 'animals' | 'nature' | 'relaxing';
  manifest: string;
  currentFileIndex: number;
}

export interface EffectType {
  id: string;
  name: string;
  enabled: boolean;
}

export interface TrackState {
  id: string;
  isPlaying: boolean;
  volume: number; // 0-1
  pan: number; // -1 to 1 (left to right)
  effectsEnabled: boolean;
  currentFile: string;
}

export interface MixerState {
  isVisible: boolean;
  masterVolume: number;
  tracks: TrackState[];
  effects: EffectType[];
  lastInteraction: number;
}

export interface AudioNodes {
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  panNode: StereoPannerNode;
  effectsGain: GainNode;
  masterGain: GainNode;
}

export interface MixerConfig {
  audioPath: string;
  autoHideDelay: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

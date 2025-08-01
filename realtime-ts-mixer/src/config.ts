// Audio configuration and track definitions

import { AudioTrack, EffectType, MixerConfig } from './types.js';

// Environment detection
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '8080' ||
                     window.location.port === '3000';

// Development configuration - direct connection to Express server
const DEVELOPMENT_CONFIG: MixerConfig = {
  audioPath: 'http://localhost:8180/audio-mixer/andrew',
  autoHideDelay: 15000,
  fadeInDuration: 500,
  fadeOutDuration: 300,
  useCDN: false,
  environment: 'development'
};

// Production configuration - relative path, nginx reverse proxy handles routing
const PRODUCTION_CONFIG: MixerConfig = {
  audioPath: '/audio-mixer/andrew',
  autoHideDelay: 15000,
  fadeInDuration: 500,
  fadeOutDuration: 300,
  useCDN: false,
  environment: 'production'
};

export const MIXER_CONFIG: MixerConfig = isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;

// Debug logging
console.log(`🔧 Mixer Environment: ${MIXER_CONFIG.environment}`);
console.log(`🎵 Audio Path: ${MIXER_CONFIG.audioPath}`);

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'brainwave1',
    name: 'Brainwave 1',
    category: 'brainwave1',
    manifest: 'manifests/brainwave.json',
    currentFileIndex: 0
  },
  {
    id: 'brainwave2',
    name: 'Brainwave 2',
    category: 'brainwave2',
    manifest: 'manifests/brainwave.json',
    currentFileIndex: 0
  },
  {
    id: 'animals',
    name: 'Animals',
    category: 'animals',
    manifest: 'manifests/animals.json',
    currentFileIndex: 0
  },
  {
    id: 'nature',
    name: 'Nature',
    category: 'nature',
    manifest: 'manifests/nature.json',
    currentFileIndex: 0
  },
  {
    id: 'relaxing',
    name: 'Relaxing',
    category: 'relaxing',
    manifest: 'manifests/relaxing.json',
    currentFileIndex: 0
  }
];

export const EFFECTS: EffectType[] = [
  { id: 'reverb', name: 'Reverb', enabled: false },
  { id: 'delay', name: 'Delay', enabled: false },
  { id: 'bitshift', name: 'Bit-Shift', enabled: false },
  { id: 'distortion', name: 'Distortion', enabled: false }
];

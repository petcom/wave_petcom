// Audio configuration and track definitions

import { AudioTrack, EffectType, MixerConfig } from './types.js';

export const MIXER_CONFIG: MixerConfig = {
  audioPath: 'https://sonar-media.sfo3.cdn.digitaloceanspaces.com/mixer/andrew',
  autoHideDelay: 15000, // 15 seconds
  fadeInDuration: 500,
  fadeOutDuration: 300,
  useCDN: true
};

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

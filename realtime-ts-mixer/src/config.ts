// Audio configuration and track definitions

import { AudioTrack, EffectType, MixerConfig } from './types.js';

export const MIXER_CONFIG: MixerConfig = {
  audioPath: '/audio/loops',
  autoHideDelay: 15000, // 15 seconds
  fadeInDuration: 500,
  fadeOutDuration: 300
};

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'brainwave1',
    name: 'Brainwave 1',
    category: 'brainwave1',
    files: [
      'brainwave1_alpha.wav',
      'brainwave1_beta.wav',
      'brainwave1_theta.wav',
      'brainwave1_delta.wav',
      'brainwave1_gamma.wav'
    ],
    currentFileIndex: 0
  },
  {
    id: 'brainwave2',
    name: 'Brainwave 2',
    category: 'brainwave2',
    files: [
      'brainwave2_alpha.wav',
      'brainwave2_beta.wav',
      'brainwave2_theta.wav',
      'brainwave2_delta.wav',
      'brainwave2_gamma.wav'
    ],
    currentFileIndex: 0
  },
  {
    id: 'animals',
    name: 'Animals',
    category: 'animals',
    files: [
      'animals_birds.wav',
      'animals_crickets.wav',
      'animals_cat_purr.wav',
      'animals_dog_pant.wav'
    ],
    currentFileIndex: 0
  },
  {
    id: 'nature',
    name: 'Nature',
    category: 'nature',
    files: [
      'nature_rain.wav',
      'nature_rain_thunder.wav',
      'nature_car_noise.wav',
      'nature_enterprise_d.wav'
    ],
    currentFileIndex: 0
  },
  {
    id: 'relaxing',
    name: 'Relaxing',
    category: 'relaxing',
    files: [
      'relaxing_baby_mobile.wav',
      'relaxing_water_play.wav',
      'relaxing_shifting_sand.wav'
    ],
    currentFileIndex: 0
  }
];

export const EFFECTS: EffectType[] = [
  { id: 'reverb', name: 'Reverb', enabled: false },
  { id: 'delay', name: 'Delay', enabled: false },
  { id: 'bitshift', name: 'Bit-Shift', enabled: false },
  { id: 'distortion', name: 'Distortion', enabled: false }
];

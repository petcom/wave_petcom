// Audio Engine - Handles Web Audio API operations

import { AudioNodes, TrackState, EffectType } from './types.js';
import { MIXER_CONFIG } from './config.js';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private trackNodes: Map<string, AudioNodes> = new Map();
  private masterGainNode: GainNode | null = null;
  private effectsNodes: Map<string, AudioNode> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();

  isInitialized(): boolean {
    return this.audioContext !== null;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check for Web Audio API support
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn('Web Audio API not supported');
        return false;
      }

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Handle suspended context (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create master gain node
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);

      // Initialize effects nodes
      this.initializeEffects();

      return true;
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      return false;
    }
  }

  private initializeEffects(): void {
    if (!this.audioContext) return;

    // Create effect nodes
    const reverbNode = this.audioContext.createConvolver();
    const delayNode = this.audioContext.createDelay(1.0);
    const distortionNode = this.audioContext.createWaveShaper();
    const filterNode = this.audioContext.createBiquadFilter();

    // Configure effects
    delayNode.delayTime.value = 0.3;
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 1000;

    // Store effect nodes
    this.effectsNodes.set('reverb', reverbNode);
    this.effectsNodes.set('delay', delayNode);
    this.effectsNodes.set('distortion', distortionNode);
    this.effectsNodes.set('bitshift', filterNode);
  }

  async loadAudioFile(filename: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    // Check if already loaded
    if (this.audioBuffers.has(filename)) {
      return this.audioBuffers.get(filename)!;
    }

    // Check if currently loading
    if (this.loadingPromises.has(filename)) {
      return await this.loadingPromises.get(filename)!;
    }

    const loadPromise = this.fetchAndDecodeAudio(filename);
    this.loadingPromises.set(filename, loadPromise);

    try {
      const buffer = await loadPromise;
      this.audioBuffers.set(filename, buffer);
      this.loadingPromises.delete(filename);
      return buffer;
    } catch (error) {
      console.error(`Failed to load audio file ${filename}:`, error);
      this.loadingPromises.delete(filename);
      return null;
    }
  }

  private async fetchAndDecodeAudio(filename: string): Promise<AudioBuffer> {
    // Ensure no duplicate slashes in URL
    let base = MIXER_CONFIG.audioPath;
    if (base.endsWith('/')) base = base.slice(0, -1);
    let file = filename;
    if (file.startsWith('/')) file = file.slice(1);
    const url = `${base}/${file}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext!.decodeAudioData(arrayBuffer);
  }

  createTrackNodes(trackId: string): AudioNodes | null {
    if (!this.audioContext || !this.masterGainNode) return null;

    const gainNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();
    const effectsGain = this.audioContext.createGain();

    // Connect nodes: source -> gain -> pan -> effects -> master
    gainNode.connect(panNode);
    panNode.connect(effectsGain);
    effectsGain.connect(this.masterGainNode);

    const nodes: AudioNodes = {
      source: null,
      gainNode,
      panNode,
      effectsGain,
      masterGain: this.masterGainNode
    };

    this.trackNodes.set(trackId, nodes);
    return nodes;
  }

  async playTrack(trackId: string, filename: string): Promise<boolean> {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes || !this.audioContext) return false;

    // Stop existing source if playing
    if (nodes.source) {
      nodes.source.stop();
      nodes.source.disconnect();
    }

    // Load audio buffer
    const buffer = await this.loadAudioFile(filename);
    if (!buffer) return false;

    // Create new source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(nodes.gainNode);

    nodes.source = source;
    source.start();

    return true;
  }

  stopTrack(trackId: string): void {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes || !nodes.source) return;

    nodes.source.stop();
    nodes.source.disconnect();
    nodes.source = null;
  }

  setTrackVolume(trackId: string, volume: number): void {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes) return;

    nodes.gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
  }

  setTrackPan(trackId: string, pan: number): void {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes) return;

    nodes.panNode.pan.setValueAtTime(pan, this.audioContext!.currentTime);
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGainNode || !this.audioContext) return;
    this.masterGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

  setTrackEffects(trackId: string, enabled: boolean): void {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes) return;

    // TODO: Connect/disconnect effects chain
    // For now, just adjust the effects gain
    const effectsVolume = enabled ? 1.0 : 0.0;
    nodes.effectsGain.gain.setValueAtTime(effectsVolume, this.audioContext!.currentTime);
  }

  toggleEffect(effectId: string, enabled: boolean): void {
    // TODO: Implement individual effect toggling
    console.log(`Effect ${effectId} ${enabled ? 'enabled' : 'disabled'}`);
  }

  dispose(): void {
    // Stop all tracks
    for (const [trackId] of this.trackNodes) {
      this.stopTrack(trackId);
    }

    // Clear maps
    this.trackNodes.clear();
    this.audioBuffers.clear();
    this.effectsNodes.clear();
    this.loadingPromises.clear();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

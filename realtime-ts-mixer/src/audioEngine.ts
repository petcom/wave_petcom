// Audio Engine - Handles Web Audio API operations

import { AudioNodes, TrackState, EffectType } from './types.js';
import { MIXER_CONFIG } from './config.js';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private trackNodes: Map<string, AudioNodes> = new Map();
  private masterGainNode: GainNode | null = null;
  private effectsNodes: Map<string, GainNode> = new Map();
  private effectProcessors: Map<string, AudioNode> = new Map();
  private effectsBypass: Map<string, GainNode> = new Map(); // For bypassing effects
  private reverbImpulse: AudioBuffer | null = null;
  private activeEffects: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();

  // Serial effects chain nodes
  private effectsInput: GainNode | null = null;
  private effectsOutput: GainNode | null = null;

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
      await this.initializeEffects();

      return true;
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      return false;
    }
  }

  private async initializeEffects(): Promise<void> {
    if (!this.audioContext) return;

    // Create effects input and output nodes
    this.effectsInput = this.audioContext.createGain();
    this.effectsOutput = this.audioContext.createGain();

    // Create effect processor nodes
    const reverbNode = this.audioContext.createConvolver();
    const delayNode = this.audioContext.createDelay(1.0);
    const bitcrusherNode = this.audioContext.createWaveShaper();
    const distortionNode = this.audioContext.createWaveShaper();

    // Create audible reverb impulse for ConvolverNode
    console.log('🔧 CREATING AUDIBLE REVERB IMPULSE for ConvolverNode...');
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.floor(2.0 * sampleRate); // 1 second reverb tail
    const reverbBuffer = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = reverbBuffer.getChannelData(channel);
      
      // Direct signal (dry)
      channelData[0] = 0.1; // Much quieter initial direct sound
      
      // Early reflections (multiple taps for room sound)
      const earlyReflections = [
        { delay: 0.02, gain: 0.2 },  // 20ms - first wall
        { delay: 0.04, gain: 0.1 }, // 40ms - opposite wall  
        { delay: 0.06, gain: 0.08 }, // 60ms - ceiling
        { delay: 0.08, gain: 0.05 }, // 80ms - floor
        { delay: 0.12, gain: 0.03 }   // 120ms - corners
      ];
      
      earlyReflections.forEach(reflection => {
        const delaySamples = Math.floor(reflection.delay * sampleRate);
        if (delaySamples < length) {
          channelData[delaySamples] += reflection.gain * (Math.random() * 0.4 + 0.8); // Slight randomization
        }
      });
      
      // Diffuse reverb tail with exponential decay
      for (let i = Math.floor(0.15 * sampleRate); i < length; i++) {
        const time = i / sampleRate;
        const decay = Math.exp(-1.2 * time); // Exponential decay over 1 second
        channelData[i] += (Math.random() * 2 - 1) * decay * 0.05; // Much quieter diffuse noise
      }
    }
    
    reverbNode.buffer = reverbBuffer;
    reverbNode.normalize = false; // Keep our custom levels
    console.log('✅ AUDIBLE REVERB IMPULSE applied to ConvolverNode - should create room ambience');

    // Create bypass gain nodes for each effect
    const reverbBypass = this.audioContext.createGain();
    const delayBypass = this.audioContext.createGain();
    const bitcrusherBypass = this.audioContext.createGain();
    const distortionBypass = this.audioContext.createGain();

    // Create effect gain nodes (for wet/dry control within each effect)
    const reverbGain = this.audioContext.createGain();
    const delayGain = this.audioContext.createGain();
    const bitcrusherGain = this.audioContext.createGain();
    const distortionGain = this.audioContext.createGain();


    // Configure delay with feedback loop
    delayNode.delayTime.value = 0.3;
    
    // Create feedback gain for delay (multiple echoes)
    const delayFeedback = this.audioContext.createGain();
    delayFeedback.gain.value = 0.3;  // 30% feedback for echo repeats
    
    // Create feedback loop: delayNode → delayFeedback → delayNode
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    
    console.log('🔊 DELAY: 300ms with 30% feedback loop configured');

    // Configure bitcrusher - start with passthrough
    this.createSafeBitcrusherCurve(bitcrusherNode, 0);

    // Configure distortion
    const distortionCurve = this.createDistortionCurve(400);
    distortionNode.curve = distortionCurve;
    distortionNode.oversample = '4x';


    // Store nodes in maps
    this.effectProcessors.set('reverb', reverbNode);
    this.effectProcessors.set('delay', delayNode);
    this.effectProcessors.set('bitcrush', bitcrusherNode);
    this.effectProcessors.set('distortion', distortionNode);

    this.effectsBypass.set('reverb', reverbBypass);
    this.effectsBypass.set('delay', delayBypass);
    this.effectsBypass.set('bitcrush', bitcrusherBypass);
    this.effectsBypass.set('distortion', distortionBypass);

    this.effectsNodes.set('reverb', reverbGain);
    this.effectsNodes.set('delay', delayGain);
    this.effectsNodes.set('bitcrush', bitcrusherGain);
    this.effectsNodes.set('distortion', distortionGain);

    // Set up the serial effects chain
    this.setupSerialEffectsChain();

    // Initially all effects are bypassed
    this.setAllEffectsBypassed();

    console.log('🎛️ Effects initialized with SAFE bitcrusher');
    console.log('🧪 CONTINUING EFFECTS INITIALIZATION...');

    // Create reverb impulse response INSIDE the method
    console.log('🧪 ABOUT TO CREATE REVERB IMPULSE...');
    try {
      await this.createReverbImpulse();
      console.log('🧪 REVERB IMPULSE CREATION COMPLETED');
    } catch (error) {
      console.error('🧪 REVERB IMPULSE CREATION FAILED:', error);
    }
  }

// RELIABLE bitcrusher that guarantees audible output
  private createSafeBitcrusherCurve(bitcrusherNode: WaveShaperNode, intensity: number): void {
    const samples = 44100;
    const curve = new Float32Array(samples);

    if (intensity <= 0.01) {
      // Passthrough mode - no processing
      for (let i = 0; i < samples; i++) {
        curve[i] = (i * 2) / samples - 1; // Linear: -1 to 1
      }
      console.log('🔊 Bitcrusher: PASSTHROUGH mode');
    } else {
      // Simple, reliable bit reduction
      // Map intensity 0.1-1.0 to steps 32-4 (more conservative)
      const steps = Math.max(4, Math.round(32 - (intensity * 28)));
      const stepSize = 2 / steps; // Range from -1 to 1
      
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1; // Input from -1 to 1
        
        // Quantize to discrete steps
        const quantized = Math.round(x / stepSize) * stepSize;
        
        // Apply slight gain reduction to prevent clipping
        curve[i] = quantized * 0.8;
      }

      console.log(`🎛️ Bitcrusher: ${steps} levels at ${(intensity * 100).toFixed(1)}% intensity (should be audible)`);
    }

    bitcrusherNode.curve = curve;
    bitcrusherNode.oversample = 'none';
  }

// NEW: Working bitcrusher implementation
  private createWorkingBitcrusherCurve(bitcrusherNode: WaveShaperNode, intensity: number): void {
    const samples = 65536; // Use power of 2 for better performance
    const curve = new Float32Array(samples);
    let bitDepth = 16; // Default bit depth

    // Ensure we always create a valid curve
    if (intensity <= 0.01) {
      // Passthrough when intensity is very low
      for (let i = 0; i < samples; i++) {
        curve[i] = (i * 2) / samples - 1; // Linear passthrough: -1 to 1
      }
      bitDepth = 16; // Full bit depth for passthrough
    } else {
      // Bit crushing with safe parameters
      bitDepth = Math.max(2, 12 - Math.floor(intensity * 8)); // 12-bit down to 2-bit
      const quantizationLevels = Math.pow(2, bitDepth);
      const stepSize = 2 / quantizationLevels;

      for (let i = 0; i < samples; i++) {
        let x = (i * 2) / samples - 1; // -1 to 1

        // Quantize to reduce bit depth
        const quantized = Math.round(x / stepSize) * stepSize;

        // Ensure output is always in valid range
        curve[i] = Math.max(-1, Math.min(1, quantized));
      }
    }

    // Verify curve is valid before applying
    let hasInvalidValues = false;
    for (let i = 0; i < samples; i++) {
      if (!isFinite(curve[i])) {
        hasInvalidValues = true;
        curve[i] = 0; // Replace invalid values with silence
      }
    }

    if (hasInvalidValues) {
      console.warn('⚠️ Fixed invalid values in bitcrusher curve');
    }

    bitcrusherNode.curve = curve;
    bitcrusherNode.oversample = 'none';

    console.log(`✅ Bitcrusher curve created - Intensity: ${(intensity * 100).toFixed(1)}%, Bit Depth: ${bitDepth}-bit, Samples: ${samples}`);
  }

  private setupSerialEffectsChain(): void {
    if (!this.audioContext || !this.effectsInput || !this.effectsOutput) return;

    const reverbNode = this.effectProcessors.get('reverb') as ConvolverNode;
    const delayNode = this.effectProcessors.get('delay') as DelayNode;
    const bitcrusherNode = this.effectProcessors.get('bitcrush') as WaveShaperNode;
    const distortionNode = this.effectProcessors.get('distortion') as WaveShaperNode;

    const reverbBypass = this.effectsBypass.get('reverb')!;
    const delayBypass = this.effectsBypass.get('delay')!;
    const bitcrusherBypass = this.effectsBypass.get('bitcrush')!;
    const distortionBypass = this.effectsBypass.get('distortion')!;

    const reverbGain = this.effectsNodes.get('reverb')!;
    const delayGain = this.effectsNodes.get('delay')!;
    const bitcrusherGain = this.effectsNodes.get('bitcrush')!;
    const distortionGain = this.effectsNodes.get('distortion')!;

    // FIXED SERIAL CHAIN: Much cleaner routing
    // Each stage has a clean switch between processed and bypass

    // Stage 1: Input → Reverb
    console.log('🔗 REVERB STAGE: Setting up connections...');
    
    // Input splits to reverb processor and bypass
    this.effectsInput.connect(reverbNode);
    this.effectsInput.connect(reverbBypass);
    console.log('🔗 Connected effectsInput to reverbNode and reverbBypass');

    // Reverb processor goes through gain control
    reverbNode.connect(reverbGain);
    console.log('🔗 Connected reverbNode to reverbGain');

    // Stage 1 Output: Mix processed + bypass (only one will be active)
    const stage1Output = this.audioContext.createGain();
    reverbGain.connect(stage1Output);
    reverbBypass.connect(stage1Output);
    console.log('🔗 Connected reverbGain and reverbBypass to stage1Output');

    // Stage 2: Stage1 → Delay
    stage1Output.connect(delayNode);
    stage1Output.connect(delayBypass);
    delayNode.connect(delayGain);

    const stage2Output = this.audioContext.createGain();
    delayGain.connect(stage2Output);
    delayBypass.connect(stage2Output);

    // Stage 3: Stage2 → Bitcrusher
    stage2Output.connect(bitcrusherNode);
    stage2Output.connect(bitcrusherBypass);
    bitcrusherNode.connect(bitcrusherGain);

    const stage3Output = this.audioContext.createGain();
    bitcrusherGain.connect(stage3Output);
    bitcrusherBypass.connect(stage3Output);

    // Stage 4: Stage3 → Distortion → Final Output
    stage3Output.connect(distortionNode);
    stage3Output.connect(distortionBypass);
    distortionNode.connect(distortionGain);

    // Final output
    distortionGain.connect(this.effectsOutput);
    distortionBypass.connect(this.effectsOutput);

    console.log('🔗 Fixed Serial Effects Chain: Input → Reverb → Delay → Bitcrusher → Distortion → Output');
  }


  private setAllEffectsBypassed(): void {
    // Start with all effects bypassed (100% dry signal passes through)
    const effects = ['reverb', 'delay', 'bitcrush', 'distortion'];

    effects.forEach(effectId => {
      const effectGain = this.effectsNodes.get(effectId);
      const bypassGain = this.effectsBypass.get(effectId);

      if (effectGain && bypassGain) {
        effectGain.gain.value = 0.0;   // No processed signal
        bypassGain.gain.value = 1.0;   // Full bypass (100% dry)
      }
    });

    console.log('🔇 All effects initialized in bypass mode (100% dry)');
  }

  private async createReverbImpulse(): Promise<void> {
    if (!this.audioContext) {
      console.error('❌ Cannot create reverb impulse: AudioContext not available');
      return;
    }

    try {
      // Create a SIMPLE test impulse for debugging
      const sampleRate = this.audioContext.sampleRate;
      const length = Math.floor(0.5 * sampleRate); // Shorter 0.5 second impulse for testing
      const impulseBuffer = this.audioContext.createBuffer(2, length, sampleRate);

      console.log(`🧪 Creating SIMPLE test reverb impulse: ${length} samples at ${sampleRate}Hz`);

      let totalEnergy = 0;
      let maxValue = 0;

      // Fill both channels with SIMPLE impulse
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulseBuffer.getChannelData(channel);

        for (let i = 0; i < length; i++) {
          let value = 0;
          
          if (i < 100) {
            // Initial burst - guaranteed to have signal
            value = (Math.random() * 2 - 1) * 0.5;
          } else {
            // Simple linear decay 
            const decayFactor = 1 - (i / length);
            value = (Math.random() * 2 - 1) * decayFactor * 0.2;
          }
          
          channelData[i] = value;
          totalEnergy += Math.abs(value);
          maxValue = Math.max(maxValue, Math.abs(value));
        }
      }

      console.log(`🧪 Impulse stats: Total energy=${totalEnergy.toFixed(2)}, Max value=${maxValue.toFixed(4)}`);
      
      this.reverbImpulse = impulseBuffer;

      // Apply to reverb convolver with extensive validation
      const reverbNode = this.effectProcessors.get('reverb') as ConvolverNode;
      if (reverbNode) {
        console.log(`🧪 ConvolverNode before: buffer=${!!reverbNode.buffer}, normalize=${reverbNode.normalize}`);
        
        reverbNode.buffer = impulseBuffer;
        reverbNode.normalize = false; // Disable normalization for testing
        
        console.log(`🧪 ConvolverNode after: buffer=${!!reverbNode.buffer}, normalize=${reverbNode.normalize}`);
        console.log(`🧪 Buffer details: channels=${impulseBuffer.numberOfChannels}, length=${impulseBuffer.length}, sampleRate=${impulseBuffer.sampleRate}`);
        
        // Validate buffer was actually set
        if (reverbNode.buffer === impulseBuffer) {
          console.log('✅ REVERB: Impulse buffer successfully applied to ConvolverNode');
        } else {
          console.error('❌ REVERB: Buffer assignment failed!');
        }
      } else {
        console.error('❌ REVERB: ConvolverNode not found in effectProcessors');
      }

    } catch (error) {
      console.error('❌ REVERB: Failed to create impulse:', error);
    }
  }

  private normalizeBuffer(buffer: AudioBuffer): void {
    // Find peak amplitude across all channels
    let peak = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        peak = Math.max(peak, Math.abs(channelData[i]));
      }
    }

    // Normalize to prevent clipping while leaving headroom
    if (peak > 0) {
      const normalizeGain = 0.95 / peak; // Leave only 5% headroom for better volume
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] *= normalizeGain;
        }
      }
      console.log(`🎚️ Normalized reverb impulse by ${normalizeGain.toFixed(3)}`);
    }
  }

  private createDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
    }

    return curve;
  }

  // REPLACE calculateEffectsIntensity with a simpler version
  private calculateEffectsIntensity(): number {
    let totalVolume = 0;
    let count = 0;

    for (const [trackId, nodes] of this.trackNodes) {
      if (nodes.wetGain.gain.value > 0) {
        totalVolume += nodes.gainNode.gain.value;
        count++;
      }
    }

    if (count === 0) return 0;

    const avgVolume = totalVolume / count;
    return Math.min(avgVolume * 0.8, 1.0); // Simple scaling
  }

  // REPLACE updateBitcrusherIntensity
  private updateBitcrusherIntensity(): void {
    const bitcrusherNode = this.effectProcessors.get('bitcrush') as WaveShaperNode;
    if (!bitcrusherNode) return;

    const intensity = this.calculateEffectsIntensity();
    this.createSafeBitcrusherCurve(bitcrusherNode, intensity);
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
    // Clean up base path and filename
    let base = MIXER_CONFIG.audioPath;
    if (base.endsWith('/')) base = base.slice(0, -1);

    let file = filename;
    if (file.startsWith('/')) file = file.slice(1);

    // Simple URL construction - proxy handles the routing
    const url = `${base}/${file}`;
    
    console.log(`🎵 Loading audio [${MIXER_CONFIG.environment}]: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext!.decodeAudioData(arrayBuffer);
  }

  createTrackNodes(trackId: string): AudioNodes | null {
    if (!this.audioContext || !this.masterGainNode || !this.effectsInput || !this.effectsOutput) return null;

    // Create basic audio processing nodes
    const gainNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();

    // Create wet/dry mixing nodes
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();

    // Set initial wet/dry mix (100% dry when effects disabled)
    dryGain.gain.value = 1.0;
    wetGain.gain.value = 0.0;

    // Connect base audio path
    gainNode.connect(panNode);

    // Setup dry path (direct to master)
    panNode.connect(dryGain);
    dryGain.connect(this.masterGainNode);

    // Setup wet path (through effects chain)
    panNode.connect(wetGain);
    wetGain.connect(this.effectsInput);

    // Effects output connects to master
    this.effectsOutput.connect(this.masterGainNode);

    const nodes: AudioNodes = {
      source: null,
      gainNode,
      panNode,
      dryGain,
      wetGain,
      effectsChain: this.effectsInput, // For compatibility
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

    // Update bitcrusher intensity when track stops
    this.updateBitcrusherIntensity();
  }

  setTrackVolume(trackId: string, volume: number): void {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes || !this.audioContext) return;

    nodes.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    // Update bitcrusher intensity based on new volume levels
    this.updateBitcrusherIntensity();
  }

  setTrackPan(trackId: string, pan: number): void {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes || !this.audioContext) return;

    nodes.panNode.pan.setValueAtTime(pan, this.audioContext.currentTime);
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGainNode || !this.audioContext) return;
    this.masterGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

  setTrackEffects(trackId: string, enabled: boolean): void {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    if (enabled) {
      // Enable wet path (80%) and reduce dry path (20%)
      nodes.wetGain.gain.setValueAtTime(nodes.wetGain.gain.value, now);
      nodes.wetGain.gain.linearRampToValueAtTime(0.8, now + 0.1);

      nodes.dryGain.gain.setValueAtTime(nodes.dryGain.gain.value, now);
      nodes.dryGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    } else {
      // Disable wet path and set dry path to 100%
      nodes.wetGain.gain.setValueAtTime(nodes.wetGain.gain.value, now);
      nodes.wetGain.gain.linearRampToValueAtTime(0.0, now + 0.1);

      nodes.dryGain.gain.setValueAtTime(nodes.dryGain.gain.value, now);
      nodes.dryGain.gain.linearRampToValueAtTime(1.0, now + 0.1);
    }

    // Update bitcrusher intensity when effects routing changes
    setTimeout(() => this.updateBitcrusherIntensity(), 150);
  }

  // 80% effect + 20% dry mixing system
  async toggleEffect(effectId: string, enabled: boolean): Promise<void> {
    if (!this.audioContext) return;

    const internalEffectId = effectId === 'bitshift' ? 'bitcrush' : effectId;
    const effectGain = this.effectsNodes.get(internalEffectId);
    const bypassGain = this.effectsBypass.get(internalEffectId);

    if (!effectGain || !bypassGain) {
      console.error(`Effect ${internalEffectId} not found`);
      return;
    }

    const now = this.audioContext.currentTime;

    if (enabled) {
      // 80% effect + 20% dry mixing with reverb compensation
      let effectLevel = 0.8;  // Default effect level
      
      // Reduced reverb level for better balance
      if (internalEffectId === 'reverb') {
        effectLevel = 0.15;  // Much quieter 10% reverb level
      }

       if (internalEffectId === 'bitcrush') {
        effectLevel = 0.2;  // Much quieter 10% reverb level
      }

      if (internalEffectId === 'delay') {
        effectLevel = 0.8;  // Medium delay level for feedback loop
      }

      if (internalEffectId === 'distortion') {
        effectLevel = 0.2;  // Much quieter 10% reverb level
      }

     
      
      effectGain.gain.setValueAtTime(effectLevel, now);   // Processed signal
      bypassGain.gain.setValueAtTime(0.0, now);           // No bypass when effect is on
      this.activeEffects.add(effectId);

      // Special handling for different effect types
      if (internalEffectId === 'bitcrush') {
        const bitcrusherNode = this.effectProcessors.get('bitcrush') as WaveShaperNode;
        if (bitcrusherNode) {
          this.createSafeBitcrusherCurve(bitcrusherNode, 0.3); // 30% intensity
          console.log('🎛️ BITCRUSHER: 80% crushed + 20% dry at 30% intensity');
        }
      } else if (internalEffectId === 'reverb') {
        const reverbNode = this.effectProcessors.get('reverb') as ConvolverNode;
        if (reverbNode) {
          console.log(`🧪 REVERB ENABLE: Checking ConvolverNode state...`);
          console.log(`🧪 ConvolverNode: exists=${!!reverbNode}, buffer=${!!reverbNode.buffer}, normalize=${reverbNode.normalize}`);
          console.log(`🧪 Effect gains: effectGain=${effectLevel}, bypassGain=0.2`);
          console.log(`🧪 REVERB ROUTING: Input → ReverbNode → ReverbGain(${effectLevel}) → Stage1Output`);
          console.log(`🧪 BYPASS ROUTING: Input → ReverbBypass(0.2) → Stage1Output`);
          
          // Validate that reverb has a proper impulse buffer
          if (!reverbNode.buffer) {
            console.warn('⚠️ Reverb ConvolverNode missing buffer, creating simple test buffer...');
            // Create a simple impulse directly here
            const sampleRate = this.audioContext!.sampleRate;
            const length = Math.floor(0.2 * sampleRate); // 0.2 second simple impulse
            const impulseBuffer = this.audioContext!.createBuffer(2, length, sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
              const channelData = impulseBuffer.getChannelData(channel);
              for (let i = 0; i < length; i++) {
                const decay = 1 - (i / length);
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.05;
              }
            }
            
            reverbNode.buffer = impulseBuffer;
            console.log('✅ Simple reverb impulse created and applied');
          }
          
          // Log routing state
          console.log(`🧪 REVERB: ${Math.round(effectLevel*100)}% reverb + 0% dry - ConvolverNode validated`);
        } else {
          console.error('❌ REVERB: ConvolverNode not found during enable!');
        }
      }

      console.log(`✅ ${effectId} ENABLED (${Math.round(effectLevel*100)}% effect + 0% dry)`);
    } else {
      // Full bypass (100% dry)
      effectGain.gain.setValueAtTime(0.0, now);   // No processed signal
      bypassGain.gain.setValueAtTime(1.0, now);   // Full dry signal
      this.activeEffects.delete(effectId);

      console.log(`❌ ${effectId} DISABLED (100% dry)`);
    }
  }

  isEffectEnabled(effectId: string): boolean {
    return this.activeEffects.has(effectId);
  }

  getActiveEffects(): string[] {
    return Array.from(this.activeEffects);
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
    this.effectProcessors.clear();
    this.effectsBypass.clear();
    this.activeEffects.clear();
    this.loadingPromises.clear();
    this.reverbImpulse = null;
    this.effectsInput = null;
    this.effectsOutput = null;

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
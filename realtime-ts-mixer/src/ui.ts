// UI Components and DOM manipulation

import { MixerState, TrackState, EffectType } from './types.js';
import { MIXER_CONFIG } from './config.js';

export class MixerUI {
  private container: HTMLElement | null = null;
  private hideTimer: number | null = null;
  private onInteraction: (() => void) | null = null;
  private onHide: (() => void) | null = null;

  constructor(private onTrackControl: (trackId: string, action: string, value?: number) => void) {}

  create(): HTMLElement {
    this.container = document.createElement('div');
    this.container.className = 'binaural-mixer';
    this.container.innerHTML = this.getHTML();
    
    this.attachEventListeners();
    return this.container;
  }

  private getHTML(): string {
    return `
      <div class="mixer-panel">
        <div class="mixer-header">
          <h3>Binaural Relaxation Mixer</h3>
          <button class="mixer-close" data-action="close">×</button>
        </div>
        
        <div class="mixer-channels">
          <!-- Track Channels -->
          <div class="channel" data-track="brainwave1">
            <div class="channel-header">Brainwave 1</div>
            <div class="channel-controls">
              <div class="pan-control">
                <label>Pan</label>
                <input type="range" class="pan-knob" min="-1" max="1" step="0.1" value="0" data-control="pan">
              </div>
              <div class="volume-control">
                <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="0.7" data-control="volume" orient="vertical">
              </div>
              <button class="play-button" data-control="play">
                <span class="play-icon">▶</span>
              </button>
              <button class="fx-button" data-control="effects">
                <span class="fx-led"></span>
                FX
              </button>
            </div>
          </div>

          <div class="channel" data-track="brainwave2">
            <div class="channel-header">Brainwave 2</div>
            <div class="channel-controls">
              <div class="pan-control">
                <label>Pan</label>
                <input type="range" class="pan-knob" min="-1" max="1" step="0.1" value="0" data-control="pan">
              </div>
              <div class="volume-control">
                <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="0.7" data-control="volume" orient="vertical">
              </div>
              <button class="play-button" data-control="play">
                <span class="play-icon">▶</span>
              </button>
              <button class="fx-button" data-control="effects">
                <span class="fx-led"></span>
                FX
              </button>
            </div>
          </div>

          <div class="channel" data-track="animals">
            <div class="channel-header">Animals</div>
            <div class="channel-controls">
              <div class="pan-control">
                <label>Pan</label>
                <input type="range" class="pan-knob" min="-1" max="1" step="0.1" value="0" data-control="pan">
              </div>
              <div class="volume-control">
                <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="0.7" data-control="volume" orient="vertical">
              </div>
              <button class="play-button" data-control="play">
                <span class="play-icon">▶</span>
              </button>
              <button class="fx-button" data-control="effects">
                <span class="fx-led"></span>
                FX
              </button>
            </div>
          </div>

          <div class="channel" data-track="nature">
            <div class="channel-header">Nature</div>
            <div class="channel-controls">
              <div class="pan-control">
                <label>Pan</label>
                <input type="range" class="pan-knob" min="-1" max="1" step="0.1" value="0" data-control="pan">
              </div>
              <div class="volume-control">
                <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="0.7" data-control="volume" orient="vertical">
              </div>
              <button class="play-button" data-control="play">
                <span class="play-icon">▶</span>
              </button>
              <button class="fx-button" data-control="effects">
                <span class="fx-led"></span>
                FX
              </button>
            </div>
          </div>

          <div class="channel" data-track="relaxing">
            <div class="channel-header">Relaxing</div>
            <div class="channel-controls">
              <div class="pan-control">
                <label>Pan</label>
                <input type="range" class="pan-knob" min="-1" max="1" step="0.1" value="0" data-control="pan">
              </div>
              <div class="volume-control">
                <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="0.7" data-control="volume" orient="vertical">
              </div>
              <button class="play-button" data-control="play">
                <span class="play-icon">▶</span>
              </button>
              <button class="fx-button" data-control="effects">
                <span class="fx-led"></span>
                FX
              </button>
            </div>
          </div>

          <!-- Effects Channel -->
          <div class="channel effects-channel">
            <div class="channel-header">Effects</div>
            <div class="effects-controls">
              <button class="effect-button" data-effect="reverb">
                <span class="effect-led"></span>
                REV
              </button>
              <button class="effect-button" data-effect="delay">
                <span class="effect-led"></span>
                DLY
              </button>
              <button class="effect-button" data-effect="bitshift">
                <span class="effect-led"></span>
                BIT
              </button>
              <button class="effect-button" data-effect="distortion">
                <span class="effect-led"></span>
                DIST
              </button>
              <div class="master-volume">
                <label>Master</label>
                <input type="range" class="volume-slider master-slider" min="0" max="1" step="0.01" value="0.8" data-control="master-volume" orient="vertical">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    // Channel controls
    this.container.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const channel = target.closest('.channel') as HTMLElement;
      const trackId = channel?.dataset.track;
      const control = target.dataset.control;

      if (trackId && control) {
        this.onTrackControl(trackId, control, parseFloat(target.value));
      }

      if (control === 'master-volume') {
        this.onTrackControl('master', 'volume', parseFloat(target.value));
      }

      this.recordInteraction();
    });

    // Button controls
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button') as HTMLButtonElement;
      if (!button) return;

      const channel = button.closest('.channel') as HTMLElement;
      const trackId = channel?.dataset.track;
      const control = button.dataset.control;
      const effect = button.dataset.effect;
      const action = button.dataset.action;

      if (action === 'close') {
        // Send close action to mixer instead of hiding directly
        this.onTrackControl('mixer', 'close');
        return;
      }

      if (trackId && control) {
        this.onTrackControl(trackId, control);
      }

      if (effect) {
        this.onTrackControl('effects', effect);
      }

      this.recordInteraction();
    });

    // Record interaction on any mouse activity
    this.container.addEventListener('mousemove', () => this.recordInteraction());
    this.container.addEventListener('mouseenter', () => this.recordInteraction());
  }

  show(): void {
    if (!this.container) return;

    this.container.style.opacity = '0';
    this.container.style.display = 'flex';
    
    // Trigger reflow
    this.container.offsetHeight;
    
    this.container.style.transition = `opacity ${MIXER_CONFIG.fadeInDuration}ms ease-in-out`;
    this.container.style.opacity = '1';

    this.recordInteraction();
  }

  hide(): void {
    if (!this.container) return;

    this.container.style.transition = `opacity ${MIXER_CONFIG.fadeOutDuration}ms ease-in-out`;
    this.container.style.opacity = '0';

    setTimeout(() => {
      if (this.container) {
        this.container.style.display = 'none';
      }
    }, MIXER_CONFIG.fadeOutDuration);

    this.clearHideTimer();
    
    // Notify mixer that UI has hidden
    if (this.onHide) {
      this.onHide();
    }
  }

  updateTrackState(trackId: string, state: TrackState): void {
    if (!this.container) return;

    const channel = this.container.querySelector(`[data-track="${trackId}"]`) as HTMLElement;
    if (!channel) return;

    // Update play button
    const playButton = channel.querySelector('.play-button') as HTMLButtonElement;
    const playIcon = playButton?.querySelector('.play-icon') as HTMLElement;
    if (playIcon) {
      playIcon.textContent = state.isPlaying ? '⏸' : '▶';
    }

    // Update effects button LED
    const fxButton = channel.querySelector('.fx-button') as HTMLButtonElement;
    const fxLed = fxButton?.querySelector('.fx-led') as HTMLElement;
    if (fxLed) {
      fxLed.classList.toggle('active', state.effectsEnabled);
    }

    // Update volume slider
    const volumeSlider = channel.querySelector('.volume-slider') as HTMLInputElement;
    if (volumeSlider) {
      volumeSlider.value = state.volume.toString();
    }

    // Update pan knob
    const panKnob = channel.querySelector('.pan-knob') as HTMLInputElement;
    if (panKnob) {
      panKnob.value = state.pan.toString();
    }
  }

  updateEffectState(effects: EffectType[]): void {
    if (!this.container) return;

    effects.forEach(effect => {
      const button = this.container!.querySelector(`[data-effect="${effect.id}"]`) as HTMLButtonElement;
      const led = button?.querySelector('.effect-led') as HTMLElement;
      if (led) {
        led.classList.toggle('active', effect.enabled);
      }
    });
  }

  setOnInteraction(callback: () => void): void {
    this.onInteraction = callback;
  }

  private recordInteraction(): void {
    this.clearHideTimer();
    this.onInteraction?.();
    
    this.hideTimer = window.setTimeout(() => {
      this.hide();
    }, MIXER_CONFIG.autoHideDelay);
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  setOnHide(callback: () => void): void {
    this.onHide = callback;
  }

  dispose(): void {
    this.clearHideTimer();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

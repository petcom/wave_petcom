// Main entry point for the Binaural Relaxation Mixer

import { Mixer } from './mixer.js';

// Auto-initialize when DOM is ready
let mixer: Mixer | null = null;

function initializeMixer(): void {
  // Only initialize once
  if (mixer) return;

  mixer = new Mixer();

  mixer.initialize('.site-header').then((success: boolean) => {
    if (success) {
      console.log('✨ Binaural Relaxation Mixer ready! Click the hero background to open.');
      // Expose mixer to global scope for debugging/external control
      (window as any).binauraMixer = mixer;
    } else {
      console.warn('❌ Binaural Relaxation Mixer failed to initialize');
    }
  }).catch((error: unknown) => {
    console.error('❌ Mixer initialization error:', error);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMixer);
} else {
  initializeMixer();
}

// Export for manual initialization
export { Mixer };

// Also export for use with script tag
(window as any).initBinauraRelaxationMixer = initializeMixer;

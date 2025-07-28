# Binaural Relaxation Mixer

A TypeScript-based interactive audio mixing board for binaural beats and relaxation sounds.

## Features

- 5 audio track channels (Brainwave 1 & 2, Animals, Nature, Relaxing sounds)
- Web Audio API-powered real-time audio processing
- Individual volume, panning, and effects controls
- 4 audio effects (Reverb, Delay, Bit-shift, Distortion)
- Auto-hide after 15 seconds of inactivity
- Responsive design with semi-transparent overlay
- Multiple sound files per track category

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript:
```bash
npm run build
```

3. Include the built files in your project:
```html
<link rel="stylesheet" href="dist/styles.css">
<script type="module" src="dist/index.js"></script>
```

## Audio Files

Place your audio files in the `/audio/loops/` directory with these naming conventions:

### Brainwave 1
- `brainwave1_alpha.wav`
- `brainwave1_beta.wav`
- `brainwave1_theta.wav`
- `brainwave1_delta.wav`
- `brainwave1_gamma.wav`

### Brainwave 2
- `brainwave2_alpha.wav`
- `brainwave2_beta.wav`
- `brainwave2_theta.wav`
- `brainwave2_delta.wav`
- `brainwave2_gamma.wav`

### Animals
- `animals_birds.wav`
- `animals_crickets.wav`
- `animals_cat_purr.wav`
- `animals_dog_pant.wav`

### Nature
- `nature_rain.wav`
- `nature_rain_thunder.wav`
- `nature_car_noise.wav`
- `nature_enterprise_d.wav`

### Relaxing
- `relaxing_baby_mobile.wav`
- `relaxing_water_play.wav`
- `relaxing_shifting_sand.wav`

## Usage

### Automatic Initialization

The mixer automatically initializes when the page loads and attaches to the hero section (`.site-header`).

### Manual Control

```javascript
// Access the mixer instance
const mixer = window.binauraMixer;

// Switch to different audio files within a track
await mixer.switchTrackFile('brainwave1', 2); // Switch to theta waves

// Get available files for a track
const files = mixer.getTrackFiles('animals');

// Check if mixer is visible
const isVisible = mixer.isVisible();
```

### Activation

Click on the background of the hero section to show the mixer. It will automatically hide after 15 seconds of inactivity.

## Browser Support

- Modern browsers with Web Audio API support
- Chrome 66+, Firefox 60+, Safari 14.1+, Edge 79+
- Gracefully degrades on older browsers (mixer won't initialize)

## Development

```bash
# Watch mode for development
npm run watch

# Build for production
npm run build
```

## Configuration

Edit `src/config.ts` to modify:
- Audio file paths
- Auto-hide delay
- Fade in/out durations
- Track configurations

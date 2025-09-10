import { Overlay, OverlayType, ClipOverlay, SoundOverlay, TextOverlay, ImageOverlay } from '../types/overlays'

export const demoOverlays: Overlay[] = [
  // Video clip on track 0 - positioned AFTER its 1-frame transition-in
  // Pattern: transition-in (0 -> 1 frame) -> video content starts at 1 frame
  // Original length: 15s, Speed: 1.0x, Effective length: 15s
  // Used: mediaStartTime(2s) + duration(8s) = 10s of 15s source
  // So trimmedIn = 2s/1.0 = 2s, trimmedOut = 15s - 10s = 5s
  {
    id: 'clip-1',
    type: OverlayType.CLIP,
    startTime: 1/24, // Starts after 1 frame transition-in (~0.04167s at 24fps)
    duration: 8,
    row: 0,
    src: '/demo/video1.mp4',
    mediaStartTime: 2, // Started at 2 seconds in source (trim-in)
    volume: 1,
    muted: false,
    selected: false,
    label: 'Video 1 (Trimmed)',
    length: 15, // Original video length in seconds
    speed: 1.0, // Normal playback speed
    trimmedIn: 0, // Will be calculated by trim detection
    trimmedOut: 0, // Will be calculated by trim detection
    transitionInId: 'clip-1-transition-in',
    transitionOutId: 'clip-1-transition-out'
  },
  
  // Transition in for clip-1 - exactly 1 frame duration
  {
    id: 'clip-1-transition-in',
    type: OverlayType.TRANSITION_IN,
    startTime: 0, // Starts at timeline beginning
    duration: 1/24, // Exactly 1 frame duration (~0.04167s at 24fps)
    row: 0,
    selected: false,
    parentClipId: 'clip-1',
    transitionType: 'fade'
  },
  
  // Transition out for clip-1
  {
    id: 'clip-1-transition-out',
    type: OverlayType.TRANSITION_OUT,
    startTime: 1/24 + 8, // starts when main clip ends (~8.04167s)
    duration: 0.5,
    row: 0,
    selected: false,
    parentClipId: 'clip-1',
    transitionType: 'fade'
  },
  
  // Second video clip on track 0 - separated from clip-1 with gap
  // Original length: 12s, Speed: 2.0x, Effective length: 6s
  // Used: mediaStartTime(1s) + duration(4s) = 5s of 6s effective (10s of 12s source)
  // So trimmedIn = 1s/2.0 = 0.5s timeline, trimmedOut = 6s - 5s = 1s timeline
  {
    id: 'clip-2',
    type: OverlayType.CLIP,
    startTime: 10.5, // starts with gap after clip-1 (clip-1 ends at ~8.54167s, gap until 10.5s)
    duration: 4,
    row: 0,
    src: '/demo/video2.mp4',
    mediaStartTime: 1, // Started at 1 second in source
    volume: 0.8,
    muted: false,
    selected: false,
    label: 'Video 2 (2x Speed)',
    length: 12, // Original video length in seconds
    speed: 2.0, // Double speed
    trimmedIn: 0, // Will be calculated by trim detection
    trimmedOut: 0, // Will be calculated by trim detection
    transitionInId: 'clip-2-transition-in',
    transitionOutId: 'clip-2-transition-out'
  },
  
  // Transition in for clip-2
  {
    id: 'clip-2-transition-in',
    type: OverlayType.TRANSITION_IN,
    startTime: 10.0, // clip start - duration (10.5 - 0.5 = 10.0)
    duration: 0.5,
    row: 0,
    selected: false,
    parentClipId: 'clip-2',
    transitionType: 'slide'
  },
  
  // Transition out for clip-2
  {
    id: 'clip-2-transition-out',
    type: OverlayType.TRANSITION_OUT,
    startTime: 14.5, // clip end (10.5 + 4 = 14.5)
    duration: 0.5,
    row: 0,
    selected: false,
    parentClipId: 'clip-2',
    transitionType: 'slide'
  },
  
  // Text overlay on track 2
  {
    id: 'text-1',
    type: OverlayType.TEXT,
    startTime: 2,
    duration: 4,
    row: 2,
    text: 'Welcome to the Timeline!',
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    x: 100,
    y: 50,
    width: 300,
    height: 60,
    selected: false
  },
  
  // Another text overlay
  {
    id: 'text-2',
    type: OverlayType.TEXT,
    startTime: 12,
    duration: 3,
    row: 2,
    text: 'End Credits',
    fontSize: 18,
    fontFamily: 'Arial',
    color: '#ffff00',
    x: 200,
    y: 400,
    width: 200,
    height: 40,
    selected: false
  },
  
  // Image overlay on track 3
  {
    id: 'image-1',
    type: OverlayType.IMAGE,
    startTime: 5,
    duration: 3,
    row: 3,
    src: '/demo/logo.png',
    label: 'Logo',
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    opacity: 0.8,
    selected: false
  },
  
  // Waveform audio track on track 1
  {
    id: 'audio-1',
    type: OverlayType.SOUND,
    startTime: 0,
    duration: 40,
    row: 1,
    src: '/demo/sample-audio.mp3', // Replace with your audio file URL
    mediaStartTime: 0,
    volume: 0.6,
    muted: false,
    selected: false,
    label: 'audio',
    waveformData: undefined // Will be generated dynamically
  }
]

// Additional waveform tracks can be added using the helper function
const additionalWaveformTracks: SoundOverlay[] = [
  // Example: createWaveformTrack('audio-2', 'https://example.com/audio.mp3', 5, 8, 1, { label: 'Sound Effect', volume: 0.8 })
  
  // To add a waveform track from any audio URL, uncomment and modify:
  // createWaveformTrack(
  //   'my-audio-track',                              // Unique ID
  //   'https://your-audio-url.com/audio.mp3',       // Audio file URL
  //   0,                                             // Start time (seconds)
  //   15,                                            // Duration (seconds)  
  //   1,                                             // Track row
  //   { 
  //     label: 'My Audio Track',                     // Display label
  //     volume: 0.7,                                 // Volume (0.0 to 1.0)
  //     muted: false                                 // Whether to start muted
  //   }
  // )
]

// Export the combined overlays
export const allDemoOverlays: Overlay[] = [...demoOverlays, ...additionalWaveformTracks]

// Helper function to create a waveform track
export function createWaveformTrack(
  id: string, 
  audioUrl: string, 
  startTime: number = 0, 
  duration: number = 10, 
  row: number = 1,
  options: Partial<{
    volume: number
    muted: boolean
    label: string
    mediaStartTime: number
  }> = {}
): SoundOverlay {
  return {
    id,
    type: OverlayType.SOUND,
    startTime,
    duration,
    row,
    src: audioUrl,
    mediaStartTime: options.mediaStartTime || 0,
    volume: options.volume || 0.6,
    muted: options.muted || false,
    selected: false,
    label: options.label || 'Audio Track',
    waveformData: undefined // Will be generated dynamically by useWaveform hook
  }
}

// Quick utility to add a waveform track at runtime
// Usage: addWaveformTrack('https://your-audio-url.com/file.mp3')
export function addWaveformTrack(audioUrl: string, options: {
  startTime?: number
  duration?: number
  row?: number
  volume?: number
  label?: string
} = {}): SoundOverlay {
  return createWaveformTrack(
    `audio-${Date.now()}`, // Generate unique ID
    audioUrl,
    options.startTime || 0,
    options.duration || 10,
    options.row || 1,
    {
      volume: options.volume || 0.6,
      label: options.label || 'Audio Track',
      muted: false
    }
  )
}

// Helper function to generate additional demo overlays
export function generateRandomOverlay(id: string, row: number): Overlay {
  const types = [OverlayType.CLIP, OverlayType.SOUND, OverlayType.TEXT, OverlayType.IMAGE]
  const type = types[Math.floor(Math.random() * types.length)]
  const startTime = Math.random() * 20
  const duration = 1 + Math.random() * 5
  
  const baseOverlay = {
    id,
    type,
    startTime,
    duration,
    row,
    selected: false
  }
  
  switch (type) {
    case OverlayType.CLIP:
      return {
        ...baseOverlay,
        src: `/demo/random-video-${Math.floor(Math.random() * 5) + 1}.mp4`,
        mediaStartTime: 0,
        volume: 0.5 + Math.random() * 0.5,
        muted: Math.random() > 0.7,
        length: 10 + Math.random() * 20, // Random length between 10-30 seconds
        speed: 0.5 + Math.random() * 1.5, // Random speed between 0.5x-2.0x
        trimmedIn: 0.0, // Not trimmed from beginning
        trimmedOut: 0.0 // Not trimmed from end
      } as ClipOverlay
      
    case OverlayType.SOUND:
      return {
        ...baseOverlay,
        src: `/demo/random-audio-${Math.floor(Math.random() * 3) + 1}.mp3`,
        mediaStartTime: 0,
        volume: 0.3 + Math.random() * 0.4,
        muted: false
      } as SoundOverlay
      
    case OverlayType.TEXT:
      const texts = ['Hello World', 'Sample Text', 'Demo Title', 'Random Text']
      return {
        ...baseOverlay,
        text: texts[Math.floor(Math.random() * texts.length)],
        fontSize: 16 + Math.random() * 16,
        fontFamily: 'Arial',
        color: `hsl(${Math.random() * 360}, 70%, 70%)`,
        x: Math.random() * 400,
        y: Math.random() * 300,
        width: 100 + Math.random() * 200,
        height: 40 + Math.random() * 60
      } as TextOverlay
      
    case OverlayType.IMAGE:
      return {
        ...baseOverlay,
        src: `/demo/random-image-${Math.floor(Math.random() * 3) + 1}.jpg`,
        x: Math.random() * 300,
        y: Math.random() * 200,
        width: 50 + Math.random() * 100,
        height: 50 + Math.random() * 100,
        opacity: 0.5 + Math.random() * 0.5
      } as ImageOverlay
      
    default:
      return baseOverlay as Overlay
  }
}
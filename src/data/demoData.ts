import { Overlay, OverlayType, ClipOverlay, SoundOverlay, TextOverlay, ImageOverlay } from '../types/overlays'

export const demoOverlays: Overlay[] = [
  // Video clip on track 0
  {
    id: 'clip-1',
    type: OverlayType.CLIP,
    startTime: 0,
    duration: 8,
    row: 0,
    src: '/demo/video1.mp4',
    mediaStartTime: 0,
    volume: 1,
    muted: false,
    selected: false,
    label: 'Video 1',
    length: 15, // Original video length in seconds
    speed: 1.0, // Normal playback speed
    trimmedIn: false,
    trimmedOut: false,
    transitionInId: 'clip-1-transition-in',
    transitionOutId: 'clip-1-transition-out'
  },
  
  // Transition in for clip-1
  {
    id: 'clip-1-transition-in',
    type: OverlayType.TRANSITION_IN,
    startTime: 0, // for demo start at 0 since negative not supported
    duration: 0.5,
    row: 0,
    selected: false,
    parentClipId: 'clip-1',
    transitionType: 'fade'
  },
  
  // Transition out for clip-1
  {
    id: 'clip-1-transition-out',
    type: OverlayType.TRANSITION_OUT,
    startTime: 8, // starts when main clip ends
    duration: 0.5,
    row: 0,
    selected: false,
    parentClipId: 'clip-1',
    transitionType: 'fade'
  },
  
  // Another video clip on track 0
  {
    id: 'clip-2',
    type: OverlayType.CLIP,
    startTime: 10,
    duration: 6,
    row: 0,
    src: '/demo/video2.mp4',
    mediaStartTime: 2,
    volume: 0.8,
    muted: false,
    selected: false,
    label: 'Video 2',
    length: 12, // Original video length in seconds
    speed: 1.0, // Normal playback speed
    trimmedIn: false,
    trimmedOut: false,
    transitionInId: 'clip-2-transition-in',
    transitionOutId: 'clip-2-transition-out'
  },
  
  // Transition in for clip-2
  {
    id: 'clip-2-transition-in',
    type: OverlayType.TRANSITION_IN,
    startTime: 9.7, // clip start - duration
    duration: 0.3,
    row: 0,
    selected: false,
    parentClipId: 'clip-2',
    transitionType: 'slide'
  },
  
  // Transition out for clip-2
  {
    id: 'clip-2-transition-out',
    type: OverlayType.TRANSITION_OUT,
    startTime: 16, // clip end
    duration: 0.3,
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
  }
]

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
        trimmedIn: false,
        trimmedOut: false
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
export enum OverlayType {
  CLIP = 'clip',
  SOUND = 'sound',
  TEXT = 'text',
  IMAGE = 'image',
  CAPTION = 'caption'
}

export interface BaseOverlay {
  id: string
  type: OverlayType
  startTime: number
  duration: number
  row: number
  selected: boolean
}

export interface ClipOverlay extends BaseOverlay {
  type: OverlayType.CLIP
  src: string
  mediaStartTime: number
  volume: number
  muted: boolean
}

export interface SoundOverlay extends BaseOverlay {
  type: OverlayType.SOUND
  src: string
  mediaStartTime: number
  volume: number
  muted: boolean
  waveformData?: number[]
}

export interface TextOverlay extends BaseOverlay {
  type: OverlayType.TEXT
  text: string
  fontSize: number
  fontFamily: string
  color: string
  backgroundColor?: string
  x: number
  y: number
  width: number
  height: number
}

export interface ImageOverlay extends BaseOverlay {
  type: OverlayType.IMAGE
  src: string
  x: number
  y: number
  width: number
  height: number
  opacity: number
}

export interface CaptionWord {
  text: string
  startTime: number
  endTime: number
}

export interface Caption {
  words: CaptionWord[]
  startTime: number
  endTime: number
}

export interface CaptionStyles {
  fontSize: number
  fontFamily: string
  color: string
  backgroundColor?: string
  position: 'top' | 'center' | 'bottom'
}

export interface CaptionOverlay extends BaseOverlay {
  type: OverlayType.CAPTION
  captions: Caption[]
  styles: CaptionStyles
}

export type Overlay = ClipOverlay | SoundOverlay | TextOverlay | ImageOverlay | CaptionOverlay

export interface TimelineState {
  overlays: Overlay[]
  currentTime: number
  duration: number
  isPlaying: boolean
  zoom: number
  selectedOverlayIds: string[]
}

export interface DragInfo {
  overlayId: string
  startX: number
  startTime: number
  originalStartTime: number
  originalDuration: number
  dragType: 'move' | 'resize-left' | 'resize-right'
}

export interface TimelineSettings {
  pixelsPerSecond: number
  trackHeight: number
  snapToGrid: boolean
  gridSize: number
}
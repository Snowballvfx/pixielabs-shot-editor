// Time formatting utilities for timeline display
// Supports SMPTE timecode format: HH:MM:SS:FF (hours:minutes:seconds:frames)

export interface TimeFormatOptions {
  fps?: number
  showFrames?: boolean
  showHours?: boolean
}

/**
 * Formats time in SMPTE timecode format: HH:MM:SS:FF
 * @param time Time in seconds
 * @param options Formatting options
 * @returns Formatted time string
 */
export function formatTimecode(time: number, options: TimeFormatOptions = {}): string {
  const { fps = 24, showFrames = true, showHours = true } = options
  
  // Ensure time is not negative
  const absoluteTime = Math.max(0, time)
  
  // Calculate time components
  const totalSeconds = Math.floor(absoluteTime)
  const frames = Math.floor((absoluteTime - totalSeconds) * fps)
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (showHours) {
    if (showFrames) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  } else {
    if (showFrames) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  }
}

/**
 * Formats time for timeline grid labels (simplified format for space constraints)
 * @param time Time in seconds
 * @param options Formatting options
 * @returns Formatted time string
 */
export function formatTimelineGrid(time: number, options: TimeFormatOptions = {}): string {
  const { fps = 24 } = options
  
  // For grid labels, we can use a more compact format
  // If time is less than an hour, show MM:SS:FF
  // If time is an hour or more, show HH:MM:SS
  const totalSeconds = Math.floor(time)
  const hours = Math.floor(totalSeconds / 3600)
  
  if (hours > 0) {
    // Show hours when needed, but without frames to save space
    return formatTimecode(time, { fps, showFrames: false, showHours: true })
  } else {
    // Show frames for sub-hour times
    return formatTimecode(time, { fps, showFrames: true, showHours: false })
  }
}

/**
 * Calculate the minimum duration (1 frame) based on frame rate
 * @param fps Frames per second
 * @returns Minimum duration in seconds
 */
export function getMinimumDuration(fps: number = 24): number {
  return 1 / fps
}

/**
 * Calculates the zoom level needed to make individual frames visible
 * @param fps Frames per second
 * @param pixelsPerSecond Base pixels per second setting
 * @param minFramePixels Minimum pixels per frame for visibility (default 8)
 * @returns Required zoom level for frame visibility
 */
export function getFrameVisibleZoom(fps: number = 24, pixelsPerSecond: number = 50, minFramePixels: number = 8): number {
  const frameDuration = 1 / fps // Duration of one frame in seconds
  const currentFramePixels = frameDuration * pixelsPerSecond // Current pixels per frame at 1x zoom
  const requiredZoom = minFramePixels / currentFramePixels // Zoom needed for minimum visibility
  return Math.ceil(requiredZoom * 10) / 10 // Round up to nearest 0.1
}

/**
 * Gets frame-aware zoom presets for the timeline
 * @param fps Frames per second
 * @param pixelsPerSecond Base pixels per second setting
 * @returns Array of zoom levels including frame-visible zoom
 */
export function getZoomPresets(fps: number = 24, pixelsPerSecond: number = 50): number[] {
  const frameVisibleZoom = getFrameVisibleZoom(fps, pixelsPerSecond)
  const basePresets = [0.1, 0.25, 0.5, 1, 2, 3, 5]
  
  // Add frame-visible zoom if it's not already covered
  const presetsWithFrame = [...basePresets]
  if (!basePresets.some(preset => Math.abs(preset - frameVisibleZoom) < 0.1)) {
    presetsWithFrame.push(frameVisibleZoom)
    presetsWithFrame.sort((a, b) => a - b)
  }
  
  return presetsWithFrame
}

/**
 * Snaps a duration to grid while ensuring it doesn't fall below minimum
 * @param duration Duration in seconds to snap
 * @param gridSize Grid size in seconds (from settings)
 * @param minDuration Minimum allowed duration in seconds
 * @returns Snapped duration that respects minimum constraint
 */
export function snapDurationToGrid(duration: number, gridSize: number, minDuration: number): number {
  const snapped = Math.round(duration / gridSize) * gridSize
  return Math.max(minDuration, snapped)
}

/**
 * Calculates the correct position for a transition-in relative to its parent clip
 * For the first clip in the timeline, transition-in starts at 0 and clip starts after it
 * For other clips, transition-in starts before the clip (standard behavior)
 * @param parentClipStartTime Start time of the parent clip
 * @param transitionDuration Duration of the transition
 * @param isFirstClip Whether this is the first clip in the timeline
 * @returns Start time for the transition-in
 */
export function getTransitionInPosition(parentClipStartTime: number, transitionDuration: number, isFirstClip: boolean = false): number {
  if (isFirstClip && parentClipStartTime <= transitionDuration) {
    // For first clip: transition starts at 0, clip starts after transition
    return 0
  } else {
    // Standard behavior: transition starts before clip
    return Math.max(0, parentClipStartTime - transitionDuration)
  }
}

/**
 * Legacy format function for backwards compatibility
 * @deprecated Use formatTimecode instead
 */
export function formatTime(time: number): string {
  return formatTimecode(time, { fps: 24, showFrames: true, showHours: true })
}

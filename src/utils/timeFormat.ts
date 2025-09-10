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
 * Legacy format function for backwards compatibility
 * @deprecated Use formatTimecode instead
 */
export function formatTime(time: number): string {
  return formatTimecode(time, { fps: 24, showFrames: true, showHours: true })
}

import { useEffect, useRef, useCallback } from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { formatTimecode } from '../utils/timeFormat'

export function usePlayback() {
  const { state, actions, settings } = useTimeline()
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  
  const updateCurrentTime = useCallback(() => {
    if (state.isPlaying) {
      const now = performance.now()
      const deltaTime = (now - lastTimeRef.current) / 1000 // Convert to seconds
      
      if (lastTimeRef.current > 0) {
        const newTime = Math.min(state.currentTime + deltaTime, state.duration)
        actions.setCurrentTime(newTime)
        
        // Auto-pause when reaching the end
        if (newTime >= state.duration) {
          actions.pause()
          return
        }
      }
      
      lastTimeRef.current = now
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime)
    }
  }, [state.isPlaying, state.currentTime, state.duration, actions])
  
  useEffect(() => {
    if (state.isPlaying) {
      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      lastTimeRef.current = 0
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state.isPlaying, updateCurrentTime])
  
  const play = useCallback(() => {
    actions.play()
  }, [actions])
  
  const pause = useCallback(() => {
    actions.pause()
  }, [actions])
  
  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [state.isPlaying, play, pause])
  
  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, state.duration))
    actions.seek(clampedTime)
  }, [state.duration, actions])
  
  const skipToStart = useCallback(() => {
    seek(0)
  }, [seek])
  
  const skipToEnd = useCallback(() => {
    seek(state.duration)
  }, [seek, state.duration])
  
  const formatTime = useCallback((time: number) => {
    return formatTimecode(time, { fps: settings.fps, showFrames: true, showHours: true })
  }, [settings.fps])
  
  return {
    // State
    currentTime: state.currentTime,
    duration: state.duration,
    isPlaying: state.isPlaying,
    
    // Actions
    play,
    pause,
    togglePlayPause,
    seek,
    skipToStart,
    skipToEnd,
    
    // Utilities
    formatTime
  }
}
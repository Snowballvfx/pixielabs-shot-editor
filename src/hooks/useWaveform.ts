import { useState, useEffect, useCallback, useRef } from 'react'

interface WaveformData {
  peaks: number[]
  duration: number
}

interface UseWaveformOptions {
  sampleRate?: number
  samplesPerPixel?: number
  fallbackDuration?: number // Duration to use for mock waveform if real audio fails to load
}

export function useWaveform(audioUrl?: string, options: UseWaveformOptions = {}) {
  const { samplesPerPixel = 512, fallbackDuration = 10 } = options
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const processAudioBuffer = useCallback((audioBuffer: AudioBuffer): WaveformData => {
    const channelData = audioBuffer.getChannelData(0) // Use first channel
    const samples = channelData.length
    const blockSize = Math.floor(samples / (samples / samplesPerPixel))
    const peaks: number[] = []
    
    for (let i = 0; i < samples; i += blockSize) {
      let max = 0
      for (let j = 0; j < blockSize && i + j < samples; j++) {
        const sample = Math.abs(channelData[i + j])
        if (sample > max) {
          max = sample
        }
      }
      peaks.push(max)
    }
    
    return {
      peaks,
      duration: audioBuffer.duration
    }
  }, [samplesPerPixel])
  
  const loadWaveform = useCallback(async (url: string) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setError(null)
    
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      // Fetch audio file
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      
      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
      
      // Process waveform data
      const waveformData = processAudioBuffer(audioBuffer)
      setWaveformData(waveformData)
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, ignore
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Waveform loading error:', err)
      // Generate mock waveform as fallback
      const mockData = generateMockWaveform(fallbackDuration)
      setWaveformData(mockData)
    } finally {
      setIsLoading(false)
    }
  }, [processAudioBuffer])
  
  // Load waveform when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      loadWaveform(audioUrl)
    } else {
      setWaveformData(null)
      setError(null)
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [audioUrl, loadWaveform])
  
  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])
  
  const generateMockWaveform = useCallback((duration: number, peakCount: number = 100): WaveformData => {
    const peaks: number[] = []
    for (let i = 0; i < peakCount; i++) {
      // Generate realistic-looking waveform with some randomness
      const baseAmplitude = Math.sin((i / peakCount) * Math.PI * 4) * 0.5 + 0.5
      const noise = (Math.random() - 0.5) * 0.3
      const peak = Math.max(0, Math.min(1, baseAmplitude + noise))
      peaks.push(peak)
    }
    
    return { peaks, duration }
  }, [])
  
  return {
    waveformData,
    isLoading,
    error,
    generateMockWaveform,
    reload: audioUrl ? () => loadWaveform(audioUrl) : undefined,
    audioDuration: waveformData?.duration // Add audio duration to return
  }
}

// Utility function to render waveform peaks as SVG path
export function generateWaveformPath(peaks: number[], width: number, height: number): string {
  if (peaks.length === 0) return ''
  
  const barWidth = width / peaks.length
  let path = ''
  
  peaks.forEach((peak, index) => {
    const x = index * barWidth
    const barHeight = peak * height
    const y = (height - barHeight) / 2
    
    if (index === 0) {
      path += `M ${x} ${y + barHeight / 2}`
    }
    
    path += ` L ${x} ${y} L ${x} ${y + barHeight} L ${x + barWidth} ${y + barHeight} L ${x + barWidth} ${y}`
  })
  
  return path
}
import { useCallback, useRef, useState, useEffect } from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { Overlay, DragInfo, OverlayType, TransitionInOverlay, TransitionOutOverlay, MergedTransitionOverlay, ClipOverlay } from '../types/overlays'

interface UseClipInteractionOptions {
  onDragStart?: (overlay: Overlay) => void
  onDragEnd?: (overlay: Overlay) => void
  onSelect?: (overlay: Overlay) => void
}

export function useClipInteraction(options: UseClipInteractionOptions = {}) {
  const { state, settings, dragInfo, actions } = useTimeline()
  const [isDragging, setIsDragging] = useState(false)
  const [isTimelineScrubbing, setIsTimelineScrubbing] = useState(false)
  const dragThreshold = 5 // pixels

  const timelineRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef(state)
  stateRef.current = state // Always keep the ref updated with current state

  // Post-move processor: snap clip if overlapping, then check for transition merges.
  // If a snap occurred, re-run once to process merges after the snap (bounded by maxIterations)
  const processAfterMove = (overlayId: string, iteration = 0) => {
    if (iteration > 1)
      return
    // Defer to ensure all batched updates have applied
    setTimeout(() => {
      const currentState = stateRef.current
      const currentOverlay = currentState.overlays.find(o => o.id === overlayId)
      if (!currentOverlay)
        return

      let snapped = false
      if (currentOverlay.type === OverlayType.CLIP) {
        const snappedTime = snapOverlappingClip(currentOverlay, currentState)
        if (snappedTime !== currentOverlay.startTime) {
          const delta = snapToGrid(snappedTime - currentOverlay.startTime)
          const relatedOverlays = getRelatedOverlays(currentOverlay)

          // Update clips first
          relatedOverlays.forEach(rel => {
            if (rel.type === OverlayType.CLIP) {
              const newStart = snapToGrid(rel.startTime + delta)
              actions.updateOverlay(rel.id, { startTime: newStart })
            }
          })

          // Then update transitions relative to their new clip positions
          setTimeout(() => {
            const freshState = stateRef.current
            console.log('processAfterMove: updating transition positions after snap')
            relatedOverlays.forEach(rel => {
              if (rel.type === OverlayType.TRANSITION_IN || rel.type === OverlayType.TRANSITION_OUT) {
                const parentClipId = (rel as TransitionInOverlay | TransitionOutOverlay).parentClipId
                const parentClip = freshState.overlays.find(o => o.id === parentClipId)
                if (parentClip) {
                  let newTransitionStart
                  if (rel.type === OverlayType.TRANSITION_IN) {
                    newTransitionStart = parentClip.startTime - rel.duration
                  } else {
                    newTransitionStart = parentClip.startTime + parentClip.duration
                  }
                  console.log('processAfterMove: updating transition', rel.id, 'from', rel.startTime, 'to', snapToGrid(newTransitionStart))
                  actions.updateOverlay(rel.id, { startTime: snapToGrid(newTransitionStart), row: parentClip.row })
                }
              } else if (rel.type === OverlayType.TRANSITION_MERGED) {
                const merged = rel as MergedTransitionOverlay
                const fromClip = freshState.overlays.find(o => o.id === merged.fromClipId)
                if (fromClip) {
                  const mergedStart = snapToGrid(fromClip.startTime + fromClip.duration)
                  console.log('processAfterMove: updating merged transition position', merged.id, 'to', mergedStart)
                  actions.updateOverlay(merged.id, { startTime: mergedStart, row: fromClip.row })
                }
              }
            })
          }, 0)

          snapped = true
        }
      }

      // After snap (or even if no snap), check transitions in a new tick to read fresh positions
      // Use longer delay if we snapped to ensure all transition updates are complete
      const delay = snapped ? 20 : 0
      setTimeout(() => {
        const freshState = stateRef.current
        const freshOverlay = freshState.overlays.find(o => o.id === overlayId) || currentOverlay
        console.log('processAfterMove: transition checks for overlay', overlayId, 'after snap:', snapped)

        const overlapCandidate = checkTransitionOverlaps(freshOverlay, freshState)
        if (overlapCandidate) {
          console.log('processAfterMove: transition overlap -> merging', overlapCandidate)
          actions.mergeTransitions(overlapCandidate.transitionOutId, overlapCandidate.transitionInId)
        }

        const mergeCandidate = checkForTransitionMerge(freshOverlay, freshState)
        if (mergeCandidate) {
          console.log('processAfterMove: adjacent transition merge -> merging', mergeCandidate)
          actions.mergeTransitions(mergeCandidate.transitionOutId, mergeCandidate.transitionInId)
        }

        // If we snapped, run once more to process merges after positions settled
        if (snapped) {
          processAfterMove(overlayId, iteration + 1)
        }
      }, delay)
    }, 0)
  }

  // Check for any transition overlaps (with other transitions or clips)
  const checkTransitionOverlaps = useCallback((changedOverlay: Overlay, currentState: typeof state) => {
    if (changedOverlay.type !== OverlayType.TRANSITION_IN &&
        changedOverlay.type !== OverlayType.TRANSITION_OUT &&
        changedOverlay.type !== OverlayType.TRANSITION_MERGED) {
      return null
    }

    const transitionEnd = changedOverlay.startTime + changedOverlay.duration

    // Find any overlapping transitions on the same row
    const overlappingTransitions = currentState.overlays.filter(other => {
      if (other.id === changedOverlay.id || other.row !== changedOverlay.row)
        return false
      if (other.type !== OverlayType.TRANSITION_IN &&
          other.type !== OverlayType.TRANSITION_OUT &&
          other.type !== OverlayType.TRANSITION_MERGED) return false

      const otherEnd = other.startTime + other.duration
      // Check for overlap
      return !(transitionEnd <= other.startTime || changedOverlay.startTime >= otherEnd)
    })

    if (overlappingTransitions.length > 0) {
      // For now, return the first overlapping transition for potential merge
      const firstOverlap = overlappingTransitions[0]
      if (changedOverlay.type === OverlayType.TRANSITION_OUT && firstOverlap.type === OverlayType.TRANSITION_IN) {
        return { transitionOutId: changedOverlay.id, transitionInId: firstOverlap.id }
      } else if (changedOverlay.type === OverlayType.TRANSITION_IN && firstOverlap.type === OverlayType.TRANSITION_OUT) {
        return { transitionOutId: firstOverlap.id, transitionInId: changedOverlay.id }
      }
    }

    return null
  }, [])

  // Helper: check for transition merge conditions around a specific overlay only
  const checkForTransitionMerge = useCallback((changedOverlay: Overlay, currentState: typeof state) => {
    console.log('checkForTransitionMerge: Checking overlay', changedOverlay.id, 'type:', changedOverlay.type)

    // Find base clip related to the changed overlay
    const getBaseClip = (o: Overlay) => {
      if (o.type === OverlayType.CLIP)
         return o
      if (o.type === OverlayType.TRANSITION_IN || o.type === OverlayType.TRANSITION_OUT) {
        const parentClipId = (o as TransitionInOverlay | TransitionOutOverlay).parentClipId
        return currentState.overlays.find(oo => oo.id === parentClipId && oo.type === OverlayType.CLIP)
      }
      if (o.type === OverlayType.TRANSITION_MERGED)
         return null
      return null
    }
    const baseClip = getBaseClip(changedOverlay)
    console.log('checkForTransitionMerge: Base clip found:', baseClip?.id || 'none')
    if (!baseClip)
       return null

    // Utility helpers
    const clipsOnRow = currentState.overlays
      .filter(o => o.type === OverlayType.CLIP && o.row === baseClip.row)
      .sort((a, b) => a.startTime - b.startTime)

    const baseIndex = clipsOnRow.findIndex(c => c.id === baseClip.id)
    if (baseIndex === -1)
       return null

    const getTransitionOut = (clipId: string) => currentState.overlays.find(o => o.id === (currentState.overlays.find(c => c.id === clipId) as any)?.transitionOutId)
    const getTransitionIn = (clipId: string) => currentState.overlays.find(o => o.id === (currentState.overlays.find(c => c.id === clipId) as any)?.transitionInId)

    const hasMergedBetween = (fromClipId: string, toClipId: string) =>
      currentState.overlays.some(o => o.type === OverlayType.TRANSITION_MERGED &&
        (o as MergedTransitionOverlay).fromClipId === fromClipId &&
        (o as MergedTransitionOverlay).toClipId === toClipId)

    // Check right neighbor (baseClip -> nextClip)
    const nextClip = clipsOnRow[baseIndex + 1]
    console.log('checkForTransitionMerge: Checking right neighbor:', nextClip?.id || 'none')
    if (nextClip && !hasMergedBetween(baseClip.id, nextClip.id)) {
      // Only merge left clip's transition-out with right clip's transition-in
      const leftOut = getTransitionOut(baseClip.id)
      const rightIn = getTransitionIn(nextClip.id)
      console.log('checkForTransitionMerge: Found transitions - leftOut:', leftOut?.id || 'none', 'rightIn:', rightIn?.id || 'none')
      const noClipBetween = clipsOnRow.filter(c => c.startTime > baseClip.startTime && c.startTime < nextClip.startTime).length === 0
      if (noClipBetween && leftOut && rightIn) {
        const leftOutEnd = leftOut.startTime + leftOut.duration
        const rightInStart = rightIn.startTime
        console.log('checkForTransitionMerge: leftOut/rightIn timing ->', leftOutEnd, rightInStart, 'overlap?', rightInStart <= leftOutEnd)
        console.log('checkForTransitionMerge: leftOut details ->', leftOut.startTime, '+', leftOut.duration, '=', leftOutEnd)
        console.log('checkForTransitionMerge: rightIn details ->', rightIn.startTime)
        if (rightInStart <= leftOutEnd) {
          console.log('checkForTransitionMerge: MATCH (leftOut-rightIn)')
          return { transitionOutId: leftOut.id, transitionInId: rightIn.id }
        }
      }
    }

    // Check left neighbor (prevClip -> baseClip)
    const prevClip = clipsOnRow[baseIndex - 1]
    console.log('checkForTransitionMerge: Checking left neighbor:', prevClip?.id || 'none')
    if (prevClip && !hasMergedBetween(prevClip.id, baseClip.id)) {
      // Only merge left (prevClip) out with baseClip in
      const leftOut = getTransitionOut(prevClip.id)
      const rightIn = getTransitionIn(baseClip.id)
      console.log('checkForTransitionMerge: Found transitions (left neighbor) - leftOut:', leftOut?.id || 'none', 'rightIn:', rightIn?.id || 'none')
      const noClipBetween = clipsOnRow.filter(c => c.startTime > prevClip.startTime && c.startTime < baseClip.startTime).length === 0
      if (noClipBetween && leftOut && rightIn) {
        const leftOutEnd = leftOut.startTime + leftOut.duration
        const rightInStart = rightIn.startTime
        console.log('checkForTransitionMerge: leftOut/rightIn timing ->', leftOutEnd, rightInStart, 'overlap?', rightInStart <= leftOutEnd)
        console.log('checkForTransitionMerge: leftOut details ->', leftOut.startTime, '+', leftOut.duration, '=', leftOutEnd)
        console.log('checkForTransitionMerge: rightIn details ->', rightIn.startTime)
        if (rightInStart <= leftOutEnd) {
          console.log('checkForTransitionMerge: MATCH (leftOut-rightIn) [left neighbor]')
          return { transitionOutId: leftOut.id, transitionInId: rightIn.id }
        }
      }
    }

    return null
  }, [])

  // Helper functions for grouped interactions
  const getRelatedOverlays = useCallback((overlay: Overlay): Overlay[] => {
    const related: Overlay[] = [overlay]

    if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      // For transitions, find the parent clip and sibling transition
      const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
      const parentClip = state.overlays.find(o => o.id === parentClipId)

      if (parentClip) {
        // Always include parent clip for transitions
        related.push(parentClip)

        // Find sibling transition
        if (overlay.type === OverlayType.TRANSITION_IN && parentClip.transitionOutId) {
          const siblingTransition = state.overlays.find(o => o.id === parentClip.transitionOutId)
          if (siblingTransition) {
            related.push(siblingTransition)
          }
        } else if (overlay.type === OverlayType.TRANSITION_OUT && parentClip.transitionInId) {
          const siblingTransition = state.overlays.find(o => o.id === parentClip.transitionInId)
          if (siblingTransition) {
            related.push(siblingTransition)
          }
        }

        // If parent clip is part of a merged transition, include the entire merged transition group
        const mergedTransition = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED &&
          ((o as MergedTransitionOverlay).fromClipId === parentClip.id || (o as MergedTransitionOverlay).toClipId === parentClip.id)) as MergedTransitionOverlay | undefined

        if (mergedTransition) {
          console.log(`${overlay.type === OverlayType.TRANSITION_IN ? 'Transition-in' : 'Transition-out'} movement: including entire merged transition group`)
          
          // Include the merged transition itself
          related.push(mergedTransition)
          
          // Include the other clip in the merged transition
          const otherClipId = mergedTransition.fromClipId === parentClip.id ? mergedTransition.toClipId : mergedTransition.fromClipId
          const otherClip = state.overlays.find(o => o.id === otherClipId)
          if (otherClip) {
            related.push(otherClip)
            
            // Include the other clip's transitions
            if ((otherClip as any).transitionInId) {
              const otherIn = state.overlays.find(o => o.id === (otherClip as any).transitionInId)
              if (otherIn) {
                related.push(otherIn)
              }
            }
            if ((otherClip as any).transitionOutId) {
              const otherOut = state.overlays.find(o => o.id === (otherClip as any).transitionOutId)
              if (otherOut) {
                related.push(otherOut)
              }
            }
          }
        }
      }
    } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
      // For merged transitions, find the related clips and their remaining transitions
      const mergedTransition = overlay as MergedTransitionOverlay
      const fromClip = state.overlays.find(o => o.id === mergedTransition.fromClipId)
      const toClip = state.overlays.find(o => o.id === mergedTransition.toClipId)

      if (fromClip) {
        related.push(fromClip)
        if ((fromClip as any).transitionInId) {
          const tIn = state.overlays.find(o => o.id === (fromClip as any).transitionInId)
          if (tIn) {
            related.push(tIn)
          }
        }
        if ((fromClip as any).transitionOutId) {
          const tOut = state.overlays.find(o => o.id === (fromClip as any).transitionOutId)
          if (tOut) {
            related.push(tOut)
          }
        }
      }
      if (toClip) {
        related.push(toClip)
        if ((toClip as any).transitionInId) {
          const tIn = state.overlays.find(o => o.id === (toClip as any).transitionInId)
          if (tIn) {
            related.push(tIn)
          }
        }
        if ((toClip as any).transitionOutId) {
          const tOut = state.overlays.find(o => o.id === (toClip as any).transitionOutId)
          if (tOut) {
            related.push(tOut)
          }
        }
      }
    } else {
      // For clips, find their transition overlays
      if (overlay.transitionInId) {
        const transitionIn = state.overlays.find(o => o.id === overlay.transitionInId)
        if (transitionIn) {
          related.push(transitionIn)
        }
      }
      if (overlay.transitionOutId) {
        const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
        if (transitionOut) {
          related.push(transitionOut)
        }
      }

      // If this clip participates in a merged transition, also include the other clip and merged overlay
      const merged = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED &&
        ((o as MergedTransitionOverlay).fromClipId === overlay.id || (o as MergedTransitionOverlay).toClipId === overlay.id)) as MergedTransitionOverlay | undefined
      if (merged) {
        related.push(merged)
        const otherClipId = merged.fromClipId === overlay.id ? merged.toClipId : merged.fromClipId
        const otherClip = state.overlays.find(o => o.id === otherClipId)
        if (otherClip) {
          related.push(otherClip)
          // Include other clip's transitions so they stay attached while dragging either clip
          if ((otherClip as any).transitionInId) {
            const otherIn = state.overlays.find(o => o.id === (otherClip as any).transitionInId)
            if (otherIn) {
              related.push(otherIn)
            }
          }
                      if ((otherClip as any).transitionOutId) {
              const otherOut = state.overlays.find(o => o.id === (otherClip as any).transitionOutId)
              if (otherOut) {
                related.push(otherOut)
              }
          }
        }
      }
    }

    return related
  }, [state.overlays])

  // Convert pixel position to time (accounting for zoom and track label offset)
  const pixelToTime = useCallback((pixel: number): number => {
    return pixel / (settings.pixelsPerSecond * state.zoom)
  }, [settings.pixelsPerSecond, state.zoom])

  // Convert time to pixel position (accounting for zoom)
  const timeToPixel = useCallback((time: number): number => {
    return time * settings.pixelsPerSecond * state.zoom
  }, [settings.pixelsPerSecond, state.zoom])

  // Snap time to grid if enabled - ensure frame-accurate snapping
  const snapToGrid = useCallback((time: number): number => {
    if (!settings.snapToGrid)
      return time
    // Special case: allow exact 0 values without snapping
    if (time === 0)
      return 0
    
    // For frame-accurate editing, snap to frame boundaries (1/fps seconds)
    const frameDuration = 1 / settings.fps
    const frameNumber = Math.round(time / frameDuration)
    return frameNumber * frameDuration
  }, [settings.snapToGrid, settings.fps])

  // Calculate effective clip length based on original length and speed
  const getEffectiveClipLength = useCallback((clip: ClipOverlay): number => {
    return clip.length / clip.speed
  }, [])

  // Calculate trims from geometry: trims are authoritative and mostly preserved
  const calculateTrimValues = useCallback((clip: ClipOverlay): { trimIn: number; trimOut: number } => {
    const effectiveLength = getEffectiveClipLength(clip)

    // If there is a merged transition before this clip, trimIn should not change from stored value
    const merged = state.overlays.find(o =>
      o.type === OverlayType.TRANSITION_MERGED &&
      (o as MergedTransitionOverlay).toClipId === clip.id
    ) as MergedTransitionOverlay | undefined

      const transitionIn = state.overlays.find(o => o.id === clip.transitionInId)
      const transitionOut = state.overlays.find(o => o.id === clip.transitionOutId)

    // Derive trimIn from left edge: distance from left transition edge to media start inside the clip
    // Since mediaStartTime is removed, use stored trimmedIn as authoritative baseline
    const trimIn = merged
      ? clip.trimmedIn
      : Math.max(0, clip.trimmedIn) // unchanged unless we explicitly adjust during transition-in resize

    // Derive trimOut from right edge: distance from right transition edge to media end (effectiveLength)
    // Use stored trimmedOut as authoritative baseline
    const trimOut = Math.max(0, clip.trimmedOut)

    // Clamp by effective length to avoid negatives
    const totalUsed = (transitionIn?.duration || 0) + clip.duration + (transitionOut?.duration || 0) + (merged ? merged.duration : 0)
    const remaining = Math.max(0, effectiveLength - totalUsed)
    return { trimIn, trimOut: Math.min(trimOut, remaining + trimOut) }
  }, [getEffectiveClipLength, state.overlays])

  // Update clip trim values based on current state
  const updateClipTrimValues = useCallback((clipId: string) => {
    const clip = state.overlays.find(o => o.id === clipId && o.type === OverlayType.CLIP) as ClipOverlay | undefined
    if (!clip) return

    const { trimIn, trimOut } = calculateTrimValues(clip)

    // Only update if values have changed to avoid unnecessary re-renders
    if (Math.abs(clip.trimmedIn - trimIn) > 0.01 || Math.abs(clip.trimmedOut - trimOut) > 0.01) {
      actions.updateOverlay(clipId, {
        trimmedIn: trimIn,
        trimmedOut: trimOut
      })
    }
  }, [state.overlays, calculateTrimValues, actions])

  // Initialize trim values for all clips on mount
  const initializeTrimValues = useCallback(() => {
    state.overlays.forEach(overlay => {
      if (overlay.type === OverlayType.CLIP) {
        updateClipTrimValues(overlay.id)
      }
    })
  }, [state.overlays, updateClipTrimValues])

  // Run initialization when component mounts or overlays change significantly
  useEffect(() => {
    // Use a timeout to ensure all state is settled
    const timer = setTimeout(() => {
      initializeTrimValues()
    }, 100)

    return () => clearTimeout(timer)
  }, []) // Only run once on mount

  // Validate that total duration doesn't exceed clip's effective length
  const validateClipTotalLength = useCallback((clipOverlay: ClipOverlay, newClipDuration?: number, newTransitionInDuration?: number, newTransitionOutDuration?: number): { isValid: boolean; maxAllowedDuration: number; currentTotal: number } => {
    const effectiveLength = getEffectiveClipLength(clipOverlay)

    // Get current transition durations
    const transitionIn = clipOverlay.transitionInId ? state.overlays.find(o => o.id === clipOverlay.transitionInId) : null
    const transitionOut = clipOverlay.transitionOutId ? state.overlays.find(o => o.id === clipOverlay.transitionOutId) : null

    // Check for merged transitions
    const mergedTransition = state.overlays.find(o =>
      o.type === OverlayType.TRANSITION_MERGED &&
      ((o as MergedTransitionOverlay).fromClipId === clipOverlay.id || (o as MergedTransitionOverlay).toClipId === clipOverlay.id)
    ) as MergedTransitionOverlay | undefined

    const transitionInDuration = newTransitionInDuration ?? (transitionIn?.duration || 0)
    const transitionOutDuration = newTransitionOutDuration ?? (transitionOut?.duration || 0)
    const clipDuration = newClipDuration ?? clipOverlay.duration
    const mergedTransitionDuration = mergedTransition?.duration || 0

    // For clips with merged transitions, include the merged transition duration
    const totalDuration = mergedTransition
      ? transitionInDuration + clipDuration + mergedTransitionDuration + transitionOutDuration
      : transitionInDuration + clipDuration + transitionOutDuration

    const maxAllowedDuration = effectiveLength

    return {
      isValid: totalDuration <= maxAllowedDuration,
      maxAllowedDuration,
      currentTotal: totalDuration
    }
  }, [state.overlays, getEffectiveClipLength])

  // Calculate maximum allowed duration for extending in a specific direction
  const getMaxAllowedDurationForExtension = useCallback((overlay: Overlay, direction: 'start' | 'end'): number => {
    let clipOverlay: ClipOverlay | undefined

    if (overlay.type === OverlayType.CLIP) {
      clipOverlay = overlay as ClipOverlay
    } else if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
      clipOverlay = state.overlays.find(o => o.id === parentClipId) as ClipOverlay | undefined
    }

    if (!clipOverlay) return overlay.duration

    const { trimIn, trimOut } = calculateTrimValues(clipOverlay)

    // For clips extending from start: can extend up to trimmedIn amount
    // For clips extending from end: can extend up to trimmedOut amount
    if (overlay.type === OverlayType.CLIP) {
      if (direction === 'start') {
        // Extending leftward: can add back trimmed-in content
        return overlay.duration + trimIn
      } else {
        // Extending rightward: can add back trimmed-out content
        return overlay.duration + trimOut
      }
    }

    // For transitions, the limit is based on parent clip's available content
    if (overlay.type === OverlayType.TRANSITION_IN) {
      if (direction === 'start') {
        // Transition-in extending leftward: limited by trimmed-in content
        return overlay.duration + trimIn
      } else {
        // Transition-in extending rightward: limited by remaining clip duration
        return Math.min(overlay.duration + trimOut, clipOverlay.duration)
      }
    }

    if (overlay.type === OverlayType.TRANSITION_OUT) {
      if (direction === 'start') {
        // Transition-out extending leftward: limited by remaining clip duration
        return Math.min(overlay.duration + trimIn, clipOverlay.duration)
      } else {
        // Transition-out extending rightward: limited by trimmed-out content
        return overlay.duration + trimOut
      }
    }

    return overlay.duration
  }, [state.overlays, getEffectiveClipLength, calculateTrimValues])

  // Calculate maximum allowed duration for a specific component (legacy function for compatibility)
  const getMaxAllowedDuration = useCallback((overlay: Overlay, componentType: 'clip' | 'transition-in' | 'transition-out'): number => {
    let clipOverlay: ClipOverlay | undefined

    if (overlay.type === OverlayType.CLIP) {
      clipOverlay = overlay as ClipOverlay
    } else if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
      clipOverlay = state.overlays.find(o => o.id === parentClipId) as ClipOverlay | undefined
    }

    if (!clipOverlay) return overlay.duration

    const effectiveLength = getEffectiveClipLength(clipOverlay)
    const transitionIn = clipOverlay.transitionInId ? state.overlays.find(o => o.id === clipOverlay.transitionInId) : null
    const transitionOut = clipOverlay.transitionOutId ? state.overlays.find(o => o.id === clipOverlay.transitionOutId) : null

    const mergedTransition = state.overlays.find(o =>
      o.type === OverlayType.TRANSITION_MERGED &&
      ((o as MergedTransitionOverlay).fromClipId === clipOverlay.id || (o as MergedTransitionOverlay).toClipId === clipOverlay.id)
    ) as MergedTransitionOverlay | undefined

    const currentTransitionInDuration = transitionIn?.duration || 0
    const currentTransitionOutDuration = transitionOut?.duration || 0
    const currentClipDuration = clipOverlay.duration
    const currentMergedDuration = mergedTransition?.duration || 0

    // Calculate how much duration is available for the component being resized
    switch (componentType) {
      case 'clip':
        return effectiveLength - currentTransitionInDuration - currentTransitionOutDuration - currentMergedDuration
      case 'transition-in':
        return effectiveLength - currentClipDuration - currentTransitionOutDuration - currentMergedDuration
      case 'transition-out':
        return effectiveLength - currentClipDuration - currentTransitionInDuration - currentMergedDuration
      default:
        return overlay.duration
    }
  }, [state.overlays, getEffectiveClipLength])

  // Check for collisions with other overlays (only for transitions - clips can overlap)
  const checkCollision = useCallback((overlay: Overlay, newStartTime: number, newDuration?: number): boolean => {
    // Allow clips to overlap during drag - only check collisions for transitions
    if (overlay.type === OverlayType.CLIP)
       return false

    const duration = newDuration ?? overlay.duration
    const endTime = newStartTime + duration
    const relatedOverlays = getRelatedOverlays(overlay)
    const relatedIds = new Set(relatedOverlays.map(o => o.id))

    return state.overlays.some(other => {
      if (relatedIds.has(other.id) || other.row !== overlay.row)
        return false

      const otherEndTime = other.startTime + other.duration
      return !(endTime <= other.startTime || newStartTime >= otherEndTime)
    })
  }, [state.overlays, getRelatedOverlays])

  // Find the nearest valid position without collision
  const findValidPosition = useCallback((overlay: Overlay, targetTime: number): number => {
    let testTime = targetTime
    const step = 1 / settings.fps // Use frame duration as step size for frame-accurate positioning
    const maxAttempts = 100

    // Try the target position first
    if (!checkCollision(overlay, testTime))
      return snapToGrid(testTime)

    // Try positions to the right and left alternately
    for (let i = 1; i <= maxAttempts; i++) {
      const rightTime = targetTime + (step * i)
      const leftTime = targetTime - (step * i)

      if (rightTime >= 0 && !checkCollision(overlay, rightTime))
        return snapToGrid(rightTime)

      if (leftTime >= 0 && !checkCollision(overlay, leftTime))
        return snapToGrid(leftTime)
    }

    // If no valid position found, return original position
    return overlay.startTime
  }, [checkCollision, snapToGrid, settings.fps])

  // Snap overlapping clips to nearest neighbor edge, accounting for transition merge space
  const snapOverlappingClip = useCallback((overlay: Overlay, currentState: typeof state): number => {
    if (overlay.type !== OverlayType.CLIP)
      return overlay.startTime

    const overlayEnd = overlay.startTime + overlay.duration
    const relatedOverlays = getRelatedOverlays(overlay)
    const relatedIds = new Set(relatedOverlays.map(o => o.id))

    console.log('Checking overlaps for clip:', overlay.id, 'position:', overlay.startTime, 'to', overlayEnd, 'on row:', overlay.row)
    console.log('Related IDs to exclude:', Array.from(relatedIds))

    // Find overlapping clips on the same row (excluding related overlays)
    const overlappingClips = currentState.overlays.filter(other => {
      if (relatedIds.has(other.id) || other.row !== overlay.row || other.type !== OverlayType.CLIP)
        return false

      const otherEnd = other.startTime + other.duration
      const hasOverlap = !(overlayEnd <= other.startTime || overlay.startTime >= otherEnd)

      console.log('Checking against clip:', other.id, 'position:', other.startTime, 'to', otherEnd, 'overlap:', hasOverlap)

      return hasOverlap
    })

    console.log('Found overlapping clips:', overlappingClips.length, overlappingClips.map(c => c.id))

    if (overlappingClips.length === 0)
      return overlay.startTime

    // Find the closest snap position for each overlapping clip
    let bestSnapTime = overlay.startTime
    let minDistance = Infinity

    overlappingClips.forEach(other => {
      const otherEnd = other.startTime + other.duration

      // Check if these clips would create a merged transition
      const overlayTransitionOut = currentState.overlays.find(o => o.id === (overlay as any).transitionOutId)
      const otherTransitionIn = currentState.overlays.find(o => o.id === (other as any).transitionInId)

      // Calculate space needed for merged transition if one would be created
      let mergedTransitionSpace = 0
      if (overlayTransitionOut && otherTransitionIn) {
        mergedTransitionSpace = overlayTransitionOut.duration + otherTransitionIn.duration
        console.log('Calculated merged transition space needed:', mergedTransitionSpace, 'for clips', overlay.id, 'and', other.id)
      }

      // Option 1: Snap to left of other clip (account for merged transition space)
      const snapLeft = other.startTime - overlay.duration - mergedTransitionSpace
      const distanceLeft = Math.abs(snapLeft - overlay.startTime)

      // Option 2: Snap to right of other clip
      const snapRight = otherEnd
      const distanceRight = Math.abs(snapRight - overlay.startTime)

      console.log('Snap options for', other.id, '- Left:', snapLeft, '(distance:', distanceLeft, ') Right:', snapRight, '(distance:', distanceRight, ')')

      // Choose the closest option
      if (snapLeft >= 0 && distanceLeft < minDistance) {
        minDistance = distanceLeft
        bestSnapTime = snapLeft
        console.log('Best snap updated to left position:', snapLeft, 'with merged space:', mergedTransitionSpace)
      }

      if (distanceRight < minDistance) {
        minDistance = distanceRight
        bestSnapTime = snapRight
        console.log('Best snap updated to right position:', snapRight)
      }
    })

    return snapToGrid(bestSnapTime)
  }, [getRelatedOverlays, snapToGrid])

  const handleMouseDown = useCallback((event: React.MouseEvent, overlay: Overlay) => {
    event.preventDefault()
    event.stopPropagation()

    // Get the clip element (not the resize handle)
    const clipElement = document.getElementById(`overlay-${overlay.id}`)
    if (!clipElement)
      return

    const clipRect = clipElement.getBoundingClientRect()
    const clickX = event.clientX - clipRect.left
    const overlayWidth = clipRect.width

    // Determine drag type based on click position relative to the full clip
    let dragType: 'move' | 'resize-left' | 'resize-right' = 'move'
    const resizeHandleWidth = 12
    const transitionInteractiveWidth = 12

    // Transition resize logic: transition-in only LEFT, transition-out only RIGHT
    if (overlay.type === OverlayType.TRANSITION_IN) {
      // Only left resize handle for transition-in (slightly larger interactive zone)
      if (clickX <= transitionInteractiveWidth) {
        dragType = 'resize-left'
      }
    } else if (overlay.type === OverlayType.TRANSITION_OUT) {
      // Only right resize handle for transition-out (slightly larger interactive zone)
      if (clickX >= overlayWidth - transitionInteractiveWidth) {
        dragType = 'resize-right'
      }
    } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
      // Merged transitions get both resize handles
      if (clickX <= resizeHandleWidth) {
        dragType = 'resize-left'
      } else if (clickX >= overlayWidth - resizeHandleWidth) {
        dragType = 'resize-right'
      }
    } else {
      // Regular clips get both resize handles
      if (clickX <= resizeHandleWidth) {
        dragType = 'resize-left'
      } else if (clickX >= overlayWidth - resizeHandleWidth) {
        dragType = 'resize-right'
      }
    }

    console.log('Drag detection:', {
      clickX,
      overlayWidth,
      resizeHandleWidth,
      dragType,
      rightThreshold: overlayWidth - resizeHandleWidth,
      targetElement: event.currentTarget.className
    })

    // Select the overlay if not already selected
    if (!overlay.selected) {
      actions.selectOverlay(overlay.id, event.ctrlKey || event.metaKey)
    }

    const currentDragInfo: DragInfo = {
      overlayId: overlay.id,
      startX: event.clientX,
      startTime: overlay.startTime,
      originalStartTime: overlay.startTime,
      originalDuration: overlay.duration,
      dragType
    }

    const startPosition = { x: event.clientX, y: event.clientY }
    actions.startDrag(currentDragInfo)
    options.onDragStart?.(overlay)

    // Add global mouse event listeners
    let localIsDragging = false

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosition.x
      const deltaY = e.clientY - startPosition.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (!localIsDragging && distance > dragThreshold) {
        localIsDragging = true
        setIsDragging(true)
      }

      if (localIsDragging) {
        const deltaPixels = e.clientX - currentDragInfo.startX
        const deltaTime = pixelToTime(deltaPixels)

        if (currentDragInfo.dragType === 'move') {
          // Determine anchor for group move: clip itself, or parent clip for transitions, or fromClip for merged
          const anchorOverlay = (() => {
            if (overlay.type === OverlayType.CLIP)
              return overlay
            if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
              const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
              return state.overlays.find(o => o.id === parentClipId) || overlay
            }
            if (overlay.type === OverlayType.TRANSITION_MERGED) {
              const fromClipId = (overlay as MergedTransitionOverlay).fromClipId
              return state.overlays.find(o => o.id === fromClipId) || overlay
            }
            return overlay
          })()

          // Use the current anchor position to compute a valid incremental delta
          const anchorCurrent = state.overlays.find(o => o.id === anchorOverlay.id) || anchorOverlay
          const anchorTarget = Math.max(0, anchorCurrent.startTime + deltaTime)

          // Add timeline boundary constraints - prevent dragging beyond timeline duration
          const maxAllowedStart = Math.max(0, state.duration - anchorCurrent.duration)
          let boundaryConstrainedTarget = Math.min(anchorTarget, maxAllowedStart)
          
          // Check if any related transitions would violate timeline boundaries
          const relatedOverlaysForBoundaryCheck = getRelatedOverlays(overlay)
          const proposedDelta = boundaryConstrainedTarget - anchorCurrent.startTime
          
          // Check each related overlay for boundary violations
          relatedOverlaysForBoundaryCheck.forEach(relatedOverlay => {
            if (relatedOverlay.type === OverlayType.TRANSITION_IN) {
              const parent = state.overlays.find(o => o.id === (relatedOverlay as TransitionInOverlay).parentClipId)
              if (parent) {
                const parentNewStart = parent.startTime + proposedDelta
                const tInStart = parentNewStart - relatedOverlay.duration
                if (tInStart < 0) {
                  // Prevent any movement that would make transition-in go below frame 0
                  // The minimum allowed parent position is where transition-in starts at frame 0
                  const minAllowedParentStart = relatedOverlay.duration
                  
                  // If the parent is already at or below this minimum, don't allow leftward movement
                  if (parent.startTime <= minAllowedParentStart) {
                    console.log('Movement blocked: transition-in already at frame 0 limit')
                    boundaryConstrainedTarget = anchorCurrent.startTime // No leftward movement allowed
                  } else {
                    // Constrain the target to not go below the minimum
                    const proposedParentStart = anchorCurrent.startTime + proposedDelta
                    if (proposedParentStart < minAllowedParentStart) {
                      // Adjust the target to keep parent at minimum allowed position
                      boundaryConstrainedTarget = anchorCurrent.startTime - (parent.startTime - minAllowedParentStart)
                      console.log('Movement constrained to prevent transition-in going below frame 0')
                    }
                  }
                }
              }
            }
            if (relatedOverlay.type === OverlayType.TRANSITION_OUT) {
              const parent = state.overlays.find(o => o.id === (relatedOverlay as TransitionOutOverlay).parentClipId)
              if (parent) {
                const parentNewStart = parent.startTime + proposedDelta
                const tOutStart = parentNewStart + parent.duration
                const tOutEnd = tOutStart + relatedOverlay.duration
                if (tOutEnd > state.duration) {
                  // Calculate maximum allowed delta to keep transition within timeline
                  const maxDelta = state.duration - (parent.startTime + parent.duration + relatedOverlay.duration)
                  // If maxDelta is negative or zero, don't allow any rightward movement
                  if (maxDelta <= 0) {
                    boundaryConstrainedTarget = anchorCurrent.startTime // No movement allowed
                  } else {
                    boundaryConstrainedTarget = Math.min(boundaryConstrainedTarget, anchorCurrent.startTime + maxDelta)
                  }
                }
              }
            }
          })

          // For clips, allow overlaps during drag - for transitions, use collision detection
          const validAnchorStart = anchorCurrent.type === OverlayType.CLIP
            ? snapToGrid(boundaryConstrainedTarget)
            : findValidPosition(anchorCurrent, boundaryConstrainedTarget)
          const deltaSinceLast = snapToGrid(validAnchorStart - anchorCurrent.startTime)

          // Move all related overlays by the same incremental delta to avoid stale state reads
          const relatedOverlays = getRelatedOverlays(overlay)
          relatedOverlays.forEach(relatedOverlay => {
            const newStart = snapToGrid(relatedOverlay.startTime + deltaSinceLast)
            // Keep transition-in glued to the start of its clip; transition-out to the end of its clip
            if (relatedOverlay.type === OverlayType.TRANSITION_IN) {
              const parent = state.overlays.find(o => o.id === (relatedOverlay as TransitionInOverlay).parentClipId)
              if (parent) {
                // Find the parent's new position after the delta has been applied
                const parentNewStart = snapToGrid(parent.startTime + deltaSinceLast)
                const tInStart = parentNewStart - relatedOverlay.duration
                
                // Ensure transition-in never starts before timeline start (0)
                const constrainedTInStart = Math.max(0, tInStart)
                actions.updateOverlayBatch(relatedOverlay.id, { startTime: constrainedTInStart, row: parent.row })
                return
              }
            }
            if (relatedOverlay.type === OverlayType.TRANSITION_OUT) {
              const parent = state.overlays.find(o => o.id === (relatedOverlay as TransitionOutOverlay).parentClipId)
              if (parent) {
                // Find the parent's new position after the delta has been applied  
                const parentNewStart = snapToGrid(parent.startTime + deltaSinceLast)
                const tOutStart = parentNewStart + parent.duration
                
                // Ensure transition-out never extends beyond timeline duration
                const maxAllowedStart = Math.min(tOutStart, state.duration - relatedOverlay.duration)
                const constrainedTOutStart = Math.max(0, maxAllowedStart)
                actions.updateOverlayBatch(relatedOverlay.id, { startTime: constrainedTOutStart, row: parent.row })
                return
              }
            }
            actions.updateOverlayBatch(relatedOverlay.id, { startTime: newStart })
          })

          // No additional realignment here; keep merged transition relative to its stored start/duration
        } else if (currentDragInfo.dragType === 'resize-left') {
          // Handle transition resize differently - only transition-in can resize from left
          if (overlay.type === OverlayType.TRANSITION_IN) {
            const minFrameDuration = 2 / settings.fps
            const requestedDuration = Math.max(minFrameDuration, currentDragInfo.originalDuration - deltaTime)
            
            // Find the parent clip to calculate boundary constraints
            const parentClip = state.overlays.find(o => o.id === (overlay as TransitionInOverlay).parentClipId) as ClipOverlay | undefined
            
            // Calculate timeline boundary constraints for transition-in
            let boundaryConstrainedDuration = requestedDuration
            if (parentClip) {
              // Transition-in extends backward from parent clip start
              const maxBackwardExtension = parentClip.startTime // Can't go before timeline start (0)
              boundaryConstrainedDuration = Math.min(requestedDuration, maxBackwardExtension)
            }
            
            // For transition-in left resize, we're potentially extending from the start
            const isExtending = boundaryConstrainedDuration > currentDragInfo.originalDuration
            const maxAllowed = isExtending
              ? getMaxAllowedDurationForExtension(overlay, 'start')
              : getMaxAllowedDuration(overlay, 'transition-in')
            const newDuration = Math.max(minFrameDuration, Math.min(boundaryConstrainedDuration, maxAllowed))

            console.log('Transition-in resize debug:', {
              originalDuration: currentDragInfo.originalDuration,
              deltaTime,
              requestedDuration,
              isExtending,
              maxAllowed,
              newDuration,
              snappedDuration: snapToGrid(newDuration)
            })

            if (parentClip) {
              // Hard-stop by trimIn budget for both directions
              const prevTIn = state.overlays.find(o => o.id === (parentClip as any).transitionInId)
              const prevDuration = prevTIn?.duration || 0
              const desiredNewDuration = snapToGrid(newDuration)
              const availableTrimIn = Math.max(0, parentClip.trimmedIn)

              let appliedDuration = prevDuration
              let trimInDelta = 0 // + increases trimIn, - decreases trimIn

              if (desiredNewDuration > prevDuration) {
                // Moving left (extend): consume trimIn
                const needed = desiredNewDuration - prevDuration
                const appliedLeft = Math.min(needed, availableTrimIn)
                appliedDuration = prevDuration + appliedLeft
                trimInDelta = -appliedLeft
              } else if (desiredNewDuration < prevDuration) {
                // Moving right (shrink): free trimIn
                const shift = prevDuration - desiredNewDuration
                const appliedRight = Math.min(shift, availableTrimIn)
                appliedDuration = prevDuration - appliedRight
                trimInDelta = +appliedRight
              }

              // Respect minimum duration (2 frames)
              appliedDuration = Math.max(minFrameDuration, appliedDuration)

              const newTransitionStart = parentClip.startTime - appliedDuration
              const newTransitionDuration = appliedDuration

              // Adjust trims
              const currentTrimIn = parentClip.trimmedIn
              const trimIn = Math.max(0, currentTrimIn + trimInDelta)
              const trimOut = parentClip.trimmedOut

              // Update both transition and parent clip
              actions.updateOverlayBatch(overlay.id, { startTime: newTransitionStart, duration: newTransitionDuration, row: parentClip.row })
              actions.updateOverlayBatch(parentClip.id, {
                trimmedIn: trimIn,
                trimmedOut: trimOut
              })
            } else {
              actions.updateOverlayBatch(overlay.id, { duration: snapToGrid(newDuration) })
            }
            return
          } else if (overlay.type === OverlayType.TRANSITION_OUT) {
            // Transition-out cannot resize from left
            return
          } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
            // Merged transition left-edge resize: adjust fromClip duration and merged start, keep toClip in place.
            const mergedTransition = overlay as MergedTransitionOverlay
            const fromClip = state.overlays.find(o => o.id === mergedTransition.fromClipId) as ClipOverlay | undefined
            const toClip = state.overlays.find(o => o.id === mergedTransition.toClipId) as ClipOverlay | undefined

            if (fromClip && toClip && fromClip.type === OverlayType.CLIP && toClip.type === OverlayType.CLIP) {
              const minFrameDuration = 2 / settings.fps
              const originalMergedStart = overlay.startTime
              const originalMergedEnd = overlay.startTime + overlay.duration
              const mergedDelta = deltaTime // >0 move right, <0 move left

              if (mergedDelta > 0) {
                // Move left edge right: extend video 1 (fromClip), do NOT change video 1 trimOut,
                // increase video 2 trimIn, do not move video 2, keep >=2-frame merge.
                const maxRightByMin = Math.max(0, originalMergedEnd - minFrameDuration - originalMergedStart)
                // Right move reduces merged duration; limit only by min-frames
                const allowedRight = Math.max(0, Math.min(mergedDelta, maxRightByMin))
                if (allowedRight === 0) return

                const newFromDuration = Math.max(minFrameDuration, fromClip.duration + allowedRight)
                const newMergedStart = originalMergedStart + allowedRight
              const newMergedDuration = originalMergedEnd - newMergedStart

                // Update fromClip duration, preserve trimOut
                actions.updateOverlayBatch(fromClip.id, {
                  duration: snapToGrid(newFromDuration),
                  trimmedOut: fromClip.trimmedOut
                })

                // Update merged transition start/duration
                actions.updateOverlayBatch(overlay.id, {
                  startTime: snapToGrid(newMergedStart),
                  duration: snapToGrid(newMergedDuration)
                })

                // Keep toClip in place; update its trimmedIn based on new merged length, keep trimmedOut
                const toTransitionInB = state.overlays.find(o => o.id === (toClip as any).transitionInId)
                const prevStartUse = (toTransitionInB?.duration || 0) + snapToGrid(overlay.duration)
                const nextStartUse = (toTransitionInB?.duration || 0) + snapToGrid(newMergedDuration)
                const deltaStartUse = nextStartUse - prevStartUse
                const toTrimIn = Math.max(0, toClip.trimmedIn - deltaStartUse)
                actions.updateOverlayBatch(toClip.id, {
                  trimmedIn: toTrimIn,
                  trimmedOut: toClip.trimmedOut
                })

                // Update fromClip's transition-out to follow new end
                if (fromClip.transitionOutId && fromClip.transitionOutId !== overlay.id) {
                  const tOut = state.overlays.find(o => o.id === fromClip.transitionOutId)
                  if (tOut) {
                    const newTOutStart = fromClip.startTime + snapToGrid(newFromDuration)
                    actions.updateOverlayBatch(fromClip.transitionOutId, { startTime: newTOutStart, row: fromClip.row })
                  }
                }
              } else if (mergedDelta < 0) {
                // Move left edge left: shrink video 1 (fromClip), reduce video 2 trimIn,
                // stop if merged would go below 2 frames (it won't here) or video 2 trimIn would hit 0.
                const leftDelta = -mergedDelta

                const toTransitionInC1 = state.overlays.find(o => o.id === (toClip as any).transitionInId)
                const frame = 1 / settings.fps
                const currentMergedDuration = snapToGrid(overlay.duration)
                const availableTrimInBudget = Math.max(0, toClip.trimmedIn + (toTransitionInC1?.duration || 0))
                const remainingTrimInBudget = Math.max(0, availableTrimInBudget)
                // Compute caps
                const allowedLeftByTrim = Math.floor(remainingTrimInBudget / frame) * frame
                const maxLeftByFromClip = Math.max(0, fromClip.duration - minFrameDuration)
                // Apply in whole-frame steps so snapToGrid advances
                const rawAllowed = Math.min(leftDelta, allowedLeftByTrim, maxLeftByFromClip)
                const appliedLeft = Math.floor(rawAllowed / frame) * frame
                if (appliedLeft <= 0) return

                const newFromDuration = Math.max(minFrameDuration, fromClip.duration - appliedLeft)
                const newMergedStart = originalMergedStart - appliedLeft
                const newMergedDuration = originalMergedEnd - newMergedStart

                // Update fromClip duration, preserve trimOut
                actions.updateOverlayBatch(fromClip.id, {
                  duration: snapToGrid(newFromDuration),
                  trimmedOut: fromClip.trimmedOut
                })

                // Update merged transition start/duration
                actions.updateOverlayBatch(overlay.id, {
                  startTime: snapToGrid(newMergedStart),
                  duration: snapToGrid(newMergedDuration)
                })

                // Update toClip trimmedIn (reduced), do not move it; keep trimmedOut
                const toTransitionInC2 = state.overlays.find(o => o.id === (toClip as any).transitionInId)
                const prevStartUse = (toTransitionInC2?.duration || 0) + currentMergedDuration
                const nextStartUse = (toTransitionInC2?.duration || 0) + snapToGrid(newMergedDuration)
                const deltaStartUse = nextStartUse - prevStartUse
                const toTrimInNew = Math.max(0, toClip.trimmedIn - deltaStartUse)
                actions.updateOverlayBatch(toClip.id, {
                  trimmedIn: toTrimInNew,
                  trimmedOut: toClip.trimmedOut
                })

                // Update fromClip's transition-out to follow new end
                if (fromClip.transitionOutId && fromClip.transitionOutId !== overlay.id) {
                  const tOut = state.overlays.find(o => o.id === fromClip.transitionOutId)
                  if (tOut) {
                    const newTOutStart = fromClip.startTime + snapToGrid(newFromDuration)
                    actions.updateOverlayBatch(fromClip.transitionOutId, { startTime: newTOutStart, row: fromClip.row })
                  }
                }
              }
            }
            return
          }

          // Regular clip resize logic with length constraints
          // Calculate minimum duration as two frames (2/fps seconds)
          const minFrameDuration = 2 / settings.fps
          const requestedStartTime = Math.max(0, currentDragInfo.originalStartTime + deltaTime)
          const requestedDuration = Math.max(minFrameDuration, currentDragInfo.originalDuration - deltaTime)
          
          // If duration hits minimum, adjust start time to maintain the minimum duration
          let newStartTime = requestedStartTime
          let finalDuration = requestedDuration
          
          if (requestedDuration <= minFrameDuration) {
            // Duration is at minimum, calculate start time to maintain minimum duration
            const originalEndTime = currentDragInfo.originalStartTime + currentDragInfo.originalDuration
            newStartTime = Math.max(0, originalEndTime - minFrameDuration)
            finalDuration = minFrameDuration
          }

          // Enforce strict timeline boundaries
          // Ensure start time is never less than 0
          newStartTime = Math.max(0, newStartTime)
          
          // Ensure end time is never greater than timeline duration
          const maxAllowedEndTime = state.duration
          if (newStartTime + finalDuration > maxAllowedEndTime) {
            // If the end would exceed timeline, adjust duration to fit
            finalDuration = Math.max(minFrameDuration, maxAllowedEndTime - newStartTime)
            
            // If even minimum duration doesn't fit, adjust start time
            if (finalDuration < minFrameDuration) {
              newStartTime = Math.max(0, maxAllowedEndTime - minFrameDuration)
              finalDuration = minFrameDuration
            }
          }

          // Final boundary check for left resize
          const boundaryConstrainedDuration = Math.max(minFrameDuration, Math.min(finalDuration, maxAllowedEndTime - newStartTime))

          // Additional constraint: ensure transition-in doesn't go below frame 0
          // If the transition-in would go below frame 0, stop the resize completely
          if (overlay.type === OverlayType.CLIP) {
            const clipOverlay = overlay as ClipOverlay
            if (clipOverlay.transitionInId) {
              const transitionIn = state.overlays.find(o => o.id === clipOverlay.transitionInId)
              if (transitionIn) {
                // Calculate where the transition-in would start with the new clip position
                const wouldBeTransitionStart = newStartTime - transitionIn.duration
                
                // If transition-in would go below frame 0, don't allow the resize
                if (wouldBeTransitionStart < 0) {
                  console.log('Left resize blocked: would push transition-in below frame 0')
                  return // Stop the resize operation completely
                }
              }
            }

            // Additional constraint for merged transitions: toClip cannot resize past merged transition start
            const mergedAsTo = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).toClipId === clipOverlay.id) as MergedTransitionOverlay | undefined
            if (mergedAsTo) {
              // Calculate minimum position to maintain 2-frame merged transition duration
              const minFrameDuration = 2 / settings.fps
              const minAllowedToClipStart = mergedAsTo.startTime + minFrameDuration
              
              // toClip cannot resize left past the minimum position that would make merged transition < 2 frames
              if (newStartTime < minAllowedToClipStart) {
                console.log('Left resize blocked: would make merged transition smaller than 2 frames')
                return // Stop the resize operation completely
              }
            }

            // Additional constraint for merged transitions: fromClip cannot be resized to disconnect from merged transition
            const mergedAsFrom = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === clipOverlay.id) as MergedTransitionOverlay | undefined
            if (mergedAsFrom) {
              // Only prevent disconnection when shrinking the clip (not when extending left)
              const isExtending = newStartTime < currentDragInfo.originalStartTime
              if (!isExtending) {
                // fromClip left resize should not disconnect from merged transition when shrinking
                const wouldBeClipEnd = newStartTime + boundaryConstrainedDuration
                if (wouldBeClipEnd < mergedAsFrom.startTime) {
                  console.log('Left resize blocked: fromClip would disconnect from merged transition')
                  return // Stop the resize operation completely
                }
              } else {
                // When extending left, check if pushing everything forward would exceed timeline duration
                const extensionAmount = currentDragInfo.originalStartTime - newStartTime
                const toClip = state.overlays.find(o => o.id === mergedAsFrom.toClipId)
                if (toClip) {
                  // Calculate where toClip would end up after being pushed
                  const newToClipStart = toClip.startTime + extensionAmount
                  const newToClipEnd = newToClipStart + toClip.duration
                  
                  // Check if toClip's transition-out would exceed timeline
                  const toClipTransitionOut = state.overlays.find(o => o.id === (toClip as any).transitionOutId)
                  const finalEndPosition = toClipTransitionOut 
                    ? newToClipEnd + toClipTransitionOut.duration 
                    : newToClipEnd
                  
                  if (finalEndPosition > state.duration) {
                    console.log('Left resize blocked: would push elements beyond timeline duration')
                    return // Stop the resize operation completely
                  }
                }
              }
            }
          }

          // Check clip length constraints
          if (overlay.type === OverlayType.CLIP) {
            const clipOverlay = overlay as ClipOverlay
            // For left resize, we're potentially extending from the start
            const isExtending = newStartTime < currentDragInfo.originalStartTime
            const maxAllowed = isExtending
              ? getMaxAllowedDurationForExtension(overlay, 'start')
              : getMaxAllowedDuration(overlay, 'clip')
            const newDuration = Math.min(boundaryConstrainedDuration, maxAllowed)
            
            // Ensure duration doesn't go below minimum
            const constrainedDuration = Math.max(minFrameDuration, newDuration)
            
            // Use the new start time, but ensure minimum duration
            let constrainedStartTime = newStartTime
            if (constrainedDuration <= minFrameDuration) {
              const originalEndTime = currentDragInfo.originalStartTime + currentDragInfo.originalDuration
              constrainedStartTime = Math.max(newStartTime, originalEndTime - minFrameDuration)
            }

            // Additional trim-aware clamp: if there is a transition-in or merged before,
            // do not allow moving left beyond available trimmedIn (i.e., trimIn cannot go below 0)
            const hasTransitionIn = !!clipOverlay.transitionInId
            const mergedBefore = state.overlays.some(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).toClipId === clipOverlay.id)
            if (hasTransitionIn || mergedBefore) {
              const minStartByTrimIn = currentDragInfo.originalStartTime - clipOverlay.trimmedIn
              if (constrainedStartTime < minStartByTrimIn) {
                constrainedStartTime = minStartByTrimIn
              }
            }

            // When left-resizing body, do not change trims unless rules say so; no mediaStartTime

            console.log('Left resize with constraints:', {
              deltaPixels: e.clientX - currentDragInfo.startX,
              deltaTime,
              originalStartTime: currentDragInfo.originalStartTime,
              originalDuration: currentDragInfo.originalDuration,
              requestedStartTime,
              requestedDuration,
              constrainedStartTime,
              constrainedDuration,
              maxAllowed,
              // trims unchanged here
            })

            if (!checkCollision(overlay, constrainedStartTime, constrainedDuration)) {
              console.log('Updating left resize:', {
                startTime: snapToGrid(constrainedStartTime),
                duration: snapToGrid(constrainedDuration)
              })

              // Compute trims per rules (left body resize): trimIn changes when transition-in or merged-before present
              const deltaStart = snapToGrid(constrainedStartTime) - currentDragInfo.originalStartTime
              const newTrimIn = (hasTransitionIn || mergedBefore)
                ? Math.max(0, (overlay as ClipOverlay).trimmedIn + deltaStart)
                : (overlay as ClipOverlay).trimmedIn
              // Right-edge trimOut unaffected in left body resize
              const newTrimOut = (overlay as ClipOverlay).trimmedOut

              // Update main overlay with new geometry and trims
              actions.updateOverlayBatch(overlay.id, {
                startTime: snapToGrid(constrainedStartTime),
                duration: snapToGrid(constrainedDuration),
                trimmedIn: newTrimIn,
                trimmedOut: newTrimOut
              })

              // Update associated transitions
              if (overlay.transitionInId) {
                const transitionIn = state.overlays.find(o => o.id === overlay.transitionInId)
                if (transitionIn) {
                  const tInStart = snapToGrid(constrainedStartTime) - transitionIn.duration
                  // Ensure transition-in never starts before frame 0
                  const constrainedTInStart = Math.max(0, tInStart)
                  actions.updateOverlayBatch(overlay.transitionInId, { startTime: constrainedTInStart, row: overlay.row })
                }
              }
              if (overlay.transitionOutId) {
                const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
                if (transitionOut) {
                  const newTransitionOutStart = snapToGrid(constrainedStartTime) + snapToGrid(constrainedDuration)
                  // Ensure transition-out never extends beyond timeline duration
                  const constrainedTOutStart = Math.min(newTransitionOutStart, state.duration - transitionOut.duration)
                  actions.updateOverlayBatch(overlay.transitionOutId, { startTime: Math.max(0, constrainedTOutStart), row: overlay.row })
                }
              }

                             // Update merged transition if present
               const mergedAsFrom = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === overlay.id) as MergedTransitionOverlay | undefined
               const mergedAsTo = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).toClipId === overlay.id) as MergedTransitionOverlay | undefined

               if (mergedAsFrom) {
                 // This clip is the fromClip - update merged transition start to stay glued to clip end
                 // and ensure toClip stays connected at the other end of the merged transition
                 const mergedStart = snapToGrid(constrainedStartTime) + snapToGrid(constrainedDuration)
                 const toClip = state.overlays.find(o => o.id === mergedAsFrom.toClipId)

                 console.log('Left resize: updating merged transition (as fromClip)', mergedAsFrom.id, 'start to', mergedStart)
                 actions.updateOverlayBatch(mergedAsFrom.id, { startTime: mergedStart, row: overlay.row })

                 // Keep toClip attached to the end of the merged transition
                 if (toClip) {
                   const newToClipStart = mergedStart + mergedAsFrom.duration
                   console.log('Left resize: moving toClip', toClip.id, 'to stay attached at', newToClipStart)
                   actions.updateOverlayBatch(toClip.id, { startTime: newToClipStart, row: overlay.row })

                   // Update toClip's transitions to follow
                   if ((toClip as any).transitionInId) {
                     const toTransitionIn = state.overlays.find(o => o.id === (toClip as any).transitionInId)
                     if (toTransitionIn) {
                       const toTInStart = newToClipStart - toTransitionIn.duration
                       actions.updateOverlayBatch(toTransitionIn.id, { startTime: toTInStart, row: overlay.row })
                     }
                   }
                   if ((toClip as any).transitionOutId) {
                     const toTransitionOut = state.overlays.find(o => o.id === (toClip as any).transitionOutId)
                     if (toTransitionOut) {
                       const toTOutStart = newToClipStart + toClip.duration
                       actions.updateOverlayBatch(toTransitionOut.id, { startTime: toTOutStart, row: overlay.row })
                     }
                   }
                 }
               }

               if (mergedAsTo) {
                 // This clip is the toClip - when left-resizing toClip, MOVE merged transition with toClip (preserve duration)
                 const fromClip = state.overlays.find(o => o.id === mergedAsTo.fromClipId) as ClipOverlay | undefined
                 if (fromClip) {
                   const deltaShift = snapToGrid(constrainedStartTime) - currentDragInfo.originalStartTime
                   const newMergedStart = snapToGrid(mergedAsTo.startTime + deltaShift)
                   const preservedDuration = mergedAsTo.duration

                   // Move merged; keep duration
                   actions.updateOverlayBatch(mergedAsTo.id, {
                     startTime: newMergedStart,
                     duration: preservedDuration,
                     row: overlay.row
                   })

                   // Move fromClip by the same delta so its end stays glued to merged start
                   const newFromStart = fromClip.startTime + deltaShift
                   actions.updateOverlayBatch(fromClip.id, { startTime: snapToGrid(newFromStart), row: fromClip.row })

                   // Update fromClip transitions to follow
                   if ((fromClip as any).transitionInId) {
                     const tIn = state.overlays.find(o => o.id === (fromClip as any).transitionInId)
                     if (tIn) {
                       actions.updateOverlayBatch((fromClip as any).transitionInId, { startTime: snapToGrid(tIn.startTime + deltaShift), row: fromClip.row })
                     }
                   }
                   if ((fromClip as any).transitionOutId) {
                     const tOut = state.overlays.find(o => o.id === (fromClip as any).transitionOutId)
                     if (tOut) {
                       actions.updateOverlayBatch((fromClip as any).transitionOutId, { startTime: snapToGrid(tOut.startTime + deltaShift), row: fromClip.row })
                     }
                   }
                 }
               }
            } else {
              console.log('Left resize collision detected')
            }
          }
        } else if (currentDragInfo.dragType === 'resize-right') {
          // Handle transition resize differently - only transition-out can resize from right
          if (overlay.type === OverlayType.TRANSITION_OUT) {
            const minFrameDuration = 2 / settings.fps
            const requestedDuration = Math.max(minFrameDuration, currentDragInfo.originalDuration + deltaTime)
            
            // Find the parent clip to calculate boundary constraints
            const parentClip = state.overlays.find(o => o.id === (overlay as TransitionOutOverlay).parentClipId) as ClipOverlay | undefined
            
            // Calculate timeline boundary constraints for transition-out
            let boundaryConstrainedDuration = requestedDuration
            if (parentClip) {
              // Transition-out extends forward from parent clip end
              const transitionEnd = parentClip.startTime + parentClip.duration + requestedDuration
              const maxAllowedEnd = state.duration
              if (transitionEnd > maxAllowedEnd) {
                // Limit the duration so transition doesn't exceed timeline
                boundaryConstrainedDuration = Math.max(minFrameDuration, maxAllowedEnd - (parentClip.startTime + parentClip.duration))
              }
            }
            
            // For transition-out right resize, we're potentially extending from the end
            const isExtending = boundaryConstrainedDuration > currentDragInfo.originalDuration
            const maxAllowed = isExtending
              ? getMaxAllowedDurationForExtension(overlay, 'end')
              : getMaxAllowedDuration(overlay, 'transition-out')
            const newDuration = Math.max(minFrameDuration, Math.min(boundaryConstrainedDuration, maxAllowed))

            console.log('Transition-out resize debug:', {
              originalDuration: currentDragInfo.originalDuration,
              deltaTime,
              requestedDuration,
              isExtending,
              maxAllowed,
              newDuration,
              snappedDuration: snapToGrid(newDuration)
            })

            if (parentClip) {
              const newTransitionStart = parentClip.startTime + parentClip.duration
              // Hard-stop: cap by available trimOut budget
              const prevTOut = state.overlays.find(o => o.id === (parentClip as any).transitionOutId)
              const prevDuration = prevTOut?.duration || 0
              const availableTrimOut = Math.max(0, parentClip.trimmedOut)
              const desiredIncrease = Math.max(0, snapToGrid(newDuration) - prevDuration)
              const appliedIncrease = Math.min(desiredIncrease, availableTrimOut)
              const newTransitionDuration = prevDuration + appliedIncrease

              // Create temporary clip state with updated transition duration for trim calculation
              const tempClip = {
                ...parentClip,
                transitionOutId: overlay.id // Ensure it references this transition
              }

              // Calculate trim values considering the new transition duration
              // Trim rules: adjust only trimOut for transition-out changes; keep trimIn
              const currentTrimOut = parentClip.trimmedOut
              const currentTrimIn = parentClip.trimmedIn
              const trimIn = currentTrimIn
              const trimOut = Math.max(0, currentTrimOut - appliedIncrease)

              // Update both transition and parent clip
              actions.updateOverlayBatch(overlay.id, { startTime: newTransitionStart, duration: newTransitionDuration, row: parentClip.row })
              actions.updateOverlayBatch(parentClip.id, {
                trimmedIn: trimIn,
                trimmedOut: trimOut
              })
            } else {
              actions.updateOverlayBatch(overlay.id, { duration: snapToGrid(newDuration) })
            }
            return
          } else if (overlay.type === OverlayType.TRANSITION_IN) {
            // Transition-in cannot resize from right
            return
          } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
            // Merged transition right resize - move the toClip start position (like resizing clip start)
            const mergedTransition = overlay as MergedTransitionOverlay
            const fromClip = state.overlays.find(o => o.id === mergedTransition.fromClipId)
            const toClip = state.overlays.find(o => o.id === mergedTransition.toClipId) as ClipOverlay | undefined

            if (fromClip && toClip && toClip.type === OverlayType.CLIP) {
              // Calculate new toClip start position based on merged transition right resize
              const mergedTransitionDelta = deltaTime // How much the transition end is moving
              const minFrameDuration = 2 / settings.fps
              
              // First, compute hard caps for how far we can move the right edge
              const toClipMaxStartByMinFrames = toClip.startTime + toClip.duration - minFrameDuration
              
              // From-clip trimOut capacity cap: merged duration cannot exceed available trimOut budget
              const fromClipOverlay = fromClip as ClipOverlay
              const effectiveFromLen = getEffectiveClipLength(fromClipOverlay)
              // Use stored trims as authoritative
              const baseFromTrimIn = fromClipOverlay.trimmedIn
              const baseFromTrimOut = fromClipOverlay.trimmedOut
              const fromTransitionOut = state.overlays.find(o => o.id === (fromClipOverlay as any).transitionOutId)
              const fromTransitionOutDur = fromTransitionOut?.duration || 0
              const maxMergedByFromTrimOut = Math.max(0, baseFromTrimOut - fromTransitionOutDur)
              const maxRightEdgeByFrom = overlay.startTime + maxMergedByFromTrimOut

              // Requested new start for toClip
              const requestedToClipStart = Math.max(0, toClip.startTime + mergedTransitionDelta)
              // Clamp by both constraints
              const allowedToClipStart = Math.min(requestedToClipStart, toClipMaxStartByMinFrames, maxRightEdgeByFrom)

              // Recompute the actual delta we will apply
              const appliedDelta = allowedToClipStart - toClip.startTime
              const newToClipStart = allowedToClipStart
              const newToClipDurationRaw = toClip.duration - appliedDelta
              const newToClipDurationMin = Math.max(minFrameDuration, newToClipDurationRaw)

              // Apply same constraints as regular clip left resize
              const isExtending = newToClipStart < toClip.startTime
              const maxAllowed = isExtending
                ? getMaxAllowedDurationForExtension(toClip, 'start')
                : getMaxAllowedDuration(toClip, 'clip')
              const constrainedDuration = Math.min(newToClipDurationMin, maxAllowed)

              // Add timeline boundary constraints
              const maxEndTime = Math.min(newToClipStart + constrainedDuration, state.duration)
              const boundaryConstrainedDuration = Math.max(minFrameDuration, maxEndTime - newToClipStart)

              // Check merged transition minimum duration BEFORE updating toClip
              // This prevents toClip from moving when the transition would become too small
              const wouldBeMergedDuration = snapToGrid(newToClipStart) - overlay.startTime
              if (wouldBeMergedDuration < minFrameDuration) {
                console.log('Merged transition right resize blocked: would make transition smaller than 2 frames')
                return // Stop the resize operation completely before updating toClip
              }

              if (!checkCollision(toClip, newToClipStart, boundaryConstrainedDuration)) {
                // Update toClip position and duration; do NOT change trimmedIn on right-edge resize
                actions.updateOverlayBatch(toClip.id, {
                  startTime: snapToGrid(newToClipStart),
                  duration: snapToGrid(boundaryConstrainedDuration),
                  trimmedIn: toClip.trimmedIn,
                  // Preserve existing trimOut for video 2 when resizing merged right edge
                  trimmedOut: toClip.trimmedOut
                })

                // Update merged transition end to stay glued to toClip start
                const newMergedDuration = snapToGrid(newToClipStart) - overlay.startTime
                actions.updateOverlayBatch(overlay.id, {
                  duration: snapToGrid(newMergedDuration)
                })

                // Update fromClip trims to reflect delta in merged duration (end usage)
                const prevEndUse = fromTransitionOutDur + (overlay.duration)
                const nextEndUse = fromTransitionOutDur + newMergedDuration
                const deltaEndUse = nextEndUse - prevEndUse // >0 means using more tail
                const fromTrimIn = fromClipOverlay.trimmedIn
                const fromTrimOut = Math.max(0, fromClipOverlay.trimmedOut - deltaEndUse)
                actions.updateOverlayBatch(fromClipOverlay.id, {
                  trimmedIn: fromTrimIn,
                  trimmedOut: fromTrimOut
                })

                // Update toClip's transition-in if it exists
                if (toClip.transitionInId && toClip.transitionInId !== overlay.id) {
                  const transitionIn = state.overlays.find(o => o.id === toClip.transitionInId)
                  if (transitionIn) {
                    const newTransitionInStart = snapToGrid(newToClipStart) - transitionIn.duration
                    actions.updateOverlayBatch(toClip.transitionInId, { startTime: newTransitionInStart, row: toClip.row })
                  }
                }

                // Update toClip's transition-out if it exists
                if (toClip.transitionOutId) {
                  const transitionOut = state.overlays.find(o => o.id === toClip.transitionOutId)
                  if (transitionOut) {
                    const newTransitionOutStart = snapToGrid(newToClipStart) + snapToGrid(boundaryConstrainedDuration)
                    actions.updateOverlayBatch(toClip.transitionOutId, { startTime: newTransitionOutStart, row: toClip.row })
                  }
                }
              }
            }
            return
          }

          // Regular clip resize logic with length constraints
          // Calculate minimum duration as two frames (2/fps seconds)
          const minFrameDuration = 2 / settings.fps
          const requestedDuration = Math.max(minFrameDuration, currentDragInfo.originalDuration + deltaTime)

          // Enforce strict timeline boundary constraints for right resize
          const maxAllowedEnd = state.duration
          const currentStartTime = currentDragInfo.originalStartTime
          
          // Ensure the end time (start + duration) never exceeds timeline duration
          const maxPossibleDuration = maxAllowedEnd - currentStartTime
          
          // Additional constraint: ensure transition-out doesn't extend beyond timeline
          // If the transition-out would go beyond timeline, stop the resize completely
          if (overlay.type === OverlayType.CLIP) {
            const clipOverlay = overlay as ClipOverlay
            if (clipOverlay.transitionOutId) {
              const transitionOut = state.overlays.find(o => o.id === clipOverlay.transitionOutId)
              if (transitionOut) {
                // Calculate where the transition-out would end with the new clip duration
                const wouldBeTransitionEnd = currentStartTime + requestedDuration + transitionOut.duration
                
                // If transition-out would go beyond timeline, don't allow the resize
                if (wouldBeTransitionEnd > state.duration) {
                  console.log('Right resize blocked: would push transition-out beyond timeline end')
                  return // Stop the resize operation completely
                }
              }
            }

            // Additional constraint for merged transitions: fromClip behavior depends on extending vs shrinking
            const mergedAsFrom = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === clipOverlay.id) as MergedTransitionOverlay | undefined
            if (mergedAsFrom) {
              const isExtending = requestedDuration > currentDragInfo.originalDuration
              
              if (!isExtending) {
                // When shrinking: prevent making merged transition smaller than 2 frames
                const minFrameDuration = 2 / settings.fps
                const mergedEnd = mergedAsFrom.startTime + mergedAsFrom.duration
                const maxAllowedFromClipEnd = mergedEnd - minFrameDuration
                
                const wouldBeClipEnd = currentStartTime + requestedDuration
                if (wouldBeClipEnd > maxAllowedFromClipEnd) {
                  console.log('Right resize blocked: would make merged transition smaller than 2 frames')
                  return // Stop the resize operation completely
                }
              } else {
                // When extending: check if pushing everything forward would exceed timeline duration
                const extensionAmount = requestedDuration - currentDragInfo.originalDuration
                const toClip = state.overlays.find(o => o.id === mergedAsFrom.toClipId)
                if (toClip) {
                  // Calculate where toClip would end up after being pushed
                  const newToClipStart = toClip.startTime + extensionAmount
                  const newToClipEnd = newToClipStart + toClip.duration
                  
                  // Check if toClip's transition-out would exceed timeline
                  const toClipTransitionOut = state.overlays.find(o => o.id === (toClip as any).transitionOutId)
                  const finalEndPosition = toClipTransitionOut 
                    ? newToClipEnd + toClipTransitionOut.duration 
                    : newToClipEnd
                  
                  if (finalEndPosition > state.duration) {
                    console.log('Right resize blocked: would push elements beyond timeline duration')
                    return // Stop the resize operation completely
                  }
                }
              }
            }

            // Additional constraint for merged transitions: toClip cannot be resized to make merged transition invalid
            const mergedAsTo = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).toClipId === clipOverlay.id) as MergedTransitionOverlay | undefined
            if (mergedAsTo) {
              // toClip right resize should maintain minimum duration and not interfere with merged transition
              const mergedEnd = mergedAsTo.startTime + mergedAsTo.duration
              const wouldBeClipEnd = currentStartTime + requestedDuration
              // Ensure the clip doesn't shrink so much that it disconnects from the merged transition
              if (wouldBeClipEnd < mergedEnd) {
                console.log('Right resize blocked: toClip would disconnect from merged transition')
                return // Stop the resize operation completely
              }
            }
          }
          
          const boundaryConstrainedDuration = Math.max(
            minFrameDuration, 
            Math.min(requestedDuration, maxPossibleDuration)
          )

          // Check clip length constraints
          if (overlay.type === OverlayType.CLIP) {
            // For right resize, we're potentially extending from the end
            const isExtending = requestedDuration > currentDragInfo.originalDuration
            const maxAllowed = isExtending
              ? getMaxAllowedDurationForExtension(overlay, 'end')
              : getMaxAllowedDuration(overlay, 'clip')
            const newDuration = Math.min(boundaryConstrainedDuration, maxAllowed)

            console.log('Right resize with constraints:', {
              deltaPixels: e.clientX - currentDragInfo.startX,
              deltaTime,
              originalDuration: currentDragInfo.originalDuration,
              requestedDuration,
              maxAllowed,
              finalDuration: newDuration,
              originalStartTime: currentDragInfo.originalStartTime,
              overlayStartTime: overlay.startTime
            })

            // For right resize, startTime should remain at the original position
            if (!checkCollision(overlay, currentDragInfo.originalStartTime, newDuration)) {
              console.log('Updating duration to:', snapToGrid(newDuration))

              // Compute trims per rules (right body resize): trimOut changes when transition-out or merged-after present
              const hasTransitionOut = !!(overlay as ClipOverlay).transitionOutId
              const mergedAfter = state.overlays.some(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === overlay.id)
              const deltaDuration = snapToGrid(newDuration) - currentDragInfo.originalDuration
              const newTrimOut = (hasTransitionOut || mergedAfter)
                ? Math.max(0, (overlay as ClipOverlay).trimmedOut - deltaDuration)
                : (overlay as ClipOverlay).trimmedOut
              // Left-edge trimIn unaffected in right body resize
              const newTrimIn = (overlay as ClipOverlay).trimmedIn

              // Update main overlay with new geometry and trims
              actions.updateOverlayBatch(overlay.id, {
                duration: snapToGrid(newDuration),
                trimmedIn: newTrimIn,
                trimmedOut: newTrimOut
              })

              // Update transition-out position if it exists
              if (overlay.transitionOutId) {
                const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
                if (transitionOut) {
                  const newTransitionOutStart = currentDragInfo.originalStartTime + snapToGrid(newDuration)
                  // Ensure transition-out never extends beyond timeline duration
                  const constrainedTOutStart = Math.min(newTransitionOutStart, state.duration - transitionOut.duration)
                  actions.updateOverlayBatch(overlay.transitionOutId, { startTime: Math.max(0, constrainedTOutStart), row: overlay.row })
                }
              }

                             // Update merged transition if present
               const mergedAsFrom = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === overlay.id) as MergedTransitionOverlay | undefined
               const mergedAsTo = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).toClipId === overlay.id) as MergedTransitionOverlay | undefined

               if (mergedAsFrom) {
                 // This clip is the fromClip - update merged transition start to stay glued to clip end
                 // and ensure toClip stays connected at the other end of the merged transition
                 const mergedStart = currentDragInfo.originalStartTime + snapToGrid(newDuration)
                 const toClip = state.overlays.find(o => o.id === mergedAsFrom.toClipId)

                 console.log('Right resize: updating merged transition (as fromClip)', mergedAsFrom.id, 'start to', mergedStart)
                 actions.updateOverlayBatch(mergedAsFrom.id, { startTime: mergedStart, row: overlay.row })

                 // Keep toClip attached to the end of the merged transition
                 if (toClip) {
                   const newToClipStart = mergedStart + mergedAsFrom.duration
                   console.log('Right resize: moving toClip', toClip.id, 'to stay attached at', newToClipStart)
                   actions.updateOverlayBatch(toClip.id, { startTime: newToClipStart, row: overlay.row })

                   // Update toClip's transitions to follow
                   if ((toClip as any).transitionInId) {
                     const toTransitionIn = state.overlays.find(o => o.id === (toClip as any).transitionInId)
                     if (toTransitionIn) {
                       const toTInStart = newToClipStart - toTransitionIn.duration
                       actions.updateOverlayBatch(toTransitionIn.id, { startTime: toTInStart, row: overlay.row })
                     }
                   }
                   if ((toClip as any).transitionOutId) {
                     const toTransitionOut = state.overlays.find(o => o.id === (toClip as any).transitionOutId)
                     if (toTransitionOut) {
                       const toTOutStart = newToClipStart + toClip.duration
                       actions.updateOverlayBatch(toTransitionOut.id, { startTime: toTOutStart, row: overlay.row })
                     }
                   }
                 }
               }

               if (mergedAsTo) {
                 // When resizing toClip (video 2) right edge, do not change merged transition.
                 // The merged transition's right edge is glued to video 2 START, not its END.
               }
            } else {
              console.log('Collision detected, not updating')
            }
          }
        }
      }
    }

    const handleMouseUp = () => {
      // Commit history if we were actually dragging
      if (localIsDragging) {
        actions.commitDragHistory()

        // Run post-move processing that may re-run once after snapping
        processAfterMove(overlay.id)
      }

      localIsDragging = false
      setIsDragging(false)
      actions.endDrag()
      options.onDragEnd?.(overlay)

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [
    dragThreshold,
    pixelToTime,
    findValidPosition,
    checkCollision,
    snapToGrid,
    snapOverlappingClip,
    getRelatedOverlays,
    checkTransitionOverlaps,
    checkForTransitionMerge,
    getMaxAllowedDuration,
    validateClipTotalLength,
    getEffectiveClipLength,
    actions,
    options
  ])
  
  const handleClick = useCallback((event: React.MouseEvent, overlay: Overlay) => {
    if (isDragging)
      return
    
    event.stopPropagation()
    
    // Handle Ctrl+click on merged transitions to split them
    if ((event.ctrlKey || event.metaKey) && overlay.type === OverlayType.TRANSITION_MERGED) {
      actions.splitMergedTransition(overlay.id)
      return
    }
    
    actions.selectOverlay(overlay.id, event.ctrlKey || event.metaKey)
    options.onSelect?.(overlay)
  }, [isDragging, actions, options])
  
  const handleTimelineMouseDown = useCallback((event: React.MouseEvent) => {
    if (isDragging)
      return
    
    const timelineElement = timelineRef.current
    if (!timelineElement)
      return
    
    const rect = timelineElement.getBoundingClientRect()
    const clickX = event.clientX - rect.left - 60 // Account for track label width
    const clickTime = Math.max(0, pixelToTime(clickX))
    
    // Start scrubbing
    setIsTimelineScrubbing(true)
    actions.seek(clickTime)
    actions.clearSelection()
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTimelineScrubbing || !timelineElement)
        return
      
      const rect = timelineElement.getBoundingClientRect()
      const moveX = e.clientX - rect.left - 60
      const moveTime = Math.max(0, Math.min(state.duration, pixelToTime(moveX)))
      
      actions.seek(moveTime)
    }
    
    const handleMouseUp = () => {
      setIsTimelineScrubbing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [isDragging, isTimelineScrubbing, pixelToTime, actions, state.duration, timelineRef])

  const handleTimelineClick = useCallback((event: React.MouseEvent) => {
    // This will be handled by mousedown for scrubbing
    event.preventDefault()
  }, [])
  
  const getClipStyle = useCallback((overlay: Overlay) => {
    const left = timeToPixel(overlay.startTime)
    const width = timeToPixel(overlay.duration)
    
    return {
      left: `${left}px`,
      width: `${width}px`,
      zIndex: overlay.selected ? 10 : 1
    }
  }, [timeToPixel])
  
  const getCursor = useCallback((overlay: Overlay, mouseX: number) => {
    if (isDragging)
      return 'grabbing'
    
    const overlayElement = document.getElementById(`overlay-${overlay.id}`)
    if (!overlayElement)
      return 'grab'
    
    const rect = overlayElement.getBoundingClientRect()
    const relativeX = mouseX - rect.left
    const resizeHandleWidth = 12
    const transitionInteractiveWidth = 12
    
    if (overlay.type === OverlayType.TRANSITION_IN) {
      return relativeX <= transitionInteractiveWidth ? 'ew-resize' : 'grab'
    }
    if (overlay.type === OverlayType.TRANSITION_OUT) {
      return relativeX >= rect.width - transitionInteractiveWidth ? 'ew-resize' : 'grab'
    }
    if (overlay.type === OverlayType.TRANSITION_MERGED) {
      if (relativeX <= resizeHandleWidth) return 'ew-resize'
      if (relativeX >= rect.width - resizeHandleWidth) return 'ew-resize'
      return 'grab'
    }
    if (relativeX <= resizeHandleWidth)
      return 'ew-resize'
    if (relativeX >= rect.width - resizeHandleWidth)
      return 'ew-resize'
    return 'grab'
  }, [isDragging])
  
  return {
    // State
    isDragging,
    isTimelineScrubbing,
    dragInfo,
    
    // Event handlers
    handleMouseDown,
    handleClick,
    handleTimelineClick,
    handleTimelineMouseDown,
    
    // Utilities
    getClipStyle,
    getCursor,
    pixelToTime,
    timeToPixel,
    snapToGrid,
    
    // Length validation utilities
    getEffectiveClipLength,
    validateClipTotalLength,
    getMaxAllowedDuration,
    
    // Refs
    timelineRef
  }
}
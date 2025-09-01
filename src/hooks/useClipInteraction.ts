import { useCallback, useRef, useState } from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { Overlay, DragInfo, OverlayType, TransitionInOverlay, TransitionOutOverlay, MergedTransitionOverlay } from '../types/overlays'

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
                  console.log('processAfterMove: updating merged transition', merged.id, 'to', mergedStart)
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
  
  // Snap time to grid if enabled
  const snapToGrid = useCallback((time: number): number => {
    if (!settings.snapToGrid)
      return time
    return Math.round(time / settings.gridSize) * settings.gridSize
  }, [settings.snapToGrid, settings.gridSize])
  
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
    const step = settings.gridSize
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
  }, [checkCollision, snapToGrid, settings.gridSize])

  // Snap overlapping clips to nearest neighbor edge
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
      
      // Option 1: Snap to left of other clip
      const snapLeft = other.startTime - overlay.duration
      const distanceLeft = Math.abs(snapLeft - overlay.startTime)
      
      // Option 2: Snap to right of other clip
      const snapRight = otherEnd
      const distanceRight = Math.abs(snapRight - overlay.startTime)
      
      // Choose the closest option
      if (snapLeft >= 0 && distanceLeft < minDistance) {
        minDistance = distanceLeft
        bestSnapTime = snapLeft
      }
      
      if (distanceRight < minDistance) {
        minDistance = distanceRight
        bestSnapTime = snapRight
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
    const resizeHandleWidth = 8
    
    // Transition resize logic: transition-in only LEFT, transition-out only RIGHT
    if (overlay.type === OverlayType.TRANSITION_IN) {
      // Only left resize handle for transition-in
      if (clickX <= resizeHandleWidth) {
        dragType = 'resize-left'
      }
    } else if (overlay.type === OverlayType.TRANSITION_OUT) {
      // Only right resize handle for transition-out
      if (clickX >= overlayWidth - resizeHandleWidth) {
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
          // For clips, allow overlaps during drag - for transitions, use collision detection
          const validAnchorStart = anchorCurrent.type === OverlayType.CLIP 
            ? snapToGrid(anchorTarget) 
            : findValidPosition(anchorCurrent, anchorTarget)
          const deltaSinceLast = snapToGrid(validAnchorStart - anchorCurrent.startTime)

          // Move all related overlays by the same incremental delta to avoid stale state reads
          const relatedOverlays = getRelatedOverlays(overlay)
          relatedOverlays.forEach(relatedOverlay => {
            const newStart = snapToGrid(relatedOverlay.startTime + deltaSinceLast)
            // Keep transition-in glued to the start of its clip; transition-out to the end of its clip
            if (relatedOverlay.type === OverlayType.TRANSITION_IN) {
              const parent = state.overlays.find(o => o.id === (relatedOverlay as TransitionInOverlay).parentClipId)
              if (parent) {
                const tInStart = snapToGrid(parent.startTime - relatedOverlay.duration + deltaSinceLast)
                actions.updateOverlayBatch(relatedOverlay.id, { startTime: tInStart, row: parent.row })
                return
              }
            }
            if (relatedOverlay.type === OverlayType.TRANSITION_OUT) {
              const parent = state.overlays.find(o => o.id === (relatedOverlay as TransitionOutOverlay).parentClipId)
              if (parent) {
                const tOutStart = snapToGrid(parent.startTime + parent.duration + deltaSinceLast)
                actions.updateOverlayBatch(relatedOverlay.id, { startTime: tOutStart, row: parent.row })
                return
              }
            }
            actions.updateOverlayBatch(relatedOverlay.id, { startTime: newStart })
          })

          // No additional realignment here; keep merged transition relative to its stored start/duration
        } else if (currentDragInfo.dragType === 'resize-left') {
          // Handle transition resize differently - only transition-in can resize from left
          if (overlay.type === OverlayType.TRANSITION_IN) {
            const newDuration = Math.max(0.05, currentDragInfo.originalDuration - deltaTime)
            const parentClip = state.overlays.find(o => o.id === (overlay as TransitionInOverlay).parentClipId)
            if (parentClip) {
              const newTransitionStart = parentClip.startTime - snapToGrid(newDuration)
              actions.updateOverlayBatch(overlay.id, { startTime: newTransitionStart, duration: snapToGrid(newDuration), row: parentClip.row })
            } else {
              actions.updateOverlayBatch(overlay.id, { duration: snapToGrid(newDuration) })
            }
            return
          } else if (overlay.type === OverlayType.TRANSITION_OUT) {
            // Transition-out cannot resize from left
            return
          }
          
          // Regular clip resize logic
          const newStartTime = Math.max(0, currentDragInfo.originalStartTime + deltaTime)
          const newDuration = Math.max(0.1, currentDragInfo.originalDuration - deltaTime)
          
          console.log('Left resize:', {
            deltaPixels: e.clientX - currentDragInfo.startX,
            deltaTime,
            originalStartTime: currentDragInfo.originalStartTime,
            originalDuration: currentDragInfo.originalDuration,
            newStartTime,
            newDuration
          })
          
          if (!checkCollision(overlay, newStartTime, newDuration)) {
            console.log('Updating left resize:', { 
              startTime: snapToGrid(newStartTime), 
              duration: snapToGrid(newDuration) 
            })
            
            // Update the main overlay
            actions.updateOverlayBatch(overlay.id, {
              startTime: snapToGrid(newStartTime),
              duration: snapToGrid(newDuration)
            })
            
            // Update associated transitions
            if (overlay.transitionInId) {
              const transitionIn = state.overlays.find(o => o.id === overlay.transitionInId)
              if (transitionIn) {
                const tInStart = snapToGrid(newStartTime) - transitionIn.duration
                actions.updateOverlayBatch(overlay.transitionInId, { startTime: tInStart, row: overlay.row })
              }
            }
            if (overlay.transitionOutId) {
              const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
              if (transitionOut) {
                const newTransitionOutStart = snapToGrid(newStartTime) + snapToGrid(newDuration)
                actions.updateOverlayBatch(overlay.transitionOutId, { startTime: newTransitionOutStart, row: overlay.row })
              }
            }

            // Update merged transition if present with this clip as fromClip
            const merged = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === overlay.id) as MergedTransitionOverlay | undefined
            if (merged) {
              const mergedStart = snapToGrid(newStartTime) + snapToGrid(newDuration)
              actions.updateOverlayBatch(merged.id, { startTime: mergedStart, row: overlay.row })
            }
          } else {
            console.log('Left resize collision detected')
          }
        } else if (currentDragInfo.dragType === 'resize-right') {
          // Handle transition resize differently - only transition-out can resize from right
          if (overlay.type === OverlayType.TRANSITION_OUT) {
            const newDuration = Math.max(0.05, currentDragInfo.originalDuration + deltaTime)
            const parentClip = state.overlays.find(o => o.id === (overlay as TransitionOutOverlay).parentClipId)
            if (parentClip) {
              const newTransitionStart = parentClip.startTime + parentClip.duration
              actions.updateOverlayBatch(overlay.id, { startTime: newTransitionStart, duration: snapToGrid(newDuration), row: parentClip.row })
            } else {
              actions.updateOverlayBatch(overlay.id, { duration: snapToGrid(newDuration) })
            }
            return
          } else if (overlay.type === OverlayType.TRANSITION_IN) {
            // Transition-in cannot resize from right
            return
          }
          
          // Regular clip resize logic
          const newDuration = Math.max(0.1, currentDragInfo.originalDuration + deltaTime)
          
          console.log('Right resize:', {
            deltaPixels: e.clientX - currentDragInfo.startX,
            deltaTime,
            originalDuration: currentDragInfo.originalDuration,
            newDuration,
            originalStartTime: currentDragInfo.originalStartTime,
            overlayStartTime: overlay.startTime
          })
          
          // For right resize, startTime should remain at the original position
          if (!checkCollision(overlay, currentDragInfo.originalStartTime, newDuration)) {
            console.log('Updating duration to:', snapToGrid(newDuration))
            
            // Update the main overlay duration
            actions.updateOverlayBatch(overlay.id, { duration: snapToGrid(newDuration) })
            
            // Update transition-out position if it exists
            if (overlay.transitionOutId) {
              const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
              if (transitionOut) {
                const newTransitionOutStart = currentDragInfo.originalStartTime + snapToGrid(newDuration)
                actions.updateOverlayBatch(overlay.transitionOutId, { startTime: newTransitionOutStart, row: overlay.row })
              }
            }

            // Update merged transition if present with this clip as fromClip
            const merged = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === overlay.id) as MergedTransitionOverlay | undefined
            if (merged) {
              const mergedStart = currentDragInfo.originalStartTime + snapToGrid(newDuration)
              actions.updateOverlayBatch(merged.id, { startTime: mergedStart, row: overlay.row })
            }
          } else {
            console.log('Collision detected, not updating')
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
    const resizeHandleWidth = 8
    
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
    
    // Refs
    timelineRef
  }
}
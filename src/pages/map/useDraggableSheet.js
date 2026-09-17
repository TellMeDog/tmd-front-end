import { useRef, useState } from 'react';

const MOBILE_BREAKPOINT = 767;
const HALF_RATIO = 0.5;
const FULL_RATIO = 0.97;
const DISMISS_RATIO = 0.3;

// 모바일 바텀시트를 드래그로 절반/전체로 스냅하거나, 충분히 내리면 닫히게 함
export function useDraggableSheet(onClose, onExpandedChange) {
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState(null);
  const sheetRef = useRef(null);
  const dragRef = useRef(null);

  const updateExpanded = (value) => {
    setExpanded(value);
    onExpandedChange?.(value);
  };

  const reset = () => {
    updateExpanded(false);
    setDragHeight(null);
  };

  const handlePointerDown = (event) => {
    const containerHeight = sheetRef.current?.parentElement?.clientHeight;
    if (!sheetRef.current || !containerHeight || window.innerWidth > MOBILE_BREAKPOINT) return;
    dragRef.current = {
      startY: event.clientY,
      startHeight: sheetRef.current.getBoundingClientRect().height,
      containerHeight,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const { startY, startHeight, containerHeight } = dragRef.current;
    const maxHeight = containerHeight * FULL_RATIO;
    const nextHeight = Math.min(maxHeight, Math.max(0, startHeight + (startY - event.clientY)));
    setDragHeight(nextHeight);
  };

  const handlePointerUp = () => {
    if (!dragRef.current) return;
    const { containerHeight } = dragRef.current;
    dragRef.current = null;
    setDragHeight((currentHeight) => {
      if (currentHeight != null) {
        if (currentHeight < containerHeight * DISMISS_RATIO) {
          onClose();
        } else {
          const midpoint = (containerHeight * (HALF_RATIO + FULL_RATIO)) / 2;
          updateExpanded(currentHeight >= midpoint);
        }
      }
      return null;
    });
  };

  return {
    sheetRef,
    expanded,
    dragHeight,
    reset,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}

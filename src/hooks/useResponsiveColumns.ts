
import { useState, useEffect } from 'react';

interface UseResponsiveColumnsProps {
  containerRef: React.RefObject<HTMLElement>;
  columnCount: number;
  minColumnWidth?: number;
  maxColumnWidth?: number;
  columnGap?: number;
  padding?: number;
}

export const useResponsiveColumns = ({
  containerRef,
  columnCount,
  minColumnWidth = 200,
  maxColumnWidth = 320,
  columnGap = 16,
  padding = 32
}: UseResponsiveColumnsProps) => {
  const [columnWidth, setColumnWidth] = useState(minColumnWidth);
  const [shouldUseHorizontalScroll, setShouldUseHorizontalScroll] = useState(false);

  useEffect(() => {
    const calculateColumnWidth = () => {
      if (!containerRef.current || columnCount === 0) return;

      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - padding;
      const totalGapWidth = (columnCount - 1) * columnGap;
      const widthPerColumn = (availableWidth - totalGapWidth) / columnCount;

      console.log('📐 RESPONSIVE COLUMNS: Container width:', containerWidth, 'Available:', availableWidth, 'Per column:', widthPerColumn);

      if (widthPerColumn >= minColumnWidth) {
        // We can fit all columns without horizontal scroll
        const optimalWidth = Math.min(widthPerColumn, maxColumnWidth);
        setColumnWidth(optimalWidth);
        setShouldUseHorizontalScroll(false);
        console.log('📐 RESPONSIVE COLUMNS: Using optimal width:', optimalWidth);
      } else {
        // Not enough space, use minimum width and enable horizontal scroll
        setColumnWidth(minColumnWidth);
        setShouldUseHorizontalScroll(true);
        console.log('📐 RESPONSIVE COLUMNS: Using minimum width with scroll');
      }
    };

    calculateColumnWidth();

    const resizeObserver = new ResizeObserver(calculateColumnWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, columnCount, minColumnWidth, maxColumnWidth, columnGap, padding]);

  return {
    columnWidth,
    shouldUseHorizontalScroll
  };
};

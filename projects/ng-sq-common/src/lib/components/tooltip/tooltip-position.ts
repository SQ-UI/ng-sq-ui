import type { TooltipPosition } from '../../interfaces/tooltip-position';

export const TOOLTIP_VIEWPORT_MARGIN = 8;
const GAP = 8;
const OPPOSITE: Record<TooltipPosition, TooltipPosition> = {
  top: 'bottom', bottom: 'top', left: 'right', right: 'left',
};

/** Fixed coordinates use the same coordinate system as getBoundingClientRect(). */
export function positionTooltip(
  anchor: Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height'>,
  tooltip: Pick<DOMRect, 'width' | 'height'>,
  viewport: { left: number; top: number; width: number; height: number },
  preferred: TooltipPosition,
): { left: number; top: number; position: TooltipPosition } {
  const margin = TOOLTIP_VIEWPORT_MARGIN;
  const left = viewport.left + margin;
  const top = viewport.top + margin;
  const right = viewport.left + viewport.width - margin;
  const bottom = viewport.top + viewport.height - margin;
  const space: Record<TooltipPosition, number> = {
    top: anchor.top - GAP - top,
    bottom: bottom - anchor.bottom - GAP,
    left: anchor.left - GAP - left,
    right: right - anchor.right - GAP,
  };
  const candidates: TooltipPosition[] = [preferred, OPPOSITE[preferred],
    ...(preferred === 'top' || preferred === 'bottom' ? ['right', 'left'] as const : ['top', 'bottom'] as const)];
  const size = (side: TooltipPosition) => side === 'top' || side === 'bottom' ? tooltip.height : tooltip.width;
  // Prefer a side that fits; otherwise choose the one with the least overflow and clamp it.
  const position = candidates.find(side => space[side] >= size(side)) ??
    candidates.reduce((best, side) => space[side] - size(side) > space[best] - size(best) ? side : best);

  let x = anchor.left + (anchor.width - tooltip.width) / 2;
  let y = anchor.top + (anchor.height - tooltip.height) / 2;
  if (position === 'top') y = anchor.top - tooltip.height - GAP;
  if (position === 'bottom') y = anchor.bottom + GAP;
  if (position === 'left') x = anchor.left - tooltip.width - GAP;
  if (position === 'right') x = anchor.right + GAP;

  return {
    left: Math.max(left, Math.min(x, right - tooltip.width)),
    top: Math.max(top, Math.min(y, bottom - tooltip.height)),
    position,
  };
}

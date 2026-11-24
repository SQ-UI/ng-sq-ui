import { positionTooltip } from './tooltip-position';
import type { TooltipPosition } from '../../interfaces/tooltip-position';

const viewport = { left: 0, top: 0, width: 320, height: 240 };
const tooltip = { width: 120, height: 40 };
const rect = (left: number, top: number, width = 40, height = 24) =>
  ({ left, top, width, height, right: left + width, bottom: top + height });

describe('tooltip positioning', () => {
  it.each<TooltipPosition>(['top', 'bottom', 'left', 'right'])('uses the preferred %s side when it fits', position => {
    const anchor = rect(140, 100);
    expect(positionTooltip(anchor, tooltip, viewport, position).position).toBe(position);
  });

  it.each([
    { preferred: 'top', expected: 'bottom', anchor: rect(140, 0) },
    { preferred: 'bottom', expected: 'top', anchor: rect(140, 216) },
    { preferred: 'left', expected: 'right', anchor: rect(0, 100) },
    { preferred: 'right', expected: 'left', anchor: rect(280, 100) },
  ] as const)('flips $preferred to $expected at the screen edge', ({ preferred, expected, anchor }) => {
    expect(positionTooltip(anchor, tooltip, viewport, preferred).position).toBe(expected);
  });

  it('tries a perpendicular side when neither preferred nor opposite side fits', () => {
    const result = positionTooltip(rect(20, 100, 24, 24), { width: 100, height: 220 }, viewport, 'top');
    expect(result.position).toBe('right');
    expect(result.top).toBe(8);
  });

  it.each([
    rect(0, 0), rect(280, 0), rect(0, 216), rect(280, 216),
  ])('keeps every corner inside the viewport', anchor => {
    for (const position of ['top', 'bottom', 'left', 'right'] as const) {
      const result = positionTooltip(anchor, tooltip, viewport, position);
      expect(result.left).toBeGreaterThanOrEqual(8);
      expect(result.top).toBeGreaterThanOrEqual(8);
      expect(result.left + tooltip.width).toBeLessThanOrEqual(312);
      expect(result.top + tooltip.height).toBeLessThanOrEqual(232);
    }
  });

  it('clamps large tooltips when no side has enough room', () => {
    const result = positionTooltip(rect(140, 100), { width: 304, height: 224 }, viewport, 'top');
    expect(result.left).toBe(8);
    expect(result.top).toBe(8);
  });

  it('respects the visual viewport offset after zooming or panning', () => {
    const result = positionTooltip(rect(100, 80), tooltip,
      { left: 100, top: 80, width: 200, height: 160 }, 'left');
    expect(result.position).toBe('right');
    expect(result.left).toBeGreaterThanOrEqual(108);
    expect(result.top).toBeGreaterThanOrEqual(88);
    expect(result.left + tooltip.width).toBeLessThanOrEqual(292);
    expect(result.top + tooltip.height).toBeLessThanOrEqual(232);
  });
});

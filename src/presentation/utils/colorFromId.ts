const GOLDEN_ANGLE = 137.508;

export function colorFromIndex(index: number): string {
  const hue = (index * GOLDEN_ANGLE) % 360;
  return `hsl(${hue}, 72%, 52%)`;
}

// Ángulo dorado utilizado para distribuir colores de forma uniforme
const GOLDEN_ANGLE = 137.508;

// Genera un color HSL a partir de un índice
// Produce colores visualmente distintos incluso con muchos elementos
export function colorFromIndex(index: number): string {
  // Calcula el tono (hue) usando el ángulo dorado
  const hue = (index * GOLDEN_ANGLE) % 360;

  // Retorna un color en formato HSL con saturación y luminosidad fijas
  return `hsl(${hue}, 72%, 52%)`;
}

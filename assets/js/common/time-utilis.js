// time-utilis.js v1.0

export function calculateTotalMinutes(activities) {
  return activities.reduce((sum, { minutes, multiplier, people }) => {
    // Assicuriamoci di trattare i valori come numeri
    const m = Number(minutes) || 0;
    const mult = Number(multiplier) || 1;
    const p = Number(people) || 1;
    return sum + (m * mult) / p;
  }, 0);
}

export function formatHoursMinutes(totalMinutes) {
  // Arrotondiamo i minuti a intero
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  const formatted = `${hours}:${minutes.toString().padStart(2, '0')}`;
  return { hours, minutes, formatted };
}

export function formatDecimalHours(totalMinutes, decimals = 2) {
  const hoursDecimal = totalMinutes / 60;
  return Number(hoursDecimal.toFixed(decimals));
}

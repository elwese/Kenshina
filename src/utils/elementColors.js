export const elementColors = {
  Pyro: '#ef4444',    // Rojo
  Hydro: '#3b82f6',   // Azul
  Anemo: '#14b8a6',   // Turquesa
  Electro: '#a855f7', // Violeta
  Dendro: '#22c55e',  // Verde
  Cryo: '#a5f3fc',    // Celeste hielo
  Geo: '#eab308',     // Amarillo/Dorado
  default: '#fbbf24'  // Dorado por defecto (Genshin)
};

export const getElementColor = (element) => {
  return elementColors[element] || elementColors.default;
};
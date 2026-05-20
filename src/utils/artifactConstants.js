
export const STAT_SCALING = {
  "ATQ": { base: 47, factor: 13.2 },
  "VIDA": { base: 717, factor: 203.15 },
  "ATQ_P": { base: 7, factor: 1.98 },
  "DEF_P": { base: 8.7, factor: 2.48 },
  "D_CRIT": { base: 6.2, factor: 2.8 },
  "P_CRIT": { base: 3.1, factor: 1.4 },
  "VIDA_P": { base: 7, factor: 1.98 },
  "RECARGA_E": { base: 5.2, factor: 2.33 },
  "BONO_DAÑO": { base: 7, factor: 1.98 }, // Genérico para bonos elementales
  "M_ELEMENTAL": { base: 28, factor: 7.95 },
  "BONO_CURACION": { base: 5.4, factor: 1.525 },
  // Mapeo extra para los bonos elementales específicos que usan la misma base
  "D_FISICO": { base: 7, factor: 1.98 },
  "D_ANEMO": { base: 7, factor: 1.98 },
  "D_CRYO": { base: 7, factor: 1.98 },
  "D_GEO": { base: 7, factor: 1.98 },
  "D_PYRO": { base: 7, factor: 1.98 },
  "D_DENDRO": { base: 7, factor: 1.98 },
  "D_HYDRO": { base: 7, factor: 1.98 },
  "D_ELECTRO": { base: 7, factor: 1.98 }
};

export const MAIN_STAT_OPTIONS = {
  RELOJ: [
    { value: "VIDA_P", label: "Vida %" },
    { value: "ATQ_P", label: "Ataque %" },
    { value: "DEF_P", label: "Defensa %" },
    { value: "M_ELEMENTAL", label: "Maestría Elemental" },
    { value: "RECARGA_E", label: "Recarga de Energía %" }
  ],
  COPA: [
    { value: "VIDA_P", label: "Vida %" },
    { value: "ATQ_P", label: "Ataque %" },
    { value: "DEF_P", label: "Defensa %" },
    { value: "M_ELEMENTAL", label: "Maestría Elemental" },
    { value: "D_FISICO", label: "Daño Físico" },
    { value: "D_ANEMO", label: "Daño Anemo" },
    { value: "D_CRYO", label: "Daño Cryo" },
    { value: "D_GEO", label: "Daño Geo" },
    { value: "D_PYRO", label: "Daño Pyro" },
    { value: "D_DENDRO", label: "Daño Dendro" },
    { value: "D_HYDRO", label: "Daño Hydro" },
    { value: "D_ELECTRO", label: "Daño Electro" }
  ],
  TIARA: [
    { value: "VIDA_P", label: "Vida %" },
    { value: "ATQ_P", label: "Ataque %" },
    { value: "DEF_P", label: "Defensa %" },
    { value: "M_ELEMENTAL", label: "Maestría Elemental" },
    { value: "P_CRIT", label: "Prob. Crítico" },
    { value: "D_CRIT", label: "Daño Crítico" },
    { value: "BONO_CURACION", label: "Bono Curación" }
  ]
};

export const SUBSTAT_OPTIONS = [
  { value: "VIDA", label: "Vida" },
  { value: "VIDA_P", label: "Vida %" },
  { value: "ATQ", label: "Ataque" },
  { value: "ATQ_P", label: "Ataque %" },
  { value: "DEF", label: "Defensa" },
  { value: "DEF_P", label: "Defensa %" },
  { value: "M_ELEMENTAL", label: "Maestría Elemental" },
  { value: "RECARGA_E", label: "Recarga de Energía" },
  { value: "D_CRIT", label: "Daño Crítico" },
  { value: "P_CRIT", label: "Prob. Crítico" }
];
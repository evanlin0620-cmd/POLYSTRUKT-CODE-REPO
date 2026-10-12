import { Shield, Flame, Layers, Box, Zap } from "lucide-react";
import { MaterialOption, MaterialType } from "../types";

export const MATERIALS: MaterialOption[] = [
  {
    id: "titanium_grade_5",
    name: "Titanium Grade 5",
    icon: Shield,
    color: "text-cyan-400",
    density: "4.43 g/cm³",
    yieldStrength: "880 MPa",
    thermalExpansion: "8.6 µm/m·K",
    machinability: "40%",
  },
  {
    id: "steel_304",
    name: "Stainless Steel 304",
    icon: Flame,
    color: "text-orange-400",
    density: "8.00 g/cm³",
    yieldStrength: "215 MPa",
    thermalExpansion: "17.3 µm/m·K",
    machinability: "45%",
  },
  {
    id: "carbon_fiber",
    name: "Carbon Composite",
    icon: Layers,
    color: "text-zinc-300",
    density: "1.55 g/cm³",
    yieldStrength: "1,500 MPa",
    thermalExpansion: "0.5 µm/m·K",
    machinability: "Special Tooling",
  },
  {
    id: "aluminum_6061",
    name: "Aluminum 6061-T6",
    icon: Box,
    color: "text-blue-300",
    density: "2.70 g/cm³",
    yieldStrength: "276 MPa",
    thermalExpansion: "23.2 µm/m·K",
    machinability: "90%",
  },
  {
    id: "abs_plastic",
    name: "ABS Plastic",
    icon: Zap,
    color: "text-zinc-400",
    density: "1.04 g/cm³",
    yieldStrength: "45 MPa",
    thermalExpansion: "73.8 µm/m·K",
    machinability: "Rapid Prototyping",
  },
];

export const DEFAULT_MATERIAL: MaterialOption = MATERIALS[0];

export const getMaterialById = (id: string): MaterialOption => {
  const normalized = id.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return (
    MATERIALS.find(
      (m) =>
        m.id === id ||
        m.id === normalized ||
        m.name.toLowerCase().includes(normalized)
    ) || DEFAULT_MATERIAL
  );
};

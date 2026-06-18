export const MATERIALS = [
  {
    id: "steel_4140",
    name: "AISI 4140 Alloy Steel",
    category: "Metals",
    properties: {
      density: "7.85 g/cm³",
      yieldStrength: "415-1080 MPa",
      tensileStrength: "655-1250 MPa",
      youngsModulus: "210 GPa",
      thermalConductivity: "42.7 W/m·K"
    },
    applications: ["Gears", "Shafts", "Bolts", "Crankshafts"]
  },
  {
    id: "alu_6061_t6",
    name: "Aluminum 6061-T6",
    category: "Metals",
    properties: {
      density: "2.70 g/cm³",
      yieldStrength: "276 MPa",
      tensileStrength: "310 MPa",
      youngsModulus: "68.9 GPa",
      thermalConductivity: "167 W/m·K"
    },
    applications: ["Aircraft structures", "Automotive parts", "Marine fittings"]
  },
  {
    id: "titanium_gr5",
    name: "Titanium Grade 5 (Ti-6Al-4V)",
    category: "Metals",
    properties: {
      density: "4.43 g/cm³",
      yieldStrength: "880 MPa",
      tensileStrength: "950 MPa",
      youngsModulus: "113.8 GPa",
      thermalConductivity: "6.7 W/m·K"
    },
    applications: ["Aerospace fasteners", "Turbine blades", "Medical implants"]
  },
  {
    id: "carbon_fiber_epoxy",
    name: "Carbon Fiber Reinforced Polymer (CFRP)",
    category: "Composites",
    properties: {
      density: "1.5-1.6 g/cm³",
      yieldStrength: "600-1500 MPa (Directional)",
      tensileStrength: "1200-2500 MPa",
      youngsModulus: "150-230 GPa",
      thermalConductivity: "2-5 W/m·K"
    },
    applications: ["Racing car chassis", "High-end sporting goods", "Aerospace fairings"]
  },
  {
    id: "peek",
    name: "PEEK (Polyether ether ketone)",
    category: "Polymers",
    properties: {
      density: "1.32 g/cm³",
      yieldStrength: "90-100 MPa",
      tensileStrength: "100 MPa",
      youngsModulus: "3.6 GPa",
      thermalConductivity: "0.25 W/m·K"
    },
    applications: ["Bearings", "Piston parts", "Insulation", "Medical devices"]
  }
];

export const getMaterialById = (id) => MATERIALS.find(m => m.id === id);
export const getMaterialsByCategory = (cat) => MATERIALS.filter(m => m.category === cat);

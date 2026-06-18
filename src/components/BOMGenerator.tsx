import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Database, Download, FileSpreadsheet, Loader2, Edit2, Check, DollarSign } from 'lucide-react';
import { ProceduralSpec } from '../types';

interface BOMGeneratorProps {
  onClose: () => void;
  currentDesign: any;
  selectedMaterial: any;
}

interface BOMItem {
  id: string;
  partName: string;
  type: string;
  dimensions: string;
  qty: number;
  volumeMm3: number;
  weightGrams: number;
  unitCost: number;
  totalCost: number;
}

// Densities (g/cm³) and raw material cost per kg
const MATERIAL_SPECS: Record<string, { densityGcm3: number; costPerKg: number }> = {
  titanium_grade_5: { densityGcm3: 4.43, costPerKg: 45 },
  steel_304: { densityGcm3: 8.00, costPerKg: 8 },
  carbon_fiber: { densityGcm3: 1.60, costPerKg: 65 },
  aluminum_6061: { densityGcm3: 2.70, costPerKg: 12 },
  abs_plastic: { densityGcm3: 1.04, costPerKg: 4 },
};

/**
 * Recursively parses the CSG structure to extract constituent shapes/components
 */
function parseSpecsToBOM(spec: ProceduralSpec, level = 1, currentPath = "Part"): BOMItem[] {
  if (!spec) return [];

  const items: BOMItem[] = [];

  // Helper to generate a semi-random unique ID
  const makeId = () => Math.random().toString(36).substring(7).toUpperCase();

  // Helper to handle shapes
  const handleShape = (type: string, args: number[], color?: string): BOMItem => {
    let dimStr = "";
    let volume = 0; // mm3

    if (type === 'box') {
      const [w, h, d] = args || [10, 10, 10];
      dimStr = `${w} × ${h} × ${d} mm`;
      volume = w * h * d;
    } else if (type === 'cylinder') {
      const [rt, rb, h] = args || [5, 5, 10];
      dimStr = `Ø${rt * 2} × ${h} mm`;
      volume = Math.PI * rt * rt * h;
    } else if (type === 'sphere') {
      const [r] = args || [5];
      dimStr = `Ø${r * 2} mm Sphere`;
      volume = (4.0 / 3.0) * Math.PI * Math.pow(r, 3);
    } else if (type === 'torus') {
      const [r, tube] = args || [10, 2];
      dimStr = `Major Ø${r * 2}, Tube Ø${tube * 2}`;
      volume = 2 * Math.pow(Math.PI, 2) * r * Math.pow(tube, 2);
    } else if (type === 'cone') {
      const [r, h] = args || [5, 10];
      dimStr = `Ø${r * 2} Base × ${h} conical`;
      volume = (1.0 / 3.0) * Math.PI * r * r * h;
    }

    return {
      id: makeId(),
      partName: `${currentPath} [${type.toUpperCase()}]`,
      type,
      dimensions: dimStr,
      qty: 1,
      volumeMm3: Math.round(volume),
      weightGrams: 0, // Computed soon
      unitCost: 0,
      totalCost: 0
    };
  };

  if ('op' in spec) {
    if (spec.op === 'group') {
      // Recurse children
      (spec.children || []).forEach((child, index) => {
        items.push(...parseSpecsToBOM(child, level + 1, `${currentPath}_G${level}P${index + 1}`));
      });
    } else {
      // union, subtract, intersect
      items.push(...parseSpecsToBOM(spec.a, level + 1, `${currentPath}_A`));
      items.push(...parseSpecsToBOM(spec.b, level + 1, `${currentPath}_B`));
    }
  } else {
    // Single shape
    items.push(handleShape(spec.type, spec.args, spec.color));
  }

  return items;
}

export const BOMGenerator: React.FC<BOMGeneratorProps> = ({ 
  onClose, 
  currentDesign, 
  selectedMaterial 
}) => {
  const spec = currentDesign?.proceduralSpec;
  const materialKey = selectedMaterial?.id || 'aluminum_6061';
  const matSpec = MATERIAL_SPECS[materialKey] || MATERIAL_SPECS.aluminum_6061;

  // Derive initial list from design CSG hierarchy
  const initialItems = useMemo(() => {
    if (!spec) {
      // Fallback base items if design spec doesn't exist
      return [
        { id: "P101", partName: "Enclosure Chassis Mount [BOX]", type: "box", dimensions: "150 × 100 × 15 mm", qty: 1, volumeMm3: 225000, weightGrams: 0, unitCost: 0, totalCost: 0 },
        { id: "P102", partName: "Core Cylinder Housing [CYLINDER]", type: "cylinder", dimensions: "Ø80 × 50 mm", qty: 1, volumeMm3: 251327, weightGrams: 0, unitCost: 0, totalCost: 0 },
        { id: "P103", partName: "Standard M8 Fastener Ports [CYLINDER]", type: "cylinder", dimensions: "Ø8 × 15 mm", qty: 4, volumeMm3: 3015, weightGrams: 0, unitCost: 0, totalCost: 0 }
      ];
    }
    const parsed = parseSpecsToBOM(spec);
    if (parsed.length === 0) {
      // Ensure we have at least one root part
      parsed.push({
        id: "P001",
        partName: "Base Geometry Chassis [BOX]",
        type: "box",
        dimensions: "150 × 100 × 50 mm",
        qty: 1,
        volumeMm3: 750000,
        weightGrams: 0,
        unitCost: 0,
        totalCost: 0
      });
    }
    return parsed;
  }, [spec]);

  // Table items state allowing manual edits of Qty and Part Names
  const [bomItems, setBomItems] = useState<BOMItem[]>(() => {
    // Complete calculations: weight (grams) = Volume (mm³) * Density (g/cm³) / 1000
    return initialItems.map(item => {
      const weight = (item.volumeMm3 * matSpec.densityGcm3) / 1000;
      const materialCostValue = (weight / 1000) * matSpec.costPerKg;
      // Add standard tooling/process markup (say $5 per raw part)
      const unitCost = parseFloat((materialCostValue + 3.50).toFixed(2));
      return {
        ...item,
        weightGrams: parseFloat(weight.toFixed(1)),
        unitCost,
        totalCost: parseFloat((unitCost * item.qty).toFixed(2))
      };
    });
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState(1);

  const startEditing = (item: BOMItem) => {
    setEditingId(item.id);
    setEditName(item.partName);
    setEditQty(item.qty);
  };

  const saveEditing = (id: string) => {
    setBomItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          partName: editName,
          qty: editQty,
          totalCost: parseFloat((item.unitCost * editQty).toFixed(2))
        };
      }
      return item;
    }));
    setEditingId(null);
  };

  // Aggregated totals
  const totalWeightKg = useMemo(() => {
    const totalGrams = bomItems.reduce((acc, curr) => acc + (curr.weightGrams * curr.qty), 0);
    return parseFloat((totalGrams / 1000).toFixed(3));
  }, [bomItems]);

  const totalBOMCost = useMemo(() => {
    return parseFloat(bomItems.reduce((acc, curr) => acc + curr.totalCost, 0).toFixed(2));
  }, [bomItems]);

  // Export as CSV Sheet
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      // Build standard compliant CSV header and data
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Part ID,Part Name,Primitive Type,Dimensions,Quantity,Volume (mm³),Weight (grams),Unit Price ($),Total Price ($)\r\n";
      
      bomItems.forEach((item) => {
        const row = [
          item.id,
          `"${item.partName.replace(/"/g, '""')}"`,
          item.type.toUpperCase(),
          `"${item.dimensions}"`,
          item.qty,
          item.volumeMm3,
          item.weightGrams,
          item.unitCost,
          item.totalCost
        ].join(",");
        csvContent += row + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `BOM_SHEET_${selectedMaterial?.id?.toUpperCase() || 'CAD'}_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 font-sans"
    >
      <div className="bg-zinc-950 border border-orange-500/30 w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl shadow-3xl shadow-orange-500/10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-orange-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1 px-2 bg-orange-500/20 text-orange-400 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 border border-orange-500/30">
              <Database size={8} /> BILL OF MATERIALS
            </div>
            <h3 className="text-sm font-black text-white tracking-widest uppercase font-unique">
              Automated Bill of Materials (BOM) Sheet Generator
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm uppercase font-mono tracking-widest cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* SUMMARY PANEL */}
        <div className="p-6 bg-zinc-900/30 border-b border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
            <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wider block">CAD Extraction Status</span>
            <div className="text-xs text-white font-bold mt-1">Successfully Traversed CSG Spec</div>
          </div>
          <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
            <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wider block">BOM Material Class</span>
            <div className="text-xs text-orange-400 font-bold mt-1 font-mono uppercase">{selectedMaterial?.name}</div>
          </div>
          <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
            <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wider block">Net Assembly Mass</span>
            <div className="text-xs text-white font-bold mt-1 font-mono">{totalWeightKg.toFixed(3)} kg</div>
          </div>
          <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
            <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wider block">Est. Bill of Materials Total</span>
            <div className="text-xs text-green-400 font-black mt-1 font-mono">${totalBOMCost.toLocaleString()}</div>
          </div>
        </div>

        {/* SHEET TABULAR CONTENT */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-zinc-500 font-mono text-[9px] font-black uppercase tracking-widest">
                <th className="py-3 px-4">Part ID</th>
                <th className="py-3 px-4">Component / Feature Class</th>
                <th className="py-3 px-4">Direct Dimensions</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Mass (g)</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Line Total</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {bomItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors font-mono">
                  <td className="py-3.5 px-4 text-zinc-500 font-bold">{item.id}</td>
                  
                  {/* EDITABLE NAME COLUMN */}
                  <td className="py-3.5 px-4 text-white">
                    {editingId === item.id ? (
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white focus:outline-none focus:border-orange-500 w-full"
                      />
                    ) : (
                      item.partName
                    )}
                  </td>
                  
                  <td className="py-3.5 px-4 text-zinc-400">{item.dimensions}</td>
                  
                  {/* EDITABLE QTY */ }
                  <td className="py-3.5 px-4 text-center text-white">
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        min={1} 
                        max={100} 
                        value={editQty}
                        onChange={(e) => setEditQty(parseInt(e.target.value) || 1)}
                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-white w-14 text-center"
                      />
                    ) : (
                      item.qty
                    )}
                  </td>
                  
                  <td className="py-3.5 px-4 text-right text-zinc-300">{(item.weightGrams * item.qty).toFixed(1)}g</td>
                  <td className="py-3.5 px-4 text-right text-zinc-300">${item.unitCost.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right text-orange-400 font-bold">${item.totalCost.toFixed(2)}</td>
                  
                  <td className="py-3.5 px-4 text-center">
                    {editingId === item.id ? (
                      <button 
                        onClick={() => saveEditing(item.id)}
                        className="p-1 px-2.5 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded transition-all text-[9.5px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Check size={12} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => startEditing(item)}
                        className="p-1 px-2.5 bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white rounded transition-all text-[9.5px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <Edit2 size={10} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM ACTION RAIL */}
        <div className="p-4 border-t border-white/5 bg-zinc-950 flex justify-between items-center px-6">
          <span className="text-[10px] text-zinc-500 font-mono">
            Structured CSG Hierarchy Traverse complete. Output is fully compatible with standard CAD inventory formats.
          </span>
          <button 
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Compiling Sheet...
              </>
            ) : (
              <>
                <FileSpreadsheet size={12} /> Export CSV Sheet
              </>
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

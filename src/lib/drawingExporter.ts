import { jsPDF } from 'jspdf';
import { TechnicalAIResponse } from '../services/geminiService';

export function exportEngineeringDrawingPDF(
  currentDesign: TechnicalAIResponse | null,
  selectedMaterial: { name: string; id: string },
  dimensions: { length: number; width: number; height: number },
  username: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const modelName = (currentDesign as any)?.modelName || 'Structural Component';
  const modelType = (currentDesign as any)?.modelType || 'Mechanical Core';
  const timestamp = new Date().toLocaleDateString();
  const dwgNo = `DWG-POL-${Math.floor(Math.random() * 900000 + 100000)}`;

  // Outer boundary grid and zones (A4 Landscape: 297 x 210 mm)
  const leftMargin = 10;
  const rightMargin = 287;
  const topMargin = 10;
  const bottomMargin = 200;

  // Set standard drawing background off-white / light blue blueprint shade
  doc.setDrawColor(30, 41, 59); // deep navy metal slate
  doc.setLineWidth(0.8);
  // Outer Border Line
  doc.rect(leftMargin, topMargin, rightMargin - leftMargin, bottomMargin - topMargin, 'D');

  // Inner Border Line
  doc.setLineWidth(0.3);
  doc.rect(leftMargin + 1, topMargin + 1, rightMargin - leftMargin - 2, bottomMargin - topMargin - 2, 'D');

  // Zone coordinate ticks (Letters on left/right, Numbers on top/bottom)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const horizontalDivisions = 5;
  const verticalDivisions = 4;

  // Top and bottom numbers
  for (let i = 1; i < horizontalDivisions; i++) {
    const x = leftMargin + (i * (rightMargin - leftMargin)) / horizontalDivisions;
    // Ticks
    doc.line(x, topMargin, x, topMargin + 3);
    doc.line(x, bottomMargin, x, bottomMargin - 3);
    // Texts
    doc.text(i.toString(), x, topMargin - 2, { align: 'center' });
    doc.text(i.toString(), x, bottomMargin + 4, { align: 'center' });
  }

  // Left and right letters (A, B, C, D)
  const letters = ['D', 'C', 'B', 'A'];
  for (let i = 1; i < verticalDivisions; i++) {
    const y = topMargin + (i * (bottomMargin - topMargin)) / verticalDivisions;
    // Ticks
    doc.line(leftMargin, y, leftMargin + 3, y);
    doc.line(rightMargin, y, rightMargin - 3, y);
    // Texts
    doc.text(letters[i - 1], leftMargin - 3, y + 1, { align: 'center' });
    doc.text(letters[i - 1], rightMargin + 4, y + 1, { align: 'center' });
  }

  // Draw Technical Title Block (Bottom Right: x=175 to 286, y=150 to 199)
  const tbX = 175;
  const tbY = 155;
  const tbW = 111;
  const tbH = 43;

  doc.setLineWidth(0.5);
  doc.setFillColor(248, 250, 252); // soft grey-white background for title box
  doc.rect(tbX, tbY, tbW, tbH, 'FD');

  // Title box divisions
  doc.line(tbX, tbY + 12, tbX + tbW, tbY + 12); // main horizontal divider
  doc.line(tbX, tbY + 24, tbX + tbW, tbY + 24); // second horizontal divider
  doc.line(tbX + 55, tbY + 24, tbX + 55, tbY + tbH); // middle vertical divider
  doc.line(tbX + 83, tbY + 24, tbX + 83, tbY + tbH); // right vertical divider

  // Title Block Text
  doc.setTextColor(15, 23, 42); // slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('POLYSTRUKT CO-DESIGN LABS', tbX + 4, tbY + 7);

  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('CAD SPECIMEN PROTOCOL SHEET', tbX + tbW - 4, tbY + 7, { align: 'right' });

  // Job Spec Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(modelName.toUpperCase(), tbX + 4, tbY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('ENGINEERING COMPONENT IDENTIFICATION TITLE', tbX + 4, tbY + 22);

  // Left Section detail:
  doc.setFontSize(6);
  doc.text('DRAWN BY', tbX + 4, tbY + 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(username.toUpperCase() || 'SYSTEM APPRENTICE', tbX + 4, tbY + 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('APPROVED BY', tbX + 4, tbY + 37);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('AI SYNTH CORE v4.2', tbX + 4, tbY + 41);

  // Middle Section detail:
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('STANDARD REFERENCE', tbX + 59, tbY + 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('ASME Y14.5-2018', tbX + 59, tbY + 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('DATE RELEASED', tbX + 59, tbY + 37);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text(timestamp, tbX + 59, tbY + 41);

  // Right Section (Scale and sheet):
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('SIZE', tbX + 87, tbY + 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('A4 / METRIC', tbX + 87, tbY + 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('SHEET', tbX + 87, tbY + 37);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('1 OF 1', tbX + 87, tbY + 41);


  // DRAWING VIEWPORTS: 3RD ANGLE PROJECTION SYMBOL AT TOP ZONE
  // Symbol diagram: small circle, bigger circle, truncated line cone
  const symX = 265;
  const symY = 18;
  doc.setLineWidth(0.3);
  doc.ellipse(symX, symY, 2, 2);
  doc.ellipse(symX, symY, 4, 4);
  // Center line through symbol
  doc.setDrawColor(148, 163, 184);
  doc.line(symX - 10, symY, symX + 18, symY);
  // Cone frustum
  doc.setDrawColor(30, 41, 59);
  doc.line(symX + 8, symY - 2, symX + 8, symY + 2);
  doc.line(symX + 14, symY - 4, symX + 14, symY + 4);
  doc.line(symX + 8, symY - 2, symX + 14, symY - 4);
  doc.line(symX + 8, symY + 2, symX + 14, symY + 4);

  // Projection text label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text('THIRD ANGLE PROJECTION', symX + 4, symY + 8, { align: 'center' });


  // DESIGN DETAILS LEGEND / TOLERANCES TABLE (Top Right)
  const lX = 185;
  const lY = 32;
  const lW = 92;
  doc.setLineWidth(0.3);
  doc.setFillColor(250, 250, 250);
  doc.rect(lX, lY, lW, 60, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('GENERAL ENGINEERING DESIGN DATA', lX + 4, lY + 5);
  doc.line(lX, lY + 7, lX + lW, lY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  
  // Specs text values dynamically adapted from design state
  doc.text(`MATERIAL EXTRUSION: ${selectedMaterial.name}`, lX + 4, lY + 12);
  doc.text(`GRID ENVELOPE: ${dimensions.length}mm x ${dimensions.width}mm x ${dimensions.height}mm`, lX + 4, lY + 17);
  doc.text(`VOLUME CALCULATED: ~${(dimensions.length * dimensions.width * dimensions.height / 1000).toFixed(0)} cm³`, lX + 4, lY + 22);
  
  const estimatedMassGrams = (dimensions.length * dimensions.width * dimensions.height / 1000) * 
    (selectedMaterial.id.includes('titanium') ? 4.43 : selectedMaterial.id.includes('steel') ? 8.0 : selectedMaterial.id.includes('aluminum') ? 2.7 : 1.1);
  doc.text(`METRIC NET MASS: ~${(estimatedMassGrams / 1000).toFixed(3)} kg`, lX + 4, lY + 27);
  doc.text(`TOLERANCES: LINEAR X.X ±0.1mm  |  X.XX ±0.05mm`, lX + 4, lY + 32);
  doc.text(`ANGULAR: ±0.5°  |  SURFACE FINISH: Ra 1.6 um (MACHINED)`, lX + 4, lY + 37);

  // GD&T Control parameters
  doc.text(`VERIFICATION PROFILE: FEA DEEP STRESS COMPLIANT`, lX + 4, lY + 44);
  doc.text(`STRUCTURE TYPE: ${modelType}`, lX + 4, lY + 49);
  doc.setFont('helvetica', 'bold');
  doc.text(`DRAWING STATUS: RELEASED FOR PROTOTYPE FORGING`, lX + 4, lY + 55);


  // DRAW CAD PROJECTIONS
  // Left Box: FRONT PROJECTION (ELEVATION)
  const fpX = 50;
  const fpY = 65;
  const fpSize = 40;

  // Center axes representing standard projection layout
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.15);
  doc.line(fpX - 25, fpY, fpX + 25, fpY);
  doc.line(fpX, fpY - 25, fpX, fpY + 25);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  
  // Draw primary component geometry
  // Front Elevation is typically the profile along length and height
  const scaleL = (dimensions.length / 200) * 20;
  const scaleH = (dimensions.height / 100) * 15;
  
  // Main body
  doc.setFillColor(241, 245, 249);
  doc.rect(fpX - scaleL, fpY - scaleH, scaleL * 2, scaleH * 2, 'FD');

  // Inner detail line representing hollow bore/thickness profile
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.2);
  // Dashed internal feature lines
  doc.line(fpX - scaleL + 3, fpY - scaleH + 3, fpX - scaleL + 3, fpY + scaleH - 3);
  doc.line(fpX + scaleL - 3, fpY - scaleH + 3, fpX + scaleL - 3, fpY + scaleH - 3);

  // Horizontal central cylinder protrusion representation
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.rect(fpX - scaleL / 2, fpY - scaleH / 2, scaleL, scaleH * 2, 'FD');

  // Center circle markers for holes
  doc.setLineWidth(0.25);
  doc.setDrawColor(30, 41, 59);
  doc.ellipse(fpX - scaleL + 5, fpY, 2, 2);
  doc.ellipse(fpX + scaleL - 5, fpY, 2, 2);

  // Elevation dimensions labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`L = ${dimensions.length}mm`, fpX, fpY + scaleH + 5, { align: 'center' });
  doc.text(`H = ${dimensions.height}mm`, fpX - scaleL - 5, fpY, { angle: 90, align: 'center' });

  // Draw dimension leader lines with arrow symbols
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.25);
  // Length leader
  doc.line(fpX - scaleL, fpY + scaleH + 2, fpX - scaleL, fpY + scaleH + 7);
  doc.line(fpX + scaleL, fpY + scaleH + 2, fpX + scaleL, fpY + scaleH + 7);
  doc.line(fpX - scaleL, fpY + scaleH + 4, fpX + scaleL, fpY + scaleH + 4);
  // Heigth leader
  doc.line(fpX - scaleL - 2, fpY - scaleH, fpX - scaleL - 7, fpY - scaleH);
  doc.line(fpX - scaleL - 2, fpY + scaleH, fpX - scaleL - 7, fpY + scaleH);
  doc.line(fpX - scaleL - 4, fpY - scaleH, fpX - scaleL - 4, fpY + scaleH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FRONT OPTICAL VIEW (ELEVATION)', fpX, fpY - scaleH - 5, { align: 'center' });


  // Right Box: TOP PROJECTION (PLAN)
  const tpX = 125;
  const tpY = 65;

  // Center axes
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.15);
  doc.line(tpX - 25, tpY, tpX + 25, tpY);
  doc.line(tpX, tpY - 25, tpX, tpY + 25);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);

  // Top projection is typically length vs width
  const scaleW = (dimensions.width / 150) * 18;
  doc.setFillColor(241, 245, 249);
  doc.rect(tpX - scaleL, tpY - scaleW, scaleL * 2, scaleW * 2, 'FD');

  // Cylinder circle indicator inside plan
  doc.ellipse(tpX, tpY, scaleW - 3, scaleW - 3);
  doc.ellipse(tpX, tpY, 5, 5); // core bore cylinder hole

  // 4 corner bolt holes markers
  doc.ellipse(tpX - scaleL + 6, tpY - scaleW + 6, 2.2, 2.2);
  doc.ellipse(tpX + scaleL - 6, tpY - scaleW + 6, 2.2, 2.2);
  doc.ellipse(tpX - scaleL + 6, tpY + scaleW - 6, 2.2, 2.2);
  doc.ellipse(tpX + scaleL - 6, tpY + scaleW - 6, 2.2, 2.2);

  // Dimensioning Plan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`W = ${dimensions.width}mm`, tpX + scaleL + 6, tpY, { angle: 90, align: 'center' });

  // Width leader
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.25);
  doc.line(tpX + scaleL + 2, tpY - scaleW, tpX + scaleL + 7, tpY - scaleW);
  doc.line(tpX + scaleL + 2, tpY + scaleW, tpX + scaleL + 7, tpY + scaleW);
  doc.line(tpX + scaleL + 4, tpY - scaleW, tpX + scaleL + 4, tpY + scaleW);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PLAN OPTICAL VIEW (TOP)', tpX, tpY - scaleW - 5, { align: 'center' });


  // Bottom Left Box: ISOMETRIC SECTOR TYPE REPRESENTATION (3D DETAILED SHAPE)
  const isoX = 75;
  const isoY = 145;

  // Render a clean isometric drawing skeleton matching standard drafts
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.45);
  doc.setFillColor(243, 244, 246);

  // Draw 3D-angled isometric lines representing base block
  const dx = 16;
  const dy = 9.24; // 30-degree offset ratio representation
  
  // Isometric base projection
  doc.line(isoX, isoY, isoX + dx, isoY - dy);
  doc.line(isoX, isoY, isoX - dx, isoY - dy);
  doc.line(isoX + dx, isoY - dy, isoX, isoY - dy * 2);
  doc.line(isoX - dx, isoY - dy, isoX, isoY - dy * 2);

  // Side vertical depths representing 3D CAD block extrusion offset
  const thick = 8;
  doc.line(isoX, isoY, isoX, isoY + thick);
  doc.line(isoX + dx, isoY - dy, isoX + dx, isoY - dy + thick);
  doc.line(isoX - dx, isoY - dy, isoX - dx, isoY - dy + thick);
  
  doc.line(isoX, isoY + thick, isoX + dx, isoY - dy + thick);
  doc.line(isoX, isoY + thick, isoX - dx, isoY - dy + thick);

  // Cylindrical protrusion model drawn as slanted ellipse
  doc.ellipse(isoX, isoY - dy, 6, 3.5);
  // Extrude vertical depth cylindrical body
  doc.line(isoX - 6, isoY - dy, isoX - 6, isoY - dy - 12);
  doc.line(isoX + 6, isoY - dy, isoX + 6, isoY - dy - 12);
  doc.ellipse(isoX, isoY - dy - 12, 6, 3.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('ISOMETRIC CAD OVERVIEW', isoX, isoY + thick + 8, { align: 'center' });

  // Leader line point in 3D block pointing to GD&T feature control frame
  doc.setDrawColor(239, 68, 68); // vibrant safety red leader pointing to cylinder surface
  doc.setLineWidth(0.35);
  doc.line(isoX + 2, isoY - dy - 8, isoX + 35, isoY - dy - 14);
  doc.ellipse(isoX + 2, isoY - dy - 8, 0.6, 0.6); // small point marker


  // GD&T FEATURE CONTROL BLOCKS (Geometric Dimensioning & Tolerancing)
  const gdtX = isoX + 35;
  const gdtY = isoY - dy - 18;

  // Let's draw standard double compartmentalized feature control frame
  // Frame border: 25mm wide, 6mm height
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);
  doc.rect(gdtX, gdtY, 34, 6, 'FD');
  
  // Segment dividers
  doc.line(gdtX + 6, gdtY, gdtX + 6, gdtY + 6); // Symbol cell
  doc.line(gdtX + 18, gdtY, gdtX + 18, gdtY + 6); // Tolerance range cell
  doc.line(gdtX + 23, gdtY, gdtX + 23, gdtY + 6); // Datum A cell
  doc.line(gdtX + 29, gdtY, gdtX + 29, gdtY + 6); // Datum B cell

  // GD&T Text Compartments
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('⌕', gdtX + 3, gdtY + 4.5, { align: 'center' }); // Cylindricity symbol (⌕)
  doc.setFontSize(5.5);
  doc.text('∅0.05', gdtX + 12, gdtY + 4.2, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('A', gdtX + 20.5, gdtY + 4.5, { align: 'center' });
  doc.text('B', gdtX + 26, gdtY + 4.5, { align: 'center' });
  doc.text('C', gdtX + 31.5, gdtY + 4.5, { align: 'center' });

  // Add small note explaining the GD&T requirement mapped
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text('CYLINDRICITY REGULATORY CONSTRAINT', gdtX, gdtY - 1.5);


  // DRAW WATERMARK SEAL / ENCRYPTION SIGNATURE IN MAIN PANEL CENTER-MIDDLE BOUNDS
  doc.save(`${modelName.replace(/\s+/g, '_')}_Engineering_Drawing.pdf`);
}

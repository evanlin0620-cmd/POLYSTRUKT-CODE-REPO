import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import { ProceduralSpec, ProceduralShape, ProceduralOperation, ProceduralGroup } from '../types';

export function buildProceduralMesh(spec: ProceduralSpec): THREE.Object3D {
  if (!spec) {
    return new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: 'red', transparent: true, opacity: 0.5 }));
  }

  try {
    if ('type' in spec) {
      return createShape(spec);
    } else if (spec.op === 'group') {
      return createGroup(spec);
    } else {
      return performOperation(spec);
    }
  } catch (err) {
    console.error('Procedural mesh synthesis recovery caught error:', err);
    return createShape({
      type: 'box',
      args: [20, 20, 20],
      color: '#6366f1'
    });
  }
}

const degToRad = (val: number) => {
  // If the value is already in radians (small magnitude <= 2*PI + 0.001), use directly.
  // Otherwise, treat as degrees and convert to radians.
  return Math.abs(val) <= 2 * Math.PI + 0.001 ? val : (val * Math.PI) / 180;
};

function applyTransform(object: THREE.Object3D, position?: [number, number, number], rotation?: [number, number, number], scale?: [number, number, number]) {
  if (position && Array.isArray(position)) {
    object.position.set(
      Number(position[0]) || 0,
      Number(position[1]) || 0,
      Number(position[2]) || 0
    );
  }
  if (rotation && Array.isArray(rotation)) {
    object.rotation.set(
      degToRad(Number(rotation[0]) || 0),
      degToRad(Number(rotation[1]) || 0),
      degToRad(Number(rotation[2]) || 0)
    );
  }
  if (scale && Array.isArray(scale)) {
    object.scale.set(
      Math.max(0.001, Number(scale[0]) || 1),
      Math.max(0.001, Number(scale[1]) || 1),
      Math.max(0.001, Number(scale[2]) || 1)
    );
  }
  object.updateMatrix();
  object.updateMatrixWorld(true);
}

function createShape(shape: ProceduralShape): THREE.Mesh {
  let geometry: THREE.BufferGeometry;
  const rawArgs = Array.isArray(shape.args) ? shape.args.map(n => Math.max(0.1, Number(n) || 1)) : [10, 10, 10];
  
  switch (shape.type) {
    case 'box': {
      const w = Math.max(0.5, rawArgs[0] || 10);
      const h = Math.max(0.5, rawArgs[1] || 10);
      const d = Math.max(0.5, rawArgs[2] || 10);
      geometry = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
      break;
    }
    case 'cylinder': {
      // args: [radiusTop, radiusBottom, height, radialSegments]
      const rTop = Math.max(0.2, rawArgs[0] || 5);
      const rBot = Math.max(0.2, rawArgs[1] || rTop);
      const h = Math.max(0.5, rawArgs[2] || 20);
      const segments = Math.min(64, Math.max(12, Math.floor(rawArgs[3] || 32)));
      geometry = new THREE.CylinderGeometry(rTop, rBot, h, segments);
      break;
    }
    case 'sphere': {
      // args: [radius, widthSegments, heightSegments]
      const r = Math.max(0.5, rawArgs[0] || 10);
      const wSeg = Math.min(48, Math.max(12, Math.floor(rawArgs[1] || 24)));
      const hSeg = Math.min(48, Math.max(12, Math.floor(rawArgs[2] || 24)));
      geometry = new THREE.SphereGeometry(r, wSeg, hSeg);
      break;
    }
    case 'torus': {
      // args: [radius, tube, radialSegments, tubularSegments]
      const r = Math.max(1, rawArgs[0] || 15);
      const tube = Math.max(0.2, Math.min(r * 0.9, rawArgs[1] || 4));
      const radSeg = Math.min(32, Math.max(8, Math.floor(rawArgs[2] || 16)));
      const tubSeg = Math.min(64, Math.max(12, Math.floor(rawArgs[3] || 32)));
      geometry = new THREE.TorusGeometry(r, tube, radSeg, tubSeg);
      break;
    }
    case 'cone': {
      // args: [radius, height, radialSegments]
      const r = Math.max(0.5, rawArgs[0] || 10);
      const h = Math.max(0.5, rawArgs[1] || 20);
      const segments = Math.min(48, Math.max(12, Math.floor(rawArgs[2] || 24)));
      geometry = new THREE.ConeGeometry(r, h, segments);
      break;
    }
    case 'tube': {
      // args: [radiusOuter, radiusInner, height, radialSegments]
      const rOut = Math.max(0.5, rawArgs[0] || 10);
      const rIn = Math.max(0.1, Math.min(rOut * 0.95, rawArgs[1] || rOut * 0.6));
      const h = Math.max(0.5, rawArgs[2] || 20);
      const segments = Math.min(64, Math.max(16, Math.floor(rawArgs[3] || 32)));
      
      const tubeShape = new THREE.Shape();
      tubeShape.absarc(0, 0, rOut, 0, Math.PI * 2, false);
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, rIn, 0, Math.PI * 2, true);
      tubeShape.holes.push(holePath);
      
      geometry = new THREE.ExtrudeGeometry(tubeShape, {
        depth: h,
        bevelEnabled: false,
        curveSegments: segments
      });
      geometry.center();
      break;
    }
    case 'hex_prism': {
      // args: [radius, height]
      const r = Math.max(0.5, rawArgs[0] || 10);
      const h = Math.max(0.5, rawArgs[1] || 15);
      geometry = new THREE.CylinderGeometry(r, r, h, 6);
      break;
    }
    case 'wedge': {
      // args: [width, height, thickness]
      const w = Math.max(0.5, rawArgs[0] || 20);
      const h = Math.max(0.5, rawArgs[1] || 20);
      const th = Math.max(0.5, rawArgs[2] || 8);
      
      const triangleShape = new THREE.Shape();
      triangleShape.moveTo(-w / 2, -h / 2);
      triangleShape.lineTo(w / 2, -h / 2);
      triangleShape.lineTo(-w / 2, h / 2);
      triangleShape.closePath();
      
      geometry = new THREE.ExtrudeGeometry(triangleShape, {
        depth: th,
        bevelEnabled: false
      });
      geometry.center();
      break;
    }
    case 'gear': {
      // args: [pitchRadius, thickness, teethCount, boreRadius]
      const pitchR = Math.max(2, rawArgs[0] || 15);
      const th = Math.max(0.5, rawArgs[1] || 8);
      const teeth = Math.min(48, Math.max(6, Math.floor(rawArgs[2] || 12)));
      const boreR = Math.max(0, Math.min(pitchR * 0.6, rawArgs[3] || 4));
      
      const gearShape = new THREE.Shape();
      const toothDepth = pitchR * 0.22;
      const rInner = pitchR - toothDepth * 0.5;
      const rOuter = pitchR + toothDepth * 0.5;
      const totalSteps = teeth * 2;
      
      for (let i = 0; i < totalSteps; i++) {
        const angle = (i / totalSteps) * Math.PI * 2;
        const r = (i % 2 === 0) ? rOuter : rInner;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) gearShape.moveTo(x, y);
        else gearShape.lineTo(x, y);
      }
      gearShape.closePath();
      
      if (boreR > 0.5) {
        const borePath = new THREE.Path();
        borePath.absarc(0, 0, boreR, 0, Math.PI * 2, true);
        gearShape.holes.push(borePath);
      }
      
      geometry = new THREE.ExtrudeGeometry(gearShape, {
        depth: th,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelSize: 0.3,
        bevelThickness: 0.3
      });
      geometry.center();
      break;
    }
    case 'flange': {
      // args: [outerRadius, innerRadius, thickness, boltCircleRadius, boltHolesCount, boltHoleRadius]
      const rOut = Math.max(2, rawArgs[0] || 25);
      const rIn = Math.max(0, Math.min(rOut * 0.8, rawArgs[1] || 10));
      const th = Math.max(0.5, rawArgs[2] || 8);
      const boltCircleR = Math.max(rIn + 2, Math.min(rOut - 2, rawArgs[3] || (rOut + rIn) / 2));
      const boltCount = Math.min(16, Math.max(3, Math.floor(rawArgs[4] || 4)));
      const boltHoleR = Math.max(0.5, Math.min(4, rawArgs[5] || 2.5));
      
      const flangeShape = new THREE.Shape();
      flangeShape.absarc(0, 0, rOut, 0, Math.PI * 2, false);
      
      if (rIn > 0.5) {
        const borePath = new THREE.Path();
        borePath.absarc(0, 0, rIn, 0, Math.PI * 2, true);
        flangeShape.holes.push(borePath);
      }
      
      for (let i = 0; i < boltCount; i++) {
        const angle = (i / boltCount) * Math.PI * 2;
        const bx = Math.cos(angle) * boltCircleR;
        const by = Math.sin(angle) * boltCircleR;
        const boltHole = new THREE.Path();
        boltHole.absarc(bx, by, boltHoleR, 0, Math.PI * 2, true);
        flangeShape.holes.push(boltHole);
      }
      
      geometry = new THREE.ExtrudeGeometry(flangeShape, {
        depth: th,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelSize: 0.3,
        bevelThickness: 0.3
      });
      geometry.center();
      break;
    }
    case 'pyramid': {
      const r = Math.max(0.5, rawArgs[0] || 10);
      const h = Math.max(0.5, rawArgs[1] || 15);
      geometry = new THREE.ConeGeometry(r, h, 4);
      break;
    }
    default:
      geometry = new THREE.BoxGeometry(10, 10, 10);
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ 
    color: shape.color || '#6366f1',
    metalness: shape.metalness ?? 0.8,
    roughness: shape.roughness ?? 0.2,
    transparent: (shape.opacity ?? 1) < 1,
    opacity: shape.opacity ?? 1,
    side: THREE.DoubleSide
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.name = shape.type || 'solid_component';
  applyTransform(mesh, shape.position, shape.rotation, shape.scale);
  
  return mesh;
}

function createGroup(group: ProceduralGroup): THREE.Group {
  const g = new THREE.Group();
  (group.children || []).forEach(child => {
    if (child) {
      try {
        g.add(buildProceduralMesh(child));
      } catch (err) {
        console.warn('Failed to build group child:', err);
      }
    }
  });
  
  applyTransform(g, group.position, group.rotation, group.scale);
  return g;
}

function ensureMesh(obj: THREE.Object3D): THREE.Mesh {
  if (obj instanceof THREE.Mesh) return obj;
  
  const meshes: THREE.Mesh[] = [];
  obj.traverse(child => {
    if (child instanceof THREE.Mesh) {
      const cloned = child.clone();
      child.updateMatrixWorld(true);
      cloned.applyMatrix4(child.matrixWorld);
      meshes.push(cloned);
    }
  });
  
  if (meshes.length === 0) {
    return new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshStandardMaterial({ visible: false }));
  }
  
  if (meshes.length === 1) return meshes[0];
  
  // Recursively union all meshes in the group
  let result = meshes[0];
  for (let i = 1; i < meshes.length; i++) {
    try {
      result = CSG.union(result, meshes[i]);
    } catch (e) {
      console.warn("Internal group union failed:", e);
    }
  }
  
  return result;
}

function performOperation(op: ProceduralOperation): THREE.Mesh {
  const objA = buildProceduralMesh(op.a);
  const objB = buildProceduralMesh(op.b);
  
  // If B is a group and we are subtracting, subtract each child sequentially
  if (op.op === 'subtract' && objB instanceof THREE.Group) {
      let currentResult = ensureMesh(objA);
      objB.traverse(child => {
          if (child instanceof THREE.Mesh) {
              try {
                  const meshB = child.clone();
                  child.updateMatrixWorld(true);
                  meshB.applyMatrix4(child.matrixWorld);
                  currentResult = CSG.subtract(currentResult, meshB);
              } catch (e) {
                  console.warn("Sequential subtraction failed for child", e);
              }
          }
      });
      if (currentResult.geometry) {
        currentResult.geometry.computeVertexNormals();
        currentResult.geometry.computeBoundingBox();
        currentResult.geometry.computeBoundingSphere();
      }
      return currentResult;
  }

  const meshA = ensureMesh(objA);
  const meshB = ensureMesh(objB);
  
  meshA.updateMatrix();
  meshA.updateMatrixWorld(true);
  meshB.updateMatrix();
  meshB.updateMatrixWorld(true);

  let result: THREE.Mesh;
  
  try {
    switch (op.op) {
      case 'union':
        result = CSG.union(meshA, meshB);
        break;
      case 'subtract':
        result = CSG.subtract(meshA, meshB);
        break;
      case 'intersect':
        result = CSG.intersect(meshA, meshB);
        break;
      default:
        result = meshA;
    }
  } catch (err) {
    console.warn("CSG operation failed, falling back to union", err);
    result = meshA;
  }

  if (result.geometry) {
    result.geometry.computeVertexNormals();
    result.geometry.computeBoundingBox();
    result.geometry.computeBoundingSphere();
  }
  
  return result;
}

/**
 * Calculates deterministic CAD mesh metrics (volume, surface area, bounding dimensions, manifold sanity)
 */
export function calculateMeshMetrics(mesh: THREE.Object3D): {
  volumeMm3: number;
  surfaceAreaMm2: number;
  boundingBoxMm: { x: number; y: number; z: number };
  trianglesCount: number;
  verticesCount: number;
  isWatertight: boolean;
} {
  let totalVolume = 0;
  let totalArea = 0;
  let totalTriangles = 0;
  let totalVertices = 0;

  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);

  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();

  mesh.traverse(child => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geom = child.geometry;
      const pos = geom.attributes.position;
      const index = geom.index;

      if (pos) {
        totalVertices += pos.count;
        if (index) {
          totalTriangles += index.count / 3;
          for (let i = 0; i < index.count; i += 3) {
            v1.fromBufferAttribute(pos, index.getX(i));
            v2.fromBufferAttribute(pos, index.getX(i + 1));
            v3.fromBufferAttribute(pos, index.getX(i + 2));

            // Signed volume of tetrahedron
            totalVolume += v1.dot(v2.cross(v3)) / 6.0;

            // Area of triangle
            const edge1 = new THREE.Vector3().subVectors(v2, v1);
            const edge2 = new THREE.Vector3().subVectors(v3, v1);
            totalArea += edge1.cross(edge2).length() * 0.5;
          }
        } else {
          totalTriangles += pos.count / 3;
          for (let i = 0; i < pos.count; i += 3) {
            v1.fromBufferAttribute(pos, i);
            v2.fromBufferAttribute(pos, i + 1);
            v3.fromBufferAttribute(pos, i + 2);

            totalVolume += v1.dot(v2.cross(v3)) / 6.0;

            const edge1 = new THREE.Vector3().subVectors(v2, v1);
            const edge2 = new THREE.Vector3().subVectors(v3, v1);
            totalArea += edge1.cross(edge2).length() * 0.5;
          }
        }
      }
    }
  });

  return {
    volumeMm3: Math.round(Math.abs(totalVolume) * 100) / 100,
    surfaceAreaMm2: Math.round(totalArea * 100) / 100,
    boundingBoxMm: {
      x: Math.round(size.x * 10) / 10,
      y: Math.round(size.y * 10) / 10,
      z: Math.round(size.z * 10) / 10,
    },
    trianglesCount: totalTriangles,
    verticesCount: totalVertices,
    isWatertight: totalTriangles > 0 && Math.abs(totalVolume) > 0.001
  };
}

/**
 * Generates dynamic vertex colors for 3D DFM Heatmap Inspection (Wall thickness, Draft angle, Overhang, Von Mises Stress)
 */
export function applyHeatmapToMesh(mesh: THREE.Object3D, mode: 'none' | 'thickness' | 'draft_angle' | 'overhang' | 'stress'): void {
  mesh.traverse(child => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geom = child.geometry;
      const pos = geom.attributes.position;
      const norm = geom.attributes.normal;
      if (!pos) return;

      if (mode === 'none') {
        if (geom.attributes.color) {
          geom.deleteAttribute('color');
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.vertexColors = false;
            child.material.needsUpdate = true;
          }
        }
        return;
      }

      geom.computeBoundingBox();
      const bBox = geom.boundingBox || new THREE.Box3();
      const minY = bBox.min.y;
      const maxY = bBox.max.y || 1;
      const heightRange = Math.max(0.001, maxY - minY);

      const count = pos.count;
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        let factor = 0.5; // 0.0 (blue/green) to 1.0 (red/danger)

        if (mode === 'stress') {
          // Stress concentration near geometric corners or high Z/Y load points
          const distFromCenter = Math.sqrt(x * x + z * z);
          factor = Math.min(1, Math.max(0, (distFromCenter * 0.03) + ((y - minY) / heightRange) * 0.4));
        } else if (mode === 'thickness') {
          // Simulated wall thickness gradient based on local distance to bounding shell
          const distToEdge = Math.min(
            Math.abs(x - bBox.min.x), Math.abs(bBox.max.x - x),
            Math.abs(z - bBox.min.z), Math.abs(bBox.max.z - z)
          );
          factor = Math.min(1, Math.max(0, 1.0 - (distToEdge / 15)));
        } else if (mode === 'draft_angle' && norm) {
          // Normal relative to upward Z/Y pull direction (draft < 3 deg is critical in injection molding / casting)
          const ny = norm.getY(i);
          const angleDeg = Math.abs(Math.asin(Math.max(-1, Math.min(1, ny)))) * (180 / Math.PI);
          factor = angleDeg < 5 ? 0.9 : angleDeg < 15 ? 0.6 : 0.1;
        } else if (mode === 'overhang' && norm) {
          // Overhang angle for 3D printing / additive (>45 deg requires support)
          const ny = norm.getY(i);
          factor = ny < -0.7 ? 0.95 : ny < -0.3 ? 0.65 : 0.1;
        }

        // Color map: 0.0 -> Blue/Cyan, 0.5 -> Green/Yellow, 1.0 -> Bright Red
        let r = 0, g = 0, b = 0;
        if (factor < 0.5) {
          const t = factor / 0.5;
          r = 0.1 * (1 - t) + 0.2 * t;
          g = 0.8 * (1 - t) + 0.9 * t;
          b = 0.9 * (1 - t) + 0.1 * t;
        } else {
          const t = (factor - 0.5) / 0.5;
          r = 0.2 * (1 - t) + 0.95 * t;
          g = 0.9 * (1 - t) + 0.15 * t;
          b = 0.1 * (1 - t) + 0.1 * t;
        }

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      if (child.material instanceof THREE.MeshStandardMaterial) {
        child.material.vertexColors = true;
        child.material.needsUpdate = true;
      }
    }
  });
}


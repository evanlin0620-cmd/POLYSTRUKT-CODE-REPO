import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import { ProceduralSpec, ProceduralShape, ProceduralOperation, ProceduralGroup } from '../types';

export function buildProceduralMesh(spec: ProceduralSpec): THREE.Object3D {
  if (!spec) {
    return new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: 'red', transparent: true, opacity: 0.5 }));
  }

  if ('type' in spec) {
    return createShape(spec);
  } else if (spec.op === 'group') {
    return createGroup(spec);
  } else {
    return performOperation(spec);
  }
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;

function applyTransform(object: THREE.Object3D, position?: [number, number, number], rotation?: [number, number, number], scale?: [number, number, number]) {
  if (position) object.position.set(...position);
  if (rotation) object.rotation.set(degToRad(rotation[0]), degToRad(rotation[1]), degToRad(rotation[2]));
  if (scale) object.scale.set(...scale);
  object.updateMatrix();
  object.updateMatrixWorld(true);
}

function createShape(shape: ProceduralShape): THREE.Mesh {
  let geometry: THREE.BufferGeometry;
  
  switch (shape.type) {
    case 'box':
      geometry = new THREE.BoxGeometry(...(shape.args as [number, number, number]));
      break;
    case 'cylinder':
      // args: [radiusTop, radiusBottom, height, radialSegments]
      geometry = new THREE.CylinderGeometry(...(shape.args as [number, number, number, number]));
      break;
    case 'sphere':
      // args: [radius, widthSegments, heightSegments]
      geometry = new THREE.SphereGeometry(...(shape.args as [number, number, number]));
      break;
    case 'torus':
      // args: [radius, tube, radialSegments, tubularSegments]
      geometry = new THREE.TorusGeometry(...(shape.args as [number, number, number, number]));
      break;
    case 'cone':
      // args: [radius, height, radialSegments]
      geometry = new THREE.ConeGeometry(...(shape.args as [number, number, number]));
      break;
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const material = new THREE.MeshStandardMaterial({ 
    color: shape.color || '#6366f1',
    metalness: shape.metalness ?? 0.8,
    roughness: shape.roughness ?? 0.2,
    transparent: (shape.opacity ?? 1) < 1,
    opacity: shape.opacity ?? 1,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  applyTransform(mesh, shape.position, shape.rotation, shape.scale);
  
  return mesh;
}

function createGroup(group: ProceduralGroup): THREE.Group {
  const g = new THREE.Group();
  group.children.forEach(child => {
    if (child) g.add(buildProceduralMesh(child));
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
  
  // If B is a group and we are subtracting, it's better to subtract each child one by one
  // than to union all children first.
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
      return currentResult;
  }

  const meshA = ensureMesh(objA);
  const meshB = ensureMesh(objB);
  
  // Ensure matrices are up to date for CSG
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
  
  return result;
}

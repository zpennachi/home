const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '..', 'public', 'models', 'two_cedar_trees.glb');
if (!fs.existsSync(glbPath)) {
    console.error("GLB not found");
    process.exit(1);
}

const buffer = fs.readFileSync(glbPath);
const chunk0Length = buffer.readUInt32LE(12);
const jsonStr = buffer.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonStr);

const chunk1Offset = 20 + chunk0Length;
const chunk1Length = buffer.readUInt32LE(chunk1Offset);
const binBuffer = buffer.subarray(chunk1Offset + 8, chunk1Offset + 8 + chunk1Length);

// POSITION accessor
const primitive = gltf.meshes[0].primitives[0];
const positionAccessorIndex = primitive.attributes.POSITION;
const accessor = gltf.accessors[positionAccessorIndex];
const bufferView = gltf.bufferViews[accessor.bufferView];

// In GLB, bufferViews are relative to the binary chunk!
const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
const count = accessor.count;

const vertices = [];
let minY = Infinity;
let maxY = -Infinity;

for (let i = 0; i < count; i++) {
    const offset = byteOffset + i * 12;
    if (offset + 12 > binBuffer.length) break;
    const x = binBuffer.readFloatLE(offset);
    const y = binBuffer.readFloatLE(offset + 4);
    const z = binBuffer.readFloatLE(offset + 8);
    vertices.push({ x, y, z });
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
}

const height = maxY - minY;
const sliceCenterY = minY + height * 0.18; // -0.858

// Filter vertices that are extremely close to the cut height, e.g., within 0.005 units
// to avoid leaves or branches that start higher/lower.
// The trunk vertices at a specific height should form circles.
const pointsAtY = vertices.filter(v => Math.abs(v.y - sliceCenterY) < 0.005);
console.log(`Vertices close to target height: ${pointsAtY.length}`);

// Let's print out the min and max X and Z of these vertices to see the boundaries
let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
pointsAtY.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.z < minZ) minZ = p.z;
    if (p.z > maxZ) maxZ = p.z;
});
console.log(`X range: [${minX.toFixed(4)}, ${maxX.toFixed(4)}], Z range: [${minZ.toFixed(4)}, ${maxZ.toFixed(4)}]`);

// Group points by X coordinate to separate the two trees:
// Tree 1 (Main tree) is on the left (negative X or near 0)
// Tree 2 (Small tree) is on the right (positive X)
const tree1Points = pointsAtY.filter(p => p.x < 0.4);
const tree2Points = pointsAtY.filter(p => p.x >= 0.4);

console.log(`Tree 1 points: ${tree1Points.length}, Tree 2 points: ${tree2Points.length}`);

function getCentroidAndRadius(pts) {
    if (pts.length === 0) return null;
    let sumX = 0, sumZ = 0;
    pts.forEach(p => { sumX += p.x; sumZ += p.z; });
    const cx = sumX / pts.length;
    const cz = sumZ / pts.length;
    
    // Radius is the average distance from centroid
    let sumD = 0;
    pts.forEach(p => {
        sumD += Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.z - cz, 2));
    });
    const radius = sumD / pts.length;
    return { cx, cz, radius };
}

console.log("Tree 1 centroid:", getCentroidAndRadius(tree1Points));
console.log("Tree 2 centroid:", getCentroidAndRadius(tree2Points));

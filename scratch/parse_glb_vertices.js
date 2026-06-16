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

console.log("Primitive attributes:", gltf.meshes[0].primitives[0].attributes);
console.log("Accessor index:", gltf.meshes[0].primitives[0].attributes.POSITION);
console.log("Accessor object:", gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION]);
console.log("BufferViews length:", gltf.bufferViews.length);
console.log("BufferView of position accessor:", gltf.bufferViews[gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION].bufferView]);

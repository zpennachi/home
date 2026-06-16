const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '..', 'public', 'models', 'two_cedar_trees.glb');

if (!fs.existsSync(glbPath)) {
    console.error("GLB file not found at:", glbPath);
    process.exit(1);
}

const buffer = fs.readFileSync(glbPath);

// GLB Header is 12 bytes
// magic (4 bytes), version (4 bytes), totalLength (4 bytes)
const magic = buffer.toString('utf8', 0, 4);
const version = buffer.readUInt32LE(4);
const totalLength = buffer.readUInt32LE(8);

console.log(`GLB Magic: ${magic}, Version: ${version}, Length: ${totalLength}`);

// Chunk 0 is JSON
const chunkLength = buffer.readUInt32LE(12);
const chunkType = buffer.toString('utf8', 16, 20);

console.log(`Chunk 0 Length: ${chunkLength}, Type: ${chunkType}`);

if (chunkType === 'JSON') {
    const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
    const gltf = JSON.parse(jsonStr);
    
    console.log("Nodes list:");
    gltf.nodes.forEach((node, i) => {
        console.log(`Node ${i}: "${node.name}"`, node.translation ? `translation: ${JSON.stringify(node.translation)}` : '');
    });
    
    console.log("\nMeshes list:");
    gltf.meshes.forEach((mesh, i) => {
        console.log(`Mesh ${i}: "${mesh.name}"`);
    });
}

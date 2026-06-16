const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '..', 'public', 'models', 'two_cedar_trees.glb');

if (!fs.existsSync(glbPath)) {
    console.error("GLB not found");
    process.exit(1);
}

const buffer = fs.readFileSync(glbPath);
const chunkLength = buffer.readUInt32LE(12);
const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
const gltf = JSON.parse(jsonStr);

console.log("JSON GLTF analysis:");
if (gltf.materials) {
    console.log("\nMaterials:");
    gltf.materials.forEach((m, i) => {
        console.log(`Material ${i}: name="${m.name}"`);
    });
}

if (gltf.meshes) {
    console.log("\nMeshes:");
    gltf.meshes.forEach((m, i) => {
        console.log(`Mesh ${i}: name="${m.name}"`);
        if (m.primitives) {
            m.primitives.forEach((p, pi) => {
                console.log(`  Primitive ${pi}: materialIndex=${p.material}`);
            });
        }
    });
}

const fs = require('fs');
const path = require('path');

function inspectBBox(glbPath) {
    const data = fs.readFileSync(glbPath);
    const magic = data.readUInt32LE(0);
    if (magic !== 0x46546C67) {
        console.error('Not a GLB');
        return;
    }
    const chunkLength = data.readUInt32LE(12);
    const jsonBuffer = data.slice(20, 20 + chunkLength);
    const gltf = JSON.parse(jsonBuffer.toString('utf8'));
    
    console.log('Accessors POSITION min/max:');
    if (gltf.accessors) {
        gltf.accessors.forEach((accessor, idx) => {
            if (accessor.min && accessor.max && accessor.type === 'VEC3') {
                console.log(`Accessor ${idx}:`);
                console.log(`  Min: ${JSON.stringify(accessor.min)}`);
                console.log(`  Max: ${JSON.stringify(accessor.max)}`);
            }
        });
    }
}

inspectBBox(path.join(__dirname, '../public/models/two_cedar_trees.glb'));

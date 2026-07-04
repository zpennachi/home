const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateIcon(size, outputPath) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, size, size)

    // Text
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${Math.floor(size * 0.4)}px sans-serif`
    ctx.fillText('ZP', size / 2, size / 2)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outputPath, buffer)
    console.log(`Generated ${outputPath}`)
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
generateIcon(192, path.join(iconsDir, 'icon-192.png'))
generateIcon(512, path.join(iconsDir, 'icon-512.png'))

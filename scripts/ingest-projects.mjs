import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_PROJECTS_DIR = 'C:\\Users\\z\\OneDrive\\Desktop\\projects';
const TEMP_INGEST_DIR = path.join(__dirname, '..', 'temp_ingest');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'projects.json');
const PUBLIC_PROJECTS_DIR = path.join(__dirname, '..', 'public', 'projects');

// Map folder names to nicer titles/categories if needed
const OVERRIDES = {
    'MVPIQ': { title: 'MVP IQ', category: 'Product', medium: 'Web App' },
    'Volumetric-Design-System-ESR--main': { title: 'Volumetric Design System', category: 'Research', medium: 'VR / Unity' },
    'hawkeye': { title: 'Hawkeye', category: 'Engineering', medium: 'Computer Vision' },
    'particle-life-131': { title: 'Particle Life', category: 'Creative Coding', medium: 'WebGL' },
    'streamer': { title: 'Streamer Tools', category: 'Engineering', medium: 'Node.js' },
    'streamer-portfolio': { title: 'Streamer Portfolio', category: 'Design', medium: 'Web' },
    'weekend': { title: 'Weekend', category: 'Experiment', medium: 'Web' },
    'athoughtful.fun': { title: 'A Thoughtful Fun', category: 'Experiment', medium: 'Web' },
    'OHM-site': { title: 'OHM', category: 'Brand', medium: 'Web' }
};

async function ingest() {
    console.log('Starting ingestion...');
    const projects = [];

    // 1. Local Projects
    if (fs.existsSync(LOCAL_PROJECTS_DIR)) {
        const localFolders = fs.readdirSync(LOCAL_PROJECTS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of localFolders) {
            const projectPath = path.join(LOCAL_PROJECTS_DIR, folder);
            const data = await processProject(projectPath, folder, 'local');
            if (data) projects.push(data);
        }
    }

    // 2. Remote (Cloned) Projects
    if (fs.existsSync(TEMP_INGEST_DIR)) {
        const remoteFolders = fs.readdirSync(TEMP_INGEST_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of remoteFolders) {
            const projectPath = path.join(TEMP_INGEST_DIR, folder);
            const data = await processProject(projectPath, folder, 'remote');
            if (data) projects.push(data);
        }
    }

    // Ensure output dir exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(projects, null, 2));
    console.log(`Ingested ${projects.length} projects to ${OUTPUT_FILE}`);
}

async function processProject(projectPath, folderName, source) {
    console.log(`Processing ${folderName}...`);

    // Read Metadata
    let packageJson = {};
    try {
        const pkgPath = path.join(projectPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
            packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        }
    } catch (e) {
        console.warn(`No valid package.json for ${folderName}`);
    }

    let readme = '';
    try {
        const readmePath = path.join(projectPath, 'README.md');
        if (fs.existsSync(readmePath)) {
            readme = fs.readFileSync(readmePath, 'utf-8');
        }
    } catch (e) { }

    // Extract Description from README (first non-header paragraph)
    let description = packageJson.description || 'No description provided.';
    const readmeLines = readme.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const firstPara = readmeLines.find(l => !l.startsWith('#') && !l.startsWith('!'));
    if (firstPara && firstPara.length > 20) description = firstPara;

    // Overrides
    const override = OVERRIDES[folderName] || {};

    // Tech Stack
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const stack = Object.keys(dependencies).slice(0, 6); // Top 6 deps

    // Helper to scan a directory for images
    const scanDir = (dir) => {
        try {
            if (!fs.existsSync(dir)) return [];
            return fs.readdirSync(dir)
                .filter(f => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f))
                .map(f => path.join(dir, f));
        } catch (e) { return []; }
    };

    // Candidates: root, public, assets, src/assets, screenshots
    let candidateFiles = [
        ...scanDir(projectPath),
        ...scanDir(path.join(projectPath, 'public')),
        ...scanDir(path.join(projectPath, 'assets')),
        ...scanDir(path.join(projectPath, 'src', 'assets')),
        ...scanDir(path.join(projectPath, 'screenshots')),
        ...scanDir(path.join(projectPath, 'docs', 'images')),
    ];

    // Deduplicate
    candidateFiles = [...new Set(candidateFiles)];

    if (candidateFiles.length > 0) {
        if (!fs.existsSync(targetImgDir)) fs.mkdirSync(targetImgDir, { recursive: true });

        // Copy first 6 images
        for (const src of candidateFiles.slice(0, 6)) {
            const filename = path.basename(src);
            const dest = path.join(targetImgDir, filename);
            fs.copyFileSync(src, dest);
            images.push(`/projects/${folderName}/${filename}`);
        }
    }

    return {
        id: folderName,
        title: override.title || packageJson.name || folderName,
        category: override.category || 'Engineering',
        medium: override.medium || 'Code',
        description,
        content: readme, // Store full MD for the page
        stack,
        repo: packageJson.repository?.url || '',
        images,
        source
    };
}

ingest();

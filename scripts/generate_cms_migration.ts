import fs from 'fs';
import path from 'path';

// 1. Load Projects
const projectsPath = path.resolve(process.cwd(), 'src/data/projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

// 2. Define Hidden Projects to Delete
const hiddenIds = ['vantage', 'nexus', 'synthetix', 'weekend', 'streamer-portfolio'];

let sql = `-- CMS Cleanup Migration\n\n`;

// 3. Delete Hidden Projects
sql += `-- 1. Delete Hidden Projects\n`;
sql += `DELETE FROM projects WHERE id IN (${hiddenIds.map(id => `'${id}'`).join(', ')});\n\n`;

// 4. Upsert Active Projects
sql += `-- 2. Upsert Active Projects\n`;
const formatArray = (arr: any[]) => {
    if (!arr || arr.length === 0) return 'ARRAY[]::text[]';
    // Escape single quotes in array items
    const items = arr.map(item => `'${item.replace(/'/g, "''")}'`).join(', ');
    return `ARRAY[${items}]`;
};

projects.forEach((p: any) => {
    // Sanitize fields
    const id = p.id;
    const title = p.title.replace(/'/g, "''");
    const category = p.category.replace(/'/g, "''");
    const medium = p.medium.replace(/'/g, "''");
    const description = p.description ? `'${p.description.replace(/'/g, "''")}'` : 'NULL';
    const content = p.content ? `'${p.content.replace(/'/g, "''")}'` : 'NULL';
    const repo = p.repo ? `'${p.repo}'` : 'NULL';
    const source = `'${p.source || 'local'}'`;
    const stack = formatArray(p.stack);
    const images = formatArray(p.images);

    sql += `
INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('${id}', '${title}', '${category}', '${medium}', ${description}, ${content}, ${stack}, ${repo}, ${images}, ${source})
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;
`;
});

const outputPath = path.resolve(process.cwd(), 'supabase/migrations/cms_cleanup.sql');
// Ensure dir exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, sql);
console.log(`Generated SQL migration file at ${outputPath}`);

const fs = require('fs');
let txt = fs.readFileSync('src/server.ts', 'utf8');

const anchor = `app.get('/entity-types', async (req, res) => {`;
const insert = `// ── Project Workspaces ──────────────────────────────────────────

app.get('/projects', async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list projects', details: String(error) });
  }
});

app.post('/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const project = await prisma.project.create({
      data: { name, description }
    });
    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ error: 'failed to create project', details: String(error) });
  }
});

app.get('/entity-types', async (req, res) => {`;

fs.writeFileSync('src/server.ts', txt.replace(anchor, insert));
console.log('Injected /projects routes');

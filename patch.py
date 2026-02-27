import re

with open('src/server.ts', 'r', encoding='utf-8') as f:
    code = f.read()

models = ['entityType', 'dataSource', 'integrationJob', 'modelDefinition', 'decisionRule', 'dashboard']
for m in models:
    pattern = re.compile(rf'(prisma\.{m}\.create\({{\s*data:\s*{{)')
    code = pattern.sub(r'\1\n        projectId: req.body.projectId || (global as any).DEFAULT_PROJECT_ID,', code)

startup_code = """
// ── Server & Graceful Shutdown ───────────────────────────────────

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Server listening on http://0.0.0.0:${PORT}`);

  try {
    let proj = await prisma.project.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!proj) {
      proj = await prisma.project.create({
        data: { name: 'Default Workspace', description: 'Auto-generated default workspace' }
      });
      logger.info(`Created default project: ${proj.id}`);
    }
    (global as any).DEFAULT_PROJECT_ID = proj.id;
  } catch (err) {
    logger.error('Failed to create default project', err);
  }

  // Start the lightweight job scheduler"""

code = re.sub(r'const PORT = parseInt.*?app\.listen.*?\{\s*(logger\.info.*?)\/\/ Start the lightweight job scheduler', startup_code, code, flags=re.DOTALL)

extra_routes = """
// ── Projects & Dashboards ────────────────────────────────────────

app.post('/projects', async (req, res) => {
  try {
    const project = await prisma.project.create({ data: { name: req.body.name || 'New Project', description: req.body.description } });
    return res.status(201).json(project);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/dashboards', async (req, res) => {
  try {
    const dashboard = await prisma.dashboard.create({ 
      data: { name: req.body.name, projectId: req.body.projectId || (global as any).DEFAULT_PROJECT_ID } 
    });
    return res.status(201).json(dashboard);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/dashboards', async (req, res) => {
  try {
    const projectId = (req.query.projectId as string) || (global as any).DEFAULT_PROJECT_ID;
    const dashboards = await prisma.dashboard.findMany({ 
      where: { projectId },
      include: { widgets: true },
      orderBy: { createdAt: 'desc' } 
    });
    return res.json(dashboards);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── End Projects & Dashboards ────────────────────────────────────
"""

if "app.get('/projects'" not in code:
    code = code.replace("// ── Health Checks (no auth) ──────────────────────────────────────", extra_routes + "\n// ── Health Checks (no auth) ──────────────────────────────────────")

with open('src/server.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patch applied successfully.")

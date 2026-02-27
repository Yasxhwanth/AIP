const fs = require('fs');

let server = fs.readFileSync('src/server.ts', 'utf8');

// Replace the fallback variable across the backend with req.header('X-Project-Id')
const REPLACEMENTS = [
    {
        from: /req\.body\.projectId \|\| \(global as any\)\.DEFAULT_PROJECT_ID/g,
        to: "req.body.projectId || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID"
    },
    {
        from: /\(req\.query\.projectId as string\) \|\| \(global as any\)\.DEFAULT_PROJECT_ID/g,
        to: "(req.query.projectId as string) || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID"
    }
];

REPLACEMENTS.forEach(r => {
    server = server.replace(r.from, r.to);
});

fs.writeFileSync('src/server.ts', server);
console.log('Patched server.ts with X-Project-Id support');

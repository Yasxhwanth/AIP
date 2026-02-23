const fs = require('fs');
let content = fs.readFileSync('src/server.ts', 'utf8');

// Fix the where['timestamp'] and where['windowStart'] by changing where type to Record<string, any>
content = content.replace(/const where: Record<string, unknown> =/g, 'const where: Record<string, any> =');
content = content.replace(/const temporalFilter: Record<string, unknown> =/g, 'const temporalFilter: Record<string, any> =');
content = content.replace(/let where: Record<string, unknown> =/g, 'let where: Record<string, any> =');

// Fix error.code access
// We'll replace `(error as Record<string, unknown>).code` with `(error as any).code` 
// and `error.code` with `(error as any).code` just to be safe.
content = content.replace(/\(error as Record<string, unknown>\)\.code/g, '(error as any).code');
content = content.replace(/error\.code/g, '(error as any).code');
content = content.replace(/\(error as any\)\.code/g, '(error as any).code'); // in case it applies twice

fs.writeFileSync('src/server.ts', content);

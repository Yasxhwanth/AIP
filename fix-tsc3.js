const fs = require('fs');
let content = fs.readFileSync('src/server.ts', 'utf8');

content = content.replace(/error\?\.code/g, '(error as any)?.code');

fs.writeFileSync('src/server.ts', content);

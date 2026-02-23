const fs = require('fs');
const layoutPath = 'frontend/src/app/layout.tsx';
let content = fs.readFileSync(layoutPath, 'utf8');

content = content.replace(/import\s*{\s*Inter\s*}\s*from\s*"next\/font\/google";\n/g, '');
content = content.replace(/const\s+inter\s*=\s*Inter\({[^}]*}\);\n/g, '');
content = content.replace(/className={inter\.className}/g, 'className="font-sans antialiased"');

fs.writeFileSync(layoutPath, content);
console.log('Removed next/font/google from layout.tsx');

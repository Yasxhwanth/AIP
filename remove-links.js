const fs = require('fs');
const layoutPath = 'frontend/src/app/layout.tsx';
let content = fs.readFileSync(layoutPath, 'utf8');

// Remove unimplemented links
content = content.replace(/.*<GlobalNavLink href="\/search".*\n/g, '');
content = content.replace(/.*<GlobalNavLink href="\/recent".*\n/g, '');
content = content.replace(/.*<GlobalNavLink href="\/alerts".*\n/g, '');
content = content.replace(/.*<GlobalNavLink href="\/settings".*\n/g, '');

fs.writeFileSync(layoutPath, content);
console.log('Removed dead links from layout');

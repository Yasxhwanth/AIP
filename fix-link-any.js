const fs = require('fs');

let content = fs.readFileSync('frontend/src/app/ontology/page.tsx', 'utf8');

// The links.map((link: any) => ...) was missed in the type replacement script!
// Also replacing setSelectedObj(any) to avoid strict mode issues if desired, though types.ts exports EntityType

content = content.replace(/links\.map\(\(link: any/g, 'links.map((link: T.RelationshipDefinition');

fs.writeFileSync('frontend/src/app/ontology/page.tsx', content);
console.log('Fixed link: any in ontology/page.tsx');

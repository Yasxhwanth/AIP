const fs = require('fs');
const path = 'src/server.ts';
let content = fs.readFileSync(path, 'utf8');

// fix error.code
// It says src/server.ts(179,16): error TS2339: Property 'code' does not exist on type '{}'.
// That is probably `if (error.code === 'P2002')`.
content = content.replace(/error\.code/g, '(error as Record<string, unknown>).code');

// fix metrics.map((m: Record<string, unknown>) => ({
content = content.replace(/m:\s*Record<string,\s*unknown>\)\s*=>/g, 'm: { metric: string, value: string | number, timestamp?: string | Date }) =>');

// fix where.timestamp and where.windowStart
content = content.replace(/where\.timestamp/g, "where['timestamp']");
content = content.replace(/where\.windowStart/g, "where['windowStart']");

fs.writeFileSync(path, content);
console.log('Fixed build errors in ' + path);

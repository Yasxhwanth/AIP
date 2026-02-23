const fs = require('fs');
const files = ['server.ts', 'computed-metrics.ts', 'data-integration.ts', 'inference-engine.ts', 'middleware.ts'];
files.forEach(f => {
    const path = 'src/' + f;
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    // replace catch (error: any) with catch (error: unknown)
    content = content.replace(/catch\s*\(\s*(error|e)\s*:\s*any\s*\)/g, 'catch ($1: unknown)');
    // replace : any = {} with : Record<string, any> = {} => let's just use `any` if it's object or bypass lint? 
    // Wait, if it's strict TS and `any` is flagged by a linter, then `Record<string, unknown>` or `Record<string, any>` might work.
    // The user said: "Fix explicit any spots called out by TypeScript: src/server.ts map/transaction callbacks and other flagged parameters"
    // If it's `prisma.$transaction`, sometimes TS needs explicit typing for the return.
    content = content.replace(/:\s*any;/g, ': unknown;');
    content = content.replace(/:\s*any\s*=/g, ': Record<string, unknown> =');
    content = content.replace(/m:\s*any\)\s*=>/g, 'm: Record<string, unknown>) =>');

    fs.writeFileSync(path, content);
    console.log('Fixed ' + path);
});

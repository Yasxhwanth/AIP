const fs = require('fs');

// Patch Integrations
const intPath = 'frontend/src/app/integrations/page.tsx';
if (fs.existsSync(intPath)) {
    let content = fs.readFileSync(intPath, 'utf8');
    content = content.replace(/job\.entityTypeId/g, 'job.targetEntityTypeId');
    content = content.replace(/selectedJob\.entityTypeId/g, 'selectedJob.targetEntityTypeId');
    fs.writeFileSync(intPath, content);
}

// Patch Telemetry
const telPath = 'frontend/src/app/telemetry/page.tsx';
if (fs.existsSync(telPath)) {
    let content = fs.readFileSync(telPath, 'utf8');
    content = content.replace(/avgValue/g, 'avg');
    content = content.replace(/maxValue/g, 'max');
    fs.writeFileSync(telPath, content);
}

// Patch Files
const filesPath = 'frontend/src/app/files/page.tsx';
if (fs.existsSync(filesPath)) {
    let content = fs.readFileSync(filesPath, 'utf8');
    content = content.replace(/baseType/g, 'dataType');
    fs.writeFileSync(filesPath, content);
}

console.log('Patched Mismatch Fields');

const { spawn } = require('child_process');

const prisma = spawn('npx.cmd', ['prisma', 'db', 'push', '--force-reset', '--skip-generate'], {
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env, CI: 'true' }
});

prisma.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[STDOUT]: ${output}`);

    // Look for any prompt markers
    if (output.includes('?') || output.includes('y/N') || output.includes('All data will be lost')) {
        console.log('[BRIDGE]: Sending "y" to Prisma...');
        prisma.stdin.write('y\n');
    }
});

prisma.stderr.on('data', (data) => {
    console.error(`[STDERR]: ${data}`);
});

prisma.on('close', (code) => {
    console.log(`[PRISMA]: Process exited with code ${code}`);
    process.exit(code);
});

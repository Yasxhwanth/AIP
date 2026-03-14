const { spawn } = require('child_process');

console.log('🚀 Starting high-frequency Prisma push bridge...');

const prisma = spawn('npx.cmd', ['prisma', 'db', 'push', '--force-reset', '--skip-generate', '--accept-data-loss'], {
    shell: true,
    stdio: ['pipe', 'inherit', 'inherit'], // inherit stdout/stderr for visibility
    env: { ...process.env, CI: 'true', COLUMNS: '80', LINES: '24' }
});

const pulse = setInterval(() => {
    try {
        prisma.stdin.write('y\n');
    } catch (err) {
        // Process might have closed
        clearInterval(pulse);
    }
}, 100); // 100ms pulse

prisma.on('close', (code) => {
    clearInterval(pulse);
    console.log(`[PRISMA]: Process exited with code ${code}`);
    process.exit(code);
});

// Safety timeout
setTimeout(() => {
    console.log('[BRIDGE]: Safety timeout reached.');
    prisma.kill();
    process.exit(1);
}, 60000);

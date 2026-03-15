const { spawn } = require('child_process');

const prisma = spawn('npx.cmd', ['prisma', 'db', 'push', '--accept-data-loss', '--force-reset', '--skip-generate'], {
    shell: true,
    cwd: 'c:\\Users\\YASHWANTH\\Projects\\AIP'
});

prisma.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    if (data.includes('All data will be lost') || data.includes('Do you want to continue')) {
        prisma.stdin.write('y\n');
    }
});

prisma.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

prisma.on('close', (code) => {
    console.log(`Prisma process exited with code ${code}`);
    process.exit(code);
});

const http = require('http');

function request(options, bodyData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });

        req.on('error', reject);

        if (bodyData) {
            req.write(JSON.stringify(bodyData));
        }
        req.end();
    });
}

async function run() {
    try {
        console.log("3. Sending Telemetry Data...");
        let i = 0;
        setInterval(async () => {
            const payload = {
                logicalId: 'sensor-alpha-001',
                metrics: [
                    { metric: 'temperature', value: 70 + Math.random() * 10 },
                    { metric: 'pressure', value: 100 + Math.random() * 5 }
                ]
            };

            const tReq = await request({
                hostname: '127.0.0.1',
                port: 3001,
                path: '/telemetry',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, payload);

            if (tReq.status === 201 || tReq.status === 200) {
                console.log(`-> Sent point ${++i}: T=${payload.metrics[0].value.toFixed(1)} P=${payload.metrics[1].value.toFixed(1)}`);
            } else {
                console.error("-> Failed telemetry:", tReq.status, tReq.data);
            }
        }, 1000); // every 1 second

    } catch (err) {
        console.error("Test failed:", err);
    }
}

run();

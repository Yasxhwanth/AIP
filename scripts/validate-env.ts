import { Client } from 'pg';
import amqp from 'amqplib';
import 'dotenv/config';

async function validateEnv() {
    console.log('--- AIP Environment Validation ---');

    const requiredVars = ['DATABASE_URL'];
    const missing = requiredVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
        console.error(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    console.log('✅ Environment variables present.');

    // Check Database connection
    const dbUrl = process.env.DATABASE_URL!;
    console.log('Testing PostgreSQL connection...');
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log('✅ Database connected successfully.');
    } catch (error: any) {
        console.error(`\n❌ Failed to connect to the database.`);
        console.error(`Error details: ${error.message}`);
        process.exit(1);
    } finally {
        await client.end();
    }

    // Check RabbitMQ if configured
    const rmqUrl = process.env.RABBITMQ_URL;
    if (rmqUrl) {
        console.log('Testing RabbitMQ connection...');
        try {
            const conn = await amqp.connect(rmqUrl);
            console.log('✅ RabbitMQ connected successfully.');
            await conn.close();
        } catch (error: any) {
            console.warn(`\n⚠️ Failed to connect to RabbitMQ using URL: ${rmqUrl}`);
            console.warn(`Error details: ${error.message}`);
            console.warn(`Note: Application may boot without RabbitMQ, but message queues will be disabled.`);
        }
    } else {
        console.log('ℹ️ No RABBITMQ_URL provided, skipping AMQP test.');
    }

    console.log('\n✅ All infrastructure checks passed. Proceeding to start...');
}

validateEnv().catch((err) => {
    console.error('Unhandled error during environment validation:', err);
    process.exit(1);
});

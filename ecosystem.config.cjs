module.exports = {
    apps: [
        {
            name: 'zalan-web',
            script: './.output/server/index.mjs',
            interpreter: 'bun',
            env: {
                PORT: 3001,
                NITRO_PRESET: 'bun'
            }
        },
        {
            name: 'zalan-worker',
            script: './worker.ts',
            interpreter: 'bun',
        },
        {
            name: 'zalan-tunnel',
            script: './cloudflared',
            args: 'tunnel run --token eyJhIjoiMDYxNDkyNTQyYThhMzYwZTE0ZWUyNGFhM2YwNzU0YTEiLCJ0IjoiZWRhYWU5MGItZDFkMC00OTJiLWEyMTAtZDlmNzY2OTY3NWE4IiwicyI6Ik1qSm1OV1l4TURndE5HRm1OaTAwTmpBMExUZzFaR1F0WkRZeE5XVmxaVFk0TURCbCJ9',
            interpreter: 'none'
        }
    ]
};

import { auth } from "./server/utils/auth";

async function test() {
    try {
        console.log('Testing getSession...');
        // Mocking event headers
        const session = await auth.api.getSession({
            headers: new Headers()
        });
        console.log('Session result:', session);
    } catch (e) {
        console.error('getSession failed:', e);
    }
}

test();

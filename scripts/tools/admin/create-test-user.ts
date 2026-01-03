import { auth } from "./server/utils/auth";

async function createTestUser() {
    const email = "tamu@zalan.web.id";
    const password = "password123";
    const name = "User Tamu";

    try {
        const user = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name
            }
        });
        console.log('Regular User Created:', user);

        // Ensure role is 'user' (it defaults to 'user' in schema, but let's be sure)
        const { Database } = await import('bun:sqlite');
        const db = new Database('sqlite.db');
        db.run("UPDATE user SET role = 'user' WHERE email = ?", [email]);
        db.close();
        console.log('Role confirmed as user for testing');

    } catch (e) {
        console.error('Failed to create test user:', e);
    }
}

createTestUser();

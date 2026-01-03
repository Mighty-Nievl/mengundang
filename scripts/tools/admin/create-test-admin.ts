import { auth } from "./server/utils/auth";

async function createTestAdmin() {
    const email = "testadmin@zalan.web.id";
    const password = "admin12345678";
    const name = "Test Admin";

    // Better-auth API usually requires a context, but we can try to call it directly
    // If it's the internal API.

    try {
        const user = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name
            }
        });
        console.log('Test Admin Created:', user);

        // Update role to admin
        const { Database } = await import('bun:sqlite');
        const db = new Database('sqlite.db');
        db.run("UPDATE user SET role = 'admin' WHERE email = ?", [email]);
        db.close();
        console.log('Role updated to admin for test user');

    } catch (e) {
        console.error('Failed to create test admin:', e);
    }
}

createTestAdmin();

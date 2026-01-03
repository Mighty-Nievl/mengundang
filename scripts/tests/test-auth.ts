import { auth } from "./server/utils/auth";

// This script will try to verify the password using better-auth's internal logic
async function test() {
    const password = "admin12345678";
    const email = "support@zalan.web.id";

    // Better auth doesn't expose a simple "verify" easily without an account object
    // But we can check how it's configured.

    console.log("Better Auth Base URL:", auth.options.baseURL);

    // Let's try to find the account and manually compare if we can guess the hasher
    // Or better, let's just use Bun.password.hash with NO options and see if that works
    // Better yet, let's look at the accounts table again.
}

test();

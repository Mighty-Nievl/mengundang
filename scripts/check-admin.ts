import { Database } from 'bun:sqlite';
const db = new Database('sqlite.db');

console.log("Checking for testadmin@zalan.web.id...");
const user = db.query("SELECT * FROM user WHERE email = 'testadmin@zalan.web.id'").get() as any;

if (user) {
    console.log("User found:", user.id, user.name);
    const account = db.query("SELECT * FROM account WHERE userId = $id").get({ $id: user.id }) as any;
    if (account) {
        console.log("Account found linked to user.");
        console.log("Password set:", !!account.password);
    } else {
        console.log("User exists but NO linked account found (so no password login possible).");
    }
} else {
    console.log("User NOT found.");
}
db.close();

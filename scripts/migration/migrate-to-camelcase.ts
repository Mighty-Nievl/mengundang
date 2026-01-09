import { Database } from "bun:sqlite";

const db = new Database("./database/sqlite.db");

// Function to rename column if exists
function renameColumn(table: string, oldName: string, newName: string) {
    try {
        const info = db.query(`PRAGMA table_info(${table})`).all() as any[];
        if (info.find(c => c.name === oldName) && !info.find(c => c.name === newName)) {
            console.log(`Renaming ${table}.${oldName} to ${newName}`);
            db.run(`ALTER TABLE ${table} RENAME COLUMN ${oldName} TO ${newName}`);
        }
    } catch (e) {
        console.error(`Failed to rename ${table}.${oldName}:`, e);
    }
}

// User Table
renameColumn("user", "email_verified", "emailVerified");
renameColumn("user", "created_at", "createdAt");
renameColumn("user", "updated_at", "updatedAt");
renameColumn("user", "max_invitations", "maxInvitations");

// Session Table
renameColumn("session", "user_id", "userId");
renameColumn("session", "expires_at", "expiresAt");
renameColumn("session", "ip_address", "ipAddress");
renameColumn("session", "user_agent", "userAgent");
renameColumn("session", "created_at", "createdAt");
renameColumn("session", "updated_at", "updatedAt");

// Account Table
renameColumn("account", "user_id", "userId");
renameColumn("account", "account_id", "accountId");
renameColumn("account", "provider_id", "providerId");
renameColumn("account", "access_token", "accessToken");
renameColumn("account", "refresh_token", "refreshToken");
renameColumn("account", "id_token", "idToken");
renameColumn("account", "access_token_expires_at", "accessTokenExpiresAt");
renameColumn("account", "refresh_token_expires_at", "refreshTokenExpiresAt");
renameColumn("account", "created_at", "createdAt");
renameColumn("account", "updated_at", "updatedAt");

// Verification Table
renameColumn("verification", "expires_at", "expiresAt");
renameColumn("verification", "created_at", "createdAt");
renameColumn("verification", "updated_at", "updatedAt");

// Invitation Table (Keep snake_case for consistency with content field if needed, but let's sync partner_email)
renameColumn("invitation", "partner_email", "partnerEmail");
renameColumn("invitation", "created_at", "createdAt");
renameColumn("invitation", "updated_at", "updatedAt");

console.log("Migration finished.");
db.close();

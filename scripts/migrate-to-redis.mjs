/**
 * Migration script: uploads existing JSON file data to Upstash Redis.
 * Run ONCE after setting up your Upstash database:
 *
 *   node scripts/migrate-to-redis.mjs
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * to be set in .env.local (or as environment variables).
 */

import { readFile, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load .env.local manually
const envPath = join(root, ".env.local");
try {
    const envContent = await readFile(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
        const [key, ...rest] = line.split("=");
        if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
} catch {
    // .env.local not found, rely on existing env vars
}

const { Redis } = await import("@upstash/redis");
const redis = Redis.fromEnv();

const dataDir = join(root, "data", "users");

// Migrate users index
try {
    const indexRaw = await readFile(join(dataDir, "index.json"), "utf-8");
    const index = JSON.parse(indexRaw);
    await redis.set("users_index", index);
    console.log(`✅ Migrated users_index (${index.length} user(s))`);
} catch (err) {
    console.error("❌ Could not read data/users/index.json:", err.message);
    process.exit(1);
}

// Migrate each user's data file
const files = await readdir(dataDir);
for (const file of files) {
    if (file === "index.json" || !file.endsWith(".json")) continue;
    const userId = file.replace(".json", "");
    try {
        const raw = await readFile(join(dataDir, file), "utf-8");
        const userData = JSON.parse(raw);
        await redis.set(`user:${userId}`, userData);
        console.log(`✅ Migrated user:${userId} (${userData.tasks?.length ?? 0} tasks, ${userData.wikiEntries?.length ?? 0} wiki entries)`);
    } catch (err) {
        console.error(`❌ Failed to migrate ${file}:`, err.message);
    }
}

console.log("\n🎉 Migration complete!");

import { readFileSync } from "node:fs";
import { join } from "node:path";

const seedPath = join(process.cwd(), "supabase", "seed.sql");

console.log(readFileSync(seedPath, "utf8"));

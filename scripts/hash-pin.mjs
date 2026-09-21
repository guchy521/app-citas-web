import crypto from "node:crypto";

const pin = process.argv[2];
if (!pin) {
  console.log("Uso: node scripts/hash-pin.mjs 1234");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(pin, salt, 64).toString("hex");
console.log(`${salt}:${hash}`);
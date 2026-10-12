// Yönetici hesabını kurar: e-posta ve şifre özetini .env.local dosyasına yazar.
// Kullanım: npm run admin:setup
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import readline from "node:readline";

const envPath = ".env.local";

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (text) => {
        process.stdout.write(text.includes(question) ? question : "*");
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function setVar(lines, key, value) {
  const line = `${key}="${value}"`;
  const index = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (index >= 0) lines[index] = line;
  else lines.push(line);
}

const email = (await ask("Yönetici e-posta adresi: ")).trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Geçerli bir e-posta adresi girin.");
  process.exit(1);
}

const password = await ask("Şifre (en az 10 karakter): ", { hidden: true });
const again = await ask("Şifre (tekrar): ", { hidden: true });
if (password.length < 10) {
  console.error("Şifre en az 10 karakter olmalı.");
  process.exit(1);
}
if (password !== again) {
  console.error("Şifreler eşleşmiyor.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64).toString("hex");

const lines = existsSync(envPath) ? readFileSync(envPath, "utf8").split(/\r?\n/).filter((l) => l !== "") : [];
setVar(lines, "ADMIN_EMAIL", email);
setVar(lines, "ADMIN_PASSWORD_HASH", `scrypt:${salt.toString("hex")}:${hash}`);
if (!lines.some((l) => l.startsWith("AUTH_SECRET="))) {
  setVar(lines, "AUTH_SECRET", randomBytes(32).toString("hex"));
}
writeFileSync(envPath, lines.join("\n") + "\n");

console.log("Yönetici hesabı .env.local dosyasına kaydedildi. Geliştirme sunucusunu yeniden başlatın.");

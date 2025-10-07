const fs = require('node:fs');
const path = require('node:path');

function loadEnv({ cwd = process.cwd(), file = '.env' } = {}) {
  const envPath = path.resolve(cwd, file);
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const contents = fs.readFileSync(envPath, 'utf-8');
  const result = {};

  contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        return;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();

      const isQuoted =
        (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'"));

      const value = isQuoted ? rawValue.slice(1, -1) : rawValue;

      if (!(key in process.env)) {
        process.env[key] = value;
      }
      result[key] = process.env[key];
    });

  return result;
}

module.exports = {
  loadEnv
};

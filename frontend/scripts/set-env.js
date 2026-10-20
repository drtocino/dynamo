const fs = require('fs');
const path = require('path');

// 1. Check for local .env files (root and frontend directory)
const possibleEnvPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env')
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
          const varName = key.trim();
          if (varName && !process.env[varName]) {
            process.env[varName] = val;
          }
        }
      }
    } catch (_) {}
  }
}

// 2. Read environment variable (Vercel, CI/CD, or local .env)
const rawUrl = process.env.DYNAMO_API_URL || process.env.BACKEND_URL || process.env.API_URL || '';
const apiBaseUrl = rawUrl.trim().replace(/\/+$/, '');

const targetPath = path.join(__dirname, '../src/environments/environment.prod.ts');
const envFileContent = `export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}',
  apiUrl: '${apiBaseUrl ? apiBaseUrl + '/api/v1' : '/api/v1'}',
  sessionHubUrl: '${apiBaseUrl ? apiBaseUrl + '/hubs/session' : '/hubs/session'}',
  gameHubUrl: '${apiBaseUrl ? apiBaseUrl + '/hub/game' : '/hub/game'}'
};
`;

const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(targetPath, envFileContent, 'utf8');

if (apiBaseUrl) {
  console.log(`[CI/CD set-env] Injected backend URL from environment: ${apiBaseUrl}`);
} else {
  console.log(`[CI/CD set-env] No DYNAMO_API_URL found; generated default relative environment`);
}

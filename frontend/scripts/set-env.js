const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/environments/environment.prod.ts');
const rawUrl = process.env.DYNAMO_API_URL || process.env.API_URL || process.env.BACKEND_URL || 'https://dynamo-dfc5a0f7bhcyctgn.canadacentral-01.azurewebsites.net';
const apiBaseUrl = rawUrl.trim().replace(/\/+$/, '');

const envFileContent = `export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}',
  apiUrl: '${apiBaseUrl}/api/v1',
  sessionHubUrl: '${apiBaseUrl}/hubs/session',
  gameHubUrl: '${apiBaseUrl}/hub/game'
};
`;

const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(targetPath, envFileContent, 'utf8');
console.log(`[CI/CD set-env] Injected production backend URL: ${apiBaseUrl}`);

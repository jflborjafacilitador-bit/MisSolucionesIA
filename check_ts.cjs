const { execSync } = require('child_process');
const fs = require('fs');
try {
  execSync('npx tsc --noEmit --pretty false', { stdio: 'pipe' });
} catch(err) {
  fs.writeFileSync('ts-output.txt', err.stdout.toString());
}

// client/build.js
import { execSync } from 'child_process';
execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
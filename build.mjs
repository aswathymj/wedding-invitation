import { cp, mkdir, rm, copyFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await copyFile(resolve(root, 'index.html'), resolve(out, 'index.html'));
await copyFile(resolve(root, 'favicon.svg'), resolve(out, 'favicon.svg'));
await cp(resolve(root, 'src'), resolve(out, 'src'), { recursive: true });
await cp(resolve(root, 'public'), out, { recursive: true });
await access(resolve(out, 'src/main.js'));
console.log(`Static invitation built in ${out}`);

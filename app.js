import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readlineLib from 'readline';
// import config from './config.json' assert { type: 'json' }; // Remove if unused

// Helper to check if node_modules exists
function isNpmInstalled(dir) {
    return fs.existsSync(path.join(dir, 'node_modules'));
}

// Helper to check if folder exists
function folderExists(dir) {
    return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
}

// Main logic
const rootDir = process.cwd();
const frontendDir = path.join(rootDir, 'frontend');
const dbDir = path.join(rootDir, 'db');

// 1. Check root npm install
if (!isNpmInstalled(rootDir)) {
    console.error('Please run "npm install" in the root directory first.');
    const readline = readlineLib.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    readline.question('Would you like to run "npm install" now? (y/N): ', (answer) => {
        readline.close();
        if (answer.trim().toLowerCase() === 'y') {
            try {
                execSync('npm install', { stdio: 'inherit', cwd: rootDir });
                console.log('npm install completed.');
                process.exit(0);
            } catch (err) {
                console.error('npm install failed.');
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    });
    process.exit(1);
}

// 2. Check frontend npm install
if (!folderExists(frontendDir) || !isNpmInstalled(frontendDir)) {
    console.error('Please run "npm install" in the /frontend directory first.');
    process.exit(1);
}

// 3. Check db folder exists
if (!folderExists(dbDir)) {
    console.error('The /db folder does not exist.');
    process.exit(1);
}

// 4. Run nodemon server.js
const nodemon = spawn('npx', ['nodemon', 'server.js'], {
    stdio: 'inherit',
    cwd: rootDir,
    shell: true,
});

// 5. Run npm run dev in /frontend
const frontendDev = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: frontendDir,
    shell: true,
});

// Handle exit
let nodemonExited = false;
let frontendExited = false;

nodemon.on('exit', (code) => {
    console.log(`nodemon exited with code ${code}`);
    nodemonExited = true;
    if (frontendExited) process.exit(code);
});
frontendDev.on('exit', (code) => {
    console.log(`frontend dev exited with code ${code}`);
    frontendExited = true;
    if (nodemonExited) process.exit(code);
});
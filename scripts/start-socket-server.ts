import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

async function checkDependencies() {
  try {
    console.log('Checking required dependencies...');
    
    // List of required dependencies for the socket server
    const requiredDeps = ['express', 'cors', 'socket.io'];
    
    // Get the package.json content
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    const missingDeps = requiredDeps.filter(dep => !allDeps[dep]);
    
    if (missingDeps.length > 0) {
      console.log(`Missing dependencies: ${missingDeps.join(', ')}. Installing...`);
      await execAsync(`npm install ${missingDeps.join(' ')} --save`);
      console.log('Dependencies installed successfully.');
    } else {
      console.log('All required dependencies are installed.');
    }
    
  } catch (error) {
    console.error('Error checking dependencies:', error);
    throw error;
  }
}

async function startSocketServer() {
  try {
    // Check dependencies first
    await checkDependencies();
    
    console.log('Compiling TypeScript for socket server...');
    
    // Compile TypeScript using the socket-specific tsconfig
    await execAsync(`tsc -p ${path.join(__dirname, '../tsconfig.socket.json')}`);
    console.log('TypeScript compilation complete.');
    
    console.log('Starting socket server...');
    console.log(`Port: ${process.env.PORT || 3001}`);
    
    // Use the correct path to the compiled server.js file
    const serverPath = path.join(__dirname, '../dist/src/server.js');
    console.log(`Server path: ${serverPath}`);
    
    // Start the server using spawn to get real-time output
    const server = spawn('node', [serverPath], { stdio: 'inherit' });
    
    server.on('error', (error) => {
      console.error('Failed to start socket server:', error);
      process.exit(1);
    });
    
    server.on('close', (code) => {
      if (code !== 0) {
        console.error(`Socket server exited with code ${code}`);
        process.exit(code || 1);
      }
    });
    
    // Handle termination signals
    process.on('SIGINT', () => {
      console.log('Shutting down socket server...');
      server.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('Shutting down socket server...');
      server.kill('SIGTERM');
    });
    
    console.log('Socket server started successfully!');
    
  } catch (error) {
    console.error('Failed to start socket server:', error);
    process.exit(1);
  }
}

startSocketServer(); 
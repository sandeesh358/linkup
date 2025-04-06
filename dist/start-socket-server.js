"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv.config();
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function checkDependencies() {
    try {
        console.log('Checking required dependencies...');
        const requiredDeps = ['express', 'cors', 'socket.io'];
        const packageJsonPath = path_1.default.join(__dirname, '../package.json');
        const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf8'));
        const allDeps = Object.assign(Object.assign({}, packageJson.dependencies), packageJson.devDependencies);
        const missingDeps = requiredDeps.filter(dep => !allDeps[dep]);
        if (missingDeps.length > 0) {
            console.log(`Missing dependencies: ${missingDeps.join(', ')}. Installing...`);
            await execAsync(`npm install ${missingDeps.join(' ')} --save`);
            console.log('Dependencies installed successfully.');
        }
        else {
            console.log('All required dependencies are installed.');
        }
    }
    catch (error) {
        console.error('Error checking dependencies:', error);
        throw error;
    }
}
async function startSocketServer() {
    try {
        await checkDependencies();
        console.log('Compiling TypeScript for socket server...');
        await execAsync(`tsc -p ${path_1.default.join(__dirname, '../tsconfig.socket.json')}`);
        console.log('TypeScript compilation complete.');
        console.log('Starting socket server...');
        console.log(`Port: ${process.env.PORT || 3001}`);
        const serverPath = path_1.default.join(__dirname, '../dist/src/server.js');
        console.log(`Server path: ${serverPath}`);
        const server = (0, child_process_1.spawn)('node', [serverPath], { stdio: 'inherit' });
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
        process.on('SIGINT', () => {
            console.log('Shutting down socket server...');
            server.kill('SIGINT');
        });
        process.on('SIGTERM', () => {
            console.log('Shutting down socket server...');
            server.kill('SIGTERM');
        });
        console.log('Socket server started successfully!');
    }
    catch (error) {
        console.error('Failed to start socket server:', error);
        process.exit(1);
    }
}
startSocketServer();
//# sourceMappingURL=start-socket-server.js.map
#!/usr/bin/env node

/**
 * 🕐 Timeout Wrapper for Node.js Child Processes
 * 
 * This utility provides deadline and cancellation handling for:
 * - child_process.spawn operations
 * - child_process.exec operations
 * - fetch operations
 * - Any long-running async operations
 * 
 * Features:
 * - AbortController-based cancellation
 * - Configurable timeout values
 * - Graceful process termination (SIGTERM then SIGKILL)
 * - Comprehensive error handling and logging
 * - Promise-based interface
 */

const { spawn, exec } = require('child_process');

/**
 * Timeout wrapper for spawn operations
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {Object} options - Spawn options
 * @param {number} timeoutMs - Timeout in milliseconds (default: 5 minutes)
 * @returns {Promise<Object>} Promise that resolves with result or rejects on timeout
 */
function spawnWithTimeout(command, args, options = {}, timeoutMs = 5 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    console.log(`🚀 Starting process: ${command} ${args.join(' ')} (timeout: ${timeoutMs}ms)`);

    const child = spawn(command, args, {
      ...options,
      signal: controller.signal
    });

    let stdout = '';
    let stderr = '';
    let isResolved = false;

    // Collect output
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    child.on('close', (code) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutId);
      
      const result = {
        success: code === 0,
        exitCode: code,
        stdout,
        stderr,
        duration: Date.now() - startTime
      };

      if (code === 0) {
        console.log(`✅ Process completed successfully in ${result.duration}ms`);
        resolve(result);
      } else {
        console.log(`❌ Process failed with exit code ${code} after ${result.duration}ms`);
        resolve(result); // Resolve with failure info, don't reject
      }
    });

    // Handle process errors
    child.on('error', (error) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutId);
      
      console.error(`💥 Process error: ${error.message}`);
      resolve({
        success: false,
        exitCode: -1,
        stdout,
        stderr: error.message,
        duration: Date.now() - startTime
      });
    });

    // Handle timeout/abort
    controller.signal.addEventListener('abort', () => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutId);
      
      console.warn(`⏰ Process timeout after ${timeoutMs}ms, terminating...`);
      
      // Graceful termination with SIGTERM first
      child.kill('SIGTERM');
      
      // Force kill with SIGKILL after 5 seconds if still running
      const forceKillTimeout = setTimeout(() => {
        if (!child.killed) {
          console.warn(`💀 Force killing process with SIGKILL`);
          child.kill('SIGKILL');
        }
      }, 5000);
      
      // Clean up force kill timeout if process exits
      child.once('exit', () => {
        clearTimeout(forceKillTimeout);
      });
      
      reject(new Error(`Process timeout after ${timeoutMs}ms: ${command} ${args.join(' ')}`));
    });

    const startTime = Date.now();
  });
}

/**
 * Timeout wrapper for exec operations
 * @param {string} command - Command to execute
 * @param {Object} options - Exec options
 * @param {number} timeoutMs - Timeout in milliseconds (default: 5 minutes)
 * @returns {Promise<Object>} Promise that resolves with result or rejects on timeout
 */
function execWithTimeout(command, options = {}, timeoutMs = 5 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    console.log(`🚀 Starting exec: ${command} (timeout: ${timeoutMs}ms)`);

    const child = exec(command, {
      ...options,
      signal: controller.signal
    }, (error, stdout, stderr) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutId);
      
      const result = {
        success: !error,
        exitCode: error ? error.code : 0,
        stdout: stdout || '',
        stderr: stderr || '',
        duration: Date.now() - startTime
      };

      if (!error) {
        console.log(`✅ Exec completed successfully in ${result.duration}ms`);
        resolve(result);
      } else {
        console.log(`❌ Exec failed with exit code ${error.code} after ${result.duration}ms`);
        resolve(result); // Resolve with failure info, don't reject
      }
    });

    let isResolved = false;

    // Handle process errors
    child.on('error', (error) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutId);
      
      console.error(`💥 Exec error: ${error.message}`);
      resolve({
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: error.message,
        duration: Date.now() - startTime
      });
    });

    // Handle timeout/abort
    controller.signal.addEventListener('abort', () => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutId);
      
      console.warn(`⏰ Exec timeout after ${timeoutMs}ms, terminating...`);
      
      // Graceful termination with SIGTERM first
      child.kill('SIGTERM');
      
      // Force kill with SIGKILL after 5 seconds if still running
      const forceKillTimeout = setTimeout(() => {
        if (!child.killed) {
          console.warn(`💀 Force killing exec process with SIGKILL`);
          child.kill('SIGKILL');
        }
      }, 5000);
      
      // Clean up force kill timeout if process exits
      child.once('exit', () => {
        clearTimeout(forceKillTimeout);
      });
      
      reject(new Error(`Exec timeout after ${timeoutMs}ms: ${command}`));
    });

    const startTime = Date.now();
  });
}

/**
 * Generic timeout wrapper for any async operation
 * @param {Promise} promise - Promise to wrap with timeout
 * @param {number} timeoutMs - Timeout in milliseconds (default: 5 minutes)
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise} Promise that rejects on timeout
 */
function withTimeout(promise, timeoutMs = 5 * 60 * 1000, operationName = 'Operation') {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ ${operationName} timeout after ${timeoutMs}ms`);
      reject(new Error(`${operationName} timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Fetch with timeout (for Node.js 18+ or with node-fetch)
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds (default: 5 minutes)
 * @returns {Promise<Response>} Promise that rejects on timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 5 * 60 * 1000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    console.log(`🌐 Starting fetch: ${url} (timeout: ${timeoutMs}ms)`);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`✅ Fetch completed successfully: ${url}`);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.warn(`⏰ Fetch timeout after ${timeoutMs}ms: ${url}`);
      throw new Error(`Fetch timeout after ${timeoutMs}ms: ${url}`);
    }
    
    console.error(`💥 Fetch error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  spawnWithTimeout,
  execWithTimeout,
  withTimeout,
  fetchWithTimeout
};


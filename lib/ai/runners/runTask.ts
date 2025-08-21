/**
 * Task Runner - Universal Header Compliant
 * 
 * Calls ai.run and writes JSON to ./var/ai/<task>.json
 */

import { run } from '@/lib/ai';
import * as fs from 'fs';
import * as path from 'path';

interface TaskRunnerOptions {
  task: string;
  input: unknown;
  outputFile?: string;
  verbose?: boolean;
}

async function runTask(options: TaskRunnerOptions): Promise<void> {
  const { task, input, outputFile, verbose = false } = options;
  
  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(`🚀 Running AI task: ${task}`);
    // eslint-disable-next-line no-console
    console.log(`📥 Input:`, JSON.stringify(input, null, 2));
  }
  
  try {
    // Run the AI task
    const result = await run(task, input);
    
    // Determine output file path
    const outputPath = outputFile ?? path.join('var', 'ai', `${task}.json`);
    
    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write result to file
    const outputData = {
      task,
      input,
      result,
      timestamp: new Date().toISOString(),
      runner: 'runTask.ts'
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    
    if (verbose) {
      // eslint-disable-next-line no-console
      console.log(`✅ Task completed successfully`);
      // eslint-disable-next-line no-console
      console.log(`📁 Output written to: ${outputPath}`);
      // eslint-disable-next-line no-console
      console.log(`📊 Result:`, JSON.stringify(result, null, 2));
    } else {
      // eslint-disable-next-line no-console
      console.log(`✅ Task '${task}' completed. Output: ${outputPath}`);
    }
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ Error running task ${task}:`, error);
    process.exit(1);
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  const args = process.argv.slice(2);
  
  // Handle both --task=value and --task value formats
  let task: string | undefined;
  let input: string | undefined;
  let outputFile: string | undefined;
  let verbose = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--task=')) {
      task = arg.split('=')[1];
    } else if (arg === '--task' && i + 1 < args.length) {
      task = args[i + 1];
      i++; // Skip next argument
    } else if (arg.startsWith('--input=')) {
      input = arg.split('=')[1];
    } else if (arg === '--input' && i + 1 < args.length) {
      input = args[i + 1];
      i++; // Skip next argument
    } else if (arg.startsWith('--out=')) {
      outputFile = arg.split('=')[1];
    } else if (arg === '--out' && i + 1 < args.length) {
      outputFile = args[i + 1];
      i++; // Skip next argument
    } else if (arg === '--verbose') {
      verbose = true;
    }
  }
  
  if (!task) {
    // eslint-disable-next-line no-console
    console.error('Usage: tsx runTask.ts --task=<task_name> [--input=<json_input>] [--out=<file_path>] [--verbose]');
    // eslint-disable-next-line no-console
    console.error('Supported tasks: incident_triage, spec_writer');
    process.exit(1);
  }
  
  let parsedInput: unknown;
  
  if (input) {
    try {
      // Try to parse as JSON first
      parsedInput = JSON.parse(input);
    } catch {
      // If not JSON, treat as text file path
      try {
        if (fs.existsSync(input)) {
          parsedInput = fs.readFileSync(input, 'utf-8');
        } else {
          parsedInput = input; // Treat as raw text
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ Error reading input file ${input}:`, error);
        process.exit(1);
      }
    }
  } else {
    parsedInput = { message: "Default input" };
  }
  
  runTask({
    task,
    input: parsedInput,
    outputFile,
    verbose
  });
}

export { runTask };

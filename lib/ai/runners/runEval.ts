/**
 * AI Evaluation Runner - Universal Header Compliant
 * 
 * Runs deterministic evaluations against AI tasks
 */
import { run } from '@/lib/ai';
import { readFileSync } from 'fs';
import { join } from 'path';
interface EvalCase {
  name: string;
  input: unknown;
  expectedShape: Record<string, unknown>;
}
interface EvalResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: unknown;
}
interface EvalSummary {
  total: number;
  passed: number;
  failed: number;
  details: EvalResult[];
}
/**
 * Load evaluation cases from filesystem
 */
function loadEvalCases(): EvalCase[] {
  const cases: EvalCase[] = [];
  try {
    // Incident Triage Case
    const incidentInput = JSON.parse(
      readFileSync(join(__dirname, '../evals/cases/incident_triage/input.json'), 'utf8')
    );
    const incidentShape = JSON.parse(
      readFileSync(join(__dirname, '../evals/cases/incident_triage/expected.shape.json'), 'utf8')
    );
    cases.push({
      name: 'incident_triage',
      input: incidentInput,
      expectedShape: incidentShape
    });
    // Spec Writer Case
    const specInput = readFileSync(
      join(__dirname, '../evals/cases/spec_writer/input.md'), 'utf8')
    const specShape = JSON.parse(
      readFileSync(join(__dirname, '../evals/cases/spec_writer/expected.shape.json'), 'utf8')
    );
    cases.push({
      name: 'spec_writer',
      input: specInput,
      expectedShape: specShape
    });
  } catch (error) {
    console.error('Failed to load eval cases:', error);
    process.exit(1);
  }
  return cases;
}
/**
 * Validate response against expected shape
 */
function validateShape(response: unknown, expectedShape: Record<string, unknown>): boolean {
  if (typeof response !== 'object' || response === null) {
    return false;
  }
  const responseObj = response as Record<string, unknown>;
  for (const [key, expectedType] of Object.entries(expectedShape)) {
    if (!(key in responseObj)) {
      return false;
    }
    const value = responseObj[key];
    if (expectedType === 'string' && typeof value !== 'string') {
      return false;
    }
    if (Array.isArray(expectedType) && !Array.isArray(value)) {
      return false;
    }
  }
  return true;
}
/**
 * Run evaluation for a single case
 */
async function runEvalCase(evalCase: EvalCase): Promise<EvalResult> {
  try {
    const result = await run(evalCase.name, evalCase.input);
    if (!result.success) {
      return {
        name: evalCase.name,
        passed: false,
        error: result.error ?? 'Task execution failed'
      };
    }
    const isValidShape = validateShape(result.data, evalCase.expectedShape);
    return {
      name: evalCase.name,
      passed: isValidShape,
      response: result.data,
      error: isValidShape ? undefined : 'Response shape validation failed'
    };
  } catch (error) {
    return {
      name: evalCase.name,
      passed: false,
      error: error instanceof Error ? error.message : 'Unexpected error'
    };
  }
}
/**
 * Main evaluation runner
 */
async function main(): Promise<void> {
  console.log('🤖 Starting AI Evaluation...');
  console.log(`Provider: ${process.env.OPENAI_API_KEY ? 'OpenAI' : 'Mock (offline)'}`);
  console.log('');
  const cases = loadEvalCases();
  const results: EvalResult[] = [];
  for (const evalCase of cases) {
    console.log(`Running: ${evalCase.name}...`);
    const result = await runEvalCase(evalCase);
    results.push(result);
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status}: ${evalCase.name}`);
    if (!result.passed && result.error) {
      console.log(`    Error: ${result.error}`);
    }
  }
  // Generate summary
  const summary: EvalSummary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    details: results
  };
  console.log('');
  console.log('📊 Evaluation Summary:');
  console.log(`Total: ${summary.total}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  // Output JSON for CI consumption
  console.log(JSON.stringify(summary));
  // Exit with failure if any tests failed
  if (summary.failed > 0) {
    process.exit(1);
  }
}
// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Evaluation failed:', error);
    process.exit(1);
  });
}

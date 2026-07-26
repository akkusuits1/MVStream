process.env.ESLINT_USE_FLAT_CONFIG = 'true';

// Load our config manually
const configFile = await import('./eslint.config.js');
const flatConfig = configFile.default;

const { ESLint } = await import('eslint');

const eslint = new ESLint({
  errorOnUnmatchedPattern: false,
  overrideConfig: flatConfig,
});

const results = await eslint.lintFiles(['src/']);

console.log('Files linted:', results.length);
let errorCount = 0, warningCount = 0;

for (const r of results) {
  errorCount += r.errorCount;
  warningCount += r.warningCount;
  for (const m of r.messages) {
    console.log(`${r.filePath}:${m.line||0}:${m.column||0}  ${m.severity === 2 ? 'ERR' : 'WARN'}  ${m.message}  ${m.ruleId || ''}`);
  }
}

console.log(`Errors: ${errorCount}, Warnings: ${warningCount}`);

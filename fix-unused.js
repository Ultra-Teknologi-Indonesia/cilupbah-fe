import fs from 'fs';

const results = JSON.parse(fs.readFileSync('lint_results2.json', 'utf8'));

for (const result of results) {
  const unusedVars = result.messages.filter(m => m.ruleId === '@typescript-eslint/no-unused-vars');
  if (unusedVars.length === 0) continue;

  let content = fs.readFileSync(result.filePath, 'utf8');
  let lines = content.split('\n');
  
  // To avoid modifying lines multiple times incorrectly, we do it carefully or reverse order.
  // Actually, replacing variable names requires AST or regex.
  // We can just use the provided message string which contains the variable name.
  // Example message: "'excludeTransit' is assigned a value but never used."
  // It's safer to just regex replace the specific word in the specific line, but only for full word matches.
  
  // Let's sort descending by line/column to modify from bottom up
  unusedVars.sort((a, b) => b.line - a.line || b.column - a.column);
  
  for (const v of unusedVars) {
    const match = v.message.match(/'([^']+)' is/);
    if (match) {
      const varName = match[1];
      const lineIdx = v.line - 1;
      
      // We will replace the occurrence of the varName at or after the column with `_${varName}`
      // Note: ESLint column is 1-indexed.
      const colIdx = v.column - 1;
      
      const lineStr = lines[lineIdx];
      // We check if the word is exactly at the column
      const regex = new RegExp(`\\b${varName}\\b`);
      const searchStr = lineStr.substring(colIdx);
      const replacedStr = searchStr.replace(regex, `_${varName}`);
      
      lines[lineIdx] = lineStr.substring(0, colIdx) + replacedStr;
    }
  }
  
  fs.writeFileSync(result.filePath, lines.join('\n'));
}

console.log("Done");

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function stripComments(code) {
  // 1. Hapus JSX comments: {/* ... */}
  let res = code.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');

  // 2. State machine parser untuk hapus // dan /* */ dengan aman (melewati string)
  let out = '';
  let state = 'NORMAL';
  let i = 0;
  
  while (i < res.length) {
    if (state === 'NORMAL') {
      if (res[i] === '/' && res[i + 1] === '/') {
        state = 'LINE_COMMENT';
        i += 2;
      } else if (res[i] === '/' && res[i + 1] === '*') {
        state = 'BLOCK_COMMENT';
        i += 2;
      } else if (res[i] === '"') {
        state = 'DOUBLE_QUOTE';
        out += res[i];
        i++;
      } else if (res[i] === "'") {
        state = 'SINGLE_QUOTE';
        out += res[i];
        i++;
      } else if (res[i] === '`') {
        state = 'BACKTICK';
        out += res[i];
        i++;
      } else {
        out += res[i];
        i++;
      }
    } else if (state === 'LINE_COMMENT') {
      if (res[i] === '\n') {
        state = 'NORMAL';
        out += res[i]; // Keep the newline
      }
      i++;
    } else if (state === 'BLOCK_COMMENT') {
      if (res[i] === '*' && res[i + 1] === '/') {
        state = 'NORMAL';
        i += 2;
      } else {
        i++;
      }
    } else if (state === 'DOUBLE_QUOTE') {
      if (res[i] === '\\') {
        out += res[i] + (res[i + 1] || '');
        i += 2;
      } else if (res[i] === '"') {
        state = 'NORMAL';
        out += res[i];
        i++;
      } else {
        out += res[i];
        i++;
      }
    } else if (state === 'SINGLE_QUOTE') {
      if (res[i] === '\\') {
        out += res[i] + (res[i + 1] || '');
        i += 2;
      } else if (res[i] === "'") {
        state = 'NORMAL';
        out += res[i];
        i++;
      } else {
        out += res[i];
        i++;
      }
    } else if (state === 'BACKTICK') {
      if (res[i] === '\\') {
        out += res[i] + (res[i + 1] || '');
        i += 2;
      } else if (res[i] === '`') {
        state = 'NORMAL';
        out += res[i];
        i++;
      } else {
        out += res[i];
        i++;
      }
    }
  }

  // 3. Bersihkan baris kosong yang berlebihan
  out = out.replace(/^[ \t]+$/gm, '');
  out = out.replace(/\n{3,}/g, '\n\n');
  
  return out;
}

const isDryRun = process.argv.includes('--dry');
const files = findFiles(srcDir, /\.(ts|tsx|js|jsx)$/);

let totalFiles = 0;
let totalLinesRemoved = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf-8');
  const stripped = stripComments(original);

  if (original !== stripped) {
    const originalLines = (original.match(/\n/g) || []).length;
    const newLines = (stripped.match(/\n/g) || []).length;
    const removed = Math.max(0, originalLines - newLines);

    const relativePath = path.relative(process.cwd(), file);

    if (isDryRun) {
      console.log(`  [DRY] ${relativePath} (-${removed} lines)`);
    } else {
      fs.writeFileSync(file, stripped);
      console.log(`  ✓ ${relativePath} (-${removed} lines)`);
    }

    totalFiles++;
    totalLinesRemoved += removed;
  }
}

console.log(`\n${isDryRun ? '[DRY-RUN] ' : ''}${totalFiles} files modified, ~${totalLinesRemoved} lines of comments removed.`);

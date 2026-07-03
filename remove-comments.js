const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const DIRECTIVE_REGEX = /eslint-disable|@ts-|@eslint|prettier-ignore|use (client|server)/i;

function stripComments(content, filename) {
    let ast;
    try {
        ast = parser.parse(content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx', 'decorators-legacy'],
            tokens: false
        });
    } catch (e) {
        console.error(`Babel parse error in ${filename}:`, e.message);
        return content;
    }
    
    const comments = ast.comments;
    if (!comments || comments.length === 0) return content;
    
    // Sort comments descending by start position to not mess up indices when slicing
    comments.sort((a, b) => b.start - a.start);
    
    let newContent = content;
    for (const comment of comments) {
        if (!DIRECTIVE_REGEX.test(comment.value)) {
            newContent = newContent.slice(0, comment.start) + newContent.slice(comment.end);
        }
    }
    
    return newContent;
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (['node_modules', '.next', 'build', 'dist', '.git'].includes(file)) continue;
            processDir(fullPath);
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const newContent = stripComments(content, fullPath);
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Comments removed cleanly via Babel parser.');

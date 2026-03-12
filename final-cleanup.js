import fs from 'fs';
import path from 'path';

const uiDir = '/Users/huynhnhu/Documents/GitHub/threads-treasure-market/src/components/ui';

function removeForwardRefTypes(text) {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    // Find React.forwardRef
    if (text.substring(i, i + 16) === 'React.forwardRef') {
      result += 'React.forwardRef';
      i += 16;
      
      // Check what comes next
      if (text[i] === '<') {
        // We need to find the matching >
        let depth = 0;
        let inString = false;
        let stringChar = null;
        
        while (i < text.length) {
          const char = text[i];
          
          // Track string state
          if ((char === '"' || char === "'" || char === '`') && text[i-1] !== '\\') {
            if (!inString) {
              inString = true;
              stringChar = char;
            } else if (char === stringChar) {
              inString = false;
            }
          }
          
          // Only count brackets outside of strings
          if (!inString) {
            if (char === '<') depth++;
            else if (char === '>') {
              depth--;
              if (depth === 0) {
                i++; // Skip the closing >
                break;
              }
            }
          }
          
          i++;
        }
      }
    } else {
      result += text[i];
      i++;
    }
  }
  
  return result;
}

const jsxFiles = fs.readdirSync(uiDir)
  .filter(file => file.endsWith('.jsx'))
  .sort();

console.log(`Processing ${jsxFiles.length} .jsx files\n`);

jsxFiles.forEach(file => {
  try {
    const jsxPath = path.join(uiDir, file);
    let content = fs.readFileSync(jsxPath, 'utf8');
    
    // Remove React.forwardRef< ... >
    content = removeForwardRefTypes(content);
    
    // Remove 'type' keyword from imports
    content = content.replace(/import\s+{\s*type\s+/g, 'import { ');
    content = content.replace(/,\s*type\s+/g, ', ');
    
    // Remove entire type-only import lines
    content = content.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]*['"]\s*;\s*\n/g, '');
    
    // Remove export interface declarations
    content = content.replace(/export\s+interface\s+\w+[^{]*\{[\s\S]*?\n\}\s*/g, '');
    
    // Remove export type declarations  
    content = content.replace(/export\s+type\s+\w+\s*=\s*[^;]+;\s*\n/g, '');
    
    // Clean up multiple blank lines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    fs.writeFileSync(jsxPath, content, 'utf8');
    console.log(`✓ Processed: ${file}`);
  } catch (error) {
    console.error(`✗ Error with ${file}: ${error.message}`);
  }
});

console.log(`\nAll files processed!`);

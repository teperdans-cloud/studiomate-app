#!/usr/bin/env node

/**
 * Overlay Guard Script
 * 
 * Prevents regressions that make UI look dark by detecting black overlays
 * in source code before they reach production.
 * 
 * Usage: node scripts/check-overlays.js
 * Exit codes: 0 = success, 1 = dark overlays found
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Patterns that indicate dark overlays
const DARK_OVERLAY_PATTERNS = [
  // Black overlays with opacity
  /fixed\s+inset-0.*bg-black\/\d{1,2}/,
  /bg-black\/\[\d+%\]/,
  /bg-black\/\d{1,2}/,
  
  // Dark neutral overlays  
  /fixed\s+inset-0.*bg-neutral-900\/\d{1,2}/,
  /bg-neutral-900\/\d{1,2}/,
  
  // Gray-900 overlays
  /fixed\s+inset-0.*bg-gray-900\/\d{1,2}/,
  /bg-gray-900\/\d{1,2}/,
  
  // Zinc/Stone dark overlays
  /bg-zinc-900\/\d{1,2}/,
  /bg-stone-900\/\d{1,2}/
];

async function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  lines.forEach((line, index) => {
    DARK_OVERLAY_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          content: line.trim(),
          pattern: pattern.toString()
        });
      }
    });
  });

  return violations;
}

async function main() {
  console.log('🔍 Checking for dark overlay regressions...\n');

  try {
    // Find all relevant source files
    const files = await glob('src/**/*.{ts,tsx,js,jsx}', { 
      cwd: process.cwd(),
      absolute: true 
    });

    let totalViolations = [];

    for (const file of files) {
      const violations = await checkFile(file);
      totalViolations = totalViolations.concat(violations);
    }

    if (totalViolations.length === 0) {
      console.log('✅ No dark overlays found. UI will maintain light theme.');
      process.exit(0);
    }

    // Report violations
    console.error('❌ Dark overlays detected:');
    console.error('These will make the UI appear dark and should use overlay-frost instead.\n');

    totalViolations.forEach(violation => {
      console.error(`📁 ${path.relative(process.cwd(), violation.file)}:${violation.line}`);
      console.error(`   ${violation.content}`);
      console.error(`   Pattern: ${violation.pattern}\n`);
    });

    console.error('🔧 Fix: Replace with overlay-frost utility class:');
    console.error('   Before: className="fixed inset-0 bg-black/50"');
    console.error('   After:  className="overlay-frost"\n');

    process.exit(1);

  } catch (error) {
    console.error('💥 Error checking overlays:', error.message);
    process.exit(1);
  }
}

main();
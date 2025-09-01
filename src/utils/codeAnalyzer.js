/**
 * Code Analyzer utility for Ian Agent
 */

import path from 'path';
import fs from 'fs-extra';

export class CodeAnalyzer {
  constructor() {
    this.languagePatterns = {
      javascript: {
        extensions: ['.js', '.jsx', '.mjs'],
        patterns: {
          functions: /function\s+(\w+)\s*\(/g,
          classes: /class\s+(\w+)/g,
          imports: /import\s+.*from\s+['"`]([^'"`]+)['"`]/g,
          exports: /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g
        }
      },
      typescript: {
        extensions: ['.ts', '.tsx'],
        patterns: {
          functions: /function\s+(\w+)\s*\(/g,
          classes: /class\s+(\w+)/g,
          interfaces: /interface\s+(\w+)/g,
          types: /type\s+(\w+)/g,
          imports: /import\s+.*from\s+['"`]([^'"`]+)['"`]/g
        }
      },
      python: {
        extensions: ['.py'],
        patterns: {
          functions: /def\s+(\w+)\s*\(/g,
          classes: /class\s+(\w+)/g,
          imports: /(?:from\s+(\w+)\s+)?import\s+(\w+)/g
        }
      },
      java: {
        extensions: ['.java'],
        patterns: {
          classes: /(?:public\s+)?class\s+(\w+)/g,
          methods: /(?:public|private|protected)\s+(?:static\s+)?(?:\w+\s+)+(\w+)\s*\(/g,
          imports: /import\s+([\w.]+);/g
        }
      },
      cpp: {
        extensions: ['.cpp', '.c', '.h', '.hpp'],
        patterns: {
          functions: /(?:\w+\s+)+(\w+)\s*\([^)]*\)\s*{/g,
          classes: /class\s+(\w+)/g,
          includes: /#include\s+[<"]([^>"]+)[>"]/g
        }
      }
    };
  }

  /**
   * Analyze project files
   */
  async analyzeProject(files) {
    const analysis = {
      overview: {
        totalFiles: files.length,
        totalLines: 0,
        languages: {},
        fileTypes: {}
      },
      structure: {
        directories: new Set(),
        dependencies: new Set(),
        exports: new Set(),
        functions: new Set(),
        classes: new Set()
      },
      complexity: {
        averageFileSize: 0,
        largestFiles: [],
        complexity: 'low'
      },
      issues: [],
      recommendations: []
    };

    for (const file of files) {
      try {
        const fileAnalysis = await this.analyzeFile(file);
        this.mergeAnalysis(analysis, fileAnalysis);
      } catch (error) {
        analysis.issues.push({
          type: 'analysis_error',
          file: file.path,
          message: error.message
        });
      }
    }

    this.calculateMetrics(analysis);
    this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze individual file
   */
  async analyzeFile(file) {
    const content = await fs.readFile(file.fullPath, 'utf8');
    const extension = path.extname(file.fullPath);
    const language = this.detectLanguage(extension);
    
    const analysis = {
      file: file.path,
      language,
      lines: content.split('\n').length,
      size: content.length,
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      complexity: this.calculateFileComplexity(content),
      issues: []
    };

    if (language && this.languagePatterns[language]) {
      const patterns = this.languagePatterns[language].patterns;
      
      // Extract functions
      if (patterns.functions) {
        const matches = [...content.matchAll(patterns.functions)];
        analysis.functions = matches.map(match => match[1]);
      }

      // Extract classes
      if (patterns.classes) {
        const matches = [...content.matchAll(patterns.classes)];
        analysis.classes = matches.map(match => match[1]);
      }

      // Extract imports
      if (patterns.imports) {
        const matches = [...content.matchAll(patterns.imports)];
        analysis.imports = matches.map(match => match[1] || match[2]);
      }

      // Extract exports
      if (patterns.exports) {
        const matches = [...content.matchAll(patterns.exports)];
        analysis.exports = matches.map(match => match[1]);
      }

      // Language-specific analysis
      this.analyzeLanguageSpecific(content, language, analysis);
    }

    return analysis;
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(extension) {
    for (const [language, config] of Object.entries(this.languagePatterns)) {
      if (config.extensions.includes(extension)) {
        return language;
      }
    }
    return 'unknown';
  }

  /**
   * Calculate file complexity
   */
  calculateFileComplexity(content) {
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    // Simple complexity metrics
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const nestingDepth = this.calculateNestingDepth(content);
    const functionCount = (content.match(/function\s+\w+|def\s+\w+|public\s+\w+\s+\w+\s*\(/g) || []).length;
    
    let complexity = 'low';
    if (cyclomaticComplexity > 10 || nestingDepth > 4 || functionCount > 20) {
      complexity = 'high';
    } else if (cyclomaticComplexity > 5 || nestingDepth > 2 || functionCount > 10) {
      complexity = 'medium';
    }

    return {
      cyclomatic: cyclomaticComplexity,
      nesting: nestingDepth,
      functions: functionCount,
      level: complexity,
      linesOfCode: nonEmptyLines.length
    };
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateCyclomaticComplexity(content) {
    const complexityKeywords = [
      'if', 'else', 'elif', 'while', 'for', 'switch', 'case',
      'catch', 'finally', '&&', '||', '?', 'and', 'or'
    ];
    
    let complexity = 1; // Base complexity
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  /**
   * Calculate nesting depth
   */
  calculateNestingDepth(content) {
    const lines = content.split('\n');
    let maxDepth = 0;
    let currentDepth = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Count opening braces/blocks
      const openBraces = (trimmed.match(/[{(\[]/g) || []).length;
      const closeBraces = (trimmed.match(/[})\]]/g) || []).length;
      
      currentDepth += openBraces - closeBraces;
      maxDepth = Math.max(maxDepth, currentDepth);
    });
    
    return maxDepth;
  }

  /**
   * Language-specific analysis
   */
  analyzeLanguageSpecific(content, language, analysis) {
    switch (language) {
      case 'javascript':
      case 'typescript':
        this.analyzeJavaScript(content, analysis);
        break;
      case 'python':
        this.analyzePython(content, analysis);
        break;
      case 'java':
        this.analyzeJava(content, analysis);
        break;
    }
  }

  /**
   * Analyze JavaScript/TypeScript specific patterns
   */
  analyzeJavaScript(content, analysis) {
    // Check for modern JS features
    const modernFeatures = [
      { pattern: /const\s+\w+\s*=/, name: 'const declarations' },
      { pattern: /let\s+\w+\s*=/, name: 'let declarations' },
      { pattern: /=>\s*{/, name: 'arrow functions' },
      { pattern: /async\s+function|async\s+\w+\s*=>/, name: 'async functions' },
      { pattern: /await\s+/, name: 'await usage' },
      { pattern: /import\s+.*from/, name: 'ES6 imports' },
      { pattern: /export\s+(default\s+)?/, name: 'ES6 exports' }
    ];

    analysis.modernFeatures = [];
    modernFeatures.forEach(feature => {
      if (content.match(feature.pattern)) {
        analysis.modernFeatures.push(feature.name);
      }
    });

    // Check for potential issues
    if (content.includes('var ')) {
      analysis.issues.push({
        type: 'style',
        message: 'Consider using const/let instead of var'
      });
    }

    if (content.includes('eval(')) {
      analysis.issues.push({
        type: 'security',
        message: 'Avoid using eval() for security reasons'
      });
    }
  }

  /**
   * Analyze Python specific patterns
   */
  analyzePython(content, analysis) {
    // Check for Python best practices
    const lines = content.split('\n');
    
    // Check for proper imports
    const importLines = lines.filter(line => line.trim().startsWith('import') || line.trim().startsWith('from'));
    if (importLines.length > 0) {
      analysis.importStyle = 'present';
    }

    // Check for docstrings
    const docstringPattern = /"""[\s\S]*?"""|'''[\s\S]*?'''/g;
    const docstrings = content.match(docstringPattern);
    analysis.hasDocstrings = docstrings && docstrings.length > 0;

    // Check for type hints
    const typeHints = content.match(/:\s*\w+(\[.*?\])?\s*=/g);
    analysis.hasTypeHints = typeHints && typeHints.length > 0;
  }

  /**
   * Analyze Java specific patterns
   */
  analyzeJava(content, analysis) {
    // Check for Java patterns
    analysis.hasPackage = content.includes('package ');
    analysis.hasMain = content.includes('public static void main');
    
    // Check for design patterns
    const patterns = [
      { pattern: /class\s+\w+Factory/, name: 'Factory Pattern' },
      { pattern: /class\s+\w+Builder/, name: 'Builder Pattern' },
      { pattern: /class\s+\w+Singleton/, name: 'Singleton Pattern' }
    ];

    analysis.designPatterns = [];
    patterns.forEach(pattern => {
      if (content.match(pattern.pattern)) {
        analysis.designPatterns.push(pattern.name);
      }
    });
  }

  /**
   * Merge file analysis into project analysis
   */
  mergeAnalysis(projectAnalysis, fileAnalysis) {
    // Update overview
    projectAnalysis.overview.totalLines += fileAnalysis.lines;
    
    if (!projectAnalysis.overview.languages[fileAnalysis.language]) {
      projectAnalysis.overview.languages[fileAnalysis.language] = 0;
    }
    projectAnalysis.overview.languages[fileAnalysis.language]++;

    const extension = path.extname(fileAnalysis.file);
    if (!projectAnalysis.overview.fileTypes[extension]) {
      projectAnalysis.overview.fileTypes[extension] = 0;
    }
    projectAnalysis.overview.fileTypes[extension]++;

    // Update structure
    projectAnalysis.structure.directories.add(path.dirname(fileAnalysis.file));
    fileAnalysis.imports.forEach(imp => projectAnalysis.structure.dependencies.add(imp));
    fileAnalysis.exports.forEach(exp => projectAnalysis.structure.exports.add(exp));
    fileAnalysis.functions.forEach(func => projectAnalysis.structure.functions.add(func));
    fileAnalysis.classes.forEach(cls => projectAnalysis.structure.classes.add(cls));

    // Track large files
    if (fileAnalysis.size > 1000) { // Files larger than 1KB
      projectAnalysis.complexity.largestFiles.push({
        file: fileAnalysis.file,
        size: fileAnalysis.size,
        lines: fileAnalysis.lines,
        complexity: fileAnalysis.complexity.level
      });
    }

    // Merge issues
    projectAnalysis.issues.push(...fileAnalysis.issues.map(issue => ({
      ...issue,
      file: fileAnalysis.file
    })));
  }

  /**
   * Calculate project metrics
   */
  calculateMetrics(analysis) {
    // Calculate averages
    analysis.complexity.averageFileSize = analysis.overview.totalLines / analysis.overview.totalFiles;
    
    // Sort largest files
    analysis.complexity.largestFiles.sort((a, b) => b.size - a.size);
    analysis.complexity.largestFiles = analysis.complexity.largestFiles.slice(0, 10);

    // Determine overall complexity
    const highComplexityFiles = analysis.complexity.largestFiles.filter(f => f.complexity === 'high').length;
    if (highComplexityFiles > analysis.overview.totalFiles * 0.3) {
      analysis.complexity.complexity = 'high';
    } else if (highComplexityFiles > analysis.overview.totalFiles * 0.1) {
      analysis.complexity.complexity = 'medium';
    }

    // Convert sets to arrays
    analysis.structure.directories = Array.from(analysis.structure.directories);
    analysis.structure.dependencies = Array.from(analysis.structure.dependencies);
    analysis.structure.exports = Array.from(analysis.structure.exports);
    analysis.structure.functions = Array.from(analysis.structure.functions);
    analysis.structure.classes = Array.from(analysis.structure.classes);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(analysis) {
    // File size recommendations
    if (analysis.complexity.averageFileSize > 500) {
      analysis.recommendations.push({
        type: 'refactoring',
        priority: 'medium',
        message: 'Consider breaking down large files into smaller modules'
      });
    }

    // Complexity recommendations
    if (analysis.complexity.complexity === 'high') {
      analysis.recommendations.push({
        type: 'refactoring',
        priority: 'high',
        message: 'High code complexity detected. Consider refactoring complex functions'
      });
    }

    // Language-specific recommendations
    const jsFiles = analysis.overview.languages.javascript || 0;
    const tsFiles = analysis.overview.languages.typescript || 0;
    
    if (jsFiles > tsFiles && jsFiles > 5) {
      analysis.recommendations.push({
        type: 'modernization',
        priority: 'low',
        message: 'Consider migrating to TypeScript for better type safety'
      });
    }

    // Security recommendations
    const securityIssues = analysis.issues.filter(issue => issue.type === 'security');
    if (securityIssues.length > 0) {
      analysis.recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'Security issues detected. Review and fix immediately'
      });
    }
  }

  /**
   * Generate code quality report
   */
  generateQualityReport(analysis) {
    const report = {
      score: this.calculateQualityScore(analysis),
      summary: {
        totalFiles: analysis.overview.totalFiles,
        totalLines: analysis.overview.totalLines,
        languages: Object.keys(analysis.overview.languages).length,
        complexity: analysis.complexity.complexity
      },
      strengths: [],
      improvements: analysis.recommendations,
      metrics: {
        averageFileSize: Math.round(analysis.complexity.averageFileSize),
        functionsCount: analysis.structure.functions.length,
        classesCount: analysis.structure.classes.length,
        dependenciesCount: analysis.structure.dependencies.length
      }
    };

    // Identify strengths
    if (analysis.complexity.complexity === 'low') {
      report.strengths.push('Low code complexity');
    }
    
    if (analysis.issues.length === 0) {
      report.strengths.push('No obvious code issues detected');
    }

    if (analysis.overview.languages.typescript) {
      report.strengths.push('Uses TypeScript for type safety');
    }

    return report;
  }

  /**
   * Calculate overall quality score
   */
  calculateQualityScore(analysis) {
    let score = 100;

    // Deduct for complexity
    if (analysis.complexity.complexity === 'high') score -= 30;
    else if (analysis.complexity.complexity === 'medium') score -= 15;

    // Deduct for issues
    score -= analysis.issues.length * 5;

    // Deduct for large files
    score -= Math.min(analysis.complexity.largestFiles.length * 2, 20);

    return Math.max(score, 0);
  }
}
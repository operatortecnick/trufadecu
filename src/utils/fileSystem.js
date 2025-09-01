/**
 * File System utilities for Ian Agent
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

export class FileSystemUtils {
  constructor() {
    this.supportedCodeExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
      '.r', '.m', '.sql', '.sh', '.ps1', '.bat', '.json', '.xml', '.yaml', '.yml'
    ];
  }

  /**
   * Read file content
   */
  async readFile(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      return {
        path: fullPath,
        content,
        size: content.length,
        extension: path.extname(fullPath)
      };
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write file content
   */
  async writeFile(filePath, content) {
    try {
      const fullPath = path.resolve(filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, 'utf8');
      return {
        path: fullPath,
        size: content.length
      };
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  /**
   * List files in directory
   */
  async listFiles(dirPath, options = {}) {
    try {
      const fullPath = path.resolve(dirPath);
      const { recursive = false, extensions = null } = options;
      
      let pattern = recursive ? '**/*' : '*';
      if (extensions && Array.isArray(extensions)) {
        pattern = `**/*.{${extensions.join(',')}}`;
      }
      
      const files = await glob(pattern, {
        cwd: fullPath,
        nodir: true,
        absolute: false
      });
      
      const result = [];
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stats = await fs.stat(filePath);
        
        result.push({
          name: path.basename(file),
          path: file,
          fullPath: filePath,
          extension: path.extname(file),
          size: stats.size,
          modified: stats.mtime,
          isDirectory: false
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to list files in ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Find code files in directory
   */
  async findCodeFiles(dirPath) {
    try {
      const allFiles = await this.listFiles(dirPath, { recursive: true });
      return allFiles.filter(file => 
        this.supportedCodeExtensions.includes(file.extension)
      );
    } catch (error) {
      throw new Error(`Failed to find code files: ${error.message}`);
    }
  }

  /**
   * Get project structure
   */
  async getProjectStructure(dirPath, maxDepth = 3) {
    try {
      const structure = await this.buildDirectoryTree(dirPath, 0, maxDepth);
      return structure;
    } catch (error) {
      throw new Error(`Failed to analyze project structure: ${error.message}`);
    }
  }

  /**
   * Build directory tree
   */
  async buildDirectoryTree(dirPath, currentDepth, maxDepth) {
    if (currentDepth >= maxDepth) {
      return null;
    }

    const fullPath = path.resolve(dirPath);
    const stats = await fs.stat(fullPath);
    
    if (!stats.isDirectory()) {
      return {
        name: path.basename(fullPath),
        type: 'file',
        extension: path.extname(fullPath),
        size: stats.size
      };
    }

    const entries = await fs.readdir(fullPath);
    const children = [];
    
    for (const entry of entries) {
      // Skip hidden files and common build directories
      if (entry.startsWith('.') || ['node_modules', 'dist', 'build', '__pycache__'].includes(entry)) {
        continue;
      }
      
      const entryPath = path.join(fullPath, entry);
      try {
        const child = await this.buildDirectoryTree(entryPath, currentDepth + 1, maxDepth);
        if (child) {
          children.push(child);
        }
      } catch (error) {
        // Skip files/directories that can't be accessed
        continue;
      }
    }

    return {
      name: path.basename(fullPath),
      type: 'directory',
      children: children.sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
    };
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath) {
    try {
      const fullPath = path.resolve(dirPath);
      await fs.ensureDir(fullPath);
      return { path: fullPath };
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Delete file or directory
   */
  async delete(targetPath) {
    try {
      const fullPath = path.resolve(targetPath);
      await fs.remove(fullPath);
      return { path: fullPath };
    } catch (error) {
      throw new Error(`Failed to delete ${targetPath}: ${error.message}`);
    }
  }

  /**
   * Copy file or directory
   */
  async copy(srcPath, destPath) {
    try {
      const fullSrcPath = path.resolve(srcPath);
      const fullDestPath = path.resolve(destPath);
      await fs.copy(fullSrcPath, fullDestPath);
      return { src: fullSrcPath, dest: fullDestPath };
    } catch (error) {
      throw new Error(`Failed to copy ${srcPath} to ${destPath}: ${error.message}`);
    }
  }

  /**
   * Move file or directory
   */
  async move(srcPath, destPath) {
    try {
      const fullSrcPath = path.resolve(srcPath);
      const fullDestPath = path.resolve(destPath);
      await fs.move(fullSrcPath, fullDestPath);
      return { src: fullSrcPath, dest: fullDestPath };
    } catch (error) {
      throw new Error(`Failed to move ${srcPath} to ${destPath}: ${error.message}`);
    }
  }

  /**
   * Search for text in files
   */
  async searchInFiles(dirPath, searchTerm, options = {}) {
    try {
      const { 
        extensions = this.supportedCodeExtensions,
        caseSensitive = false,
        wholeWord = false
      } = options;
      
      const files = await this.listFiles(dirPath, { recursive: true, extensions });
      const results = [];
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file.fullPath, 'utf8');
          const lines = content.split('\n');
          
          let pattern = searchTerm;
          if (!caseSensitive) {
            pattern = new RegExp(searchTerm, 'i');
          }
          if (wholeWord) {
            pattern = new RegExp(`\\b${searchTerm}\\b`, caseSensitive ? 'g' : 'gi');
          }
          
          lines.forEach((line, index) => {
            if (line.match(pattern)) {
              results.push({
                file: file.path,
                line: index + 1,
                content: line.trim(),
                match: searchTerm
              });
            }
          });
        } catch (error) {
          // Skip binary files or files that can't be read
          continue;
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Failed to search in files: ${error.message}`);
    }
  }

  /**
   * Get file statistics
   */
  async getFileStats(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const stats = await fs.stat(fullPath);
      
      return {
        path: fullPath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        permissions: stats.mode.toString(8)
      };
    } catch (error) {
      throw new Error(`Failed to get file stats for ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check if path exists
   */
  async exists(targetPath) {
    try {
      await fs.access(path.resolve(targetPath));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file content preview
   */
  async getFilePreview(filePath, maxLines = 50) {
    try {
      const content = await this.readFile(filePath);
      const lines = content.content.split('\n');
      
      return {
        ...content,
        preview: lines.slice(0, maxLines).join('\n'),
        totalLines: lines.length,
        truncated: lines.length > maxLines
      };
    } catch (error) {
      throw new Error(`Failed to get file preview: ${error.message}`);
    }
  }

  /**
   * Watch file for changes
   */
  watchFile(filePath, callback) {
    try {
      const watcher = fs.watch(path.resolve(filePath), (eventType, filename) => {
        callback(eventType, filename);
      });
      
      return watcher;
    } catch (error) {
      throw new Error(`Failed to watch file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get disk usage for directory
   */
  async getDiskUsage(dirPath) {
    try {
      const files = await this.listFiles(dirPath, { recursive: true });
      let totalSize = 0;
      const fileTypes = {};
      
      files.forEach(file => {
        totalSize += file.size;
        const ext = file.extension || 'no extension';
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      });
      
      return {
        totalFiles: files.length,
        totalSize,
        fileTypes,
        averageFileSize: totalSize / files.length || 0
      };
    } catch (error) {
      throw new Error(`Failed to calculate disk usage: ${error.message}`);
    }
  }
}
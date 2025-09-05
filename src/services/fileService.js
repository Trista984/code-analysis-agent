const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const CODE_EXTENSIONS = [
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.cpp', '.c', '.go', 
    '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml',
    '.vue', '.svelte', '.html', '.css', '.scss', '.less', '.sql', '.graphql',
    '.json', '.yaml', '.yml', '.toml', '.xml', '.md', '.dockerfile', '.sh'
];

const IGNORE_PATTERNS = [
    'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'target',
    '__pycache__', '.pytest_cache', 'coverage', '.coverage', 'vendor',
    '.idea', '.vscode', '.DS_Store', 'thumbs.db', '*.log', '*.tmp'
];

class FileService {
    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
        this.tempDir = process.env.TEMP_DIR || 'temp';
        this.ensureDirectories();
    }

    async ensureDirectories() {
        await fs.ensureDir(this.uploadDir);
        await fs.ensureDir(this.tempDir);
    }

    async extractZip(zipFilePath) {
        try {
            const zip = new AdmZip(zipFilePath);
            const extractPath = path.join(this.tempDir, `extracted-${uuidv4()}`);
            
            await fs.ensureDir(extractPath);
            zip.extractAllTo(extractPath, true);
            
            return extractPath;
        } catch (error) {
            throw new Error(`ZIP文件解压失败: ${error.message}`);
        }
    }

    async analyzeCodeStructure(rootPath) {
        const structure = {
            root_path: rootPath,
            files: [],
            directories: [],
            package_files: [],
            config_files: [],
            total_files: 0,
            total_lines: 0,
            file_types: {},
            summary: {}
        };

        await this.walkDirectory(rootPath, structure, rootPath);
        structure.summary = this.generateSummary(structure);
        
        return structure;
    }

    async walkDirectory(dirPath, structure, rootPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                const relativePath = path.relative(rootPath, fullPath);
                
                if (this.shouldIgnore(entry.name, relativePath)) {
                    continue;
                }
                
                if (entry.isDirectory()) {
                    structure.directories.push(relativePath);
                    await this.walkDirectory(fullPath, structure, rootPath);
                } else if (entry.isFile()) {
                    await this.processFile(fullPath, relativePath, structure);
                }
            }
        } catch (error) {
            console.warn(`无法读取目录 ${dirPath}:`, error.message);
        }
    }

    async processFile(fullPath, relativePath, structure) {
        try {
            const ext = path.extname(relativePath).toLowerCase();
            const fileName = path.basename(relativePath);
            
            structure.total_files++;
            
            if (!structure.file_types[ext]) {
                structure.file_types[ext] = 0;
            }
            structure.file_types[ext]++;
            
            if (['package.json', 'requirements.txt', 'pom.xml', 'build.gradle', 'Cargo.toml'].includes(fileName)) {
                structure.package_files.push(relativePath);
            }
            
            if (['dockerfile', '.env', 'docker-compose.yml', 'webpack.config.js', 'tsconfig.json'].some(pattern => 
                fileName.toLowerCase().includes(pattern.toLowerCase()))) {
                structure.config_files.push(relativePath);
            }
            
            if (CODE_EXTENSIONS.includes(ext) || this.isCodeFile(fileName)) {
                const content = await fs.readFile(fullPath, 'utf8');
                const lines = content.split('\n').length;
                
                structure.files.push({
                    path: relativePath,
                    name: fileName,
                    extension: ext,
                    size: content.length,
                    lines: lines,
                    content: content.substring(0, 10000)
                });
                
                structure.total_lines += lines;
            }
        } catch (error) {
            console.warn(`无法处理文件 ${fullPath}:`, error.message);
        }
    }

    shouldIgnore(name, relativePath) {
        return IGNORE_PATTERNS.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(name);
            }
            return name === pattern || relativePath.includes(pattern);
        });
    }

    isCodeFile(fileName) {
        const codeFileNames = [
            'dockerfile', 'makefile', 'rakefile', 'gemfile', 'requirements.txt',
            'setup.py', 'main.py', 'app.py', 'index.js', 'server.js', 'main.js'
        ];
        return codeFileNames.includes(fileName.toLowerCase());
    }

    generateSummary(structure) {
        const topExtensions = Object.entries(structure.file_types)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([ext, count]) => ({ extension: ext, count }));

        const topFiles = structure.files
            .sort((a, b) => b.lines - a.lines)
            .slice(0, 10)
            .map(file => ({
                path: file.path,
                lines: file.lines,
                size: file.size
            }));

        return {
            total_files: structure.total_files,
            total_lines: structure.total_lines,
            top_extensions: topExtensions,
            top_files: topFiles,
            has_package_files: structure.package_files.length > 0,
            has_config_files: structure.config_files.length > 0
        };
    }

    async cleanup(dirPath) {
        try {
            await fs.remove(dirPath);
        } catch (error) {
            console.warn(`无法删除目录 ${dirPath}:`, error.message);
        }
    }

    async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            throw new Error(`无法读取文件 ${filePath}: ${error.message}`);
        }
    }

    formatStructureForLLM(structure) {
        let result = `项目根目录: ${structure.root_path}\n`;
        result += `总文件数: ${structure.total_files}\n`;
        result += `总代码行数: ${structure.total_lines}\n\n`;

        result += `文件类型分布:\n`;
        Object.entries(structure.file_types)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([ext, count]) => {
                result += `  ${ext}: ${count} 个文件\n`;
            });

        result += `\n主要代码文件:\n`;
        structure.files
            .sort((a, b) => b.lines - a.lines)
            .slice(0, 20)
            .forEach(file => {
                result += `  ${file.path} (${file.lines} 行, ${file.size} 字符)\n`;
            });

        if (structure.config_files.length > 0) {
            result += `\n配置文件:\n`;
            structure.config_files.forEach(file => {
                result += `  ${file}\n`;
            });
        }

        return result;
    }
}

module.exports = FileService;
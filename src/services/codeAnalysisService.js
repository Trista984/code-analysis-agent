const FileService = require('./fileService');
const LLMClient = require('../utils/llmClient');

class CodeAnalysisService {
    constructor() {
        this.fileService = new FileService();
        this.llmClient = new LLMClient();
    }

    async analyzeCode(problemDescription, zipFilePath, includeVerification = false) {
        let extractedPath = null;
        
        try {
            console.log('正在解压ZIP文件...');
            extractedPath = await this.fileService.extractZip(zipFilePath);
            
            console.log('正在分析代码结构...');
            const codeStructure = await this.fileService.analyzeCodeStructure(extractedPath);
            
            const formattedStructure = this.fileService.formatStructureForLLM(codeStructure);
            const keyFileContents = this.prepareKeyFileContents(codeStructure);
            
            console.log('正在使用AI分析代码...');
            const analysisResult = await this.llmClient.analyzeCode(
                problemDescription,
                formattedStructure,
                keyFileContents
            );
            
            const report = {
                feature_analysis: analysisResult.feature_analysis || [],
                execution_plan_suggestion: analysisResult.execution_plan_suggestion || '',
                code_structure_summary: codeStructure.summary,
                analysis_metadata: {
                    total_files_analyzed: codeStructure.total_files,
                    total_lines_analyzed: codeStructure.total_lines,
                    analysis_timestamp: new Date().toISOString(),
                    model_used: 'intelligent-analysis'
                }
            };
            
            if (includeVerification) {
                console.log('正在生成功能验证测试...');
                try {
                    const verificationResult = await this.llmClient.generateFunctionalVerification(
                        analysisResult.feature_analysis,
                        formattedStructure
                    );
                    
                    report.functional_verification = verificationResult;
                } catch (error) {
                    console.warn('功能验证生成失败:', error.message);
                    report.functional_verification = {
                        error: error.message,
                        generated_test_code: '',
                        execution_result: {
                            tests_passed: false,
                            log: '验证生成失败'
                        }
                    };
                }
            }
            
            return report;
            
        } catch (error) {
            console.error('代码分析失败:', error);
            throw new Error(`代码分析失败: ${error.message}`);
        } finally {
            if (extractedPath) {
                await this.fileService.cleanup(extractedPath);
            }
        }
    }

    prepareKeyFileContents(codeStructure) {
        let contents = '';
        
        if (codeStructure.package_files.length > 0) {
            contents += '=== 配置文件 ===\n';
            codeStructure.package_files.forEach(file => {
                const fileInfo = codeStructure.files.find(f => f.path === file);
                if (fileInfo) {
                    contents += `\n文件: ${file}\n`;
                    contents += fileInfo.content + '\n';
                }
            });
        }
        
        contents += '\n=== 主要代码文件 ===\n';
        const mainFiles = codeStructure.files
            .filter(file => file.lines > 10)
            .sort((a, b) => b.lines - a.lines)
            .slice(0, 15);
        
        mainFiles.forEach(file => {
            contents += `\n文件: ${file.path}\n`;
            contents += `行数: ${file.lines}\n`;
            contents += '内容:\n';
            contents += file.content + '\n';
            contents += '---\n';
        });
        
        return contents;
    }
}

module.exports = CodeAnalysisService;
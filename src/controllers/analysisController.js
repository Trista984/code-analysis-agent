const CodeAnalysisService = require('../services/codeAnalysisService');

class AnalysisController {
    constructor() {
        this.codeAnalysisService = new CodeAnalysisService();
    }

    async analyzeCode(req, res) {
        try {
            const validation = this.validateRequest(req);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: '请求参数验证失败',
                    details: validation.errors
                });
            }

            const { problem_description, include_verification } = req.body;
            const codeZipFile = req.file;
            const includeVerification = include_verification === 'true' || 
                                      req.body.include_verification === true;

            console.log('开始代码分析...');
            console.log('问题描述:', problem_description);
            console.log('文件大小:', codeZipFile.size, 'bytes');
            console.log('包含验证:', includeVerification);

            const analysisResult = await this.codeAnalysisService.analyzeCode(
                problem_description,
                codeZipFile.path,
                includeVerification
            );

            const reportSummary = this.generateReportSummary(analysisResult);

            const response = {
                success: true,
                data: analysisResult,
                summary: reportSummary,
                timestamp: new Date().toISOString()
            };

            console.log('代码分析完成');
            console.log('分析质量分数:', reportSummary.analysis_quality_score);

            res.status(200).json(response);

        } catch (error) {
            console.error('分析请求处理错误:', error);
            res.status(500).json({
                success: false,
                error: '代码分析失败',
                message: error.message
            });
        }
    }

    async healthCheck(req, res) {
        try {
            const healthStatus = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                environment: process.env.NODE_ENV || 'development'
            };

            res.status(200).json(healthStatus);
        } catch (error) {
            console.error('健康检查失败:', error);
            res.status(500).json({
                status: 'unhealthy',
                error: error.message
            });
        }
    }

    async getApiInfo(req, res) {
        const apiInfo = {
            name: '代码分析助手',
            version: '1.0.0',
            description: '基于AI的代码分析工具，能够分析代码仓库并生成结构化的功能定位报告',
            endpoints: {
                'POST /api/analyze': {
                    description: '分析代码并生成功能定位报告',
                    parameters: {
                        problem_description: 'string (form field) - 项目功能描述',
                        code_zip: 'file (multipart) - 项目源代码ZIP文件',
                        include_verification: 'boolean (optional) - 是否包含功能验证'
                    },
                    response: {
                        success: 'boolean',
                        data: 'Object - 分析结果',
                        summary: 'Object - 报告摘要',
                        validation: 'Object - 验证结果'
                    }
                },
                'GET /api/health': {
                    description: '健康检查',
                    response: 'Object - 服务状态信息'
                },
                'GET /api/info': {
                    description: 'API信息',
                    response: 'Object - API详细信息'
                }
            },
            features: [
                '代码结构分析',
                '功能定位报告',
                '执行计划建议',
                '功能验证测试生成',
                '多语言支持',
                'Docker部署支持'
            ],
            requirements: {
                'OpenAI API Key': '必需的环境变量',
                'Node.js': '>=18.0.0',
                'Memory': '>=512MB',
                'Storage': '>=100MB'
            }
        };

        res.status(200).json(apiInfo);
    }

    validateRequest(req) {
        const validation = {
            isValid: true,
            errors: []
        };

        if (!req.body.problem_description) {
            validation.isValid = false;
            validation.errors.push('缺少problem_description参数');
        } else if (typeof req.body.problem_description !== 'string') {
            validation.isValid = false;
            validation.errors.push('problem_description必须是字符串类型');
        } else if (req.body.problem_description.trim().length < 10) {
            validation.isValid = false;
            validation.errors.push('problem_description长度至少需要10个字符');
        }

        if (!req.file) {
            validation.isValid = false;
            validation.errors.push('缺少code_zip文件');
        } else {
            const maxSize = 50 * 1024 * 1024;
            if (req.file.size > maxSize) {
                validation.isValid = false;
                validation.errors.push('文件大小不能超过50MB');
            }
        }

        return validation;
    }

    async handleNotFound(req, res) {
        res.status(404).json({
            success: false,
            error: 'API端点不存在',
            available_endpoints: [
                'POST /api/analyze - 代码分析',
                'GET /api/health - 健康检查',
                'GET /api/info - API信息'
            ],
            timestamp: new Date().toISOString()
        });
    }

    generateReportSummary(analysisResult) {
        const totalFeatures = analysisResult.feature_analysis?.length || 0;
        const hasVerification = !!analysisResult.functional_verification;
        const hasExecutionPlan = !!analysisResult.execution_plan_suggestion;
        
        let qualityScore = 60;
        
        if (totalFeatures > 0) qualityScore += 20;
        if (hasVerification) qualityScore += 10;
        if (hasExecutionPlan) qualityScore += 10;
        
        return {
            total_features_analyzed: totalFeatures,
            analysis_quality_score: Math.min(qualityScore, 100),
            has_functional_verification: hasVerification,
            has_execution_plan: hasExecutionPlan,
            analysis_timestamp: new Date().toISOString()
        };
    }
}

module.exports = AnalysisController;
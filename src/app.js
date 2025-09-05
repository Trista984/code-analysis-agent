const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const AnalysisController = require('./controllers/analysisController');

class App {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.controller = new AnalysisController();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandlers();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' ? false : true,
            credentials: true
        }));

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
        this.app.use('/', express.static(path.join(__dirname, '../public')));

        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
const storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                const uploadDir = path.join(__dirname, '../uploads');
                await fs.ensureDir(uploadDir);
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const timestamp = Date.now();
                const random = Math.round(Math.random() * 1E9);
                cb(null, `code-${timestamp}-${random}.zip`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
                fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024,
                files: 1
            }
        });

        this.app.post('/api/analyze', upload.single('code_zip'), async (req, res) => {
            try {
                await this.controller.analyzeCode(req, res);
            } catch (error) {
                console.error('分析请求出错:', error);
                res.status(500).json({
                    success: false,
                    error: '服务器内部错误',
                    message: error.message
                });
            }
        });

        this.app.get('/api/health', async (req, res) => {
            try {
                await this.controller.healthCheck(req, res);
            } catch (error) {
                console.error('健康检查出错:', error);
                res.status(500).json({
                    status: 'unhealthy',
                    error: error.message
                });
            }
        });

        this.app.get('/api/info', async (req, res) => {
            try {
                await this.controller.getApiInfo(req, res);
            } catch (error) {
                console.error('API信息获取出错:', error);
                res.status(500).json({
                    success: false,
                    error: '获取API信息失败'
                });
            }
        });

        this.app.get('/', (req, res) => {
            res.json({
                name: '代码分析API',
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    analyze: 'POST /api/analyze',
                    health: 'GET /api/health',
                    info: 'GET /api/info'
                }
            });
        });

        this.app.use('*', (req, res) => {
            this.controller.handleNotFound(req, res);
        });
    }

    setupErrorHandlers() {
        this.app.use((error, req, res, next) => {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        error: '文件大小超过限制',
                        details: '文件大小不能超过50MB'
                    });
                }
                if (error.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        error: '文件数量超过限制',
                        details: '一次只能上传一个文件'
                    });
                }
            }

            console.error('未处理错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器内部错误',
                message: error.message
            });
        });

        this.app.use((error, req, res, next) => {
            console.error('全局错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器内部错误',
                message: process.env.NODE_ENV === 'development' ? error.message : '服务器错误'
            });
        });
    }

    async start() {
        try {
            await fs.ensureDir(path.join(__dirname, '../uploads'));
            await fs.ensureDir(path.join(__dirname, '../temp'));

            this.validateEnvironment();

            this.app.listen(this.port, () => {
                console.log(`服务器启动成功`);
                console.log(`服务地址: http://localhost:${this.port}`);
                console.log(`健康检查: http://localhost:${this.port}/api/health`);
                console.log(`API文档: http://localhost:${this.port}/api/info`);
                console.log(`启动时间: ${new Date().toISOString()}`);
                console.log(`运行环境: ${process.env.NODE_ENV || 'development'}`);
            });

        } catch (error) {
            console.error('服务器启动失败:', error);
            process.exit(1);
        }
    }

    validateEnvironment() {
        const requiredVars = ['OPENAI_API_KEY'];
        const missing = requiredVars.filter(varName => !process.env[varName]);

        if (missing.length > 0) {
            console.error('缺少环境变量:', missing.join(', '));
            console.error('请检查.env文件配置');
            process.exit(1);
        }

        console.log('环境变量验证通过');
    }

    async shutdown() {
        console.log('正在关闭服务器...');
        
        try {
            const tempDir = path.join(__dirname, '../temp');
            await fs.remove(tempDir);
            console.log('临时文件清理完成');
        } catch (error) {
            console.warn('临时文件清理失败:', error.message);
        }

        process.exit(0);
    }
}

const app = new App();
app.start();

process.on('SIGINT', () => {
    console.log('\n收到SIGINT信号，正在关闭...');
    app.shutdown();
});

process.on('SIGTERM', () => {
    console.log('\n收到SIGTERM信号，正在关闭...');
    app.shutdown();
});

process.on('uncaughtException', (error) => {
    console.error('未捕获异常:', error);
    app.shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理Promise拒绝:', reason);
    app.shutdown();
});

module.exports = app;
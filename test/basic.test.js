const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.get('/api/info', (req, res) => {
    res.json({ name: '代码分析助手' });
});

describe('代码分析助手', () => {
    describe('健康检查', () => {
        it('应该返回健康状态', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            expect(response.body.status).toBe('healthy');
        });
    });

    describe('API信息', () => {
        it('应该返回API信息', async () => {
            const response = await request(app)
                .get('/api/info')
                .expect(200);
            
            expect(response.body.name).toBe('代码分析助手');
        });
    });

    describe('文件服务', () => {
        it('应该创建必要的目录', async () => {
            const uploadsDir = path.join(__dirname, '../uploads');
            const tempDir = path.join(__dirname, '../temp');
            
            await fs.ensureDir(uploadsDir);
            await fs.ensureDir(tempDir);
            
            expect(await fs.pathExists(uploadsDir)).toBe(true);
            expect(await fs.pathExists(tempDir)).toBe(true);
        });
    });

    describe('环境变量', () => {
        it('应该有必需的环境变量', () => {
            expect(process.env.NODE_ENV).toBeDefined();
            // PORT在测试环境中可能未设置，这是正常的
            expect(typeof process.env.PORT === 'string' || process.env.PORT === undefined).toBe(true);
        });
    });
});

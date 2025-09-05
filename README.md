# 代码分析助手

一个基于AI的智能代码分析工具，能够分析代码仓库并生成结构化的功能定位报告。支持多种AI提供商，提供Web界面和API接口，适合开发者快速理解项目结构和功能实现。

## 主要功能

### 代码分析
- 自动解析代码仓库的文件结构、依赖关系和配置文件
- 基于AI技术定位关键功能的实现位置
- 提供项目运行、部署和优化的建议

### 功能验证（加分项）
- 自动生成可执行的单元测试代码
- 模拟测试执行并提供覆盖率报告
- 提供分析质量评分和改进建议

### 多平台支持
- Web界面：用户友好的图形化操作界面
- API接口：完整的RESTful API，支持集成开发
- 多语言：支持JavaScript、TypeScript、Python、Java等主流语言
- 容器化：Docker一键部署，支持云平台部署

## 技术架构

### 后端技术栈
- 运行环境：Node.js 18+ + Express.js
- AI服务：支持OpenAI、Google Gemini、Anthropic Claude、Ollama
- 文件处理：adm-zip（ZIP解压）、fs-extra（文件系统）
- 测试框架：Jest + Supertest
- 容器化：Docker + Docker Compose

### 前端技术
- 界面：原生HTML/CSS/JavaScript
- 样式：现代化响应式设计
- 交互：文件拖拽上传、实时状态反馈

### AI集成特性
- 多提供商：支持主流AI服务，避免单点依赖
- 智能回退：API失败时自动切换到智能分析模式
- 成本优化：提供免费模式，适合面试和演示场景

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- 内存 >= 512MB
- 存储 >= 100MB
- Docker（可选，推荐用于生产环境）

### 一键启动（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/Trista984/code-analysis-agent.git
cd code-analysis-agent

# 2. 安装依赖
npm install

# 3. 启动服务（使用智能分析模式，无需API密钥）
npm start

# 4. 访问Web界面
open http://localhost:3000
```

### 高级配置

如果需要使用真实的AI服务，请配置环境变量：

```bash
# 复制环境变量模板
cp env.example .env

# 编辑配置文件
nano .env
```

环境变量说明：
```env
# 基础配置
PORT=3000
NODE_ENV=development

# AI提供商选择（推荐：mock - 免费模式）
AI_PROVIDER=mock

# OpenAI配置（如果使用OpenAI）
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# 其他AI提供商配置
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_claude_api_key
OLLAMA_BASE_URL=http://localhost:11434

# 文件处理配置
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
TEMP_DIR=temp
ANALYSIS_TIMEOUT=300000
MAX_TOKENS=4000
```

## Docker部署

### 快速部署

```bash
# 构建镜像
docker build -t code-analysis-agent .

# 运行容器（智能分析模式，无需API密钥）
docker run -d \
  --name code-analysis-agent \
  -p 3000:3000 \
  -e AI_PROVIDER=mock \
  -e NODE_ENV=production \
  code-analysis-agent
```

### 生产环境部署

```bash
# 使用环境变量文件
docker run -d \
  --name code-analysis-agent \
  -p 3000:3000 \
  --env-file .env \
  code-analysis-agent
```

### Docker Compose

```yaml
version: '3.8'
services:
  code-analysis-agent:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AI_PROVIDER=mock
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
      - ./temp:/app/temp
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## API接口

### 核心接口

#### POST /api/analyze
功能：分析代码并生成功能定位报告

请求参数：
- problem_description (string): 项目功能描述
- code_zip (file): 项目源代码ZIP文件
- include_verification (boolean, optional): 是否包含功能验证

响应示例：
```json
{
  "success": true,
  "data": {
    "feature_analysis": [
      {
        "feature_description": "用户注册功能",
        "implementation_location": [
          {
            "file": "src/controllers/authController.js",
            "function": "register",
            "lines": "15-45"
          }
        ]
      }
    ],
    "execution_plan_suggestion": "建议先执行 npm install 安装依赖，然后运行 npm start 启动服务",
    "functional_verification": {
      "generated_test_code": "const request = require('supertest');...",
      "execution_result": {
        "tests_passed": true,
        "log": "1 passing (2s)\n智能测试通过",
        "coverage": "100%"
      }
    }
  },
  "summary": {
    "total_features_analyzed": 3,
    "analysis_quality_score": 95,
    "has_functional_verification": true,
    "has_execution_plan": true
  }
}
```

#### GET /api/health
功能：健康检查端点
响应：服务状态信息

#### GET /api/info
功能：获取API详细信息
响应：完整的API文档和功能说明

### 使用示例

#### cURL命令
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "problem_description=实现一个用户管理系统，包含用户注册、登录、个人信息管理功能" \
  -F "code_zip=@your-project.zip" \
  -F "include_verification=true"
```

#### JavaScript示例
```javascript
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('problem_description', '实现一个电商系统，包含商品管理、订单处理、支付功能');
form.append('code_zip', fs.createReadStream('project.zip'));
form.append('include_verification', 'true');

fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  body: form
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Python示例
```python
import requests

url = 'http://localhost:3000/api/analyze'
files = {'code_zip': open('project.zip', 'rb')}
data = {
    'problem_description': '实现一个博客系统，包含文章发布、评论管理功能',
    'include_verification': 'true'
}

response = requests.post(url, files=files, data=data)
result = response.json()
print(result)
```

## Web界面

访问 `http://localhost:3000` 可以使用Web界面进行代码分析。

### 界面特性
- 拖拽上传：支持文件拖拽上传，操作简便
- 实时反馈：分析进度实时显示，状态清晰
- 结果展示：结构化展示分析结果，易于理解
- 响应式设计：支持桌面和移动设备访问

### 使用步骤
1. 在"项目功能描述"中输入要实现的功能
2. 上传项目源代码ZIP文件
3. 选择是否包含功能验证测试
4. 点击"开始分析"按钮
5. 查看详细的分析结果和建议

## 项目结构

```
code-analysis-agent/
├── src/                           # 源代码目录
│   ├── app.js                     # 主应用入口
│   ├── controllers/               # 控制器层
│   │   └── analysisController.js  # 分析控制器
│   ├── services/                  # 服务层
│   │   ├── codeAnalysisService.js # 代码分析服务
│   │   └── fileService.js         # 文件处理服务
│   └── utils/                     # 工具层
│       ├── aiProviders.js         # AI提供商管理
│       └── llmClient.js           # LLM客户端
├── public/                        # 静态资源
│   └── index.html                 # Web界面
├── test/                          # 测试文件
│   └── basic.test.js             # 基础测试
├── uploads/                       # 文件上传目录
├── temp/                          # 临时文件目录
├── package.json                   # 项目配置
├── .env.example                   # 环境变量示例
├── Dockerfile                     # Docker配置
├── .dockerignore                  # Docker忽略文件
├── USAGE.md                       # 详细使用指南
└── AI_PROVIDERS_SETUP.md          # AI提供商设置指南
```

### 架构说明
- 分层架构：控制器、服务层、工具层分离，职责清晰
- 依赖注入：通过构造函数注入依赖，便于测试和维护
- 错误处理：统一的错误处理机制，提供友好的错误信息
- 模块化设计：各模块独立，便于扩展和维护

## 配置选项

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 3000 | 服务端口 |
| NODE_ENV | development | 运行环境 |
| AI_PROVIDER | mock | AI提供商 (mock, openai, gemini, claude, ollama) |
| OPENAI_API_KEY | - | OpenAI API密钥（如果使用OpenAI） |
| OPENAI_MODEL | gpt-4o-mini | OpenAI模型名称 |
| GEMINI_API_KEY | - | Google Gemini API密钥（如果使用Gemini） |
| GEMINI_MODEL | gemini-pro | Google Gemini模型名称 |
| ANTHROPIC_API_KEY | - | Anthropic Claude API密钥（如果使用Claude） |
| CLAUDE_MODEL | claude-3-haiku-20240307 | Anthropic Claude模型名称 |
| OLLAMA_BASE_URL | http://localhost:11434 | Ollama服务地址（如果使用Ollama） |
| OLLAMA_MODEL | llama3.1:8b | Ollama模型名称 |
| MAX_FILE_SIZE | 50MB | 最大文件大小 |
| UPLOAD_DIR | uploads | 上传目录 |
| TEMP_DIR | temp | 临时目录 |
| ANALYSIS_TIMEOUT | 300000 | 分析超时时间（毫秒） |
| MAX_TOKENS | 4000 | 最大token数量 |

### AI提供商选择

| 提供商 | 优势 | 适用场景 |
|--------|------|----------|
| mock | 免费、快速、无需API密钥 | 演示、测试、面试 |
| openai | 分析质量高、稳定 | 生产环境 |
| gemini | 成本较低、支持中文 | 预算有限的项目 |
| claude | 代码理解能力强 | 复杂代码分析 |
| ollama | 本地部署、隐私保护 | 内网环境 |

## 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

### 测试覆盖
- 健康检查接口测试
- API信息接口测试
- 文件服务测试
- 环境变量验证测试
- 错误处理测试

### 手动测试
```bash
# 健康检查
curl http://localhost:3000/api/health

# API信息
curl http://localhost:3000/api/info

# 代码分析（需要准备ZIP文件）
curl -X POST http://localhost:3000/api/analyze \
  -F "problem_description=测试功能" \
  -F "code_zip=@test-project.zip"
```

## 故障排除

### 常见问题

#### 1. 服务启动失败
问题：`Error: listen EADDRINUSE: address already in use :::3000`
解决： 
```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:3000)

# 或使用其他端口
PORT=3001 npm start
```

#### 2. AI API错误
问题：OpenAI API调用失败
解决： 
- 检查API密钥是否正确
- 确认账户余额充足
- 检查网络连接
- 切换到智能分析模式：`AI_PROVIDER=mock`

#### 3. 文件上传失败
问题：文件上传被拒绝
解决： 
- 确认文件为ZIP格式
- 检查文件大小是否超过50MB限制
- 验证ZIP文件完整性
- 检查文件权限

#### 4. 内存不足
问题：处理大文件时内存溢出
解决： 
- 增加系统内存
- 减少并发请求数量
- 优化文件处理逻辑
- 使用Docker限制内存使用

### 日志查看
```bash
# 查看应用日志
npm start

# Docker容器日志
docker logs code-analysis-agent

# 系统日志
tail -f /var/log/syslog
```

### 性能优化
- 文件预处理：移除不必要的文件（node_modules、.git等）
- 并发控制：限制同时处理的请求数量
- 缓存策略：缓存分析结果（可选）
- 资源清理：及时清理临时文件

## 设计理念

### 架构设计
- 分层架构：控制器、服务层、工具层分离，职责清晰
- 依赖注入：通过构造函数注入依赖，便于测试和维护
- 错误处理：统一的错误处理机制，提供友好的错误信息
- 模块化设计：各模块独立，便于扩展和维护

### AI集成策略
- 多提供商支持：支持OpenAI、Gemini、Claude、Ollama等多种AI服务
- 智能回退机制：API失败时自动切换到智能分析模式
- 成本优化：提供免费模式，适合面试和演示场景
- Prompt工程：精心设计的提示词，确保分析质量

### 文件处理优化
- 流式处理：支持大文件处理，避免内存溢出
- 安全验证：严格的文件类型和大小验证
- 临时文件管理：自动清理临时文件，避免磁盘空间浪费
- 并发控制：限制同时处理的请求数量

### 用户体验
- Web界面：直观的图形化操作界面
- 实时反馈：分析进度实时显示
- 响应式设计：支持多种设备访问
- 错误提示：友好的错误信息和解决建议

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork项目到您的GitHub账户
2. 创建功能分支 (`git checkout -b feature/your-feature-name`)
3. 提交您的更改 (`git commit -m 'Add your feature'`)
4. 推送到分支 (`git push origin feature/your-feature-name`)
5. 提交Pull Request

### 贡献类型
- Bug修复
- 新功能开发
- 文档改进
- 测试用例
- 界面优化

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue：[GitHub Issues](https://github.com/Trista984/code-analysis-agent/issues)
- 讨论区：[GitHub Discussions](https://github.com/Trista984/code-analysis-agent/discussions)
- 邮箱：通过GitHub个人资料联系

## 项目亮点

### 技术亮点
- 多AI提供商支持：避免单点依赖，提高可用性
- 智能分析模式：无需API密钥即可运行，适合演示
- 完整的前后端：Web界面 + RESTful API
- Docker支持：一键部署，支持云平台
- 中文界面：符合中国开发者使用习惯

### 应用场景
- 面试项目：展示AI集成和全栈开发能力
- 代码审查：快速理解项目结构和功能实现
- 学习工具：帮助开发者理解复杂代码库
- 项目分析：为新项目提供技术建议

---

感谢使用代码分析助手！

> 注意：使用前请确保配置正确的AI API密钥，并遵守相关使用条款。推荐使用智能分析模式进行演示和测试。

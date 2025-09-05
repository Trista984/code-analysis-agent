# AI代码分析助手

一个基于AI的智能代码分析工具，能够分析代码仓库并生成结构化的功能定位报告。

## 功能特性

- **代码结构分析**: 自动分析代码仓库的文件结构、依赖关系和配置
- **功能定位报告**: 使用AI识别代码中关键功能的实现位置
- **执行计划建议**: 生成项目执行和部署建议
- **功能验证测试**: 自动生成可执行的单元测试代码（加分项）
- **多语言支持**: 支持JavaScript、TypeScript、Python、Java等多种编程语言
- **Docker部署**: 提供完整的容器化部署方案

## 技术栈

- **后端**: Node.js + Express
- **AI服务**: OpenAI GPT-4o-mini（支持多提供商）
- **文件处理**: adm-zip, fs-extra
- **测试框架**: Jest + Supertest
- **容器化**: Docker

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- Docker（可选）
- OpenAI API Key

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd code-analysis-agent
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp env.example .env
```

编辑 `.env` 文件：
```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
TEMP_DIR=temp
ANALYSIS_TIMEOUT=300000
MAX_TOKENS=4000
```

4. **启动服务**
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## Docker部署（推荐）

### 构建和运行

```bash
# 构建镜像
docker build -t code-analysis-agent .

# 运行容器
docker run -d \
  --name code-analysis-agent \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your_api_key \
  -e NODE_ENV=production \
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
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
```

## API使用

### 主要端点

#### POST /api/analyze
分析代码并生成功能定位报告

**请求参数**：
- `problem_description` (string): 项目功能描述
- `code_zip` (file): 项目源代码ZIP文件
- `include_verification` (boolean, optional): 是否包含功能验证

**响应格式**：
```json
{
  "success": true,
  "data": {
    "feature_analysis": [
      {
        "feature_description": "功能描述",
        "implementation_location": [
          {
            "file": "文件路径",
            "function": "函数名",
            "lines": "行号范围"
          }
        ]
      }
    ],
    "execution_plan_suggestion": "执行建议",
    "functional_verification": {
      "generated_test_code": "生成的测试代码",
      "execution_result": {
        "tests_passed": true,
        "log": "测试日志"
      }
    }
  },
  "summary": {
    "total_features_analyzed": 3,
    "analysis_quality_score": 85
  }
}
```

#### GET /api/health
健康检查端点

#### GET /api/info
获取API详细信息

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

## Web界面

访问 `http://localhost:3000` 可以使用Web界面进行代码分析。

## 项目结构

```
code-analysis-agent/
├── src/
│   ├── app.js                    # 主应用文件
│   ├── controllers/
│   │   └── analysisController.js # 分析控制器
│   ├── services/
│   │   ├── codeAnalysisService.js # 代码分析服务
│   │   └── fileService.js        # 文件处理服务
│   └── utils/
│       ├── aiProviders.js        # AI提供者管理
│       └── llmClient.js          # LLM客户端
├── public/
│   └── index.html               # 前端界面
├── test/
│   └── basic.test.js            # 基础测试
├── uploads/                      # 文件上传目录
├── temp/                         # 临时文件目录
├── package.json                  # 项目配置
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git忽略文件
├── Dockerfile                    # Docker配置
├── USAGE.md                      # 详细使用指南
└── AI_PROVIDERS_SETUP.md         # AI提供者设置指南
```

## 配置选项

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3000 | 服务端口 |
| `NODE_ENV` | development | 运行环境 |
| `OPENAI_API_KEY` | - | OpenAI API密钥（必需） |
| `OPENAI_MODEL` | gpt-4o-mini | OpenAI模型名称 |
| `MAX_FILE_SIZE` | 50MB | 最大文件大小 |
| `UPLOAD_DIR` | uploads | 上传目录 |
| `TEMP_DIR` | temp | 临时目录 |
| `ANALYSIS_TIMEOUT` | 300000 | 分析超时时间（毫秒） |
| `MAX_TOKENS` | 4000 | 最大token数量 |

## 测试

```bash
# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

## 故障排除

### 常见问题

1. **OpenAI API错误**
   - 检查API密钥是否正确
   - 确认账户余额充足
   - 检查网络连接

2. **文件上传失败**
   - 确认文件为ZIP格式
   - 检查文件大小是否超过限制
   - 验证文件完整性

3. **内存不足**
   - 增加系统内存
   - 减少并发请求数量
   - 优化文件处理逻辑

## 设计思路

### 架构设计
- **分层架构**: 控制器、服务层、工具层分离，职责清晰
- **依赖注入**: 通过构造函数注入依赖，便于测试和维护
- **错误处理**: 统一的错误处理机制，提供友好的错误信息

### AI集成
- **多提供商支持**: 支持OpenAI、Gemini、Claude等多种AI服务
- **智能回退**: API失败时自动回退到智能分析模式
- **Prompt工程**: 精心设计的提示词，确保分析质量

### 文件处理
- **流式处理**: 支持大文件处理，避免内存溢出
- **安全验证**: 严格的文件类型和大小验证
- **临时文件管理**: 自动清理临时文件，避免磁盘空间浪费

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue
- 发送邮件
- 项目讨论区

---

**注意**: 使用前请确保配置正确的OpenAI API密钥，并遵守相关使用条款。

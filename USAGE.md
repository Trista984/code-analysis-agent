
# 代码分析助手使用指南

## 概述

代码分析助手是一个基于AI的智能代码分析工具，能够分析代码仓库并生成结构化的功能定位报告。支持多种编程语言，提供功能验证测试生成等高级功能。

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- 内存 >= 512MB
- 存储空间 >= 100MB

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

编辑 `.env` 文件，设置必要的环境变量：
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

## API使用

### 主要端点

#### POST /api/analyze
分析代码并生成功能定位报告

**请求参数**：
- `problem_description` (string, form field): 项目功能描述
- `code_zip` (file, multipart): 项目源代码ZIP文件
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

## 前端界面

访问 `http://localhost:3000` 可以使用Web界面：

1. 在"项目功能描述"中输入项目要实现的功能
2. 上传项目源代码ZIP文件
3. 选择是否包含功能验证测试
4. 点击"开始分析"按钮
5. 查看分析结果

## 配置选项

### 环境变量

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

## 部署指南

### Docker部署（推荐）

1. **构建镜像**
```bash
docker build -t code-analysis-agent .
```

2. **运行容器**
```bash
docker run -d \
  --name code-analysis-agent \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your_api_key \
  -e NODE_ENV=production \
  code-analysis-agent
```

### 生产环境部署

1. **使用PM2**
```bash
npm install -g pm2
pm2 start src/app.js --name "code-analysis-agent"
pm2 save
pm2 startup
```

2. **使用Nginx反向代理**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
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

### 日志查看

```bash
# Docker容器日志
docker logs code-analysis-agent

# PM2日志
pm2 logs code-analysis-agent

# 系统日志
tail -f /var/log/syslog
```

## 技术支持

如有问题或建议，请通过以下方式联系：

- 提交Issue
- 发送邮件
- 项目讨论区

---

**注意**：使用前请确保配置正确的OpenAI API密钥，并遵守相关使用条款。

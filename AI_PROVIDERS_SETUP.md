# 🚀 AI服务商快速设置指南

## 📋 免费AI服务商推荐

### 1. 🆓 Ollama (本地部署) - 最推荐
**完全免费，无需API密钥**

```bash
# 安装Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 下载模型
ollama pull llama3.1:8b
ollama pull qwen2.5:7b

# 启动服务
ollama serve
```

**配置**：
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

### 2. 🆓 Google Gemini (免费额度)
**每月150万字符免费**

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建API密钥
3. 配置环境变量：

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
```

### 3. 🆓 Anthropic Claude (新用户免费)
**新用户$5免费额度**

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册账号并获取API密钥
3. 配置环境变量：

```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLAUDE_MODEL=claude-3-haiku-20240307
```

### 4. 🆓 Hugging Face (免费额度)
**每月1000次免费请求**

1. 访问 [Hugging Face](https://huggingface.co/settings/tokens)
2. 创建访问令牌
3. 使用免费模型

## 🔧 快速配置步骤

### 步骤1: 选择服务商
```bash
# 编辑 .env 文件
nano .env
```

### 步骤2: 设置服务商
```env
# 选择其中一个
AI_PROVIDER=mock      # 智能分析模式（推荐面试用）
AI_PROVIDER=ollama    # 本地部署
AI_PROVIDER=gemini    # Google Gemini
AI_PROVIDER=claude    # Anthropic Claude
```

### 步骤3: 安装依赖
```bash
npm install
```

### 步骤4: 启动服务
```bash
npm start
```

## 💡 使用建议

### 面试场景 (推荐)
```env
AI_PROVIDER=mock
```
- ✅ 完全免费
- ✅ 响应快速
- ✅ 无需配置
- ✅ 智能分析

### 生产环境
```env
AI_PROVIDER=ollama
```
- ✅ 完全免费
- ✅ 本地部署
- ✅ 隐私安全
- ✅ 离线使用

### 开发测试
```env
AI_PROVIDER=gemini
```
- ✅ 免费额度大
- ✅ 质量高
- ✅ 稳定可靠

## 🎯 成本对比

| 服务商 | 费用 | 额度 | 推荐场景 |
|--------|------|------|----------|
| Mock | 免费 | 无限制 | 面试演示 |
| Ollama | 免费 | 无限制 | 生产环境 |
| Gemini | 免费 | 150万字符/月 | 开发测试 |
| Claude | 免费 | $5新用户 | 高质量分析 |
| OpenAI | 付费 | 按使用量 | 企业级 |

## 🚨 注意事项

1. **API密钥安全**：不要提交到Git仓库
2. **额度监控**：注意免费额度的使用情况
3. **网络连接**：Ollama需要下载模型（约4GB）
4. **回退机制**：所有服务商都支持回退到智能分析模式

## 🔄 切换服务商

```bash
# 修改 .env 文件中的 AI_PROVIDER
# 重启服务
npm start
```

系统会自动检测配置并切换到对应的服务商！

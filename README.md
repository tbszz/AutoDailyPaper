# 🤖 AI 每日热点生成器

自动收集 AI 领域每日热点新闻和 GitHub 今日热门项目，生成 AI 总结并保存到 Obsidian。

## ✨ 功能特性

- 🤖 **RSS 聚合**：从 OpenAI、Google AI、Hugging Face 等多个实用 AI 源收集最新新闻
- 🚀 **GitHub 今日热门榜**：获取真正的今日 trending 项目（今日新增 stars）
- 📝 **AI 总结**：使用 Claude API 生成中文摘要（100字左右）
- 📥 **Obsidian 集成**：自动保存到 Obsidian 草稿箱，方便随时查看
- 📱 **多端同步**：通过 Git 在电脑和手机之间同步日报

## 🎯 使用场景

适合想要每天快速了解 AI 行业动态，不想在大量信息中翻找的用户。

---

## 📦 快速开始

### 1. 安装依赖

```bash
cd "D:\GitHub project\ai-daily-news"
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Claude API Key（必需，用于 AI 总结）
# 从 https://console.anthropic.com/ 或 https://www.aigocode.com/dashboard/tutorials 获取
ANTHROPIC_API_KEY=sk-ant-your_key_here

# 如果使用中转站
ANTHROPIC_BASE_URL=https://api.aigocode.com

# Obsidian 草稿箱路径（必需）
VAULT_PATH=D:\Obsidian\skills\second-brain\草稿箱

# GitHub Token（可选，提高请求限制）
GITHUB_TOKEN=your_github_token_here
```

### 3. 运行

```bash
npm start
```

日报会自动保存到你的 Obsidian 草稿箱！

---

## 📱 安卓手机 Git 同步完整指南

### 方案 1：使用 Obsidian Git 插件（推荐）

#### Step 1: 在安卓手机上安装 Obsidian

1. 从 Google Play 或 F-Droid 安装 Obsidian
2. 打开 Obsidian

#### Step 2: 克隆 Obsidian Vault

1. 打开 Obsidian
2. 点击"创建新仓库" → "克隆"
3. 输入仓库地址：`https://github.com/tbszz/second-brain.git`（你的 vault 仓库）
4. 选择保存位置（建议选择 `Documents/Obsidian`）
5. 等待克隆完成

#### Step 3: 配置 Git 插件

1. 在 Obsidian 中打开你的 vault
2. 点击设置（齿轮图标）→ 第三方插件 → 浏览
3. 搜索 "Obsidian Git" 并安装
4. 启用插件后，点击插件设置
5. 配置如下：

```
- Git 自动提交间隔：15 分钟
- 自动提交前先拉取：开启
- 自动拉取间隔：5 分钟
- 推送间隔：15 分钟
- Submodule 默认行为：更新（update）
```

#### Step 4: 配置 Git 凭证（重要！）

**方法 A：使用 SSH（推荐）**

1. 在手机上安装 Termux
2. 在 Termux 中生成 SSH key：
   ```bash
   pkg install openssh
   ssh-keygen -t ed25519 -C "your_email@example.com"
   cat ~/.ssh/id_ed25519.pub
   ```
3. 复制公钥，添加到 GitHub：Settings → SSH and GPG keys → New SSH key
4. 在 Obsidian Git 插件中：
   - 设置 Git 路径：`/data/data/com.termux/files/usr/bin/git`
   - 仓库地址改为：`git@github.com:tbszz/second-brain.git`

**方法 B：使用 HTTPS（简单）**

1. 在 Obsidian Git 插件中，确保使用 HTTPS 地址
2. GitHub 用户名：输入你的用户名
3. 密码：输入 Personal Access Token（不是 GitHub 密码！）
   - 生成地址：https://github.com/settings/tokens
   - 勾选 `repo` 权限
   - 生成 token 并复制

#### Step 5: 测试同步

1. 在电脑上修改一个笔记并推送到 GitHub
2. 在手机上 Obsidian Git 插件点击"拉取更改"
3. 应该能看到更新的内容

---

### 方案 2：使用 Termux + Git（适合高级用户）

#### Step 1: 安装 Termux

1. 从 F-Droid 安装 Termux（不要用 Google Play 版，已过时）
2. 启动 Termux，更新包管理器：
   ```bash
   pkg update && pkg upgrade
   ```

#### Step 2: 安装 Git 和 Vim

```bash
pkg install git vim neovim
```

#### Step 3: 配置 Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

#### Step 4: 克隆 Vault

```bash
cd ~/storage/shared
git clone https://github.com/tbszz/second-brain.git
```

#### Step 5: 日常同步

**拉取最新更改**：
```bash
cd ~/storage/shared/second-brain
git pull
```

**查看日报**：
```bash
ls 草稿箱/
cat "草稿箱/AI日报-$(date +%Y-%m-%d).md"
```

---

### 方案 3：使用 GitHub App（最简单）

1. 在手机上安装 GitHub 官方 App
2. 登录你的 GitHub 账号
3. 访问 `tbszz/second-brain` 仓库
4. 浏览 `草稿箱` 目录
5. 点击任意日报文件查看内容
6. 可以直接在手机上编辑和提交

---

## 📂 项目结构

```
ai-daily-news/
├── src/
│   ├── index.js          # 主入口
│   ├── collector.js      # 数据收集（RSS + GitHub Trending）
│   ├── summarizer.js     # AI 总结
│   ├── formatter.js      # Markdown 格式化
│   └── sender.js         # Obsidian 保存
├── config/
│   └── sources.json      # RSS 源配置
├── .env.example          # 环境变量模板
├── package.json
└── README.md
```

---

## 📊 输出示例

生成的日报会自动保存到 Obsidian 草稿箱：

```markdown
# 🤖 AI 每日热点 - 2025-01-17

> 自动生成于 2025-01-17 08:00

---

## 📰 今日头条

### 1. OpenAI 发布 GPT-5 预览版

🔗 原文链接：https://openai.com/blog/gpt5

**📰 新闻摘要**

OpenAI 今日正式发布 GPT-5 预览版，新版本在多模态推理能力上取得重大突破...

---

## 🚀 GitHub 今日热门榜

> 今日新增 stars 最多的项目

### 🤖 AI/ML 项目

#### **1. langgenius/dify**

🔥 今日 +2,345 stars | 🐙 Python

**简介**：LLM 应用开发平台，可视化编排 AI 工作流...

🔗 [查看项目](https://github.com/langgenius/dify)

---

### 💻 开发工具

#### **6. vercel/next.js**

🔥 今日 +1,234 stars | 🐙 TypeScript

**简介**：React 全栈框架，支持 Server Actions...

🔗 [查看项目](https://github.com/vercel/next.js)

---

## 📊 今日统计

- 📰 AI 新闻：12 条
- 🤖 AI 项目：5 个
- 💻 开发工具：5 个

---

💡 由 AI 自动生成 | 来源：[GitHub](https://github.com) • [AI News](https://openai.com/blog)
```

---

## ⚙️ 配置说明

### RSS 源

编辑 `config/sources.json` 来自定义 RSS 源。默认源包括：
- OpenAI Blog
- Google AI Blog
- Hugging Face Blog
- AI News
- The Verge AI
- TechCrunch AI
- Wired AI
- MIT Technology Review

### GitHub Trending

使用 GitHub Trending unofficial API，获取真正的今日热门项目：
- **AI/ML 项目**：从 Python trending 中筛选
- **开发工具**：JavaScript/TypeScript trending
- **排序依据**：今日新增 stars（`currentPeriodStars`）

### Obsidian 保存路径

在 `.env` 文件中配置：

```env
# 直接指定草稿箱的完整路径
VAULT_PATH=D:\Obsidian\skills\second-brain\草稿箱
```

文件会保存为：`AI日报-2025-01-17.md`

---

## 💰 成本估算

- **Claude API**：~$1/月（每日 30 条总结，使用 Haiku 模型）
- **其他服务**：完全免费（GitHub Trending、RSS、Git）

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 🔗 相关链接

- [Claude API Console](https://console.anthropic.com/)
- [AIGocode 中转站](https://www.aigocode.com/dashboard/tutorials)
- [GitHub Tokens](https://github.com/settings/tokens)
- [Obsidian Git 插件](https://github.com/denolehov/obsidian-git)
- [Termux Wiki](https://wiki.termux.com/)

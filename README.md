# 校园搭子 - 大学生互助平台

一个专为大学生打造的轻量级社交互助平台，帮助大学生找到志同道合的伙伴。

## ✨ 功能特点

- 🤝 **竞赛组队** - 寻找数学建模、互联网+、挑战杯等竞赛队友
- 🍚 **吃饭搭子** - 找食堂干饭、校外探店、奶茶拼单
- 🏃 **兴趣搭子** - 篮球、跑步、学习、游戏等兴趣伙伴
- 👤 **个人中心** - 个人资料管理、发布管理

## 🛠️ 技术栈

- **前端**：HTML5 + CSS3 + JavaScript + Tailwind CSS
- **后端**：Node.js + Express
- **数据库**：SQLite
- **认证**：JWT

## 🚀 快速开始

### 本地运行

```bash
# 进入项目目录
cd campus-mate

# 安装依赖
npm install

# 启动服务
npm start
```

然后在浏览器中打开：http://localhost:3000

## 📦 部署到 Railway

### 1. 确保代码已上传到 GitHub

本项目已上传到：https://github.com/CR7-LJT/campus-mate

### 2. 使用 Railway 一键部署

1. 访问 https://railway.app
2. 使用 GitHub 账号登录
3. 点击 **New Project** → **Deploy from GitHub repo**
4. 选择 `campus-mate` 仓库
5. 等待部署完成（约1-2分钟）
6. 获得你的 `.railway.app` 访问地址

## 👤 测试账号

| 昵称 | 密码 |
|------|------|
| 校园小达人 | 123456 |
| 数模小王子 | 123456 |
| 干饭王 | 123456 |

## 📁 项目结构

```
campus-mate/
├── index.html              # 前端主页面
├── server.js               # 服务端入口
├── package.json           # 项目配置
├── database/              # 数据库相关
│   └── db.js
├── routes/                # API 路由
│   ├── auth.js           # 认证相关
│   ├── competition.js    # 竞赛组队
│   ├── meal.js          # 吃饭搭子
│   ├── hobby.js         # 兴趣搭子
│   └── user.js          # 用户管理
├── js/                    # 前端 JavaScript
│   └── main.js
├── middleware/           # 中间件
└── utils/               # 工具函数
```

## 📝 许可证

MIT License

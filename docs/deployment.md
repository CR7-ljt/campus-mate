# Campus Mate 部署说明

本文档说明如何将 Campus Mate 部署到 Railway，并避免把本地敏感文件提交到公开仓库。

## 1. 本地准备

确认项目可以本地启动：

```bash
npm install
cp .env.example .env
npm start
```

浏览器访问：

```text
http://localhost:3000
```

## 2. 必要环境变量

Railway 中至少需要配置：

```env
NODE_ENV=production
JWT_SECRET=替换为强随机字符串
JWT_REFRESH_SECRET=替换为另一个强随机字符串
```

建议使用长随机字符串，不要使用 README 或 `.env.example` 中的示例值。

## 3. SQLite 持久化

项目本地默认会在根目录生成：

```text
campus_mate.db
campus_mate.db-shm
campus_mate.db-wal
```

这些文件已经通过 `.gitignore` 忽略，不应该提交到 GitHub。

在 Railway 上，如果希望数据在重启后保留，需要配置 Volume，并让应用读取 `RAILWAY_VOLUME_DIR`。项目的 `database/db.js` 已支持该变量：

```js
const RAILWAY_VOLUME_DIR = process.env.RAILWAY_VOLUME_DIR;
```

配置后，数据库会写入 Volume 目录。

## 4. Railway 部署流程

1. 将代码推送到 GitHub。
2. 打开 https://railway.app。
3. 点击 **New Project**。
4. 选择 **Deploy from GitHub repo**。
5. 选择 `campus-mate` 仓库。
6. 添加环境变量：
   - `NODE_ENV=production`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
7. 如需持久化 SQLite，创建 Volume 并设置 `RAILWAY_VOLUME_DIR`。
8. 等待部署完成。
9. 打开 Railway 分配的域名访问项目。

## 5. 发布前检查清单

- [ ] `.env` 没有被 Git 跟踪
- [ ] `campus_mate.db` 没有被 Git 跟踪
- [ ] `logs/` 没有被 Git 跟踪
- [ ] README 中有运行步骤和截图
- [ ] Railway 环境变量已配置
- [ ] 线上访问地址已补充到 GitHub About 或 README

## 6. 常见问题

### 登录后提示 token 无效

检查 Railway 是否配置了 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`。如果不同路由使用的 secret 不一致，登录态会失效。

### 重启后数据消失

检查是否配置 Railway Volume，以及 `RAILWAY_VOLUME_DIR` 是否指向持久化目录。

### 页面能打开但接口失败

检查 Railway 日志，确认服务是否成功启动，数据库是否成功初始化。

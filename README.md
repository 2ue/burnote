# Burnote 🔥

> **Share Once, Burn Forever**

Burnote 是一个安全的临时文本分享平台。支持密码保护、阅读次数限制和自动过期。分享后即焚,不留痕迹。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)

## ✨ 特性

- 🔒 **密码保护** - 仅授权访问
- 👁️ **浏览限制** - 控制阅读次数
- ⏱️ **自动过期** - 定时销毁内容
- 🔥 **阅后即焚** - 不留痕迹
- 🎨 **主题切换** - 16种中国传统色主题
- 📱 **响应式设计** - 支持所有设备
- 🐳 **Docker部署** - 一键启动

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 克隆仓库
git clone https://github.com/yourusername/burnote.git
cd burnote

# 启动服务
docker-compose up -d
```

访问 http://localhost:3500

默认管理员密码：`admin123`

### 方式二：使用预构建镜像

从GitHub Container Registry拉取：
```bash
docker pull ghcr.io/yourusername/burnote:latest
docker run -d \
  -p 3500:3500 \
  -e ADMIN_PASSWORD=your-secure-password \
  -v burnote-data:/app/data \
  --name burnote \
  ghcr.io/yourusername/burnote:latest
```

从Docker Hub拉取：
```bash
docker pull yourusername/burnote:latest
docker run -d \
  -p 3500:3500 \
  -e ADMIN_PASSWORD=your-secure-password \
  -v burnote-data:/app/data \
  --name burnote \
  yourusername/burnote:latest
```

### 生产环境配置

修改 `docker-compose.yml` 中的管理员密码：
```yaml
environment:
  - ADMIN_PASSWORD=${ADMIN_PASSWORD:your-secure-password}
```

或设置环境变量：
```bash
export ADMIN_PASSWORD=your-secure-password
docker-compose up -d
```

## 📖 使用说明

### 创建分享

1. 访问首页,点击"创建分享"
2. 输入要分享的文本内容
3. (可选)设置访问密码
4. (可选)设置最大浏览次数
5. (可选)设置过期时间
6. 点击"创建分享"获取链接

### 管理后台

1. 点击首页"管理后台"按钮
2. 输入管理员密码登录
3. 查看所有分享记录
4. 删除不需要的分享
5. 一键清理过期分享

## 🛠️ 技术栈

### 后端
- **NestJS 10** - 渐进式 Node.js 框架
- **Prisma 5** - 现代化 ORM
- **SQLite** - 轻量级数据库
- **bcrypt** - 密码哈希

### 前端
- **React 19** - UI 框架
- **Vite 7** - 构建工具
- **TypeScript 5** - 类型安全
- **TailwindCSS 3** - CSS 框架
- **shadcn/ui** - 组件库

## 🔐 安全性

- ✅ 密码使用 bcrypt 哈希存储
- ✅ 管理功能密码保护
- ✅ 自动过期和浏览次数限制
- ✅ Nginx安全头配置

⚠️ **生产环境必做**:
1. 修改管理员密码（至少16位强密码）
2. 使用HTTPS（配置SSL证书）
3. 定期备份数据库：
```bash
# 备份
docker run --rm -v burnote-data:/data -v $(pwd):/backup alpine tar czf /backup/burnote-backup.tar.gz -C /data .

# 恢复
docker run --rm -v burnote-data:/data -v $(pwd):/backup alpine tar xzf /backup/burnote-backup.tar.gz -C /data
```

## 📝 开发

```bash
# 后端开发
cd backend
pnpm install
pnpm run start:dev

# 前端开发
cd frontend
pnpm install
pnpm run dev
```

## 🐳 Docker架构

单镜像包含：
- **Nginx** - 提供前端静态文件 + 反向代理后端API
- **Node.js** - 运行NestJS后端服务
- **Supervisor** - 进程管理，同时运行nginx和node

访问架构：
```
http://localhost:3500/       → 前端静态文件
http://localhost:3500/api    → 反向代理到后端 (localhost:3501)
```

## 🚢 发布镜像

推送tag自动构建并发布到GitHub Packages和Docker Hub：

```bash
git tag v1.0.0
git push origin v1.0.0
```

需要配置的GitHub Secrets（Settings → Secrets and variables → Actions）：
- `DOCKERHUB_USERNAME` - Docker Hub用户名
- `DOCKERHUB_TOKEN` - Docker Hub访问令牌（在 https://hub.docker.com/settings/security 生成）

GitHub Actions会自动：
1. 构建多平台镜像（amd64 + arm64）
2. 推送到 `ghcr.io/用户名/仓库名:版本号`
3. 推送到 `docker.io/用户名/burnote:版本号`
4. 自动生成标签：`latest`, `1.0.0`, `1.0`, `1`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 License

[MIT](LICENSE)

---

<div align="center">

**Burnote** - Share Once, Burn Forever 🔥

Made with ❤️ using Claude Code

</div>

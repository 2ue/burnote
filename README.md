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

### Docker 单容器部署(最简单)

前后端打包在一个镜像中，一条命令即可启动：

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/burnote.git
cd burnote/modern-share

# 2. 构建镜像
docker build -t burnote .

# 3. 运行容器
docker run -d \
  -p 3500:80 \
  -e ADMIN_PASSWORD="change-me-to-secure-password" \
  -v burnote-data:/app/data \
  --name burnote \
  burnote

# 4. 访问应用
# 前端: http://localhost:3500
# 后端API: http://localhost:3500/api
```

### Docker Compose 部署(前后端分离)

如果需要独立扩展前后端，可使用docker-compose：

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/burnote.git
cd burnote/modern-share

# 2. 修改管理员密码
# 编辑 docker-compose.yml,修改 ADMIN_PASSWORD

# 3. 启动服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost:3500
# 后端API: http://localhost:3501
```

**两种部署方式对比**:
- **单容器**: 部署简单，资源占用少，适合个人或小团队
- **Docker Compose**: 前后端分离，可独立扩展和更新

### 手动部署

#### 后端

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
# 设置 ADMIN_PASSWORD 环境变量
export ADMIN_PASSWORD="your-secure-password"
export DATABASE_URL="file:./data/burnote.db"

# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 启动服务
npm run start:prod
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 构建
npm run build

# 使用nginx或其他web服务器提供dist目录
# nginx配置文件已包含在 nginx.conf
```

## ⚙️ 配置

### 环境变量

#### 后端

```bash
# 数据库
DATABASE_URL="file:/app/data/burnote.db"

# 管理员密码(必填,否则无法访问管理功能)
ADMIN_PASSWORD="your-secure-password"

# CORS配置
CORS_ORIGIN="http://localhost"
```

#### 前端

前端默认连接 `http://localhost:3501` 的后端API。如需修改,可通过环境变量设置:

```bash
# frontend/.env
VITE_API_URL=http://your-backend-url
```

## 📖 使用说明

### 创建分享

1. 访问首页,点击"创建分享"
2. 输入要分享的文本内容
3. (可选)设置访问密码
4. (可选)设置最大浏览次数
5. (可选)设置过期时间(快速选择/自定义/精确时间)
6. 点击"创建分享"获取链接

### 查看分享

- 访问分享链接
- 如果设置了密码,输入密码
- 查看内容后会自动增加浏览次数
- 达到浏览次数或过期时间后,内容将永久销毁

### 管理后台

1. 点击首页"管理后台"按钮
2. 输入管理员密码登录
3. 查看所有分享记录
4. 点击ID可跳转查看详情
5. 删除不需要的分享
6. 一键清理过期分享

⚠️ **注意**: 如果未设置 `ADMIN_PASSWORD` 环境变量,管理功能将被禁用,任何密码都无法登录。

## 🛠️ 技术栈

### 后端
- **NestJS 10** - 渐进式 Node.js 框架
- **Prisma 5** - 现代化 ORM
- **SQLite** - 轻量级数据库
- **bcrypt** - 密码哈希
- **nanoid** - 短ID生成

### 前端
- **React 19** - UI 框架
- **Vite 7** - 构建工具
- **TypeScript 5** - 类型安全
- **TailwindCSS 3** - CSS 框架
- **shadcn/ui** - 组件库
- **React Router 6** - 路由管理
- **React Hot Toast** - 消息提示

## 📦 项目结构

```
modern-share/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── shares/         # 分享模块
│   │   ├── admin/          # 管理员模块
│   │   ├── prisma/         # 数据库服务
│   │   └── main.ts         # 入口文件
│   ├── prisma/
│   │   └── schema.prisma   # 数据模型
│   ├── Dockerfile
│   └── package.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   │   ├── Home.tsx
│   │   │   ├── CreateShare.tsx
│   │   │   ├── ViewShare.tsx
│   │   │   └── Admin.tsx
│   │   ├── components/     # UI组件
│   │   │   ├── ui/         # shadcn组件
│   │   │   └── ThemeSwitcher.tsx
│   │   └── lib/            # 工具函数
│   │       └── api.ts      # API客户端
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml       # Docker编排
└── README.md
```

## 🔐 安全性

### 已实现的安全措施

- ✅ 密码使用 bcrypt 哈希存储
- ✅ 管理功能密码保护
- ✅ 未配置管理员密码时禁用管理功能
- ✅ CORS 配置防止跨域攻击
- ✅ 自动过期和浏览次数限制
- ✅ Nginx安全头配置(X-Frame-Options, X-Content-Type-Options等)

### 安全建议

⚠️ **生产环境必做**:

1. **修改管理员密码**: 使用强密码,至少16位包含大小写字母+数字+符号
2. **使用HTTPS**: 配置SSL证书,避免明文传输
3. **数据库备份**: 定期备份 `/app/data/burnote.db`
4. **限制访问**: 通过防火墙限制管理端口访问
5. **更新依赖**: 定期更新依赖包修复安全漏洞

## 🐳 Docker 详细说明

### 单容器镜像构建

```bash
# 从项目根目录构建
cd modern-share
docker build -t burnote .

# 或指定不同标签
docker build -t burnote:latest .
docker build -t burnote:1.0.0 .
```

### 单容器运行参数

```bash
docker run -d \
  -p 3500:80 \                          # 端口映射
  -e ADMIN_PASSWORD="your-password" \   # 管理员密码
  -e DATABASE_URL="file:/app/data/burnote.db" \  # 数据库路径(可选)
  -v burnote-data:/app/data \           # 数据持久化
  --name burnote \                      # 容器名称
  --restart unless-stopped \            # 自动重启
  burnote
```

### 分离部署镜像构建

```bash
# 构建后端镜像
cd backend
docker build -t burnote-backend .

# 构建前端镜像
cd frontend
docker build -t burnote-frontend .
```

### 分离部署运行

```bash
# 运行后端
docker run -d \
  -p 3501:3501 \
  -e ADMIN_PASSWORD="your-password" \
  -e PORT=3501 \
  -v burnote-data:/app/data \
  --name burnote-backend \
  burnote-backend

# 运行前端
docker run -d \
  -p 3500:80 \
  --link burnote-backend:backend \
  --name burnote-frontend \
  burnote-frontend
```

### Docker Compose 配置说明

```yaml
services:
  backend:
    environment:
      - PORT=3501
      - ADMIN_PASSWORD=change-me  # 修改此密码
      - DATABASE_URL=file:/app/data/burnote.db
      - CORS_ORIGIN=http://localhost:3500
    volumes:
      - burnote-data:/app/data  # 持久化数据库

  frontend:
    depends_on:
      - backend
```

## 📝 开发

```bash
# 后端开发
cd backend
npm run start:dev  # 启动开发服务器(监听文件变化)

# 前端开发
cd frontend
npm run dev  # 启动Vite开发服务器

# 数据库管理
cd backend
npx prisma studio  # 打开数据库可视化工具
npx prisma migrate dev  # 创建新迁移
```

## 🌐 API 接口

### 分享相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/shares | 创建分享 | 否 |
| POST | /api/shares/:id/view | 查看分享内容 | 否 |
| GET | /api/shares | 获取所有分享 | 是 |
| DELETE | /api/shares/:id | 删除分享 | 是 |
| POST | /api/shares/clean-expired | 清理过期分享 | 是 |

### 管理员相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/login | 管理员登录 |

## ❓ 常见问题

### Q: 如何修改管理员密码?

A: 修改 `docker-compose.yml` 中的 `ADMIN_PASSWORD` 环境变量,或直接设置系统环境变量,然后重启服务。

### Q: 忘记管理员密码怎么办?

A: 重新设置 `ADMIN_PASSWORD` 环境变量即可,不需要重置数据库。

### Q: 数据存储在哪里?

A: 使用Docker时,数据存储在名为 `burnote-data` 的Docker volume中。可以通过 `docker volume inspect burnote-data` 查看具体路径。

### Q: 如何备份数据?

A:
```bash
# 导出volume数据
docker run --rm -v burnote-data:/data -v $(pwd):/backup alpine tar czf /backup/burnote-backup.tar.gz -C /data .

# 恢复数据
docker run --rm -v burnote-data:/data -v $(pwd):/backup alpine tar xzf /backup/burnote-backup.tar.gz -C /data
```

### Q: 如何限制分享内容大小?

A: 后端默认限制为50MB。如需修改,编辑 `backend/src/main.ts`:
```typescript
app.use(json({ limit: '10mb' })); // 修改限制
```

### Q: 支持自定义域名吗?

A: 支持。修改 `docker-compose.yml` 中的 `CORS_ORIGIN` 为你的域名,并配置Nginx反向代理。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 License

[MIT](LICENSE)

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com/) - 精美的组件库
- [NestJS](https://nestjs.com/) - 优秀的后端框架
- [Prisma](https://www.prisma.io/) - 现代化ORM
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的CSS框架

---

<div align="center">

**Burnote** - Share Once, Burn Forever 🔥

Made with ❤️ using Claude Code

</div>

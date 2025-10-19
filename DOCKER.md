# Burnote Docker 部署指南

## 概述

这是 Burnote 的单容器 Docker 部署方案,将前端(React)和后端(NestJS)打包到同一个镜像中。

### 架构设计

```
Docker Container (Port 80)
├── Nginx (前端静态文件 + 反向代理)
│   ├── Frontend: /usr/share/nginx/html
│   └── Backend Proxy: /api -> http://localhost:3000
└── Node.js (后端服务)
    ├── NestJS Application
    └── SQLite Database (/app/data/burnote.db)
```

### 核心特性

✅ **运行时环境变量支持** - 无需重新构建镜像即可修改配置  
✅ **单容器部署** - 简化运维,一个容器包含所有服务  
✅ **数据持久化** - SQLite 数据库通过 volume 持久化  
✅ **健康检查** - 自动检测服务健康状态  

---

## 快速开始

### 方式 1: 使用 Docker Compose (推荐)

```bash
# 1. 构建并启动容器
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 停止容器
docker-compose down

# 4. 停止并删除数据卷
docker-compose down -v
```

### 方式 2: 使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t burnote:latest .

# 2. 创建数据卷
docker volume create burnote-data

# 3. 运行容器
docker run -d \
  --name burnote \
  -p 80:80 \
  -v burnote-data:/app/data \
  -e VITE_API_URL=/api \
  -e DATABASE_URL=file:/app/data/burnote.db \
  -e ADMIN_PASSWORD=your-secure-password \
  burnote:latest

# 4. 查看日志
docker logs -f burnote

# 5. 停止并删除容器
docker stop burnote && docker rm burnote
```

---

## 环境变量配置

### 前端变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `VITE_API_URL` | 后端 API 地址 | `/api` | `https://api.yourdomain.com` |

### 后端变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `DATABASE_URL` | SQLite 数据库路径 | `file:/app/data/burnote.db` | - |
| `PORT` | 后端服务端口 | `3000` | 不建议修改 |
| `NODE_ENV` | Node 环境 | `production` | `development` |
| `CORS_ORIGIN` | CORS 允许的源 | `*` | `https://yourdomain.com` |
| `ADMIN_PASSWORD` | 管理员密码 | 无(功能禁用) | 见下方说明 |

### 设置管理员密码

**重要:** 如果不设置 `ADMIN_PASSWORD`,管理员功能将完全禁用。

#### 方式 1: 明文密码 (仅开发环境)

```bash
-e ADMIN_PASSWORD=my-plain-password
```

#### 方式 2: Bcrypt 哈希 (生产环境推荐)

```bash
# 1. 生成 bcrypt 哈希
node -e "console.log(require('bcrypt').hashSync('your-password', 10))"

# 2. 使用哈希值
-e ADMIN_PASSWORD='$2b$10$YourBcryptHashHere'
```

---

## 生产环境部署

### 1. 修改 docker-compose.yml

```yaml
services:
  burnote:
    image: burnote:latest
    restart: always
    ports:
      - "80:80"
    volumes:
      - burnote-data:/app/data
    environment:
      VITE_API_URL: /api
      DATABASE_URL: file:/app/data/burnote.db
      PORT: 3000
      NODE_ENV: production
      CORS_ORIGIN: https://yourdomain.com
      ADMIN_PASSWORD: $2b$10$...your-bcrypt-hash...
```

### 2. 使用 Nginx 反向代理 (可选)

如果需要 HTTPS,在宿主机配置 Nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 常见问题

### Q: 如何修改前端 API URL?

**A:** 直接修改环境变量后重启容器即可,无需重新构建镜像:

```bash
docker-compose down
# 修改 docker-compose.yml 中的 VITE_API_URL
docker-compose up -d
```

### Q: 数据存储在哪里?

**A:** SQLite 数据库存储在 Docker volume `burnote-data` 中,映射到容器内的 `/app/data`。

查看数据卷位置:
```bash
docker volume inspect burnote-data
```

### Q: 如何备份数据?

**A:** 

```bash
# 备份
docker run --rm \
  -v burnote-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/burnote-backup-$(date +%Y%m%d).tar.gz /data

# 恢复
docker run --rm \
  -v burnote-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/burnote-backup-YYYYMMDD.tar.gz -C /
```

### Q: 为什么构建很慢?

**A:** 首次构建需要下载依赖,后续构建会利用 Docker 层缓存。确保 `.dockerignore` 正确配置以避免不必要的文件复制。

### Q: 如何查看容器内的日志?

**A:**

```bash
# 实时日志
docker-compose logs -f

# 后端日志
docker exec -it burnote tail -f /app/backend/logs/*.log

# Nginx 日志
docker exec -it burnote tail -f /var/log/nginx/error.log
```

---

## 技术细节

### 多阶段构建流程

1. **Stage 1 - 构建前端**
   - 使用 `npm ci` 安装依赖
   - 使用占位符 `__VITE_API_URL_PLACEHOLDER__` 构建
   - 生成静态文件到 `/build/dist`

2. **Stage 2 - 构建后端**
   - 安装依赖并生成 Prisma 客户端
   - 使用 `nest build` 编译 TypeScript
   - 清理并只保留生产依赖

3. **Stage 3 - 生产镜像**
   - 复制前端静态文件到 Nginx 目录
   - 复制后端编译产物和 node_modules
   - 配置 Nginx 反向代理
   - 运行 entrypoint 脚本

### 启动流程

容器启动时,`docker-entrypoint.sh` 执行以下操作:

1. **环境变量注入**: 使用 `sed` 替换前端 JS 文件中的占位符
2. **配置后端环境**: 设置数据库路径、端口等
3. **运行数据库迁移**: 执行 `prisma migrate deploy`
4. **启动服务**: 并行启动 Nginx 和 Node.js 后端

---

## 故障排查

### 容器启动失败

```bash
# 查看详细启动日志
docker-compose up

# 检查容器状态
docker ps -a

# 进入容器检查
docker exec -it burnote /bin/sh
```

### 数据库迁移失败

```bash
# 手动运行迁移
docker exec -it burnote sh -c "cd /app/backend && npx prisma migrate deploy"

# 重置数据库 (谨慎!)
docker exec -it burnote sh -c "cd /app/backend && npx prisma migrate reset"
```

### Nginx 配置错误

```bash
# 测试 Nginx 配置
docker exec -it burnote nginx -t

# 重载 Nginx 配置
docker exec -it burnote nginx -s reload
```

---

## 性能优化建议

1. **启用 Nginx gzip 压缩** (已默认启用)
2. **配置静态资源缓存** (已默认配置)
3. **使用 Alpine Linux 基础镜像减小体积** (已使用)
4. **多阶段构建分离构建和运行时依赖** (已实现)

---

## 安全建议

⚠️ **生产环境必做:**

1. ✅ 修改默认管理员密码
2. ✅ 配置 CORS_ORIGIN 为具体域名
3. ✅ 使用 HTTPS (在宿主机配置)
4. ✅ 定期备份数据库
5. ✅ 定期更新镜像和依赖

---

## 开发模式

如果需要在容器内开发:

```yaml
services:
  burnote:
    build: .
    volumes:
      - ./backend:/app/backend
      - ./frontend:/app/frontend
    environment:
      NODE_ENV: development
```

**注意:** 生产环境不要挂载源代码目录!

---

## 许可证

与 Burnote 项目相同。

---

**最后更新**: 2025-10-19

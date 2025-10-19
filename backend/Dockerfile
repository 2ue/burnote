# 后端 Dockerfile - 多阶段构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 生产环境
FROM node:20-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY prisma ./prisma/

# 仅安装生产依赖
RUN npm install --production

# 生成Prisma客户端
RUN npx prisma generate

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3501

# 启动应用
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

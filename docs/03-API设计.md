# Enclosed 改造方案 - API设计

## 一、新增API列表

### 概览

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| GET | `/api/users/me/notes` | 获取当前用户的notes列表 | ✅ 必需 |
| GET | `/api/notes/:noteId/metadata` | 获取note的metadata | ❌ 可选 |
| DELETE | `/api/notes/:noteId` | 删除note | ✅ 必需(验证所有权) |
| PATCH | `/api/notes/:noteId/metadata` | 更新note的metadata | ✅ 必需(验证所有权) |

---

## 二、API详细设计

### 2.1 获取用户的notes列表

**接口**: `GET /api/users/me/notes`

**描述**: 返回当前登录用户创建的所有notes的metadata列表

**请求**:
```http
GET /api/users/me/notes?page=1&limit=50&status=active HTTP/1.1
Authorization: Bearer <jwt-token>
```

**查询参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码,默认1 |
| limit | number | ❌ | 每页数量,默认50,最大100 |
| status | string | ❌ | 过滤状态: all/active/expired,默认all |

**响应 200**:
```json
{
  "notes": [
    {
      "noteId": "abc123xyz",
      "encTitle": "加密的标题",
      "createdAt": "2025-10-17T08:00:00.000Z",
      "expiresAt": "2025-10-17T09:00:00.000Z",
      "deleteAfterReading": false,
      "isPasswordProtected": true,
      "viewCount": 3,
      "status": "active"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 50
}
```

**响应 401**:
```json
{
  "error": {
    "code": "auth.unauthorized",
    "message": "Authentication required"
  }
}
```

**实现代码** (`packages/app-server/src/modules/notes/notes.routes.ts`):

```typescript
function setupGetUserNotesRoute({ app }: { app: ServerInstance }) {
  app.get(
    '/api/users/me/notes',
    protectedRouteMiddleware,
    async (context) => {
      const userId = context.get('userId');
      const storage = context.get('storage');

      // 查询参数
      const page = Number(context.req.query('page')) || 1;
      const limit = Math.min(Number(context.req.query('limit')) || 50, 100);
      const statusFilter = context.req.query('status') || 'all';

      const notesRepository = createNoteRepository({ storage });
      const { notes, total } = await notesRepository.getNotesByUserId({
        userId,
        page,
        limit,
        statusFilter
      });

      // 格式化响应
      const formattedNotes = notes.map(note => ({
        noteId: note.noteId,
        encTitle: note.encTitle,
        createdAt: note.createdAt,
        expiresAt: note.expirationDate,
        deleteAfterReading: note.deleteAfterReading,
        isPasswordProtected: !!note.payload, // TODO: 需要更准确的判断
        viewCount: note.viewCount || 0,
        status: calculateStatus(note)
      }));

      return context.json({
        notes: formattedNotes,
        total,
        page,
        limit
      });
    }
  );
}

// 注册到routes
export function registerNotesRoutes({ app }: { app: ServerInstance }) {
  setupGetNoteRoute({ app });
  setupGetNoteExistsRoute({ app });
  setupCreateNoteRoute({ app });
  setupGetUserNotesRoute({ app });     // 新增
  setupDeleteNoteRoute({ app });        // 新增
}
```

---

### 2.2 获取note的metadata

**接口**: `GET /api/notes/:noteId/metadata`

**描述**: 获取单个note的metadata(不包含加密内容)

**请求**:
```http
GET /api/notes/abc123xyz/metadata HTTP/1.1
```

**响应 200**:
```json
{
  "noteId": "abc123xyz",
  "createdAt": "2025-10-17T08:00:00.000Z",
  "expiresAt": "2025-10-17T09:00:00.000Z",
  "deleteAfterReading": false,
  "viewCount": 3,
  "status": "active"
}
```

**响应 404**:
```json
{
  "error": {
    "code": "note.not_found",
    "message": "Note not found"
  }
}
```

**实现代码**:

```typescript
function setupGetNoteMetadataRoute({ app }: { app: ServerInstance }) {
  app.get('/api/notes/:noteId/metadata', async (context) => {
    const { noteId } = context.req.param();
    const storage = context.get('storage');

    const notesRepository = createNoteRepository({ storage });

    try {
      const { note } = await notesRepository.getNoteById({ noteId });

      return context.json({
        noteId,
        createdAt: note.createdAt,
        expiresAt: note.expirationDate,
        deleteAfterReading: note.deleteAfterReading,
        viewCount: note.viewCount || 0,
        status: calculateStatus(note)
      });
    } catch (error) {
      if (error.code === 'note.not_found') {
        return context.json({ error }, 404);
      }
      throw error;
    }
  });
}
```

---

### 2.3 删除note

**接口**: `DELETE /api/notes/:noteId`

**描述**: 删除指定的note(需要验证所有权)

**请求**:
```http
DELETE /api/notes/abc123xyz HTTP/1.1
Authorization: Bearer <jwt-token>
```

**响应 200**:
```json
{
  "success": true,
  "noteId": "abc123xyz"
}
```

**响应 403**:
```json
{
  "error": {
    "code": "note.forbidden",
    "message": "You don't have permission to delete this note"
  }
}
```

**响应 404**:
```json
{
  "error": {
    "code": "note.not_found",
    "message": "Note not found"
  }
}
```

**实现代码**:

```typescript
function setupDeleteNoteRoute({ app }: { app: ServerInstance }) {
  app.delete(
    '/api/notes/:noteId',
    protectedRouteMiddleware, // 需要认证
    async (context) => {
      const { noteId } = context.req.param();
      const userId = context.get('userId');
      const storage = context.get('storage');

      const notesRepository = createNoteRepository({ storage });

      try {
        // 获取note并验证所有权
        const { note } = await notesRepository.getNoteById({ noteId });

        if (note.createdBy && note.createdBy !== userId) {
          throw createForbiddenError();
        }

        // 删除note
        await notesRepository.deleteNoteById({ noteId });

        return context.json({
          success: true,
          noteId
        });
      } catch (error) {
        if (error.code === 'note.not_found') {
          return context.json({ error }, 404);
        }
        if (error.code === 'note.forbidden') {
          return context.json({ error }, 403);
        }
        throw error;
      }
    }
  );
}

// 新增错误类型
export function createForbiddenError(): CustomError {
  return {
    code: 'note.forbidden',
    message: 'You don\'t have permission to delete this note',
  };
}
```

---

### 2.4 更新note的metadata (可选)

**接口**: `PATCH /api/notes/:noteId/metadata`

**描述**: 更新note的metadata(如标题)

**请求**:
```http
PATCH /api/notes/abc123xyz/metadata HTTP/1.1
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "encTitle": "新的加密标题"
}
```

**响应 200**:
```json
{
  "success": true,
  "noteId": "abc123xyz"
}
```

**实现代码**:

```typescript
function setupUpdateNoteMetadataRoute({ app }: { app: ServerInstance }) {
  app.patch(
    '/api/notes/:noteId/metadata',
    protectedRouteMiddleware,
    validateJsonBody(
      z.object({
        encTitle: z.string().optional()
      })
    ),
    async (context) => {
      const { noteId } = context.req.param();
      const { encTitle } = context.req.valid('json');
      const userId = context.get('userId');
      const storage = context.get('storage');

      const notesRepository = createNoteRepository({ storage });

      try {
        const { note } = await notesRepository.getNoteById({ noteId });

        if (note.createdBy && note.createdBy !== userId) {
          throw createForbiddenError();
        }

        await notesRepository.updateNoteMetadata({
          noteId,
          encTitle
        });

        return context.json({
          success: true,
          noteId
        });
      } catch (error) {
        // 错误处理同删除API
        throw error;
      }
    }
  );
}
```

---

## 三、Repository层新增方法

**文件**: `packages/app-server/src/modules/notes/notes.repository.ts`

### 3.1 按用户ID查询notes

```typescript
async function getNotesByUserId({
  userId,
  page = 1,
  limit = 50,
  statusFilter = 'all',
  storage
}: {
  userId: string;
  page?: number;
  limit?: number;
  statusFilter?: 'all' | 'active' | 'expired';
  storage: Storage<DatabaseNote>;
}): Promise<{ notes: Note[]; total: number }> {
  // 方案1: 使用内存索引(推荐)
  const noteIds = userNotesIndex.get(userId) || new Set();
  const allNotes = await Promise.all(
    Array.from(noteIds).map(async id => {
      try {
        const note = await storage.getItem(id);
        return note ? { noteId: id, ...note } : null;
      } catch {
        return null;
      }
    })
  );

  // 过滤null和按状态过滤
  let filteredNotes = allNotes.filter(n => n !== null);

  if (statusFilter !== 'all') {
    filteredNotes = filteredNotes.filter(note => {
      const status = calculateStatus(note);
      return statusFilter === 'active'
        ? status === 'active'
        : status === 'expired';
    });
  }

  // 排序(最新的在前)
  filteredNotes.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 分页
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedNotes = filteredNotes.slice(start, end);

  return {
    notes: paginatedNotes,
    total: filteredNotes.length
  };
}
```

### 3.2 更新metadata

```typescript
async function updateNoteMetadata({
  noteId,
  encTitle,
  storage
}: {
  noteId: string;
  encTitle?: string;
  storage: Storage<DatabaseNote>;
}): Promise<void> {
  const note = await storage.getItem(noteId);

  if (!note) {
    throw createNoteNotFoundError();
  }

  if (encTitle !== undefined) {
    note.encTitle = encTitle;
  }

  await storage.setItem(noteId, note);
}
```

### 3.3 计算note状态

```typescript
function calculateStatus(note: Note): 'active' | 'expired' | 'destroyed' {
  const now = new Date();

  if (note.expirationDate) {
    const expiresAt = new Date(note.expirationDate);
    if (now > expiresAt) {
      return 'expired';
    }
  }

  if (note.deleteAfterReading && note.viewCount && note.viewCount > 0) {
    return 'destroyed';
  }

  return 'active';
}
```

---

## 四、修改创建API

### 4.1 扩展CreateNote请求

**修改**: `packages/app-server/src/modules/notes/notes.routes.ts`

```typescript
function setupCreateNoteRoute({ app }: { app: ServerInstance }) {
  app.post(
    '/api/notes',
    protectedRouteMiddleware,
    validateJsonBody(
      z.object({
        payload: z.string(),
        deleteAfterReading: z.boolean(),
        ttlInSeconds: z.number().optional(),
        encryptionAlgorithm: z.enum(encryptionAlgorithms),
        serializationFormat: z.enum(serializationFormats),
        isPublic: z.boolean().optional().default(true),

        // === 新增字段 ===
        encTitle: z.string().optional(),          // 加密的标题
        linkToUser: z.boolean().optional().default(true) // 是否关联用户
      })
    ),
    async (context, next) => {
      // 验证逻辑(同原来)
      await next();
    },
    async (context) => {
      const {
        payload,
        ttlInSeconds,
        deleteAfterReading,
        encryptionAlgorithm,
        serializationFormat,
        isPublic,
        encTitle,      // 新增
        linkToUser     // 新增
      } = context.req.valid('json');

      const storage = context.get('storage');
      const userId = context.get('userId');
      const isAuthenticated = context.get('isAuthenticated');

      const notesRepository = createNoteRepository({ storage });

      // 创建note
      const { noteId } = await notesRepository.saveNote({
        payload,
        ttlInSeconds,
        deleteAfterReading,
        encryptionAlgorithm,
        serializationFormat,
        isPublic,
        encTitle,
        createdBy: (isAuthenticated && linkToUser) ? userId : undefined, // 新增
        createdAt: new Date().toISOString() // 新增
      });

      return context.json({ noteId });
    }
  );
}
```

---

## 五、错误处理

### 5.1 新增错误类型

**文件**: `packages/app-server/src/modules/notes/notes.errors.ts`

```typescript
export function createForbiddenError(): CustomError {
  return {
    code: 'note.forbidden',
    message: 'You don\'t have permission to perform this action',
  };
}

export function createInvalidPageError(): CustomError {
  return {
    code: 'note.invalid_page',
    message: 'Invalid page number',
  };
}
```

### 5.2 统一错误响应

所有API使用统一的错误格式:

```json
{
  "error": {
    "code": "error.code",
    "message": "Human readable message"
  }
}
```

---

## 六、API测试用例

### 6.1 获取用户notes列表

```bash
# 测试1: 成功获取
curl -X GET "http://localhost:8787/api/users/me/notes" \
  -H "Authorization: Bearer <token>"

# 预期: 200, 返回notes列表

# 测试2: 未认证
curl -X GET "http://localhost:8787/api/users/me/notes"

# 预期: 401, 返回unauthorized错误

# 测试3: 分页
curl -X GET "http://localhost:8787/api/users/me/notes?page=2&limit=10" \
  -H "Authorization: Bearer <token>"

# 预期: 200, 返回第2页的10条记录
```

### 6.2 删除note

```bash
# 测试1: 成功删除
curl -X DELETE "http://localhost:8787/api/notes/abc123" \
  -H "Authorization: Bearer <token>"

# 预期: 200, { "success": true }

# 测试2: 删除他人的note
curl -X DELETE "http://localhost:8787/api/notes/xyz789" \
  -H "Authorization: Bearer <other-user-token>"

# 预期: 403, forbidden错误

# 测试3: 删除不存在的note
curl -X DELETE "http://localhost:8787/api/notes/nonexistent" \
  -H "Authorization: Bearer <token>"

# 预期: 404, not_found错误
```

---

**下一步**: 阅读 [04-前端设计.md](./04-前端设计.md) 或直接开始实现

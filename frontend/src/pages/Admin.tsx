import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Eye, Lock, Clock, Shield, RefreshCw, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, sharesApi, setAuthToken } from '../lib/api';
import type { Share } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<Share[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareToDelete, setShareToDelete] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      loadShares();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminApi.login(password);
      setAuthToken(result.token);
      setIsAuthenticated(true);
      toast.success('登录成功');
      loadShares();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const loadShares = async () => {
    try {
      const data = await sharesApi.list();
      setShares(data);
    } catch (error: any) {
      toast.error('加载失败');
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleDelete = async () => {
    if (!shareToDelete) return;

    try {
      await sharesApi.delete(shareToDelete);
      toast.success('删除成功');
      loadShares();
      setDeleteDialogOpen(false);
      setShareToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败');
    }
  };

  const openDeleteDialog = (id: string) => {
    setShareToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCleanExpired = async () => {
    try {
      const result = await sharesApi.cleanExpired();
      toast.success(`已清理 ${result.deletedCount} 个过期分享`);
      loadShares();
    } catch (error: any) {
      toast.error('清理失败');
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setShares([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">管理员登录</h2>
            <p className="text-center text-muted-foreground mb-6">
              请输入管理员密码以访问后台
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理员密码"
                className="text-center text-lg h-12"
                autoFocus
                required
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    登录
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full"
              >
                返回首页
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleCleanExpired}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              清理过期
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20">
            <CardContent className="flex items-center p-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">总分享数</p>
                <p className="text-4xl font-bold text-primary">{shares.length}</p>
                <p className="text-xs text-muted-foreground mt-1">所有创建的分享</p>
              </div>
              <Shield className="w-12 h-12 text-primary/20" />
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardContent className="flex items-center p-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">总浏览次数</p>
                <p className="text-4xl font-bold text-accent">
                  {shares.reduce((sum, s) => sum + s.viewCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">累计浏览量</p>
              </div>
              <Eye className="w-12 h-12 text-accent/20" />
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="flex items-center p-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">活跃分享</p>
                <p className="text-4xl font-bold text-primary">
                  {shares.filter(s => !s.expiresAt || new Date(s.expiresAt) > new Date()).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">未过期的分享</p>
              </div>
              <Clock className="w-12 h-12 text-primary/20" />
            </CardContent>
          </Card>
        </div>

        {/* Shares List */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              分享管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shares.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                    <Shield className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                </div>
                <p className="text-lg text-muted-foreground">暂无分享</p>
                <p className="text-sm text-muted-foreground/60 mt-2">创建第一个分享吧</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>内容预览</TableHead>
                      <TableHead>浏览次数</TableHead>
                      <TableHead>过期时间</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shares.map((share) => (
                      <TableRow key={share.id}>
                        <TableCell>
                          <button
                            onClick={() => navigate(`/share/${share.id}`)}
                            className="font-mono text-xs text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
                            title="点击查看分享详情"
                          >
                            {share.id}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{share.content}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm font-medium text-primary">
                            <Eye className="w-3 h-3" />
                            {share.viewCount}
                            {share.maxViews && <span className="text-muted-foreground">/ {share.maxViews}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {share.expiresAt ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4" />
                              {new Date(share.expiresAt).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">永久</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(share.createdAt).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => openDeleteDialog(share.id)}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除此分享吗?此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

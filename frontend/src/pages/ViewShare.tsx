import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, Clock, Copy, Check, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { sharesApi } from '../lib/api';
import type { Share } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ViewSharePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState<Share | null>(null);
  const [copied, setCopied] = useState(false);
  const loadingRef = useRef(false);

  const loadShare = async (pwd?: string) => {
    if (!id || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await sharesApi.view(id, pwd);
      setShare(data);
      setNeedsPassword(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setNeedsPassword(true);
        if (pwd) {
          toast.error('密码错误');
        }
      } else {
        toast.error(error.response?.data?.message || '加载失败');
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadShare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    loadShare(password);
  };

  const handleCopy = () => {
    if (share?.content) {
      navigator.clipboard.writeText(share.content);
      setCopied(true);
      toast.success('内容已复制');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/20 via-pink-50/20 to-rose-50/20 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-12 h-12 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">需要密码</h2>
            <p className="text-center text-muted-foreground mb-6">
              此分享受密码保护,请输入正确的密码以查看内容
            </p>

            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入访问密码"
                className="text-center text-lg h-12"
                autoFocus
                required
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    验证中...
                  </>
                ) : (
                  '查看内容'
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

  if (!share) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Button>

        <div className="space-y-6">
          {/* 分享限制信息卡片 */}
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" />
                分享信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 浏览次数 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">浏览次数</p>
                    <p className="text-2xl font-bold text-primary">
                      {share.viewCount}
                      {share.maxViews && <span className="text-sm text-muted-foreground ml-1">/ {share.maxViews}</span>}
                    </p>
                    {share.maxViews ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        剩余 {Math.max(0, share.maxViews - share.viewCount)} 次
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">无限制</p>
                    )}
                  </div>
                </div>

                {/* 过期时间 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">过期时间</p>
                    {share.expiresAt ? (
                      <>
                        <p className="text-lg font-bold text-accent truncate">
                          {new Date(share.expiresAt).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(() => {
                            const now = new Date();
                            const expires = new Date(share.expiresAt);
                            const diff = expires.getTime() - now.getTime();
                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                            if (diff < 0) return '已过期';
                            if (days > 0) return `剩余 ${days} 天`;
                            if (hours > 0) return `剩余 ${hours} 小时`;
                            return `剩余 ${minutes} 分钟`;
                          })()}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">永久有效</p>
                        <p className="text-xs text-muted-foreground mt-1">无过期时间</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 创建时间 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">创建时间</p>
                    <p className="text-lg font-bold text-primary truncate">
                      {new Date(share.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const now = new Date();
                        const created = new Date(share.createdAt);
                        const diff = now.getTime() - created.getTime();
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                        if (days > 0) return `${days} 天前创建`;
                        if (hours > 0) return `${hours} 小时前创建`;
                        return '刚刚创建';
                      })()}
                    </p>
                  </div>
                </div>

                {/* 内容大小 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">内容大小</p>
                    <p className="text-2xl font-bold text-accent">{share.content.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">字符</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 内容卡片 */}
          <Card className="shadow-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-3xl flex items-center gap-2">
                  <FileText className="w-8 h-8 text-primary" />
                  分享内容
                </CardTitle>
                <Button
                  onClick={handleCopy}
                  variant={copied ? "default" : "outline"}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制内容
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-6 border min-h-[300px]">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">{share.content}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

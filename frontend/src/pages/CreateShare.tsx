import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Share2, Lock, Eye, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { sharesApi } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type ExpireMode = 'quick' | 'custom' | 'datetime';

export default function CreateSharePage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [expireMode, setExpireMode] = useState<ExpireMode>('quick');
  const [quickExpire, setQuickExpire] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [exactDateTime, setExactDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const calculateExpiresAt = (): string | undefined => {
    if (expireMode === 'quick' && quickExpire) {
      const minutes = parseInt(quickExpire);
      return new Date(Date.now() + minutes * 60 * 1000).toISOString();
    }

    if (expireMode === 'custom' && customValue) {
      const value = parseInt(customValue);
      let minutes = value;
      if (customUnit === 'hours') minutes = value * 60;
      if (customUnit === 'days') minutes = value * 24 * 60;
      return new Date(Date.now() + minutes * 60 * 1000).toISOString();
    }

    if (expireMode === 'datetime' && exactDateTime) {
      return new Date(exactDateTime).toISOString();
    }

    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('请输入分享内容');
      return;
    }

    setLoading(true);

    try {
      const expiresAt = calculateExpiresAt();

      const result = await sharesApi.create({
        content,
        password: password || undefined,
        maxViews: maxViews ? parseInt(maxViews) : undefined,
        expiresAt,
      });

      const url = `${window.location.origin}/share/${result.id}`;
      setShareUrl(url);
      toast.success('分享创建成功!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('链接已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    const expiresAt = calculateExpiresAt();
    let info = `分享链接: ${shareUrl}\n`;
    if (password) {
      info += `访问密码: ${password}\n`;
    }
    if (maxViews) {
      info += `最大浏览次数: ${maxViews}\n`;
    }
    if (expiresAt) {
      info += `过期时间: ${new Date(expiresAt).toLocaleString('zh-CN')}\n`;
    }

    navigator.clipboard.writeText(info);
    setCopiedAll(true);
    toast.success('全部信息已复制');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleVisit = () => {
    window.open(shareUrl, '_blank');
  };

  if (shareUrl) {
    const expiresAt = calculateExpiresAt();
    const shareInfo = {
      url: shareUrl,
      hasPassword: !!password,
      maxViews: maxViews ? parseInt(maxViews) : null,
      expiresAt: expiresAt,
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardContent className="pt-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-primary" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-primary mb-8">
              创建成功!
            </h2>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="share-url" className="font-semibold">分享链接</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopy}
                    variant={copied ? "default" : "outline"}
                    size="icon"
                    className="shrink-0"
                    title="复制链接"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* 分享限制信息 */}
              {(shareInfo.hasPassword || shareInfo.maxViews || shareInfo.expiresAt) && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-sm">分享限制</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {shareInfo.hasPassword && (
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">访问密码:</span>
                        <span className="font-mono font-semibold">{password}</span>
                      </div>
                    )}
                    {shareInfo.maxViews && (
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-accent" />
                        <span className="text-muted-foreground">最大浏览:</span>
                        <span className="font-semibold">{shareInfo.maxViews} 次</span>
                      </div>
                    )}
                    {shareInfo.expiresAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">过期时间:</span>
                        <span className="font-semibold text-xs">
                          {new Date(shareInfo.expiresAt).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                onClick={handleCopyAll}
                variant={copiedAll ? "default" : "outline"}
                className="gap-2"
              >
                {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                复制全部信息
              </Button>
              <Button
                onClick={handleVisit}
                variant="outline"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                访问分享
              </Button>
            </div>

            <div className="h-px bg-border my-6" />

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setShareUrl('');
                  setContent('');
                  setPassword('');
                  setMaxViews('');
                  setExpireMode('quick');
                  setQuickExpire('');
                  setCustomValue('');
                  setCustomUnit('hours');
                  setExactDateTime('');
                }}
                className="w-full gap-2"
              >
                <Share2 className="w-4 h-4" />
                创建新分享
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full"
              >
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
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

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Share2 className="w-8 h-8 text-primary" />
              创建分享
            </CardTitle>
            <CardDescription className="text-base">
              创建一个安全的文本分享链接,支持多种保护选项
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 分享内容 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="content" className="font-semibold">
                    <span className="text-destructive">*</span> 分享内容
                  </Label>
                  <span className="text-sm text-muted-foreground">{content.length} 字符</span>
                </div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-64 font-mono text-sm resize-none"
                  placeholder="输入要分享的内容..."
                  required
                />
              </div>

              {/* 可选配置 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">可选配置</span>
                </div>
              </div>

              {/* 两列布局 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 左列 */}
                <div className="space-y-6">
                  {/* 密码保护 */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      访问密码
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="留空表示不设密码"
                    />
                    <p className="text-sm text-muted-foreground">设置后需要密码才能查看</p>
                  </div>

                  {/* 浏览限制 */}
                  <div className="space-y-2">
                    <Label htmlFor="maxViews" className="font-semibold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      最大浏览次数
                    </Label>
                    <Input
                      id="maxViews"
                      type="number"
                      min="1"
                      value={maxViews}
                      onChange={(e) => setMaxViews(e.target.value)}
                      placeholder="不限制"
                    />
                    <p className="text-sm text-muted-foreground">达到次数后自动失效</p>
                  </div>
                </div>

                {/* 右列 - 过期时间 */}
                <div className="space-y-2">
                  <Label className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    过期时间
                  </Label>

                  {/* 模式选择按钮 */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={expireMode === 'quick' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExpireMode('quick')}
                    >
                      快速
                    </Button>
                    <Button
                      type="button"
                      variant={expireMode === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExpireMode('custom')}
                    >
                      自定义
                    </Button>
                    <Button
                      type="button"
                      variant={expireMode === 'datetime' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExpireMode('datetime')}
                    >
                      精确
                    </Button>
                  </div>

                  {/* 快速选择 */}
                  {expireMode === 'quick' && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <Button
                        type="button"
                        variant={quickExpire === '5' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuickExpire('5')}
                      >
                        5分钟
                      </Button>
                      <Button
                        type="button"
                        variant={quickExpire === '15' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuickExpire('15')}
                      >
                        15分钟
                      </Button>
                      <Button
                        type="button"
                        variant={quickExpire === '60' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuickExpire('60')}
                      >
                        1小时
                      </Button>
                      <Button
                        type="button"
                        variant={quickExpire === '360' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuickExpire('360')}
                      >
                        6小时
                      </Button>
                      <Button
                        type="button"
                        variant={quickExpire === '1440' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuickExpire('1440')}
                      >
                        1天
                      </Button>
                      <Button
                        type="button"
                        variant={quickExpire === '10080' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuickExpire('10080')}
                      >
                        7天
                      </Button>
                    </div>
                  )}

                  {/* 自定义 */}
                  {expireMode === 'custom' && (
                    <div className="flex gap-2 pt-2">
                      <Input
                        type="number"
                        min="1"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="数值"
                        className="flex-1"
                      />
                      <select
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                        className="px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="minutes">分钟</option>
                        <option value="hours">小时</option>
                        <option value="days">天</option>
                      </select>
                    </div>
                  )}

                  {/* 精确时间 */}
                  {expireMode === 'datetime' && (
                    <div className="pt-2">
                      <Input
                        type="datetime-local"
                        value={exactDateTime}
                        onChange={(e) => setExactDateTime(e.target.value)}
                      />
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    {expireMode === 'quick' && !quickExpire && '选择快速选项,或留空表示永不过期'}
                    {expireMode === 'quick' && quickExpire && '到期后自动删除'}
                    {expireMode === 'custom' && '输入数值和单位,留空表示永不过期'}
                    {expireMode === 'datetime' && '选择具体的过期日期和时间'}
                  </p>
                </div>
              </div>

              {/* 提交按钮 */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    创建分享
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

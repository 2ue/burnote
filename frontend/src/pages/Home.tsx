import { useNavigate } from 'react-router-dom';
import { Share2, Lock, Eye, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-7xl w-full text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Sparkles className="w-20 h-20 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-primary opacity-30 animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
            Burnote
          </h1>

          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto font-semibold">
            Share Once, Burn Forever
          </p>

          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            安全的临时文本分享平台
            <br />
            支持密码保护、浏览限制和自动过期 · 阅后即焚
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Lock className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold mb-1">密码保护</h3>
                <p className="text-sm text-muted-foreground">安全加密</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-accent/20">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Eye className="w-10 h-10 text-accent mb-3" />
                <h3 className="font-semibold mb-1">浏览限制</h3>
                <p className="text-sm text-muted-foreground">次数控制</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Clock className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold mb-1">自动过期</h3>
                <p className="text-sm text-muted-foreground">定时销毁</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-accent/20">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Share2 className="w-10 h-10 text-accent mb-3" />
                <h3 className="font-semibold mb-1">一键分享</h3>
                <p className="text-sm text-muted-foreground">快速便捷</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => navigate('/create')}
              size="lg"
              className="gap-2"
            >
              <Share2 className="w-5 h-5" />
              创建分享
            </Button>
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Lock className="w-5 h-5" />
              管理后台
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card className="border-primary/20">
              <CardContent className="flex flex-col items-center p-6">
                <p className="text-sm text-muted-foreground mb-2">安全加密</p>
                <p className="text-4xl font-bold text-primary mb-2">100%</p>
                <p className="text-xs text-muted-foreground">端到端保护</p>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardContent className="flex flex-col items-center p-6">
                <p className="text-sm text-muted-foreground mb-2">易于使用</p>
                <p className="text-4xl font-bold text-accent mb-2">3</p>
                <p className="text-xs text-muted-foreground">步即可分享</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="flex flex-col items-center p-6">
                <p className="text-sm text-muted-foreground mb-2">开源免费</p>
                <p className="text-4xl font-bold text-primary mb-2">MIT</p>
                <p className="text-xs text-muted-foreground">自托管部署</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private adminService: AdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('未提供认证信息');
    }

    // 期望格式: "Bearer password"
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('认证格式错误');
    }

    const isValid = await this.adminService.validatePassword(token);
    if (!isValid) {
      throw new UnauthorizedException('认证失败');
    }

    return true;
  }
}

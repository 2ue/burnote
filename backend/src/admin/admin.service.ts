import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  async validatePassword(password: string): Promise<boolean> {
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 如果未配置管理员密码,拒绝所有访问
    if (!adminPassword) {
      return false;
    }

    // 支持明文比对(仅开发环境)和bcrypt哈希比对
    if (adminPassword.startsWith('$2')) {
      // bcrypt哈希
      return bcrypt.compare(password, adminPassword);
    } else {
      // 明文比对(仅用于开发)
      return password === adminPassword;
    }
  }

  async login(password: string) {
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 如果未配置管理员密码,直接拒绝登录
    if (!adminPassword) {
      throw new UnauthorizedException('管理功能未启用');
    }

    const isValid = await this.validatePassword(password);
    if (!isValid) {
      throw new UnauthorizedException('密码错误');
    }
    return { token: password }; // 简单实现:直接返回密码作为token
  }
}

import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShareDto } from './dto/create-share.dto';
import { ViewShareDto } from './dto/view-share.dto';
import { hashPassword, verifyPassword } from '../utils/password';
import { nanoid } from 'nanoid';

@Injectable()
export class SharesService {
  constructor(private prisma: PrismaService) {}

  async create(createShareDto: CreateShareDto) {
    const { content, password, maxViews, expiresAt } = createShareDto;

    // 生成短ID
    const id = nanoid(10);

    // 如果有密码,进行哈希
    const hashedPassword = password ? await hashPassword(password) : null;

    // 创建分享
    const share = await this.prisma.share.create({
      data: {
        id,
        content,
        password: hashedPassword,
        maxViews,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        maxViews: true,
      },
    });

    return share;
  }

  async findOne(id: string, viewShareDto?: ViewShareDto) {
    const share = await this.prisma.share.findUnique({
      where: { id },
    });

    if (!share) {
      throw new NotFoundException('分享不存在');
    }

    // 检查是否过期
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new BadRequestException('分享已过期');
    }

    // 检查浏览次数限制
    if (share.maxViews && share.viewCount >= share.maxViews) {
      throw new BadRequestException('分享已达到最大浏览次数');
    }

    // 验证密码
    if (share.password) {
      if (!viewShareDto?.password) {
        throw new UnauthorizedException('需要密码');
      }
      const isPasswordValid = await verifyPassword(share.password, viewShareDto.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('密码错误');
      }
    }

    // 增加浏览次数
    await this.prisma.share.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // 返回内容(不包含密码哈希)
    return {
      id: share.id,
      content: share.content,
      viewCount: share.viewCount + 1,
      maxViews: share.maxViews,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt,
    };
  }

  async findAll() {
    return this.prisma.share.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        viewCount: true,
        maxViews: true,
        expiresAt: true,
        createdAt: true,
        password: false,
      },
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.share.delete({
        where: { id },
      });
      return { message: '删除成功' };
    } catch (error) {
      throw new NotFoundException('分享不存在');
    }
  }

  async cleanExpired() {
    const result = await this.prisma.share.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return { deletedCount: result.count };
  }
}

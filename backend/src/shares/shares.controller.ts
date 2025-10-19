import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/create-share.dto';
import { ViewShareDto } from './dto/view-share.dto';
import { AdminGuard } from '../admin/admin.guard';

@ApiTags('分享管理')
@Controller('api/shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  @ApiOperation({ summary: '创建分享' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createShareDto: CreateShareDto) {
    return this.sharesService.create(createShareDto);
  }

  @Post(':id/view')
  @ApiOperation({ summary: '查看分享内容' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '需要密码或密码错误' })
  @ApiResponse({ status: 404, description: '分享不存在' })
  view(@Param('id') id: string, @Body() viewShareDto: ViewShareDto) {
    return this.sharesService.findOne(id, viewShareDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有分享(需要管理员密码)' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  findAll() {
    return this.sharesService.findAll();
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除分享(需要管理员密码)' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  remove(@Param('id') id: string) {
    return this.sharesService.remove(id);
  }

  @Post('clean-expired')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '清理过期分享(需要管理员密码)' })
  @ApiResponse({ status: 200, description: '清理成功' })
  cleanExpired() {
    return this.sharesService.cleanExpired();
  }
}

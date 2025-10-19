import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsDateString } from 'class-validator';

export class CreateShareDto {
  @ApiProperty({ description: '分享的文本内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '访问密码(可选)' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: '最大浏览次数(可选)', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxViews?: number;

  @ApiPropertyOptional({ description: '过期时间(ISO 8601格式,可选)', example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

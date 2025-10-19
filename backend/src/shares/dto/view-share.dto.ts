import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ViewShareDto {
  @ApiPropertyOptional({ description: '访问密码(如果需要)' })
  @IsOptional()
  @IsString()
  password?: string;
}

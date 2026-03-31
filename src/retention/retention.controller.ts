import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RetentionService } from './retention.service';

@Controller('retention')
@UseGuards(JwtAuthGuard)
export class RetentionController {
  constructor(private retentionService: RetentionService) {}

  @Get()
  findAll(@Query('batchId') batchId?: string, @Query('status') status?: string) {
    return this.retentionService.findAll(batchId, status);
  }

  @Get('expiring')
  getExpiring(@Query('days') days?: string) {
    return this.retentionService.getExpiring(days ? parseInt(days) : 30);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.retentionService.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.retentionService.create(req.user, body);
  }

  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.retentionService.withdraw(id, req.user, body);
  }
}

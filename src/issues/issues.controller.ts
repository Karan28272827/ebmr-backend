import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IssuesService } from './issues.service';

@UseGuards(JwtAuthGuard)
@Controller('issues')
export class IssuesController {
  constructor(private svc: IssuesService) {}

  @Get()
  findAll(@Query('batchId') batchId?: string, @Query('status') status?: string, @Query('severity') severity?: string) {
    return this.svc.findAll({ batchId, status, severity });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  create(@Request() req, @Body() body: { title: string; description: string; severity: string; batchId?: string; assignedTo?: string }) {
    return this.svc.create(req.user, body);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Request() req, @Body() body: { status: string }) {
    return this.svc.updateStatus(id, req.user, body.status);
  }

  @Put(':id/resolve')
  resolve(@Param('id') id: string, @Request() req, @Body() body: { resolution: string }) {
    return this.svc.resolve(id, req.user, body.resolution);
  }

  @Put(':id/close')
  close(@Param('id') id: string, @Request() req) {
    return this.svc.close(id, req.user);
  }
}

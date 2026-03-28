import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DeviationsService } from './deviations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('deviations')
export class DeviationsController {
  constructor(private deviationsService: DeviationsService) {}

  @Get()
  findAll(@Query('batchId') batchId?: string, @Query('status') status?: string) {
    return this.deviationsService.findAll({ batchId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviationsService.findOne(id);
  }

  @Post()
  create(@Request() req, @Body() body: { batchId: string; stepNumber: number; fieldName: string; expectedRange: string; actualValue: number }) {
    return this.deviationsService.manualCreate(req.user, body);
  }

  @Put(':id/close')
  close(@Param('id') id: string, @Request() req, @Body() body: { resolutionNotes: string }) {
    return this.deviationsService.close(id, req.user, body.resolutionNotes);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Request() req, @Body() body: { status: string }) {
    return this.deviationsService.updateStatus(id, req.user, body.status);
  }
}

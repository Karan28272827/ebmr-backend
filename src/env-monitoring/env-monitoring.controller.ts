import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EnvMonitoringService } from './env-monitoring.service';

@Controller('env-monitoring')
@UseGuards(JwtAuthGuard)
export class EnvMonitoringController {
  constructor(private envMonitoringService: EnvMonitoringService) {}

  @Get('areas')
  findAllAreas(@Query('isActive') isActive?: string) {
    return this.envMonitoringService.findAllAreas(isActive !== undefined ? isActive === 'true' : undefined);
  }

  @Get('areas/:id')
  findArea(@Param('id') id: string) {
    return this.envMonitoringService.findArea(id);
  }

  @Post('areas')
  createArea(@Request() req: any, @Body() body: any) {
    return this.envMonitoringService.createArea(req.user, body);
  }

  @Get('dashboard')
  getDashboard() {
    return this.envMonitoringService.getDashboard();
  }

  @Get('readings')
  getReadings(@Query('areaId') areaId?: string, @Query('readingType') readingType?: string, @Query('days') days?: string) {
    return this.envMonitoringService.getReadings(areaId, readingType, days ? parseInt(days) : 30);
  }

  @Post('readings')
  recordReading(@Request() req: any, @Body() body: any) {
    return this.envMonitoringService.recordReading(req.user, body);
  }
}

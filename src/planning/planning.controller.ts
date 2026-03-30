import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlanningService } from './planning.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlanningController {
  constructor(private planningService: PlanningService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('period') period?: string) {
    return this.planningService.findAll(status, period);
  }

  @Get('calendar')
  getCalendar() {
    return this.planningService.getCalendar();
  }

  @Get('expiry-alerts')
  getExpiryAlerts(
    @Query('level') level?: string,
    @Query('materialCode') materialCode?: string,
  ) {
    return this.planningService.getExpiryAlerts(level, materialCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planningService.findOne(id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.planningService.create(req.user, body);
  }

  @Post(':id/batches')
  addPlannedBatch(
    @Param('id') id: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.planningService.addPlannedBatch(id, req.user, body);
  }

  @Post(':id/simulate')
  simulatePlan(@Param('id') id: string) {
    return this.planningService.simulatePlan(id);
  }

  @Patch(':id/approve')
  approvePlan(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { signature?: any },
  ) {
    return this.planningService.approvePlan(id, req.user, body.signature);
  }

  @Post(':planId/batches/:batchId/initiate')
  initiateBatch(
    @Param('planId') planId: string,
    @Param('batchId') batchId: string,
    @Request() req,
    @Body() body: { templateId: string; batchNumber: string },
  ) {
    return this.planningService.initiateBatch(planId, batchId, req.user, body);
  }

  @Patch('expiry-alerts/:id/acknowledge')
  acknowledgeAlert(@Param('id') id: string, @Request() req) {
    return this.planningService.acknowledgeAlert(id, req.user);
  }
}

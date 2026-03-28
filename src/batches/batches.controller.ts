import { Controller, Get, Post, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Get('templates')
  getTemplates() {
    return this.batchesService.getTemplates();
  }

  @Get()
  findAll() {
    return this.batchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Post()
  create(@Request() req, @Body() body: { templateId: string; batchSize: number; batchNumber: string }) {
    return this.batchesService.create(req.user, body.templateId, body.batchSize, body.batchNumber);
  }

  @Put(':id/transition')
  transition(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { toState: string; signature?: any },
  ) {
    return this.batchesService.transition(id, req.user, body.toState, body.signature);
  }

  @Put(':id/steps/:stepNumber/complete')
  completeStep(
    @Param('id') id: string,
    @Param('stepNumber') stepNumber: string,
    @Request() req,
    @Body() body: { actualValues: any; signature?: any },
  ) {
    return this.batchesService.completeStep(id, req.user, parseInt(stepNumber), body.actualValues, body.signature);
  }

  @Put(':id/steps/:stepNumber/skip')
  skipStep(@Param('id') id: string, @Param('stepNumber') stepNumber: string, @Request() req) {
    return this.batchesService.skipStep(id, req.user, parseInt(stepNumber));
  }

  @Post(':id/signature')
  addSignature(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { meaning: string; stepOrTransition: string; password: string },
  ) {
    return this.batchesService.addSignature(id, req.user, body.meaning, body.stepOrTransition, body.password);
  }
}

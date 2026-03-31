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
import { CapaService } from './capa.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('capa')
export class CapaController {
  constructor(private capaService: CapaService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('source') source?: string) {
    return this.capaService.findAll(status, source);
  }

  @Get('dashboard')
  getDashboard() {
    return this.capaService.getDashboard();
  }

  @Get('batch/:batchId')
  findByBatch(@Param('batchId') batchId: string) {
    return this.capaService.findByBatch(batchId);
  }

  @Get('deviation/:deviationId')
  findByDeviation(@Param('deviationId') deviationId: string) {
    return this.capaService.findByDeviation(deviationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capaService.findOne(id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.capaService.create(req.user, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.capaService.update(id, req.user, body);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.capaService.close(id, req.user, body);
  }
}

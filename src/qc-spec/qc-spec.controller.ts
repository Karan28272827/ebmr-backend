import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QcSpecService } from './qc-spec.service';

@Controller('qc-specs')
@UseGuards(JwtAuthGuard)
export class QcSpecController {
  constructor(private qcSpecService: QcSpecService) {}

  @Get()
  findAll(@Query('productCode') productCode?: string, @Query('status') status?: string) {
    return this.qcSpecService.findAll(productCode, status);
  }

  @Get('product/:productCode')
  findByProduct(@Param('productCode') productCode: string) {
    return this.qcSpecService.findByProduct(productCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qcSpecService.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.qcSpecService.create(req.user, body);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.qcSpecService.approve(id, req.user);
  }

  @Post(':id/parameters')
  addParameter(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.qcSpecService.addParameter(id, req.user, body);
  }

  @Patch('parameters/:paramId')
  updateParameter(@Param('paramId') paramId: string, @Request() req: any, @Body() body: any) {
    return this.qcSpecService.updateParameter(paramId, req.user, body);
  }
}

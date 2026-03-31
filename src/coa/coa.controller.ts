import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CoaService } from './coa.service';

@Controller('coa')
@UseGuards(JwtAuthGuard)
export class CoaController {
  constructor(private coaService: CoaService) {}

  @Get()
  findAll(@Query('productCode') productCode?: string) {
    return this.coaService.findAll(productCode);
  }

  @Get('batch/:batchId')
  findByBatch(@Param('batchId') batchId: string) {
    return this.coaService.findByBatch(batchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coaService.findOne(id);
  }

  @Post()
  generate(@Request() req: any, @Body() body: any) {
    return this.coaService.generate(req.user, body);
  }

  @Post(':id/release')
  release(@Param('id') id: string, @Request() req: any) {
    return this.coaService.release(id, req.user);
  }
}

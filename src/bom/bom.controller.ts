import { Controller, Get, Post, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BomService } from './bom.service';

@UseGuards(JwtAuthGuard)
@Controller('bom')
export class BomController {
  constructor(private svc: BomService) {}

  @Get('templates/:templateId')
  getTemplateBoM(@Param('templateId') templateId: string) {
    return this.svc.getTemplateBoM(templateId);
  }

  @Post('templates/:templateId/items')
  addItem(
    @Request() req,
    @Param('templateId') templateId: string,
    @Body() body: { materialId: string; qtyPerKg: number; notes?: string },
  ) {
    return this.svc.addItem(req.user, templateId, body);
  }

  @Delete('items/:id')
  removeItem(@Request() req, @Param('id') id: string) {
    return this.svc.removeItem(req.user, id);
  }

  @Get('batches/:batchId')
  getRequiredMaterials(@Param('batchId') batchId: string) {
    return this.svc.getRequiredMaterials(batchId);
  }

  @Get('batches/:batchId/issuances')
  getBatchIssuances(@Param('batchId') batchId: string) {
    return this.svc.getBatchIssuances(batchId);
  }

  @Post('batches/:batchId/issuances')
  issueForBatch(
    @Request() req,
    @Param('batchId') batchId: string,
    @Body() body: { bomItemId: string; lotNumber: string; issuedQty: number },
  ) {
    return this.svc.issueForBatch(req.user, batchId, body);
  }
}

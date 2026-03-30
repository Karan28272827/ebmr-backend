import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BomService } from './bom.service';

@UseGuards(JwtAuthGuard)
@Controller('bom')
export class BomController {
  constructor(private svc: BomService) {}

  // ─── Dynamic BOM ──────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('productCode') productCode?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.findAll(productCode, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.svc.create(req.user, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { status: string },
  ) {
    return this.svc.updateStatus(id, req.user, body.status);
  }

  @Post(':id/simulate')
  simulate(
    @Param('id') id: string,
    @Body() body: { targetBatchSize: number },
  ) {
    return this.svc.simulate(id, body.targetBatchSize);
  }

  // ─── Legacy BOM (BomDefinition page) ─────────────────────────────────────────

  @Get('legacy/all')
  findAllLegacy() {
    return this.svc.findAllLegacy();
  }

  @Post('legacy/items')
  addLegacyBomItem(
    @Body() body: { templateId: string; materialId: string; qtyPerKg: number; notes?: string },
  ) {
    return this.svc.addLegacyBomItem(body.templateId, body.materialId, body.qtyPerKg, body.notes);
  }

  @Delete('legacy/items/:id')
  removeLegacyBomItem(@Param('id') id: string) {
    return this.svc.removeLegacyBomItem(id);
  }

  // ─── Legacy template/batch BOM (preserved existing routes) ───────────────────

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

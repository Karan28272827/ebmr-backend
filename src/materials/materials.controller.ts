import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MaterialsService } from './materials.service';

@UseGuards(JwtAuthGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private svc: MaterialsService) {}

  // ─── Legacy material master ───────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.svc.findAllMaterials();
  }

  @Get('barcode/:code')
  findByBarcode(@Param('code') code: string) {
    return this.svc.findByBarcode(code);
  }

  // ─── Stock & Alerts ───────────────────────────────────────────────────────────

  @Get('stock')
  getStock() {
    return this.svc.getStock();
  }

  @Get('expiry-alerts')
  getExpiryAlerts(
    @Query('level') level?: string,
    @Query('materialCode') materialCode?: string,
  ) {
    return this.svc.getExpiryAlerts(level, materialCode);
  }

  @Patch('expiry-alerts/:id/acknowledge')
  acknowledgeAlert(@Param('id') id: string, @Request() req) {
    return this.svc.acknowledgeAlert(id, req.user);
  }

  // ─── Material Intent ──────────────────────────────────────────────────────────

  @Post('intent')
  createIntent(@Request() req, @Body() body: any) {
    return this.svc.createIntent(req.user, body);
  }

  @Get('intent')
  findAllIntents(
    @Query('status') status?: string,
    @Query('materialCode') materialCode?: string,
  ) {
    return this.svc.findAllIntents(status, materialCode);
  }

  // ─── Purchase Orders ──────────────────────────────────────────────────────────

  @Post('po')
  createPO(@Request() req, @Body() body: any) {
    return this.svc.createPO(req.user, body);
  }

  @Get('po')
  findAllPOs(@Query('status') status?: string) {
    return this.svc.findAllPOs(status);
  }

  // ─── Material Receipts ────────────────────────────────────────────────────────

  @Post('receipts')
  createReceipt(@Request() req, @Body() body: any) {
    return this.svc.createReceipt(req.user, body);
  }

  @Get('receipts')
  findAllReceipts(
    @Query('qcStatus') qcStatus?: string,
    @Query('expiryBefore') expiryBefore?: string,
  ) {
    return this.svc.findAllReceipts(qcStatus, expiryBefore);
  }

  @Get('receipts/expiring')
  getExpiring(@Query('days') days?: string) {
    return this.svc.getExpiring(days ? parseInt(days, 10) : 90);
  }

  @Get('receipts/:id')
  findReceiptById(@Param('id') id: string) {
    return this.svc.findReceiptById(id);
  }

  // ─── GRN ──────────────────────────────────────────────────────────────────────

  @Post('grn')
  createGRN(
    @Request() req,
    @Body() body: { po_id: string; receipt_ids: string[]; invoice_ref?: string; payment_due?: string },
  ) {
    return this.svc.createGRN(req.user, body);
  }

  @Patch('grn/:id/accounts')
  updateGRNAccounts(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { accounts_status: string; invoice_ref?: string; payment_due?: string },
  ) {
    return this.svc.updateGRNAccounts(id, req.user, body);
  }

  // ─── Legacy single-material CRUD (preserved) ─────────────────────────────────

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  createMaterial(
    @Body() body: { materialCode: string; materialName: string; unit: string; description?: string },
  ) {
    return this.svc.createMaterial(body);
  }

  @Put(':id')
  updateMaterial(
    @Param('id') id: string,
    @Body() body: { materialName?: string; unit?: string; description?: string },
  ) {
    return this.svc.updateMaterial(id, body);
  }
}

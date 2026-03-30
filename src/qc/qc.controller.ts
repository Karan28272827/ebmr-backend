import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QcService } from './qc.service';

@UseGuards(JwtAuthGuard)
@Controller('qc')
export class QcController {
  constructor(private qcService: QcService) {}

  @Get('dashboard')
  getDashboard() {
    return this.qcService.getDashboard();
  }

  // ─── Tests ────────────────────────────────────────────────────────────────────

  @Get('tests')
  findAll(
    @Query('stage') stage?: string,
    @Query('status') status?: string,
    @Query('batchId') batchId?: string,
  ) {
    return this.qcService.findAll(stage, status, batchId);
  }

  @Get('tests/:id')
  findOne(@Param('id') id: string) {
    return this.qcService.findOne(id);
  }

  @Post('tests')
  createTest(@Request() req, @Body() body: any) {
    return this.qcService.createTest(req.user, body);
  }

  @Post('tests/:id/results')
  submitResults(@Param('id') id: string, @Request() req, @Body() body: { results: any[] }) {
    return this.qcService.submitResults(id, req.user, body.results);
  }

  @Patch('tests/:id/verdict')
  recordVerdict(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { verdict: string; notes?: string },
  ) {
    return this.qcService.recordVerdict(id, req.user, body.verdict, body.notes);
  }

  // ─── Checklists ───────────────────────────────────────────────────────────────

  @Get('checklists')
  findAllChecklists(@Query('stage') stage?: string) {
    return this.qcService.findAllChecklists(stage);
  }

  @Post('checklists')
  createChecklist(@Request() req, @Body() body: any) {
    return this.qcService.createChecklist(req.user, body);
  }

  @Get('checklists/:id')
  findChecklist(@Param('id') id: string) {
    return this.qcService.findChecklist(id);
  }

  @Post('checklists/:id/items')
  addChecklistItems(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { items: any[] },
  ) {
    return this.qcService.addChecklistItems(id, req.user, body.items);
  }

  // ─── Executions ───────────────────────────────────────────────────────────────

  @Post('executions')
  startChecklistExecution(
    @Request() req,
    @Body() body: { checklistId: string; qcTestId: string },
  ) {
    return this.qcService.startChecklistExecution(req.user, body.checklistId, body.qcTestId);
  }

  @Patch('executions/:executionId/items/:itemId')
  updateChecklistItem(
    @Param('executionId') executionId: string,
    @Param('itemId') itemId: string,
    @Request() req,
    @Body() body: { is_completed: boolean; value_recorded?: string; notes?: string },
  ) {
    return this.qcService.updateChecklistItem(executionId, itemId, req.user, body);
  }

  @Post('executions/:executionId/complete')
  completeChecklistExecution(
    @Param('executionId') executionId: string,
    @Request() req,
  ) {
    return this.qcService.completeChecklistExecution(executionId, req.user);
  }
}

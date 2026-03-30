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
import { ProcessFlowService } from './process-flow.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('process-flow')
export class ProcessFlowController {
  constructor(private processFlowService: ProcessFlowService) {}

  @Get()
  findAll(@Query('productCode') productCode?: string) {
    return this.processFlowService.findAll(productCode);
  }

  @Get('by-product/:code')
  findByProduct(@Param('code') code: string) {
    return this.processFlowService.findByProduct(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processFlowService.findOne(id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.processFlowService.create(req.user, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.processFlowService.update(id, req.user, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { status: string },
  ) {
    return this.processFlowService.updateStatus(id, req.user, body.status);
  }

  @Post(':id/documents')
  addDocument(
    @Param('id') id: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.processFlowService.addDocument(id, req.user, body);
  }
}

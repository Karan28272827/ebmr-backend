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
import { SopService } from './sop.service';

@UseGuards(JwtAuthGuard)
@Controller('sop')
export class SopController {
  constructor(private sopService: SopService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('productCategory') productCategory?: string,
  ) {
    return this.sopService.findAll(status, productCategory);
  }

  @Get('by-bom/:bomId')
  findByBom(@Param('bomId') bomId: string) {
    return this.sopService.findByBom(bomId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sopService.findOne(id);
  }

  @Get(':id/qc-parameters')
  getQCParameters(@Param('id') id: string) {
    return this.sopService.getQCParameters(id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.sopService.create(req.user, body);
  }

  @Post(':id/sections')
  addSection(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.sopService.addSection(id, req.user, body);
  }

  @Post(':id/qc-parameters')
  addQCParameterSet(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.sopService.addQCParameterSet(id, req.user, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { status: string; signature?: any },
  ) {
    return this.sopService.updateStatus(id, req.user, body.status, body.signature);
  }

  @Post(':id/clone')
  clone(@Param('id') id: string, @Request() req) {
    return this.sopService.clone(id, req.user);
  }
}

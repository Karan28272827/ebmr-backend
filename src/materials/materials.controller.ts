import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MaterialsService } from './materials.service';

@UseGuards(JwtAuthGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private svc: MaterialsService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get('barcode/:code')
  findByCode(@Param('code') code: string) { return this.svc.findByCode(code); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  create(@Body() body: { materialCode: string; materialName: string; unit: string; description?: string }) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { materialName?: string; unit?: string; description?: string }) {
    return this.svc.update(id, body);
  }
}

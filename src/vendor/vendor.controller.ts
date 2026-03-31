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
import { VendorService } from './vendor.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.vendorService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.vendorService.create(req.user, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.vendorService.update(id, req.user, body);
  }

  @Post(':id/qualify')
  qualify(@Param('id') id: string, @Request() req) {
    return this.vendorService.qualify(id, req.user);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @Request() req, @Body() body: { reason: string }) {
    return this.vendorService.suspend(id, req.user, body.reason);
  }
}

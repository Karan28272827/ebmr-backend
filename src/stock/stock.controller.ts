import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StockService } from './stock.service';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private stockService: StockService) {}

  @Get()
  getCurrentStock(@Query('materialCode') materialCode?: string) {
    return this.stockService.getCurrentStock(materialCode);
  }

  @Get('ledger')
  getLedger(@Query('materialCode') materialCode?: string, @Query('limit') limit?: string) {
    return this.stockService.getLedger(materialCode, limit ? parseInt(limit) : 100);
  }

  @Get('expiry')
  getExpiryReport() {
    return this.stockService.getExpiryReport();
  }

  @Post('movement')
  recordMovement(@Request() req: any, @Body() body: any) {
    return this.stockService.recordMovement(req.user, body);
  }

  @Post('fefo-issue')
  fefoIssue(@Request() req: any, @Body() body: any) {
    return this.stockService.fefoIssue(req.user, body);
  }
}

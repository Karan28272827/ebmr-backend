import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  findAllUsers(@Request() req) {
    return this.adminService.findAllUsers(req.user);
  }

  @Post('users')
  createUser(
    @Request() req,
    @Body() body: { email: string; name: string; role: string; password: string },
  ) {
    return this.adminService.createUser(req.user, body);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { name?: string; role?: string; is_active?: boolean },
  ) {
    return this.adminService.updateUser(req.user, id, body);
  }

  @Post('users/:id/unlock')
  unlockUser(@Param('id') id: string, @Request() req) {
    return this.adminService.unlockUser(req.user, id);
  }

  @Post('users/:id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { newPassword: string },
  ) {
    return this.adminService.resetPassword(req.user, id, body.newPassword);
  }

  @Get('users/:id/activity')
  getUserActivity(@Param('id') id: string, @Request() req) {
    return this.adminService.getUserActivity(req.user, id);
  }
}

import { Controller, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  findAll(@Request() req) {
    return this.sessionsService.findAll(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  revokeSession(@Param('id') id: string, @Request() req) {
    return this.sessionsService.revokeSession(id, req.user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Revoke all sessions except current' })
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully' })
  revokeAllSessions(@Request() req) {
    return this.sessionsService.revokeAllSessions(req.user.id, req.session?.id);
  }
}

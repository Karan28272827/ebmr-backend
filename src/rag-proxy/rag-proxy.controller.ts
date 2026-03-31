import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('rag')
@UseGuards(JwtAuthGuard)
export class RagProxyController {
  constructor(private readonly http: HttpService) {}

  @Post('query')
  async query(@Body() body: { question: string; top_k?: number }) {
    const ragUrl = process.env.RAG_SERVICE_URL;
    if (!ragUrl) {
      throw new HttpException('RAG service not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    try {
      const { data } = await firstValueFrom(
        this.http.post(`${ragUrl}/query/`, body, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          timeout: 30000,
        }),
      );
      return data;
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.BAD_GATEWAY;
      const message = err?.response?.data?.detail || err?.message || 'RAG service error';
      throw new HttpException(message, status);
    }
  }
}

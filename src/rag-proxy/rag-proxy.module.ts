import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RagProxyController } from './rag-proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [RagProxyController],
})
export class RagProxyModule {}

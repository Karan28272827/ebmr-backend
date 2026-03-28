import { Module } from '@nestjs/common';
import { BatchesModule } from '../batches/batches.module';

@Module({
  imports: [BatchesModule],
})
export class StepsModule {}

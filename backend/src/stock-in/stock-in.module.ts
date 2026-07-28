import { Module } from '@nestjs/common';
import { StockInService } from './stock-in.service';
import { StockInController } from './stock-in.controller';

@Module({
  providers: [StockInService],
  controllers: [StockInController],
})
export class StockInModule {}

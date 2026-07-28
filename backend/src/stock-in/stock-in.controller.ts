import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StockInService } from './stock-in.service';
import { CreateStockInDto } from './dto/create-stock-in.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('stock-ins')
export class StockInController {
  constructor(private readonly stockInService: StockInService) {}

  @Post()
  create(@Body() dto: CreateStockInDto, @CurrentUser() user: AuthUser) {
    return this.stockInService.create(dto, user.userId);
  }

  @Get()
  findAll() {
    return this.stockInService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockInService.findOne(id);
  }
}

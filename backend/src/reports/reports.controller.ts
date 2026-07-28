import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  summary(@Query() query: ReportQueryDto) {
    return this.reportsService.summary(query.from, query.to);
  }

  @Get('daily')
  daily(@Query() query: ReportQueryDto) {
    return this.reportsService.daily(query.from, query.to);
  }

  @Get('top-products')
  topProducts(@Query() query: ReportQueryDto) {
    return this.reportsService.topProducts(query.from, query.to);
  }
}

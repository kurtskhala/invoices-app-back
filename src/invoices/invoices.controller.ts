import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import mongoose, { mongo } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('invoices')
export class InvoicesController {
  postModel: any;
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Req() request, @Body() createInvoiceDto: CreateInvoiceDto) {
    const userId = request.userId;
    return this.invoicesService.create(createInvoiceDto, userId);
  }

  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Req() request,
  ) {
    const userId = request.userId;
    return this.invoicesService.update(id, updateInvoiceDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') invoiceId: string, @Req() request) {
    const userId = request.userId;
    await this.invoicesService.removeInvoiceFromUser(userId, invoiceId);
    return this.invoicesService.remove(invoiceId, userId);
  }
}

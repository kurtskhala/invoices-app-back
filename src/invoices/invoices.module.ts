import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './schema/invoice.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService],
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    UsersModule,
  ],
})
export class InvoicesModule {}

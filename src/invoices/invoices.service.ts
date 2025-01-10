import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateInvoiceDto, ItemDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './schema/invoice.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    private usersService: UsersService,
  ) {}

  private generateInvoiceId(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randLetters = Array(2)
      .fill(0)
      .map(() => letters[Math.floor(Math.random() * letters.length)])
      .join('');
    const randNumbers = Array(4)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join('');
    return `${randLetters}${randNumbers}`;
  }

  private calculateTotal(items): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async create(createInvoiceDto: CreateInvoiceDto, userId) {
    const total = this.calculateTotal(createInvoiceDto.items);
    const items = createInvoiceDto.items.map((item) => ({
      ...item,
      total: item.price * item.quantity,
    }));
    const user = await this.usersService.findOne(userId);

    if (!Object.keys(user).length)
      throw new BadRequestException('user not found');
    if ('_id' in user) {
      const expense = await this.invoiceModel.create({
        ...createInvoiceDto,
        id: this.generateInvoiceId(),
        items,
        total,
        user: userId,
        paymentDue: new Date(
          new Date(createInvoiceDto.invoiceDate).getTime() +
            createInvoiceDto.paymentTerms * 24 * 60 * 60 * 1000,
        ),
      });
      await this.usersService.addInvoice(user._id, expense._id);
      return expense;
    }
  }

  findAll() {
    return this.invoiceModel.find();
  }

  async findOne(id: mongoose.Schema.Types.ObjectId) {
    const expense = await this.invoiceModel.findById(id).populate('user');
    return expense || {};
  }

  async update(id: string, updateInvoiceDto, userId: string) {
    let updateData = { ...updateInvoiceDto };

    if (updateInvoiceDto.items) {
      const total = this.calculateTotal(updateInvoiceDto.items);
      const items = updateInvoiceDto.items.map((item) => ({
        ...item,
        total: item.price * item.quantity,
      }));
      updateData = { ...updateData, items, total };
    }

    if (updateInvoiceDto.paymentTerms) {
      updateData.paymentDue = new Date(
        new Date(updateInvoiceDto.invoiceDate).getTime() +
          updateInvoiceDto.paymentTerms * 24 * 60 * 60 * 1000,
      );
    }

    const updatedInvoice = await this.invoiceModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedInvoice) {
      throw new Error('Invoice not found or update failed');
    }

    return updatedInvoice;
  }

  async removeInvoiceFromUser(userId: string, invoiceId: string): Promise<any> {
    return this.usersService.removeInvoice(userId, invoiceId);
  }

  async remove(id, userId) {
    const post = await this.invoiceModel.findById(id);

    if (!post) {
      throw new BadGatewayException('Expense not found');
    }

    if (userId === post.user.toString()) {
      const deletedPost = await this.invoiceModel.findByIdAndDelete(id);
      return { message: 'post deleted', data: deletedPost };
    }

    throw new BadGatewayException('Permission denied');
  }
}

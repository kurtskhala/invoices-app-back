import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { Invoice } from 'src/invoices/schema/invoice.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Invoice.name) private invoicesModel: Model<Invoice>,
  ) {}

  async create(body) {
    const existUser = await this.userModel.findOne({
      email: body.email,
    });
    if (existUser) throw new BadGatewayException('user already exists');
    const user = await this.userModel.create(body);
    return user;
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: mongoose.Schema.Types.ObjectId) {
    if (!isValidObjectId(id))
      throw new BadGatewayException('Not valid id is provided');
    return this.userModel.findById(id);
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).select('+password');
    return user;
  }

  async update(id, body) {
    if (!isValidObjectId(id))
      throw new BadGatewayException('Not valid id is provided');
    const updatedUser = await this.userModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    return { message: 'user updated successfully', data: updatedUser };
  }

  async remove(id: mongoose.Schema.Types.ObjectId) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deletedInvoices = await this.invoicesModel.deleteMany({
      _id: { $in: user.invoices },
    });
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    return { message: 'user deleted', data: deletedUser };
  }

  async addInvoice(id, invoiceId) {
    const user = await this.userModel.findById(id);
    if (!user) throw new BadRequestException('user not found');

    const invoices = user.invoices;
    invoices.push(invoiceId);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { ...user, invoices },
      {
        new: true,
      },
    );
    return updatedUser;
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/schema/user.schema';

@Schema()
class Address {
  @Prop({ type: String })
  street: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  postCode: string;

  @Prop({ type: String })
  country: string;
}

@Schema()
class Item {
  @Prop({ type: String })
  name: string;

  @Prop({ type: Number })
  quantity: number;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Number })
  total: number;
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  paymentDue: Date;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number, required: true })
  paymentTerms: number;

  @Prop({ type: String })
  clientName: string;

  @Prop({ type: String })
  clientEmail: string;

  @Prop({ type: String, enum: ['paid', 'pending', 'draft'], default: 'pending' })
  status: string;

  @Prop({ type: Address })
  senderAddress: Address;

  @Prop({ type: Address })
  clientAddress: Address;

  @Prop({ type: [Item] })
  items: Item[];

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  user: mongoose.Schema.Types.ObjectId;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
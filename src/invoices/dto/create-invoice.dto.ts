import { IsString, IsNumber, IsEmail, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  postCode: string;

  @IsString()
  country: string;
}

export class ItemDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateInvoiceDto {
  @IsString()
  description: string;

  @IsNumber()
  paymentTerms: number;

  @IsString()
  clientName: string;

  @IsEmail()
  clientEmail: string;

  @IsEnum(['paid', 'pending', 'draft'])
  status: string;

  @ValidateNested()
  @Type(() => AddressDto)
  senderAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  clientAddress: AddressDto;

  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}
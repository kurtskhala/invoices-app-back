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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Req() request, @Body() body: UpdateUserDto) {
    const userId = request.userId;
    return this.usersService.update(userId, body);
  }

  @Delete('')
  @UseGuards(AuthGuard)
  remove(@Req() request) {
    const userId = request.userId;
    return this.usersService.remove(userId);
  }
}

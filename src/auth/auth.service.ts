import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import mongoose, { mongo } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signUp(signUpDto: SignUpDto) {
    const existUser = await this.usersService.findOneByEmail(signUpDto.email);
    if (existUser) throw new BadRequestException('User already exists');

    const hashedPass = await bcrypt.hash(signUpDto.password, 10);
    await this.usersService.create({ ...signUpDto, password: hashedPass });
    return 'user created successfully';
  }

  async signIn(signInDto: SignInDto) {
    const existUser = await this.usersService.findOneByEmail(signInDto.email);
    if (!existUser)
      throw new BadRequestException('Email or passwor is not correct');
    const isPassEqual = await bcrypt.compare(
      signInDto.password,
      existUser.password,
    );
    if (!isPassEqual)
      throw new BadRequestException('Email or passwor is not correct');
    const payload = {
      userId: existUser._id,
    };
    const accessToken = await this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    return { accessToken };
  }

  async getCurrentUser(userId: mongoose.Schema.Types.ObjectId) {
    const user = await this.usersService.findOne(userId);
    return user;
  }
}

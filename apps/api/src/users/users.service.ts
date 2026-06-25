import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Only DIR users should have a directionId
    const userData: any = {
      ...createUserDto,
      password: hashedPassword,
    };

    // Clear directionId for non-DIR users
    if (createUserDto.role !== 'dir') {
      delete userData.directionId;
    }

    const createdUser = new this.userModel(userData);

    const savedUser = await createdUser.save();
    return this.sanitizeUser(savedUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().populate('directionId', 'name code').exec();
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByMatricule(matricule: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ matricule: matricule.toUpperCase() }).select('+password').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Prepare update data
    const updateData: any = { ...updateUserDto };

    // Clear directionId for non-DIR users
    if (updateUserDto.role && updateUserDto.role !== 'dir') {
      updateData.directionId = null;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
    });
  }

  private sanitizeUser(user: UserDocument): User {
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }
}

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Direction, DirectionDocument } from './schemas/direction.schema';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';

@Injectable()
export class DirectionsService {
    constructor(
        @InjectModel(Direction.name)
        private directionModel: Model<DirectionDocument>,
    ) { }

    async findAll(): Promise<Direction[]> {
        return this.directionModel.find({ isActive: true }).sort({ name: 1 }).exec();
    }

    async findOne(id: string): Promise<Direction> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid direction ID');
        }

        const direction = await this.directionModel.findById(id).exec();
        if (!direction) {
            throw new NotFoundException(`Direction with ID ${id} not found`);
        }

        return direction;
    }

    async create(createDirectionDto: CreateDirectionDto, userId: string): Promise<Direction> {
        try {
            const direction = new this.directionModel({
                ...createDirectionDto,
                code: createDirectionDto.code.toUpperCase(),
                createdBy: new Types.ObjectId(userId),
            });

            return await direction.save();
        } catch (error: any) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                throw new ConflictException(`Direction with this ${field} already exists`);
            }
            throw error;
        }
    }

    async update(id: string, updateDirectionDto: UpdateDirectionDto): Promise<Direction> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid direction ID');
        }

        const updateData: any = { ...updateDirectionDto };

        if (updateDirectionDto.code) {
            updateData.code = updateDirectionDto.code.toUpperCase();
        }



        try {
            const direction = await this.directionModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .exec();

            if (!direction) {
                throw new NotFoundException(`Direction with ID ${id} not found`);
            }

            return direction;
        } catch (error: any) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                throw new ConflictException(`Direction with this ${field} already exists`);
            }
            throw error;
        }
    }

    async remove(id: string): Promise<{ message: string }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid direction ID');
        }

        const direction = await this.directionModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        if (!direction) {
            throw new NotFoundException(`Direction with ID ${id} not found`);
        }

        return { message: 'Direction deleted successfully' };
    }
}

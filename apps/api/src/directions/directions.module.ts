import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Direction, DirectionSchema } from './schemas/direction.schema';
import { DirectionsController } from './directions.controller';
import { DirectionsService } from './directions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Direction.name, schema: DirectionSchema },
    ]),
  ],
  controllers: [DirectionsController],
  providers: [DirectionsService],
  exports: [DirectionsService],
})
export class DirectionsModule { }

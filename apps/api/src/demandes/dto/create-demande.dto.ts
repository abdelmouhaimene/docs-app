import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { DemandeCategory } from '../schemas/demande.schema';

export class CreateDemandeDto {
    @ApiProperty({ example: 'test010203' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ enum: DemandeCategory, default: DemandeCategory.DOCUMENT })
    @IsNotEmpty()
    category: DemandeCategory;

    @ApiProperty({ example: '211777' })
    @IsString()
    @IsNotEmpty()
    matricule: string;

    // File properties are typically handled by Multer but we validate them if passed manually or need to store them
    // In a typical upload flow, these might be extracted from the uploaded file object in the controller
    // But strictly following the schema fields for DB creation:
}

export class UpdateDemandeDto {
    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    consulte?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    accepte?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    integre?: boolean;
}

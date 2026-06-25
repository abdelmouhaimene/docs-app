import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';
import { DirectionsModule } from './directions/directions.module';
import { DemandesModule } from './demandes/demandes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryAttempts: 3,
        retryDelay: 1000,
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    // Feature modules
    AuthModule,
    UsersModule,
    DocumentsModule,
    UploadModule,
    HealthModule,
    DirectionsModule,
    DemandesModule,
    DashboardModule,
    CommentsModule,

    // Static Files - serve at /documents/ for new uploads
    ServeStaticModule.forRoot({
      rootPath: join(process.env.UPLOAD_PATH || join(process.cwd(), 'uploads'), 'documents'),
      serveRoot: '/documents',
    }),
    // Static Files - serve at /uploads/documents/ for backward compatibility with existing DB records
    ServeStaticModule.forRoot({
      rootPath: join(process.env.UPLOAD_PATH || join(process.cwd(), 'uploads'), 'documents'),
      serveRoot: '/uploads/documents',
    }),
  ],
})
export class AppModule { }

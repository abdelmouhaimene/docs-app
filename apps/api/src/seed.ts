import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    console.log('🌱 Seeding database...');

    // Check if admin already exists
    const existingAdmin = await usersService.findByMatricule('217977');

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with matricule 217977');
    } else {
      // Create SYS admin user (password will be hashed by the service)
      const adminUser = await usersService.create({
        matricule: '217977',
        email: 'admin@mca.ma',
        name: 'System Administrator',
        password: '21797799',
        role: UserRole.SYS,
      });

      console.log('✅ SYS admin user created successfully!');
      console.log('   Matricule: 217977');
      console.log('   Password: 21797799');
      console.log('   Role: SYS');
      console.log('   Email: admin@mca.ma');
    }

    console.log('🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap();

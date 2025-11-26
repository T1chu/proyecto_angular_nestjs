// social-network-backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PublicationsModule } from './publications/publications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/redsocial',
    ),

    // 🔥 FIX REAL PARA RENDER
    // Ahora Render puede servir /uploads/... correctamente
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        redirect: false,
      },
    }),

    MulterModule.register({
      dest: './uploads',
    }),

    AuthModule,
    UsersModule,
    PublicationsModule,
  ],
})
export class AppModule {}

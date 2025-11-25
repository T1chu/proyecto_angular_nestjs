// social-network-backend/src/publications/publications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { PublicationSchema } from './schemas/publication.schema';
import { CommentSchema } from './schemas/comment.schema';
import { UserSchema } from '../users/schemas/user.schema'; // ← Importar UserSchema
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Publication', schema: PublicationSchema },
      { name: 'Comment', schema: CommentSchema },
      { name: 'User', schema: UserSchema }, // ← Agregar User
    ]),
    AuthModule,
  ],
  controllers: [PublicationsController, EstadisticasController],
  providers: [PublicationsService, EstadisticasService],
})
export class PublicationsModule {}
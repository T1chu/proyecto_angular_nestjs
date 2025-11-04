// src/publications/publications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { PublicationSchema } from './schemas/publication.schema';
import { CommentSchema } from './schemas/comment.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Publication', schema: PublicationSchema },
      { name: 'Comment', schema: CommentSchema },
    ]),
    AuthModule,
  ],
  controllers: [PublicationsController],
  providers: [PublicationsService],
})
export class PublicationsModule {}

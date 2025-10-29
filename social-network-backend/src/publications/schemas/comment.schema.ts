// src/publications/schemas/comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  mensaje: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Publication', required: true })
  publicacion: Types.ObjectId;

  @Prop({ default: false })
  modificado: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
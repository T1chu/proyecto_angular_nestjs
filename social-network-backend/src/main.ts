import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import { existsSync, mkdirSync, readdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Crear carpetas si no existen (compatible con Windows)
  const uploadsPath = resolve(__dirname, '..', 'uploads');
  const perfilesPath = join(uploadsPath, 'perfiles');
  const publicacionesPath = join(uploadsPath, 'publicaciones');

  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Carpeta uploads creada');
  }
  if (!existsSync(perfilesPath)) {
    mkdirSync(perfilesPath, { recursive: true });
    console.log('✅ Carpeta perfiles creada');
  }
  if (!existsSync(publicacionesPath)) {
    mkdirSync(publicacionesPath, { recursive: true });
    console.log('✅ Carpeta publicaciones creada');
  }

  console.log('\n📁 === CONFIGURACIÓN DE ARCHIVOS ===');
  console.log('📁 Ruta de uploads:', uploadsPath);
  console.log('📁 Carpeta perfiles existe:', existsSync(perfilesPath));
  console.log('📁 Carpeta publicaciones existe:', existsSync(publicacionesPath));

  // Mostrar archivos existentes
  try {
    const perfilesFiles = readdirSync(perfilesPath);
    const publicacionesFiles = readdirSync(publicacionesPath);
    console.log('📷 Imágenes en perfiles:', perfilesFiles.length);
    console.log('📷 Imágenes en publicaciones:', publicacionesFiles.length);
  } catch (error) {
    console.log('⚠️ Error listando archivos:', error);
  }
  console.log('=====================================\n');

  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Servir archivos estáticos - Método más simple
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
  console.log(`📷 Prueba: http://localhost:${port}/uploads/perfiles/`);
  console.log(`📷 Prueba: http://localhost:${port}/uploads/publicaciones/`);
}
bootstrap();

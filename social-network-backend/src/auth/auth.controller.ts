// ==========================================
// ARCHIVO 1: src/auth/auth.controller.ts
// ==========================================
import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `perfil-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('📁 Archivo recibido en backend:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });

        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          console.log('❌ Tipo de archivo rechazado:', file.mimetype);
          return cb(
            new BadRequestException('Solo se permiten imágenes JPG, PNG o GIF'),
            false,
          );
        }

        console.log('✅ Archivo aceptado');
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async registro(
    @Body() body: any, 
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('📝 Body recibido:', body);
    console.log('📷 Archivo recibido:', file ? file.filename : 'Sin archivo');

    // Validar campos obligatorios manualmente
    if (!body.nombre || !body.apellido || !body.nombreUsuario || 
        !body.correo || !body.contrasena || !body.fechaNacimiento) {
      throw new BadRequestException('Faltan campos obligatorios');
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.correo)) {
      throw new BadRequestException('El correo no es válido');
    }

    // Validar contraseña
    if (body.contrasena.length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/^(?=.*[A-Z])(?=.*\d)/.test(body.contrasena)) {
      throw new BadRequestException('La contraseña debe contener al menos una mayúscula y un número');
    }

    try {
      const resultado = await this.authService.registro(body, file);
      console.log('✅ Usuario registrado exitosamente');
      return resultado;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 Intento de login:', {
      usuarioOCorreo: loginDto.usuarioOCorreo,
      tieneContrasena: !!loginDto.contrasena
    });

    try {
      const resultado = await this.authService.login(loginDto);
      console.log('✅ Login exitoso para:', loginDto.usuarioOCorreo);
      return resultado;
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      throw error;
    }
  }

  @Post('autorizar')
  @HttpCode(200)
  async autorizar(@Headers('authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const token = auth.split(' ')[1];
    return this.authService.autorizar(token);
  }

  @Post('refrescar')
  @HttpCode(200)
  async refrescar(@Headers('authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const token = auth.split(' ')[1];
    return this.authService.refrescar(token);
  }
}

// ==========================================
// ARCHIVO 2: src/auth/auth.service.ts
// ==========================================
// (Mantener el mismo que ya tienes, ya está bien)

// social-network-backend/src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface JwtPayload {
  sub: string;
  nombreUsuario: string;
  perfil: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async registro(
    registerDto: RegisterDto,
    file: Express.Multer.File,
  ): Promise<{ mensaje: string; usuario: any }> {
    const { correo, nombreUsuario, contrasena, ...resto } = registerDto;

    console.log('🔍 Verificando si el correo existe...');
    const correoExiste = await this.userModel.findOne({ correo });
    if (correoExiste) {
      throw new ConflictException('El correo ya está registrado');
    }

    console.log('🔍 Verificando si el nombre de usuario existe...');
    const usuarioExiste = await this.userModel.findOne({ nombreUsuario });
    if (usuarioExiste) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const imagenPerfil = file ? `/uploads/perfiles/${file.filename}` : null;
    
    console.log('💾 Creando usuario en la base de datos...');
    const nuevoUsuario = new this.userModel({
      ...resto,
      correo,
      nombreUsuario,
      contrasena: hashedPassword,
      imagenPerfil,
      perfil: 'usuario',
      activo: true
    });

    await nuevoUsuario.save();
    console.log('✅ Usuario guardado con ID:', nuevoUsuario._id);

    return {
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        nombreUsuario: nuevoUsuario.nombreUsuario,
        correo: nuevoUsuario.correo,
        imagenPerfil: nuevoUsuario.imagenPerfil,
      },
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; usuario: any }> {
    const { usuarioOCorreo, contrasena } = loginDto;

    console.log('🔍 Buscando usuario:', usuarioOCorreo);
    const usuario = await this.userModel.findOne({
      $or: [{ correo: usuarioOCorreo }, { nombreUsuario: usuarioOCorreo }],
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('✅ Usuario encontrado:', usuario.nombreUsuario);

    if (!usuario.activo) {
      console.log('❌ Usuario inactivo');
      throw new UnauthorizedException('Usuario inactivo');
    }

    console.log('🔐 Verificando contraseña...');
    console.log('- Contraseña proporcionada:', contrasena);
    console.log('- Hash en BD:', usuario.contrasena.substring(0, 20) + '...');
    
    const contrasenaValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena,
    );
    
    console.log('- Contraseña válida:', contrasenaValida);

    if (!contrasenaValida) {
      console.log('❌ Contraseña incorrecta');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('✅ Login exitoso, generando tokens...');

    const payload: JwtPayload = {
      sub: String(usuario._id),
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      usuario: {
        _id: String(usuario._id),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        fechaNacimiento: usuario.fechaNacimiento,
        descripcion: usuario.descripcion,
        imagenPerfil: usuario.imagenPerfil,
        perfil: usuario.perfil,
        activo: usuario.activo,
      },
    };
  }

  async autorizar(token: string): Promise<{ valido: boolean; usuario?: any }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const usuario = await this.userModel.findById(payload.sub);

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException('Token inválido');
      }

      return {
        valido: true,
        usuario: {
          id: String(usuario._id),
          nombreUsuario: usuario.nombreUsuario,
          perfil: usuario.perfil,
        },
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  refrescar(refreshToken: string): {
    accessToken: string;
    refreshToken: string;
  } {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      const newPayload: JwtPayload = {
        sub: payload.sub,
        nombreUsuario: payload.nombreUsuario,
        perfil: payload.perfil,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}

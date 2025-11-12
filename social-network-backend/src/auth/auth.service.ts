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

    const correoExiste = await this.userModel.findOne({ correo });
    if (correoExiste) {
      throw new ConflictException('El correo ya está registrado');
    }

    const usuarioExiste = await this.userModel.findOne({ nombreUsuario });
    if (usuarioExiste) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = new this.userModel({
      ...resto,
      correo,
      nombreUsuario,
      contrasena: hashedPassword,
      imagenPerfil: file ? `/uploads/perfiles/${file.filename}` : null,
    });

    await nuevoUsuario.save();

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

    const usuario = await this.userModel.findOne({
      $or: [{ correo: usuarioOCorreo }, { nombreUsuario: usuarioOCorreo }],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena,
    );
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

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
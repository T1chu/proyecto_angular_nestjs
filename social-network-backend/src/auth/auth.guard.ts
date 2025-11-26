// social-network-backend/src/auth/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';

interface RequestWithUser {
  headers: {
    authorization?: string;
    Authorization?: string;
    [key: string]: string | undefined;
  };
  user?: {
    sub: string;
    perfil: string;
    nombreUsuario: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      // Verificar el token
      const payload = this.jwtService.verify(token);
      
      // Obtener el usuario completo de la base de datos
      const usuario = await this.userModel.findById(payload.sub);

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException('Usuario inválido o inactivo');
      }

      // Establecer el usuario en la request con TODOS los datos necesarios
      req.user = {
        sub: String(usuario._id),
        perfil: usuario.perfil, // ← ESTO ES CRÍTICO
        nombreUsuario: usuario.nombreUsuario,
      };

      console.log('✅ Usuario autenticado:', {
        id: req.user.sub,
        perfil: req.user.perfil,
        nombreUsuario: req.user.nombreUsuario
      });

      return true;
    } catch (error) {
      console.error('❌ Error en AuthGuard:', error.message);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}

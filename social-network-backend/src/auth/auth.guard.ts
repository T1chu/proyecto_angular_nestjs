import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

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
  constructor(private readonly authService: AuthService) {}

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

    const resultado = await this.authService.autorizar(token);

    // IMPORTANTE: Normalizar la estructura que el backend espera
    req.user = {
      sub: String(resultado.usuario?.id), // Convertir a string explícitamente
      perfil: resultado.usuario?.perfil as string,
      nombreUsuario: resultado.usuario?.nombreUsuario as string,
    };

    console.log('✅ Usuario autenticado:', req.user);

    return true;
  }
}
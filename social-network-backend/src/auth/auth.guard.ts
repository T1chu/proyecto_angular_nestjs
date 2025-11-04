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

    // Normalizar la estructura que el resto del backend espera (req.user.sub, req.user.perfil)
    req.user = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      sub: resultado.usuario?.id as string,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      perfil: resultado.usuario?.perfil as string,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      nombreUsuario: resultado.usuario?.nombreUsuario as string,
    };

    return true;
  }
}




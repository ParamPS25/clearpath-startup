import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  email: string;
  display_picture: string;
  role: string;
}

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    email: user.email,
    display_picture: user.display_picture,
    role: user.role,
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      this.logger.warn(
        `Registration attempt with an email already in use: ${email}`,
      );
      throw new ConflictException('Email is already registered');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, password: hashed });
    this.logger.log(`User registered: ${email}`);

    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user: toPublicUser(user) };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login attempt for unknown email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      this.logger.warn(`Login attempt with an incorrect password: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${email}`);
    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user: toPublicUser(user) };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: this.configService.get<string>('JWT_REFRESH_SECRET') },
      );
    } catch {
      this.logger.warn(
        'Refresh attempted with an invalid or expired refresh token',
      );
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      this.logger.warn(
        `Refresh attempted with a stale token for user ${payload.sub}`,
      );
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    this.logger.debug(`Access token refreshed for user ${user._id.toString()}`);
    return this.issueTokenPair(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.incrementTokenVersion(userId);
    this.logger.log(`User logged out: ${userId}`);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return toPublicUser(user);
  }

  private async issueTokenPair(user: UserDocument): Promise<TokenPair> {
    const accessPayload: AccessTokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user._id.toString(),
      tokenVersion: user.tokenVersion,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
        ) as StringValue,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
        ) as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}

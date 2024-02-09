import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { generateVerificationToken } from '../utils/token.utils';
import { VerificationTokenService } from '../verification-token/verification-token.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
    private verificationTokenService: VerificationTokenService,
  ) {}

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);
    // save the new user in the db
    const verificationToken =
      generateVerificationToken();
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });

      await this.verificationTokenService.createVerificationToken(
        user.id,
        verificationToken,
      );

      // Send the verification email
      await this.emailService.sendMail({
        from: `Md Mobinur Rahaman <${this.config.get(
          'SENDER_EMAIL',
        )}>`,
        to: user.email,
        subject: 'Email Verification',
        htmlBody: `
        <p>Thank you for signing up!</p>
        <p>Please click the following link to verify your email:</p>
        <a href="http://localhost:3333/verify/${verificationToken}">Verify Email</a>
      `,
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async verifyUser(token: string): Promise<any> {
    const verificationToken =
      await this.verificationTokenService.getVerificationTokenByToken(
        token,
      );

    if (!verificationToken) {
      throw new NotFoundException(
        'Verification token not found',
      );
    }

    await this.prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        isEmailVerified: true,
      },
    });

    await this.verificationTokenService.deleteVerificationToken(
      verificationToken.id,
    );

    return verificationToken;
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    // if user does not exist throw exception
    if (!user)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    // compare password
    const pwMatches = await argon.verify(
      user.password,
      dto.password,
    );
    // if password incorrect throw exception
    if (!pwMatches)
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: secret,
      },
    );

    return {
      access_token: token,
    };
  }
}

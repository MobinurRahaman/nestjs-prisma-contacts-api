import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { VerificationTokenService } from 'src/verification-token/verification-token.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private verificationTokenService: VerificationTokenService,
  ) {}

  async verifyUser(token: string) {
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

  async editUser(
    userId: number,
    dto: EditUserDto,
  ) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.password;

    return user;
  }
}

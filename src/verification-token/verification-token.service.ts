import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class VerificationTokenService {
  constructor(private prisma: PrismaService) {}

  async createVerificationToken(
    userId: number,
    token: string,
  ) {
    return this.prisma.verificationToken.create({
      data: {
        userId,
        token,
      },
    });
  }

  async getVerificationTokenByToken(
    token: string,
  ) {
    const verificationToken =
      await this.prisma.verificationToken.findFirst(
        {
          where: {
            token,
          },
        },
      );

    return verificationToken || null;
  }

  async deleteVerificationToken(
    id: number,
  ): Promise<void> {
    const verificationToken =
      await this.prisma.verificationToken.findUnique(
        {
          where: {
            id,
          },
        },
      );

    if (!verificationToken) {
      throw new NotFoundException(
        'Verification token not found',
      );
    }

    await this.prisma.verificationToken.delete({
      where: {
        id,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto';

@Injectable()
export class contactService {
  constructor(private prisma: PrismaService) {}

  async createContact(
    userId: number,
    dto: CreateContactDto,
  ) {
    const contact =
      await this.prisma.contact.create({
        data: {
          userId,
          ...dto,
        },
      });

    return contact;
  }

  async getContacts(
    userId: number,
    page = 1,
    pageSize = 10,
  ) {
    const limitedPageSize = Math.min(
      pageSize,
      50,
    );
    const skip = (page - 1) * limitedPageSize;

    return this.prisma.contact.findMany({
      where: {
        userId,
      },
      take: limitedPageSize,
      skip,
    });
  }

  async getContactsByNameOrPhone(
    userId: number,
    searchTerm: string,
  ) {
    return this.prisma.contact.findMany({
      where: {
        userId,
        OR: [
          {
            name: {
              contains: searchTerm,
            },
          },
          {
            phone: {
              contains: searchTerm,
            },
          },
        ],
      },
    });
  }
}

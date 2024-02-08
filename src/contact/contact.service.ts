import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContactDto,
  EditContactDto,
} from './dto';

@Injectable()
export class contactService {
  constructor(private prisma: PrismaService) {}

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

  getContactById(
    userId: number,
    contactId: number,
  ) {
    return this.prisma.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
    });
  }

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

  async editContactById(
    userId: number,
    contactId: number,
    dto: EditContactDto,
  ) {
    // get the contact by id
    const contact =
      await this.prisma.contact.findUnique({
        where: {
          id: contactId,
        },
      });

    // check if user owns the contact
    if (!contact || contact.userId !== userId)
      throw new ForbiddenException(
        'Access to resources denied',
      );

    return this.prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteContactById(
    userId: number,
    contactId: number,
  ) {
    const contact =
      await this.prisma.contact.findUnique({
        where: {
          id: contactId,
        },
      });

    // check if user owns the contact
    if (!contact || contact.userId !== userId)
      throw new ForbiddenException(
        'Access to resources denied',
      );

    await this.prisma.contact.delete({
      where: {
        id: contactId,
      },
    });
  }
}

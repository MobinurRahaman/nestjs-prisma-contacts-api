import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { contactService } from './contact.service';
import { CreateContactDto } from './dto';

@UseGuards(JwtGuard)
@Controller('contacts')
export class contactController {
  constructor(
    private contactService: contactService,
  ) {}

  @Post()
  createContact(
    @GetUser('id') userId: number,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactService.createContact(
      userId,
      dto,
    );
  }

  @Get()
  getContacts(
    @GetUser('id') userId: number,
    @Query(
      'page',
      new DefaultValuePipe(1),
      ParseIntPipe,
    )
    page: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      ParseIntPipe,
    )
    pageSize: number,
  ) {
    const limitedPageSize = Math.min(
      pageSize,
      50,
    );

    return this.contactService.getContacts(
      userId,
      page,
      limitedPageSize,
    );
  }

  @Get('search')
  getContactsByNameOrPhone(
    @GetUser('id') userId: number,
    @Query('q') searchTerm: string,
  ) {
    return this.contactService.getContactsByNameOrPhone(
      userId,
      searchTerm,
    );
  }
}

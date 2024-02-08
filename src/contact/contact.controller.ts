import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { contactService } from './contact.service';
import {
  CreateContactDto,
  EditContactDto,
} from './dto';

@UseGuards(JwtGuard)
@Controller('contacts')
export class contactController {
  constructor(
    private contactService: contactService,
  ) {}

  @Get()
  getContacts(@GetUser('id') userId: number) {
    return this.contactService.getContacts(
      userId,
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

  @Get(':id')
  getContactById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) contactId: number,
  ) {
    return this.contactService.getContactById(
      userId,
      contactId,
    );
  }

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

  @Patch(':id')
  editContactById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) contactId: number,
    @Body() dto: EditContactDto,
  ) {
    return this.contactService.editContactById(
      userId,
      contactId,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteContactById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) contactId: number,
  ) {
    return this.contactService.deleteContactById(
      userId,
      contactId,
    );
  }
}

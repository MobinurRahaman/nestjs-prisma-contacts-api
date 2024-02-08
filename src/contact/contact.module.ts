import { Module } from '@nestjs/common';
import { contactController } from './contact.controller';
import { contactService } from './contact.service';

@Module({
  controllers: [contactController],
  providers: [contactService],
})
export class ContactModule {}

import {
  IsOptional,
  IsString,
} from 'class-validator';

export class EditContactDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  postalAddress: string;
}

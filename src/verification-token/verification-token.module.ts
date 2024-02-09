import { Global, Module } from '@nestjs/common';
import { VerificationTokenService } from './verification-token.service';

@Global()
@Module({
  providers: [VerificationTokenService],
  exports: [VerificationTokenService],
})
export class VerificationTokenModule {}

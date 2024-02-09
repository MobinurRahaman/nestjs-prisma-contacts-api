import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';
const mailgun = new Mailgun(formData);

interface MailInput {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface IMail extends MailInput {
  htmlBody?: string;
}

@Injectable()
export class EmailService {
  private mg;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.mg = mailgun.client({
      username: 'api',
      key: this.configService.get(
        'MAILGUN_API_KEY',
      ),
    });
  }

  public async sendMail(mail: IMail) {
    const mailOptions: MailInput = {
      from: `Md Mobinur Rahaman <mailgun@${this.configService.get(
        'MAILGUN_DOMAIN',
      )}>`,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    };

    if (mail.htmlBody) {
      mailOptions.html = mail.htmlBody;
    }

    try {
      const response =
        await this.mg.messages.create(
          this.configService.get(
            'MAILGUN_DOMAIN',
          ),
          mailOptions,
        );
      Logger.log(
        `Email successfully sent to: ${mail.to}.`,
      );
      return response;
    } catch (error) {
      console.log(this.mg);
      console.log(
        `Md Mobinur Rahaman <mailgun@${this.configService.get(
          'MAILGUN_DOMAIN',
        )}`,
        this.configService.get('MAILGUN_DOMAIN'),
        this.configService.get('MAILGUN_API_KEY'),
      );

      Logger.warn(
        `Problem in sending email: ${error}`,
      );
      throw error;
    }
  }
}

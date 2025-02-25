import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getping(): string {
    return 'pong';
  }
  getHello(): string {
    return 'Hello World!';
  }
}

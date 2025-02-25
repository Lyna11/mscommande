import { Controller, Get } from '@nestjs/common';
@Controller('api/ping')
export class PingController {
  @Get()
  getPing(): string {
    return 'pong';
  }
}

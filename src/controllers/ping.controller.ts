import { Controller, Get } from '@nestjs/common';
import { AppService } from '../app.service';
@Controller('api/ping')
export class PingController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getPing(): string {
    return this.appService.getping();
  }
}

import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller('health')
@Throttle({ default: { ttl: 60_000, limit: 200 } })
export class HealthController {
  @Get()
  health() {
    return { ok: true };
  }
}

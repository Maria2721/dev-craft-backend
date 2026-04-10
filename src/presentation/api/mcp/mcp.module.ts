import { Module } from '@nestjs/common';

import { KnowledgeDiModule } from '../../../infrastructure/knowledge/di/knowledge-di.module';
import { InternalModule } from '../internal/internal.module';
import { McpController } from './mcp.controller';

@Module({
  imports: [KnowledgeDiModule, InternalModule],
  controllers: [McpController],
})
export class McpModule {}

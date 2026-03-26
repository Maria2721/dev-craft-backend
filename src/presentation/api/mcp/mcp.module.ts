import { Module } from '@nestjs/common';

import { KnowledgeDiModule } from '../../../infrastructure/knowledge/di/knowledge-di.module';
import { McpController } from './mcp.controller';

@Module({
  imports: [KnowledgeDiModule],
  controllers: [McpController],
})
export class McpModule {}

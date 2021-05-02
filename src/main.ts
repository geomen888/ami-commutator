import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(4000, '127.0.0.1');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

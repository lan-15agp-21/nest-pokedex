import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';


async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v2')
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform:  true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo RESTFul API')
    .setDescription('Teslo shop endoints')
    .setVersion('1.0')
    .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    

  await app.listen( process.env.PORT );
  console.log(`App running on port ${ process.env.PORT }`)
}
bootstrap();

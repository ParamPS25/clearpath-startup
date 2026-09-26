import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { ValidateModule } from './validate/validate.module';
import { SeoModule } from './seo/seo.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

const mongooseLogger = new Logger('MongooseModule');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () =>
            mongooseLogger.log('MongoDB connection established'),
          );
          connection.on('error', (err: Error) =>
            mongooseLogger.error(`MongoDB connection error: ${err.message}`),
          );
          connection.on('disconnected', () =>
            mongooseLogger.warn('MongoDB connection lost'),
          );
          return connection;
        },
      }),
    }),
    HealthModule,
    ValidateModule,
    SeoModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

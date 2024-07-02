import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'rt') {
  constructor(private databaseService: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const payload = JSON.parse(
            Buffer.from(rawJwtToken.split('.')[1], 'base64').toString(),
          );
          const user = await this.databaseService.profile.findUnique({
            where: {
              userId: payload.userId,
            },
          });
          if (!user) {
            return { message: 'user not found' };
          }
          if (!user.secret) {
            return { message: 'session is not active for the user' };
          }
          console.log('secrets');
          console.log(user.secret);

          done(null, user.secret);
        } catch (error) {
          done(error, null);
        }
      },
    });
  }

  async validate(payload: any) {
    return payload;
  }
}

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'at') {
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

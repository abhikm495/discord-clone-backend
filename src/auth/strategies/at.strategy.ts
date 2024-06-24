import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AT_SECRET } from 'src/utils/constants';
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'at') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: AT_SECRET,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}

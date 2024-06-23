import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { RT_SECRET } from 'src/utils/constants';
import { Request } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: RT_SECRET,
      PassReqToCallBack: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.get('autthorization').replace('Bearer', '').trim();
    return {
      ...payload,
      refreshToken,
    };
  }
}

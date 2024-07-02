import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AtGuard extends AuthGuard('at') {
  constructor() {
    super();
  }
}

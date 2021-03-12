import {Exception} from './exception';

export class Firebase {
  exception: Exception;
  userEmail: string;

  constructor() {
    this.exception = new Exception();
    this.userEmail = '';
  }
}

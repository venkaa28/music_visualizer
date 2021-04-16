import {Exception} from './exception';
import {Music} from './music';
import {User} from './user';

export class Firebase {
  exception: Exception;
  userEmail: string;

  constructor() {
    this.exception = new Exception();
    this.userEmail = '';
  }

  storeFile(music: Music): void {

  }
  storeUserAccount(user: User): void {

  }

  retrieveFile(musicID: string): Music {
    return new Music();
  }

  retrieveAccount(userEmail: string): User {
    return new User();
  }
}

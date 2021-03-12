import {User} from './user';
import {VisualPage} from './visualPage';
import {Exception} from './exception';

export class Controller {
  userAccount: User;
  visualPage: VisualPage;
  exception: Exception;

  constructor() {
    this.userAccount = new User();
    this.visualPage = new VisualPage();
    this.exception = new Exception();
  }
}

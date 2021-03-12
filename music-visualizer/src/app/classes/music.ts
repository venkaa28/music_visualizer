import {Exception} from './exception';

export class Music {
  source: string;
  metadata: JSON;
  // what's the data type of a music file?
  // file: mp3;
  uploadEmail: string;
  isPublic: boolean;
  exception: Exception;

  constructor() {
    this.source = '';
    this.metadata = JSON;
    // this.file = mp3;
    this.uploadEmail = '';
    this.isPublic = true;
    this.exception = new Exception();
  }
}

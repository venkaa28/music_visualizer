import {Exception} from './exception';

export class User {
  name: string;
  email: string;
  password: string;

  exception: Exception;
  fileList: string[];
  spotifyAPIKey: string;
  soundCloudAPIKey: string;
  previousMusic: string[];
  previousStyles: number[];


  constructor() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.exception = new Exception();
    this.fileList = [];
    this.spotifyAPIKey = '';
    this.soundCloudAPIKey = '';
    this.previousMusic = [];
    this.previousStyles = [];
  }
}



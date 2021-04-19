export class User {
  name: string;
  email: string;
  password: string;

  spotifyAPIKey: string;
  soundCloudAPIKey: string;


  constructor() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.spotifyAPIKey = '';
    this.soundCloudAPIKey = '';
  }
}



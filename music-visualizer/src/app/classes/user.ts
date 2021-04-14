export class User {
  name: string;
  email: string;

  spotifyAPIKey: string;
  soundCloudAPIKey: string;


  constructor() {
    this.name = '';
    this.email = '';
    this.spotifyAPIKey = '';
    this.soundCloudAPIKey = '';
  }
}

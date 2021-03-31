import {Exception} from './exception';

export class Music {
  name: string;
  source: string;
  metadata: JSON;
  // what's the data type of a music file?
  // file: mp3;
  filepath: string;
  artist: string
  album: string;

  constructor() {
    this.source = '';
    this.metadata = JSON;
    this.name = 'Unknown';
    this.artist = 'Unknown';
    this.album = '../../assets/icons/disc.svg';
  }
}

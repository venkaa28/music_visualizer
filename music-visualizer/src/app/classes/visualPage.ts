import {Exception} from './exception';
import {MusicPlayer} from './musicPlayer';
import {VisualPlayer} from './visualPlayer';
import {Music} from './music';

export class VisualPage {
  volume: number;
  style: number;
  musicList: string[];
  currentMusic: Music;
  musicPlayer: MusicPlayer;
  visualPlayer: VisualPlayer;
  playList: string[];
  exception: Exception;

  constructor() {
    this.volume = 0;
    this.style = 0;
    this.musicList = [];
    this.currentMusic = new Music();
    this.musicPlayer = new MusicPlayer();
    this.visualPlayer = new VisualPlayer();
    this.playList = [];
    this.exception = new Exception();
  }
}

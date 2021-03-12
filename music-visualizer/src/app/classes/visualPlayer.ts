import {Music} from './music';
import {Exception} from './exception';

export class VisualPlayer {
  // what's the data type of canvas??
  // canvas Canvas;
  style: number;
  music: Music;
  exception: Exception;

  constructor() {
    // canvas Canvas;
    this.style = 0;
    this.music = new Music();
    this.exception = new Exception();
  }
}

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {AuthService} from "./auth.service";
import {ToolsService} from "./tools.service";

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  public analysis: {};
  public feature: {};

  public segmentIndex: number; // current segment index
  public segmentEnd: number; // end in ms of current segment
  public sectionIndex: number; // current section index
  public sectionEnd: number; // end in ms of current section
  public avgSegmentDuration: number; // average duration in ms of segments
  public trackDuration: number; // duration of the track in ms
  public firstTimbrePreProcess: number[]; // stored preprocessed data of segment.timbre[0]
  public brightnessTimbrePreProcess: number[]; //stored preprocessed data of segment.timbre[1]
 
  constructor(public http: HttpClient, private authService: AuthService,
              private tool: ToolsService) {
    this.segmentIndex = 0;
    this.segmentEnd = 0;
    this.sectionIndex = 0;
    this.sectionEnd = 0;
    this.firstTimbrePreProcess = null;
    this.brightnessTimbrePreProcess = null;
  }

  // get spotify authentication
  public getAuth(): void {
    let tempURL: string = "https://accounts.spotify.com/authorize?";
    tempURL += 'client_id=' + environment.clientId + '&';
    tempURL += 'redirect_uri=' + 'https://music-visualizer-b2ae6.web.app/Callback/' + '&';
    tempURL += 'scope=' + 'streaming%20user-read-email%20user-read-private%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing' + '&';
    tempURL += 'response_type=token';
    window.location.href = tempURL;
  }

  // get provided track visual analysis data
  public getTrackAnalysisData(trackID: string): void {
    try {
      let url: string = 'https://api.spotify.com/v1/audio-analysis/' + trackID;
      const headers: HttpHeaders = new HttpHeaders()
        .set("Accept", 'application/json')
        .set("Content-Type", 'application/json')
        .set("Authorization", 'Bearer ' + this.authService.getUser().spotifyAPIKey);
      this.http.get(url, {headers}).subscribe((resp) => this.analysis = resp);
    } catch (e) {
      console.log('Error with HTTP Request to spotify for track analysis data: ' + e);
      throw new Error('Error retrieving track analysis data from spotify ');
    }
  }

  // get provided track feature data
  public getTrackFeatureData(trackID: string): void {
    try {
      let url = 'https://api.spotify.com/v1/audio-features/' + trackID;
      const headers = new HttpHeaders()
        .set("Accept", 'application/json')
        .set("Content-Type", 'application/json')
        .set("Authorization", 'Bearer ' + this.authService.getUser().spotifyAPIKey);
      this.http.get(url, {headers}).subscribe((resp) => this.feature = resp);
    } catch (e) {
      console.log('Error with HTTP Request to spotify for track analysis data: ' + e);
      throw new Error('Error retrieving track feature data from spotify ');
    }
  }

  // get the segment at the trackProgress
  public getSegment(trackProgress: number): any {
    // reset data
    if (this.segmentEnd === 0) {
      this.segmentIndex = 0;
    }

    // update only if we're past the end of the most recently grabbed segment
    if (trackProgress >= this.segmentEnd) {
      // serach for segment based on track progress
      while (this.analysis['segments'][this.segmentIndex]!['start'] * 1000 < trackProgress && this.segmentIndex < this.analysis['segments'].length) {
        this.segmentIndex++;
      }

      this.segmentEnd = (this.analysis['segments'][this.segmentIndex]!['start'] + this.analysis['segments'][this.segmentIndex]['duration']) * 1000;
    }

    return this.analysis['segments'][this.segmentIndex];
  }

  // get the section at trackProgress
  public getSection(trackProgress: number): any {
    // reset data
    if (this.sectionEnd === 0) {
      this.sectionIndex = 0;
    }

    // update only if we're past the end of the most recently grabbed section
    if (trackProgress >= this.sectionEnd) {
      // serach for section based on track progress
      while (this.analysis['sections'][this.sectionIndex]['start'] * 1000 <= trackProgress) {
        this.sectionIndex++;
      }

      this.sectionEnd = this.analysis['sections'][this.sectionIndex]['start'] + this.analysis['sections'][this.sectionIndex]['duration'];
    }

    return this.analysis['sections'][this.sectionIndex];
  }

  // get the average duration of all segments for the current track
  public getAvgSegmentDuration(): number {
    if (this.avgSegmentDuration !== 0) {
      return this.avgSegmentDuration;
    } else {
      let sumDuration: number = 0;

      for (let i = 0; i < this.analysis['segments'].length; i++) {
        sumDuration += this.analysis['segments'][i]['duration'];
      }

      this.avgSegmentDuration = sumDuration / this.analysis['segments'].length;
      return this.avgSegmentDuration;
    }
  }

  // get the average for all timbres of the current segment
  public getTimbreAvg(trackProgress: number): number {
    const currSegment: any = this.getSegment(trackProgress);
    return this.tool.absAvg(currSegment.timbre);
  }

  // get the average of all pitches of the current segment scaled up
  public getScaledAvgPitch(trackProgress: number): number {
    const currSegment: any = this.getSegment(trackProgress);
    const pitchAvg: number = this.tool.absAvg(currSegment.pitches);
    return this.tool.modulate(pitchAvg, this.tool.min(currSegment.pitches), this.tool.max(currSegment.pitches), 0, 180);
  }

  // get the average of all pitches of the current segment
  public getAvgPitch(trackProgress: number): number {
    const currSegment: any = this.getSegment(trackProgress);
    return this.tool.absAvg(currSegment.pitches);
  }

  // get the loudness of the current segment
  public getSegmentLoudness(trackProgress: number): number {
    const currSegment: any = this.getSegment(trackProgress);
    return Math.abs(currSegment.loudness_max);
  }

  // get the duration of the current segment in ms
  public getTimeScalar(trackProgress: number): number {
    const currSegment: any = this.getSegment(trackProgress);
    const segDuration: number = currSegment.duration;
    return (1 - segDuration) / 100;
  }

  // preprocess the timbre data for faster real time performance
  public async getTimbrePreProcessing(): Promise<void> {
    return new Promise(() => {
      const avgSegmentDuration: number = this.getAvgSegmentDuration();
      const numPerSeg: number = avgSegmentDuration/0.0167;

      this.firstTimbrePreProcess = [];
      this.brightnessTimbrePreProcess = [];

      for (let i = 0; i < this.analysis['segments'].length-1; i++) {
        const dist1 = this.analysis['segments'][i].timbre[0]- this.analysis['segments'][i+1].timbre[0];
        const dist2 = this.analysis['segments'][i].timbre[1]- this.analysis['segments'][i+1].timbre[1];
        
        for(let j = 1; j <= numPerSeg; j++){
          this.firstTimbrePreProcess.push((dist1 / numPerSeg*j) + this.analysis['segments'][i].timbre[0]);
          this.brightnessTimbrePreProcess.push((dist2 / numPerSeg*j) + this.analysis['segments'][i].timbre[1]);
        }
      }
    });
  }

  // linearly smooth the data by calculating euclidean distance
  public eucDistance(a: number[], b: number[]): number {
    let sum = 0;

    // sum = sqrt( SIGMA [0 -> n - 1] { (a[i] - b[i])^2 } )
    for(let i = 0; i < a.length; i++){
      sum += (a[i]-b[i]) **2; // (a[i] - b[i])^2
    }
    return sum ** (1/2); // sqrt
  }
}

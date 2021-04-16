import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {ToolsService} from "./tools.service";

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  public analysis: {};
  public feature: {};

  public segmentIndex: number;
  public segmentEnd: number;
  public sectionIndex: number;
  public sectionEnd: number;
  public avgSegmentDuration: number;
  public trackDuration: number;
  public firstTimbrePreProcess: number[];
  public brightnessTimbrePreProcess: number[];

  constructor(public http: HttpClient, private router: Router, private authService: AuthService,
              private tool: ToolsService) {
    this.segmentIndex = 0;
    this.segmentEnd = 0;
    this.sectionIndex = 0;
    this.sectionEnd = 0;
    this.firstTimbrePreProcess = null;
    this.brightnessTimbrePreProcess = null;
  }

  getAuth() {
    let tempURL = "https://accounts.spotify.com/authorize?";
    tempURL += 'client_id=' + environment.clientId + '&';
    tempURL += 'redirect_uri=' + 'https://music-visualizer-b2ae6.web.app/' + '&';
    tempURL += 'scope=' + 'streaming%20user-read-email%20user-read-private%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing' + '&';
    tempURL += 'response_type=token';
    window.location.href = tempURL;
  }

  getTrackAnalysisData(trackID: string) {
    try {
      let url = 'https://api.spotify.com/v1/audio-analysis/' + trackID;
      const headers = new HttpHeaders()
        .set("Accept", 'application/json')
        .set("Content-Type", 'application/json')
        .set("Authorization", 'Bearer ' + this.authService.getUser().spotifyAPIKey);
      this.http.get(url, {headers}).subscribe((resp) => this.analysis = resp);
    } catch (e) {
      console.log('Error with HTTP Request to spotify for track analysis data: ' + e);
      throw new Error('Error retrieving track analysis data from spotify ');
    }
  }

  getTrackFeatureData(trackID: string) {
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

  getSegment(trackProgress) {
    if (this.segmentEnd === 0) {
      this.segmentIndex = 0;

      while (this.analysis['segments'][this.segmentIndex]['start'] * 1000 <= trackProgress) {
        this.segmentIndex++;
      }

      this.segmentEnd = this.analysis['segments'][this.segmentIndex]['start'] + this.analysis['segments'][this.segmentIndex]['duration'];
    } else if (trackProgress >= this.segmentEnd) {
      while (this.analysis['segments'][this.segmentIndex]['start'] * 1000 <= trackProgress) {
        this.segmentIndex++;
      }

      this.segmentEnd = this.analysis['segments'][this.segmentIndex]['start'] + this.analysis['segments'][this.segmentIndex]['duration'];
    }

    return this.analysis['segments'][this.segmentIndex];
  }

  getSection(trackProgress) {
    if (this.sectionEnd === 0) {
      this.sectionIndex = 0;

      while (this.analysis['sections'][this.sectionIndex]['start'] * 1000 <= trackProgress) {
        this.sectionIndex++;
      }

      this.sectionEnd = this.analysis['sections'][this.sectionIndex]['start'] + this.analysis['sections'][this.sectionIndex]['duration'];
    } else if (trackProgress >= this.sectionEnd) {
      while (this.analysis['sections'][this.sectionIndex]['start'] * 1000 <= trackProgress) {
        this.sectionIndex++;
      }

      this.sectionEnd = this.analysis['sections'][this.sectionIndex]['start'] + this.analysis['sections'][this.sectionIndex]['duration'];
    }

    return this.analysis['sections'][this.sectionIndex];
  }

  getAvgSegmentDuration() {
    if (this.avgSegmentDuration !== 0) {
      return this.avgSegmentDuration;
    } else {
      let sumDuration = 0;
      for (let i = 0; i < this.analysis['segments'].length; i++) {
        sumDuration += this.analysis['segments'][i]['duration'];
      }
      this.avgSegmentDuration = sumDuration / this.analysis['segments'].length;
      return this.avgSegmentDuration;
    }
  }

  getTimbreAvg(trackProgress) {
    const currSegment = this.getSegment(trackProgress);
    return this.tool.absAvg(currSegment.timbre);
  }

  getScaledAvgPitch(trackProgress) {
    const currSegment = this.getSegment(trackProgress);
    const pitchAvg = this.tool.absAvg(currSegment.pitches);
    return this.tool.modulate(pitchAvg, this.tool.min(currSegment.pitches), this.tool.max(currSegment.pitches), 0, 180);
  }

  getAvgPitch(trackProgress) {
    const currSegment = this.getSegment(trackProgress);
    return this.tool.absAvg(currSegment.pitches);
  }

  getSegmentLoudness(trackProgress) {
    const currSegment = this.getSegment(trackProgress);
    return Math.abs(currSegment.loudness_max);
  }

  getTimeScalar(trackProgress) {
    const currSegment = this.getSegment(trackProgress);
    const segDuration = currSegment.duration;
    return (1 - segDuration) / 100;
  }

  async getTimbrePreProcessing() {
    const avgSegmentDuration = this.getAvgSegmentDuration();
    const numPerSeg = avgSegmentDuration/0.0167;
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
  }

  eucDistance(a, b) {
    let sum = 0;
    for(let i = 0; i < a.length; i++){
      sum += (a[i]-b[i]) **2;
    }
    return sum ** (1/2);
  }
}

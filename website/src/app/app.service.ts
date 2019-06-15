import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class AppServiceService {
  // Socket.io Settings
  private url = '/';
  public socket;
  public socketRoomId;

  // Background image settings
  public bgImage = '/assets/images/bg-dark.jpg';
  public bgActive = false;

  // Main app variables
  public videoLink = '';
  public headerText = 'YouTube to MP3';
  public subText =
    'Wizardli gets the best quality audio automatically. Download instantly.';
  public isVideoLinkValid = false;
  public downloadLink = '';
  public isDownloadInProgress = false;
  public isDownloadComplete = false;
  public videoThumbnail = '';

  constructor() {
    this.socket = io(this.url);
    this.socketRoomId = this.randomString(15);
    this.socket.emit('joinRoom', this.socketRoomId);

    this.socket.on('started', () => {
      this.videoLink = 'Connecting to server...';
    });

    this.socket.on('progress', data => {
      const completion = data.progress.percentage;
      const size = (data.progress.transferred / 1048576).toFixed(1) + ' MB';

      if (completion >= 99) {
        this.videoLink = 'Transcoding MP3';
      } else {
        this.videoLink = `Downloading ${size} (${completion.toFixed(0)}%)`;
      }
    });

    this.socket.on('finished', () => {
      this.videoLink = 'Download complete';
    });
  }

  randomString(length: number) {
    return Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, length);
  }
}

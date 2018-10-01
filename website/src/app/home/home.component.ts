import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppServiceService } from '../app.service';

import { faSearch, faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import * as url from 'url';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  readonly API_URL = ''; // Blank for local
  title = 'youtube-downloader';
  videoLink = '';
  headerText = 'YouTube to MP3';
  subText = 'Wizardli gets the best quality audio automatically. Download instantly.';
  isVideoLinkValid = false;
  downloadLink = '';
  isDownloadInProgress = false;
  isDownloadComplete = false;
  videoThumbnail = '';

  faSearch = faSearch;
  faSpinner = faSpinner;
  faDownload = faDownload;

  constructor(
    private http: HttpClient,
    private appService: AppServiceService
  ) { }

  onSubmit() {
    this.isDownloadComplete = false;

    if (this.isVideoLinkValid) {
      console.log('Video URL requested for download:', this.videoLink);
      const tmpurl = `${this.API_URL}/download/${encodeURIComponent(this.videoLink)}`;
      this.activateSpecialUI();

      this.http.get(tmpurl, { responseType: 'text' })
        .subscribe(
          resp => {
            this.downloadLink = `${this.API_URL}/downloadFile/${resp}`;
            this.isDownloadComplete = true;
            this.finishDownloadUI();
            console.log('Download link: ', this.downloadLink);
          },
          err => {
            this.finishDownloadUI();
            console.log('Error getting download link:', err);
          }
        );
    } else {
      this.appService.bgActive = false;
      this.headerText = 'Youtube to MP3';
      this.subText = 'Wizardli gets the best quality audio automatically. Download instantly.';
    }
  }

  activateSpecialUI() {
    // Get video ID from link
    let ytVideoId = this.videoLink.split('v=')[1];
    const ampersandPosition = ytVideoId.indexOf('&');
    if (ampersandPosition !== -1) {
      ytVideoId = ytVideoId.substring(0, ampersandPosition);
    }

    this.videoLink = 'Downloading audio...';
    this.isDownloadInProgress = true;

    // Query youtube API
    const ytApiKey = 'AIzaSyBQGvKx7zgM80gt7h9Y42JPnFneNPo4Dk4';
    const ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=${ytVideoId}&key=${ytApiKey}`;

    this.http.get(ytApiUrl, { responseType: 'text' })
      .subscribe(
        (resp: any) => {
          console.log(resp);

          const videoMetadata = JSON.parse(resp).items[0].snippet;
          const thumbnail = (() => {
            if (videoMetadata.thumbnails.maxres) {
              return videoMetadata.thumbnails.maxres.url;
            } else {
              return videoMetadata.thumbnails[videoMetadata.thumbnails.length - 1].url;
            }
          })();

          const title = videoMetadata.title;

          this.appService.bgImage = thumbnail;
          this.appService.bgActive = true;
          this.headerText = title;
          this.subText = 'Download initialized, please wait.';
        },
        err => {
          console.log('we got', err);
        }
      );
  }

  finishDownloadUI() {
    this.isDownloadInProgress = false;
    this.isVideoLinkValid = false;
    this.videoLink = '';
    this.subText = 'Processing complete. Click below to download.';
  }

  resetDownloadUI() {
    this.isDownloadComplete = false;
    this.isDownloadInProgress = false;
    this.isVideoLinkValid = false;
    this.videoLink = '';
    this.appService.bgActive = false;
    this.headerText = 'Youtube to MP3';
    this.subText = 'Wizardli gets the best quality audio automatically. Download instantly.';
  }

  onVideoLinkChange(value: string) {
    const parsedUrl = url.parse(value);
    const isYouTube = (parsedUrl.pathname === '/watch' &&
      (parsedUrl.hostname === 'youtube.com' ||
        parsedUrl.hostname === 'www.youtube.com' ||
        parsedUrl.hostname === 'm.youtube.com')) ||
      parsedUrl.hostname === 'youtu.be' ||
      parsedUrl.hostname === 'www.youtu.be';

    if (isYouTube) {
      this.isVideoLinkValid = true;
    } else {
      this.isVideoLinkValid = false;
    }
  }
}

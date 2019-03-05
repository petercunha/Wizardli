import {HttpClient} from '@angular/common/http';
import {Component} from '@angular/core';
import {faDownload, faSearch, faSpinner} from '@fortawesome/free-solid-svg-icons';
import * as url from 'url';

import {AppServiceService} from '../app.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  readonly API_URL =
      'http://localhost:3000';  // Leave blank for local // Previously:
                                // http://localhost:3000
  title = 'youtube-downloader';

  faSearch = faSearch;
  faSpinner = faSpinner;
  faDownload = faDownload;

  constructor(private http: HttpClient, private appService: AppServiceService) {
  }

  onSubmit() {
    this.appService.isDownloadComplete = false;

    if (this.appService.isVideoLinkValid) {
      console.log(
          'Video URL requested for download:', this.appService.videoLink);
      const tmpurl = `${this.API_URL}/download/${
          encodeURIComponent(this.appService.videoLink)}`;
      this.activateSpecialUI();

      this.http.get(tmpurl, {responseType: 'text'})
          .subscribe(
              resp => {
                this.appService.downloadLink =
                    `${this.API_URL}/downloadFile/${resp}`;
                this.appService.isDownloadComplete = true;
                this.finishDownloadUI();
                // console.log('Download link: ', appService.downloadLink);
              },
              err => {
                this.finishDownloadUI();
                console.log('Error getting download link:', err);
              });
    } else {
      this.appService.bgActive = false;
      this.appService.headerText = 'YouTube to MP3';
      this.appService.subText =
          'Wizardli gets the best quality audio automatically. Download instantly.';
    }
  }

  activateSpecialUI() {
    // Get video ID from link
    let ytVideoId = this.appService.videoLink.split('v=')[1];
    const ampersandPosition = ytVideoId.indexOf('&');
    if (ampersandPosition !== -1) {
      ytVideoId = ytVideoId.substring(0, ampersandPosition);
    }

    this.appService.videoLink = 'Downloading audio...';
    this.appService.isDownloadInProgress = true;

    // Query youtube API
    const ytApiKey = 'AIzaSyBQGvKx7zgM80gt7h9Y42JPnFneNPo4Dk4';
    const ytApiUrl =
        `https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=${
            ytVideoId}&key=${ytApiKey}`;

    this.http.get(ytApiUrl, {responseType: 'text'})
        .subscribe(
            (resp: any) => {
              // console.log(resp);

              const videoMetadata = JSON.parse(resp).items[0].snippet;
              const thumbnail = (() => {
                const thumbs: any = videoMetadata.thumbnails;
                if (thumbs.maxres) {
                  return thumbs.maxres.url;
                } else if (thumbs.standard) {
                  return thumbs.standard.url;
                } else if (thumbs.medium) {
                  return thumbs.medium.url;
                } else if (thumbs.default) {
                  return thumbs.default.url;
                } else {
                  return '';
                }
              })();

              const title = videoMetadata.title;

              this.appService.bgImage = thumbnail;
              this.appService.bgActive = true;
              this.appService.headerText = title;
              this.appService.subText = 'Download initialized, please wait.';
            },
            err => {
              console.log(err);
            });
  }

  finishDownloadUI() {
    this.appService.isDownloadInProgress = false;
    this.appService.isVideoLinkValid = false;
    this.appService.videoLink = '';
    this.appService.subText = 'Processing complete. Click below to download.';
  }

  resetDownloadUI() {
    this.appService.isDownloadComplete = false;
    this.appService.isDownloadInProgress = false;
    this.appService.isVideoLinkValid = false;
    this.appService.videoLink = '';
    this.appService.bgActive = false;
    this.appService.headerText = 'YouTube to MP3';
    this.appService.subText =
        'Wizardli gets the best quality audio automatically. Download instantly.';
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
      this.appService.isVideoLinkValid = true;
    } else {
      this.appService.isVideoLinkValid = false;
    }
  }
}

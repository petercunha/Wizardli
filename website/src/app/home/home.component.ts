import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  isVideoLinkValid = false;
  downloadLink = '';
  isDownloadInProgress = false;
  isDownloadComplete = false;

  faSearch = faSearch;
  faSpinner = faSpinner;
  faDownload = faDownload;

  constructor(private http: HttpClient) {

  }

  onSubmit() {
    this.isDownloadComplete = false;

    if (this.isVideoLinkValid) {
      console.log('Video URL requested for download:', this.videoLink);
      const tmpurl = `${this.API_URL}/download/${encodeURIComponent(this.videoLink)}`;
      this.videoLink = 'Downloading audio...';
      this.isDownloadInProgress = true;

      this.http.get(tmpurl, { responseType: 'text' })
        .subscribe(
          resp => {
            this.downloadLink = `${this.API_URL}/downloadFile/${resp}`;
            this.isDownloadComplete = true;
            this.resetDownloadUI();
            console.log('Download link: ', this.downloadLink);
          },
          err => {
            this.resetDownloadUI();
            console.log('Error getting download link:', err);
          }
        );
    }
  }

  resetDownloadUI() {
    this.isDownloadInProgress = false;
    this.isVideoLinkValid = false;
    this.videoLink = '';
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

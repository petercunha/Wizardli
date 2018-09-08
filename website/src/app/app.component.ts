import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faSearch, faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly API_URL = 'http://localhost:3000';
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
      const url = `${this.API_URL}/download/${this.videoLink.split('watch?v=')[1]}`;
      this.videoLink = 'Downloading audio...';
      this.isDownloadInProgress = true;

      this.http.get(url, { responseType: 'text' })
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
    if (this.videoLink.includes('youtube.com/watch')) {
      this.isVideoLinkValid = true;
    } else {
      this.isVideoLinkValid = false;
    }
  }
}

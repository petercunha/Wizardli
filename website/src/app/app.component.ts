import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';

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
  isDownloadComplete = false;

  faSearch = faSearch;
  faDownload = faDownload;

  constructor(private http: HttpClient) {

  }

  onSubmit() {
    if (this.isVideoLinkValid) {
      const url = `${this.API_URL}/download/${this.videoLink.split('watch?v=')[1]}`;
      this.http.get(url, { responseType: 'text' })
        .subscribe(
          resp => {
            console.log(resp);
            const responseLink = `${this.API_URL}/downloadFile/${resp}`;
            this.isDownloadComplete = true;
            this.downloadLink = responseLink;
            console.log('response was', responseLink);
          },
          err => {
            console.log('caught an error', err);
          }
        );
    }
    console.log('Submitted', this.videoLink);
  }

  onVideoLinkChange(value: string) {
    if (this.videoLink.includes('youtube.com/watch')) {
      this.isVideoLinkValid = true;
    } else {
      this.isVideoLinkValid = false;
    }
  }
}

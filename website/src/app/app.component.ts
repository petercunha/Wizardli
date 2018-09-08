import { Component } from '@angular/core';
import { faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  videoLink: string = "";
  isVideoLinkValid: boolean = false;
  title = 'youtube-downloader';
  faSearch = faSearch;
  faDownload = faDownload;

  onSubmit() {
    console.log('Submitted', this.videoLink)
  }

  onVideoLinkChange(value: string) {
    if (this.videoLink.includes('youtube.com/watch')) {
      this.isVideoLinkValid = true
    } else {
      this.isVideoLinkValid = false
    }
  }
}

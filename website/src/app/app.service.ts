import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AppServiceService {
  public bgImage = '';
  public bgActive = false;
  public videoLink = '';
  public headerText = 'YouTube to MP3';
  public subText =
      'Wizardli gets the best quality audio automatically. Download instantly.';
  public isVideoLinkValid = false;
  public downloadLink = '';
  public isDownloadInProgress = false;
  public isDownloadComplete = false;
  public videoThumbnail = '';

  constructor() {}
}

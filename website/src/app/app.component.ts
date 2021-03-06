import { Component, OnInit } from '@angular/core';
import { AppServiceService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(public appService: AppServiceService) {}
  ngOnInit() {}
}

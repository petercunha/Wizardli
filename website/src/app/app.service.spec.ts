import { TestBed } from '@angular/core/testing';

import { AppServiceService } from './app.service';

describe('AppServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppServiceService = TestBed.get(AppServiceService);
    expect(service).toBeTruthy();
  });
});

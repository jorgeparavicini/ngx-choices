import { TestBed } from '@angular/core/testing';

import { NgxChoicesService } from './ngx-choices.service';

describe('NgxChoicesService', () => {
  let service: NgxChoicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxChoicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

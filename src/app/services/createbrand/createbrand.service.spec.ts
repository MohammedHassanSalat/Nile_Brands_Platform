import { TestBed } from '@angular/core/testing';

import { CreatebrandService } from './createbrand.service';

describe('CreatebrandService', () => {
  let service: CreatebrandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreatebrandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

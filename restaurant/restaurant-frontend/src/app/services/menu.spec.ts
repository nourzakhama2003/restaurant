import { TestBed } from '@angular/core/testing';

import { Men } from './men';

describe('Men', () => {
  let service: Men;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Men);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

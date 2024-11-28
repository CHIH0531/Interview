import { TestBed } from '@angular/core/testing';

import { AuthGuardDemoService } from './auth-guard-demo.service';

describe('AuthGuardDemoService', () => {
  let service: AuthGuardDemoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthGuardDemoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

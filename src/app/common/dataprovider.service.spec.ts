/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DataproviderService } from './dataprovider.service';

describe('Service: Dataprovider', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataproviderService]
    });
  });

  it('should ...', inject([DataproviderService], (service: DataproviderService) => {
    expect(service).toBeTruthy();
  }));
});

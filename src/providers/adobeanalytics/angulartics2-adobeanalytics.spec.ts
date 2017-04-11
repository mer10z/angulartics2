import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { TestBed, ComponentFixture, fakeAsync, inject } from '@angular/core/testing';

import { TestModule, RootCmp, advance, createRoot } from '../../test.mocks';

import { Angulartics2 } from '../../core/angulartics2';
import { Angulartics2AdobeAnalytics } from './angulartics2-adobeanalytics';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
declare var window: any;

export class MockLocation extends SpyLocation {
  path() {
    return 'http://test.com/test/#/pagename';
  }
}

describe('Angulartics2AdobeAnalytics', () => {
  let s: any;
  let fixture: ComponentFixture<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestModule
      ],
      providers: [
        { provide: Location, useClass: MockLocation },
        Angulartics2AdobeAnalytics
      ]
    });

    window.s = s = jasmine.createSpyObj('s',['clearVars','t','tl']);
    
  });

  it('should track pages',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
      (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          angulartics2.pageTrack.next({ path: '/abc' });
          advance(fixture);
          expect(s.clearVars).not.toHaveBeenCalled();
          expect(s.t).toHaveBeenCalledWith({pageName:'/abc'});
  })));

  it('should track events with no delay',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
      (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          
          angulartics2.eventTrack.next({ action: 'do', properties: { disableDelay: true } });
          advance(fixture);
          expect(s.tl).toHaveBeenCalledWith(true, 'o', 'do');
          expect(window.s.pageName).toEqual('#/pagename');
  })));

  it('should track events with custom properties',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
      (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          
          angulartics2.eventTrack.next({ action: 'do', properties: { category: 'cat', prop1: 'user1234' } });
          advance(fixture);
          expect(window.s.prop1).toEqual('user1234');
          expect(window.s.category).toEqual('cat');
          expect(s.tl).toHaveBeenCalledWith(jasmine.any(Object), 'o', 'do');
  })));

  it('should track events',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
        (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          angulartics2.eventTrack.next({ action: 'do', properties: { category: 'cat' } });
          advance(fixture);
          expect(s.tl).toHaveBeenCalledWith(jasmine.any(Object), 'o', 'do');
          expect(window.s.pageName).toEqual('#/pagename');
  })));

  it('should add user properties to page track',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
        (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          angulartics2.setUserProperties.next({ evar1: 'test' });
          angulartics2.pageTrack.next('page');
          advance(fixture);
          expect(s.evar1).toEqual('test');
          angulartics2.setUserProperties.next({ prop1: 'test' });
          angulartics2.pageTrack.next('page');
          advance(fixture);
          expect(s.prop1).toEqual('test');
  })));

  it('should add user properties to event track',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
        (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          angulartics2.setUserProperties.next({ evar1: 'test' });
          angulartics2.eventTrack.next({ action: 'go'});
          advance(fixture);
          expect(s.evar1).toEqual('test');
          expect(s.linkTrackVars).toEqual('evar1,pageName');
          expect(s.tl).toHaveBeenCalledWith(jasmine.any(Object), 'o', 'go');

          angulartics2.setUserProperties.next({ prop1: 'test' });
          angulartics2.eventTrack.next({ action: 'search', properties: { events: 'event192' }});
          advance(fixture);
          expect(s.prop1).toEqual('test');
          expect(s.linkTrackVars).toEqual('evar1,pageName,prop1,events');
          expect(s.linkTrackEvents).toEqual('event192');
          expect(s.tl).toHaveBeenCalledWith(jasmine.any(Object), 'o', 'search');
  })));
});

describe('Angulartics2AdobeAnalytics with undefined s', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestModule
      ],
      providers: [
        { provide: Location, useClass: MockLocation },
        Angulartics2AdobeAnalytics
      ]
    });

    if (typeof window.s !== 'undefined') {
      delete window.s;
    }
  });

  it('should not track pages',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
      (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          angulartics2.pageTrack.next({ path: '/abc' });
          advance(fixture);
          expect(window.s).toBeUndefined();
  })));

  it('should not track events',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
      (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          
          angulartics2.eventTrack.next({ action: 'do', properties: { disableDelay: true } });
          advance(fixture);
          expect(window.s).toBeUndefined();
  })));

  it('should not add user properties',
    fakeAsync(inject([Location, Angulartics2, Angulartics2AdobeAnalytics],
        (location: Location, angulartics2: Angulartics2, angulartics2AdobeAnalytics: Angulartics2AdobeAnalytics) => {
          fixture = createRoot(RootCmp);
          angulartics2.setUserProperties.next({ evar1: 'test' });
          advance(fixture);
          expect(window.s).toBeUndefined();
  })));

});

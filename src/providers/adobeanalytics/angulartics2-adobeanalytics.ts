import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Angulartics2 } from '../../core/angulartics2';

declare var s: any;

@Injectable()
export class Angulartics2AdobeAnalytics {

  private userProperties: any;

  constructor(
    private angulartics2: Angulartics2,
    private location: Location
  ) {
    this.angulartics2.settings.pageTracking.trackRelativePath = true;

    this.angulartics2.pageTrack.subscribe((x: any) => this.pageTrack(x.path));

    this.angulartics2.eventTrack.subscribe((x: any) => this.eventTrack(x.action, x.properties));

    this.angulartics2.setUserProperties.subscribe((x: any) => this.setUserProperties(x));
  }

  /**
   * Track a page and add user properties if they exist
   * 
   * @param path 
   */
  pageTrack(path: string) {
    if (typeof s !== 'undefined' && s) {
      // if user has added properties, set them before page track
      if (this.userProperties) {
        this.setSProperties(this.userProperties);
      }
      s.t({pageName:path});
    }
  }

  /**
   * Track Event in Adobe Analytics
   * @name eventTrack
   *
   * @param {string} action Required 'action' (string) associated with the event
   * @param {object} properties Comprised of the mandatory field 'category' (string) and optional  fields 'label' (string), 'value' (integer) and 'noninteraction' (boolean)
   *
   * @link https://marketing.adobe.com/resources/help/en_US/sc/implement/js_implementation.html
   */
  eventTrack(action: string, properties: any) {
    if (!properties) {
      properties = properties || {};
    }

    if (typeof s !== 'undefined' && s) {
      if (action) {
        if (typeof properties === 'object') {
          // add all properties from this event and user
          this.setSProperties(this.userProperties);
          this.setSProperties(properties);
          this.setLinkTrackVars(this.userProperties);
          this.setLinkTrackVars(properties);

          if (properties['events']) {
            s.linkTrackEvents = properties['events'];
          }
        }

        // if linkName property is passed, use that; otherwise, the action is the linkName
        const linkName = (properties['linkName']) ? properties['linkName'] : action;
        // note that 'this' should refer the link element, but we can't get that in this function. example:
        // <a href="http://anothersite.com" onclick="s.tl(this,'e','AnotherSite',null)">
        // if disableDelay property is passed, use that to turn off/on the 500ms delay; otherwise, it uses this
        const disableDelay = !!properties['disableDelay'] ? true : this;
        // if action property is passed, use that; otherwise, the action remains unchanged
        if (properties['action']) {
          action = properties['action'];
        }
        this.setPageName();

        if (action.toUpperCase() === "DOWNLOAD") {
          s.tl(disableDelay,'d',linkName);
        } else if (action.toUpperCase() === "EXIT") {
          s.tl(disableDelay,'e',linkName);
        } else {
          s.tl(disableDelay,'o',linkName);
        }
      }
    }
  }

  /**
   * Allows user to add additional properties
   * 
   * @param properties object example - {prop1: 'username'}
   */
  setUserProperties(properties: any) {
    if (typeof properties === 'object') {
      this.userProperties = properties;
    }
  }

  /**
   * set s.pageName from current url
   */
  private setPageName() {
    const path = this.location.path(true);
    const hashNdx = path.indexOf('#');
    if (hashNdx > 0 && hashNdx < path.length) {
      s.pageName = path.substring(hashNdx);
    } else {
      s.pageName = path;
    }
  }

  /**
   * Set s properties
   * @param properties property object
   */
  private setSProperties(properties: any) {
    if (typeof properties === 'object') {
      for (let key in properties) {
        if (properties.hasOwnProperty(key) && typeof s !== 'undefined' && s) {
          s[key] = properties[key];
        }
      }
    }
  }

  /**
   * Adobe Analytics doesn't send properties and events by default in events.
   * Here the required settings are added to setup event tracking. 
   * @param properties properties to add to s.linkTrackVars
   */
  private setLinkTrackVars(properties: any) {
    if (typeof s === 'undefined' || !s) {
      return;
    }

    if (typeof s['linkTrackVars'] === 'undefined' || !s['linkTrackVars']) {
      s['linkTrackVars'] = '';
    }

    if (typeof properties === 'object') {
      for (let key in properties) {
        if (properties.hasOwnProperty(key) && s['linkTrackVars'].indexOf(key) < 0) {
          s['linkTrackVars'] = s['linkTrackVars'] + ',' + key;
        }
      }
    }

    if (s['linkTrackVars'].indexOf('pageName') < 0) {
      s['linkTrackVars'] = s['linkTrackVars'] + ',pageName';
    }

    if (s['linkTrackVars'].charAt(0) === ',') {
      s['linkTrackVars'] = s['linkTrackVars'].substring(1);
    }
  }

}

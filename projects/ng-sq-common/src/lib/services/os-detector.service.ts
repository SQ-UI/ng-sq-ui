import { Injectable } from '@angular/core';
import { DeviceOS } from '../enums/device-os.enum';

@Injectable({ providedIn: 'root' })
export class OSDetectorService {

  constructor() { }

  static getDeviceOS(): DeviceOS {
    // No `navigator` during server-side rendering / prerendering: report a desktop.
    if (typeof navigator === 'undefined') {
      return DeviceOS.Desktop;
    }

    const userAgent = navigator.userAgent || navigator.vendor || '';
    let agent: DeviceOS = DeviceOS.Desktop;

    if (/android/i.test(userAgent)) {
      agent = DeviceOS.Android;
    }

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      agent = DeviceOS.iOS;
    }

    return agent;
  }
}

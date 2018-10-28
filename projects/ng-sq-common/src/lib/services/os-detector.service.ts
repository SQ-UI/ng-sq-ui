import { Injectable } from '@angular/core';
import { DeviceOS } from '../enums/device-os.enum';

@Injectable()
export class OSDetectorService {

  constructor() { }

  static getDeviceOS(): DeviceOS {
    const userAgent = navigator.userAgent || navigator.vendor;
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

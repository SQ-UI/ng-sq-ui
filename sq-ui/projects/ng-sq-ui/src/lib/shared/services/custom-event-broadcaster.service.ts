import { Injectable } from '@angular/core';
import { CustomEventDetails } from '../interfaces/custom-event-details';

@Injectable()
export class CustomEventBroadcasterService {
  static eventCallbackCollection = {};

  constructor() { }

  static addEventListener(eventName: string, callback: (eventDetails?: CustomEventDetails) => void): string {
    const callbackId: string = 'sq-event_' + new Date().getTime();
    const registeredCallback = {
      callbackId: callbackId,
      callback: callback
    };

    if (CustomEventBroadcasterService.eventCallbackCollection.hasOwnProperty(eventName)) {
      CustomEventBroadcasterService.eventCallbackCollection[eventName].push(registeredCallback);
    } else {
      CustomEventBroadcasterService.eventCallbackCollection[eventName] = [registeredCallback];
    }

    return callbackId;
  }

  static broadcastEvent(eventName: string, eventDetails?: CustomEventDetails) {
    CustomEventBroadcasterService.eventCallbackCollection[eventName].forEach((registeredCallback) => {
      registeredCallback.callback(eventDetails);
    });
  }

  static removeEventListener(eventName: string, callbackId: string) {
    if (CustomEventBroadcasterService.eventCallbackCollection.hasOwnProperty(eventName)) {
      let registeredCallbackIndex: number;

      let callback = CustomEventBroadcasterService.eventCallbackCollection[eventName]
        .filter((registeredCallback, index) => {
          registeredCallbackIndex = index;
          return registeredCallback.callbackId === callbackId;
        })[0];

      if (callback) {
        CustomEventBroadcasterService.eventCallbackCollection[eventName].splice(registeredCallbackIndex, 1);
      }
    }
  }

}

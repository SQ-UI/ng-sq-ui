# Services

## @sq-ui/ng-sq-ui

> If you use this package all services should be available to you

## @sq-ui/ng-sq-common

> Available services in this package

### OSDetectorService

- **getDeviceOS():** [`DeviceOS`](enums.md??id=deviceos).

```typescript
class OSDetectorService {
  static getDeviceOS(): DeviceOS
}
```

### CustomEventBroadcasterService

- **subscribeFor(`eventName`, `callback`):** `Subscription`.
- **broadcastEvent(`eventName`, [`eventDetails`](interfaces.md?id=customeventdetails)):** `void`.

```typescript
 class CustomEventBroadcasterService {
  subscribeFor(eventName: string,
               callback: (eventDetails?: CustomEventDetails) => void): Subscription {}
  broadcastEvent(eventName: string, eventDetails?: CustomEventDetails): void {}
}
```
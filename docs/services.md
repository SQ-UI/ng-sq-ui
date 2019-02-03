# Services

!> If you use [@sq-ui/ng-sq-ui](https://www.npmjs.com/package/@sq-ui/ng-sq-ui) package all services should be available to you

!> Available services in [@sq-ui/ng-sq-common](https://www.npmjs.com/package/@sq-ui/ng-sq-common) package

## OSDetectorService

- **getDeviceOS():** [`DeviceOS`](enums.md??id=deviceos).

```typescript
class OSDetectorService {
  static getDeviceOS(): DeviceOS
}
```

## CustomEventBroadcasterService

- **subscribeFor(`eventName`, `callback`):** `Subscription`.
- **broadcastEvent(`eventName`, [`eventDetails`](interfaces.md?id=customeventdetails)):** `void`.

```typescript
 class CustomEventBroadcasterService {
  subscribeFor(eventName: string,
               callback: (eventDetails?: CustomEventDetails) => void): Subscription {}
  broadcastEvent(eventName: string, eventDetails?: CustomEventDetails): void {}
}
```
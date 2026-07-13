export {};

declare global {
  interface DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }
}

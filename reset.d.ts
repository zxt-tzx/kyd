import "@total-typescript/ts-reset";

declare global {
  interface PushMessageData {
    json(): unknown;
  }
}

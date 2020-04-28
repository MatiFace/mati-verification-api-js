export enum InputErrorType {
  IntegrationError = 'IntegrationError',
  SystemError = 'SystemError',
  ValidationError = 'ValidationError',
}

export enum SelfieVideoInputErrorCode {
  ConversionFailed = 'selfieVideo.conversionFailed',
  MultipleFaces = 'selfieVideo.multipleFaces',
  NoFace = 'selfieVideo.noFace',
}

export enum CommonInputErrorCode {
  InputLocked = 'input.locked',
  InputNotFound = 'input.notFound',
  MediaNotFound = 'media.notFound',
  SystemInternalError = 'system.internalError',
}

export enum DocumentPhotoInputErrorCode {
  UnexpectedData = 'documentPhoto.unexpectedData',
  BadText = 'documentPhoto.badText',
  BlurryText = 'documentPhoto.blurryText',
  SmallImageSize = 'documentPhoto.smallImageSize',
}

export enum SelfiePhotoInputErrorCode {
  MultipleFaces = 'selfiePhoto.multipleFaces',
  NoFace = 'selfiePhoto.noFace',
}

interface InputError {
  type: InputErrorType;
  code: CommonInputErrorCode | DocumentPhotoInputErrorCode | SelfieVideoInputErrorCode | SelfiePhotoInputErrorCode;
  message?: string;
  details?: any;
}

export interface InputResult  {
  result?: boolean;
  error?: InputError;
}

export default interface SendInputResponse extends Array<InputResult> {}

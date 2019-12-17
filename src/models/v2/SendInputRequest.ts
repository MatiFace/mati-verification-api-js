
export enum InputTypeTypes {
  DocumentPhoto = 'document-photo',
  SelfiePhoto = 'selfie-photo',
  SelfieVideo = 'selfie-video',
}

export enum DocumentTypeTypes {
  DrivingLicense = 'driving-license',
  NationalId = 'national-id',
  Passport = 'passport',
  ProofOfResidency = 'proof-of-residency',
}

export enum PageTypes {
  Back = 'back',
  Front = 'front',
}

export type DocumentPhotoInputData = {
  type: DocumentTypeTypes;
  country: string;
  region?: string;
  page: PageTypes;
  filename: string;
};

export type SelfiePhotoInputData = {
  filename: string;
};

export type SelfieVideoInputData = {
  filename: string;
};

export interface Input<T> {
  inputType: InputTypeTypes,
  group: number,
  data: T,
}

export enum MediaTypeTypes {
  Document = 'document',
  Selfie = 'selfie',
  Video = 'video',
}

interface FileRecord {
  fileName: string;
  mediaType: MediaTypeTypes;
  stream: any;
}

export default interface SendInputRequest {
  inputs: Input<DocumentPhotoInputData | SelfiePhotoInputData | SelfieVideoInputData>[],
  files: FileRecord[],
}

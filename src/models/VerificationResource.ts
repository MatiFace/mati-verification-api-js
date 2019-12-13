import IdentityResource from './v2/IdentityResource';

export enum StepIdTypes {
  AlterationDetection = 'mexican-curp-validation',
  Curp = 'alteration-detection',
  DocumentReading = 'document-reading',
  Facematch = 'facematch',
  Ine = 'mexican-ine-validation',
  Liveness = 'liveness',
  Selfie = 'selfie',
  TemplateMatching = 'template-matching',
  Watchlists = 'watchlists',
}

export enum FieldNames {
  Address = 'address',
  Cde = 'cde',
  Curp = 'curp',
  DateOfBirth = 'dateOfBirth',
  DniNumber = 'dniNumber',
  DocumentNumber = 'documentNumber',
  EmissionDate = 'emissionDate',
  ExpirationDate = 'expirationDate',
  FullName = 'fullName',
  Ne = 'ne',
  OcrNumber = 'ocrNumber',
  PersonalNumber = 'personalNumber',
}

export enum StepStatusTypes {
  Pending = 0,
  Running = 100,
  Complete = 200,
}

enum StepErrorTypes {
  SystemError = 'SystemError',
  LegacyError = 'LegacyError',
  StepError = 'StepError'
}

enum LegacyErrorCodes {
  LegacyError = 'legacy.error',
}

enum SystemErrorCodes {
  ServiceUnavailable = 'system.serviceUnavailable',
  InternalError = 'system.internalError',
}

enum StepErrorCodes {
  IneNotEnoughParams = 'ine.notEnoughParams',
  IneNotFound = 'ine.notFound',
  CurpInvalid = 'curp.invalid',
  CurpNotFound = 'curp.notFound',
  FullNameMismatch = 'curp.fullNameMismatch',
}

export interface StepError {
  type: StepErrorTypes;
  code: LegacyErrorCodes | SystemErrorCodes | StepErrorCodes | string;
  message: string;
}

export interface Step {
  id: StepIdTypes;
  status: StepStatusTypes;
  data?: any; // TODO: TBD
  error?: StepError;
}

export interface VerificationDocument {
  type: string;
  country: string;
  fields: {
    [fieldName in FieldNames]: Field;
  };
  region?: string;
  steps: Step[];
  photos: string[];
}

export interface Field {
  value: any;
}

export default interface VerificationResource {
  id: string;
  documents: VerificationDocument[];
  expired?: boolean;
  identity: Pick<IdentityResource, 'status'>;
  steps: Step[];
}

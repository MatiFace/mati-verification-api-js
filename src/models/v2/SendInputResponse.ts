interface InputError {
  type: string;
  code: string;
  message?: string;
  details?: any;
}

export class InputResult {
  result: boolean;
  error: InputError;
}

export default interface SendInputResponse extends Array<Partial<InputResult>> {}

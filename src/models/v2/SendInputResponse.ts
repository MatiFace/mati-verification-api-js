interface InputError {
  type: string;
  code: string;
  message?: string;
  details?: any;
}

interface InputSuccessResult {
  result: boolean;
}

interface InputErrorResult {
  error: InputError;
}

type InputResult = InputSuccessResult | InputErrorResult;

export default interface SendInputResponse extends Array<InputResult> {}

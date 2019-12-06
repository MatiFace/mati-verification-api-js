import isomorph from './isomorph';
import ErrorResponse from './ErrorResponse';

export type RequestOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | Record<string, any>;
};

export const formContentType = 'application/x-www-form-urlencoded';
export const multipartFormDataType = 'multipart/form-data';

/**
 * @param requestURL
 * @param requestOptions
 */
export default async function callHttp(
  requestURL: string,
  requestOptions: RequestOptions,
): Promise<string | Record<string, any>> {
  let { body = null } = requestOptions;
  const { method, headers = {} as HeadersInit } = requestOptions;
  // @ts-ignore
  const requestContentType: string = headers['content-type'] || '';

  if (body
    // @ts-ignore
    && !(body instanceof isomorph.FormData)
    && !requestContentType.startsWith(formContentType)) {
    body = JSON.stringify(body);
    Object.assign(headers, {
      accept: 'application/json',
      'content-type': 'application/json',
    });
  }

  // @ts-ignore
  const response = await isomorph.fetch(requestURL, { method, headers, body });
  const contentType = response.headers!.get('content-type');
  const isJSON = contentType && contentType.includes('json');
  const getResponseResult = response[isJSON ? 'json' : 'text']();
  if (!response.ok) {
    const errResponse = await getResponseResult;
    throw new ErrorResponse(`${errResponse.error}: ${errResponse.message}`, response);
  }
  return getResponseResult;
}

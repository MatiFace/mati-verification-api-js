import qs from 'qs';
import crypto from 'crypto';

import callHttp, { formContentType, RequestOptions } from './lib/callHttp';
import isomorph from './lib/isomorph';
import AuthResponse from './models/v2/AuthResponse';
import IdentityResource from './models/v2/IdentityResource';
import SendInputRequest from './models/v2/SendInputRequest';
import SendInputResponse from './models/v2/SendInputResponse';
import ErrorResponse from './lib/ErrorResponse';
import IdentityMetadata from './models/IdentityMetadata';

export const API_HOST = 'https://api.getmati.com';

export type Options = {
  clientId: string;
  clientSecret: string;
  flowId?: string;
  host?: string;
  webhookSecret?: string;
};

type CallHttpParamsType = {
  url?: string,
  path?: string,
  requestOptions?: RequestOptions,
  authType?: 'bearer' | 'basic' | 'none',
};

class ApiService {
  private bearerAuthHeader: string;

  private clientAuthHeader: string;

  private flowId: string | undefined;

  private host: string;

  private webhookSecret: string | false = false;

  /**
   * Initializes the service. Call this method before using api calls.
   * @param {Options} options
   * @param {string} options.clientId
   * @param {string} options.clientSecret
   * @param {string} options.webhookSecret
   */
  public init(options: Options) {
    const {
      host,
      clientId,
      clientSecret,
      flowId,
      webhookSecret,
    } = options;
    this.host = host || API_HOST;
    this.flowId = flowId;
    this.webhookSecret = webhookSecret || false;
    this.setClientAuth(clientId, clientSecret);
  }

  /**
   * Validates signature of requests.
   * We use webhookSecret to sign data. You put this value in the Dashboard, when define webhooks.
   * And provide the same value, when you initialize the service. Please, use a strong secret value.
   * Draw your attention. The order of the fields in the body is important. Keep the original one.
   * @param {string} signature - signature from x-signature header of request calculated
   * on Mati side
   * @param {any} body - data came in request body
   * @returns {boolean} `true` if the signature is valid, `false` - otherwise
   */
  public validateSignature(signature: string, body: any): boolean {
    if (!this.webhookSecret) {
      throw new Error('No webhookSecret provided');
    }
    const bodyStr = JSON.stringify(body);
    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret as string)
      .update(bodyStr)
      .digest('hex');
    return signature === computedSignature;
  }

  /**
   * Fetches resource by its absolute URL using your client credentials you provide,
   * when you initialize the service. Usually you do not need to build url by yourself,
   * its values come in webhooks or in other resources.
   * @param {string} url absolute url of the resource
   * @returns {Promise<T>} resource
   * @throws ErrorResponse if we get http error
   */
  public async fetchResource<T>(url: string): Promise<T> {
    return this.callHttp({ url }) as Promise<T>;
  }

  /**
   * Starts new verification flow and creates identity. You should use result of this method
   * in order to get id for further `#sendInput` calls.
   * @param {IdentityMetadata} metadata - payload you want to pass to the identity
   * @returns {Promise<IdentityResource>} resource of identity created.
   * @throws ErrorResponse if we get http error
   */
  public async createIdentity(metadata?: IdentityMetadata): Promise<IdentityResource> {
    const body: Record<string, any> = { metadata };
    if (this.flowId) {
      body.flowId = this.flowId;
    }
    return this.callHttp({
      path: 'v2/identities',
      requestOptions: {
        method: 'POST',
        body,
      },
    }) as Promise<IdentityResource>;
  }

  /**
   * Send a partial or complete inputs for the verification process
   * (photos, videos with some text data).
   * @param {string} identityId - id of identity created with #createIdentity
   * @param {SendInputRequest} sendInputRequest - object containing all details needed
   * for the inputs (see its documentation for details)
   * @returns {Promise<SendInputResponse>} resource of identity created.
   * @throws ErrorResponse if we get http error
   */
  public async sendInput(
    identityId: string,
    sendInputRequest: SendInputRequest,
  ): Promise<SendInputResponse> {
    // @ts-ignore
    const formData = new isomorph.FormData();
    formData.append('inputs', JSON.stringify(sendInputRequest.inputs));
    sendInputRequest.files.forEach((fileRecord) => {
      formData.append(fileRecord.mediaType, fileRecord.stream, fileRecord.fileName);
    });
    return this.callHttp({
      path: `v2/identities/${identityId}/send-input`,
      requestOptions: {
        method: 'POST',
        body: formData,
      },
    }) as Promise<SendInputResponse>;
  }

  private setClientAuth(clientId: string, clientSecret: string) {
    this.clientAuthHeader = `Basic ${isomorph.btoa(`${clientId}:${clientSecret}`)}`;
  }

  private setBearerAuth(accessToken: string) {
    this.bearerAuthHeader = `Bearer ${accessToken}`;
  }

  private async auth() {
    const authResponse = await this.callHttp({
      path: 'oauth',
      authType: 'basic',
      requestOptions: {
        method: 'POST',
        body: qs.stringify({
          grant_type: 'client_credentials',
        }),
        headers: {
          'content-type': formContentType,
        },
      },
    }) as AuthResponse;
    this.setBearerAuth(authResponse.access_token);
    return authResponse;
  }

  private async callHttp({
    path,
    url,
    requestOptions = {},
    authType = 'bearer',
  }: CallHttpParamsType) {
    let triedAuth = false;
    if (authType === 'bearer' && !this.bearerAuthHeader) {
      await this.auth();
      triedAuth = true;
    }
    if (authType !== 'none') {
      let authorization = null;
      if (authType === 'bearer') {
        authorization = this.bearerAuthHeader;
      } else if (authType === 'basic') {
        authorization = this.clientAuthHeader;
      }
      if (authorization) {
        const { headers = {} } = requestOptions;
        // @ts-ignore
        headers.authorization = authorization;
        requestOptions.headers = headers;
      }
    }

    const requestURL = url || `${this.host}/${path}`;
    try {
      return await callHttp(requestURL, requestOptions);
    } catch (err) {
      if (!triedAuth
        && authType === 'bearer'
        && err instanceof ErrorResponse
        && (err as ErrorResponse).response.status === 401
      ) {
        // re-auth
        await this.auth();
        // @ts-ignore
        requestOptions.headers.authorization = this.bearerAuthHeader;
        return callHttp(requestURL, requestOptions);
      }
      throw err;
    }
  }
}

export { ApiService };
export default new ApiService();

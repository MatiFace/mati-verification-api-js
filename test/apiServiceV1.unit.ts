import callHttp from '../src/lib/callHttp';
import { ApiServiceV1, Options } from '../src/apiServiceV1';
import WebhookResource, { EventNameTypes } from '../src/models/WebhookResource';
import AuthResponse from '../src/models/v1/AuthResponse';
import ErrorResponse from '../src/lib/ErrorResponse';

jest.mock('../src/lib/callHttp');

const callHttpMock = callHttp as jest.Mock;

const clientId = 'clientId';
const clientSecret = 'clientSecret';
const webhookSecret = 'webhookSecret';

const authResponse: AuthResponse = {
  access_token: 'access_token',
  expires_in: 3600,
  token_type: 'Bearer',
};

type MockFn = () => Promise<any>;
let authMock: MockFn | null;
let httpMock: MockFn | null;

callHttpMock.mockImplementation((requestURL: string): Promise<any> | null => {
  if (requestURL.endsWith('oauth')) {
    return authMock && authMock();
  } else {
    return httpMock && httpMock();
  }
});

type Context = { apiService: ApiServiceV1 };

function createContext<C>(initialContext: Partial<C>): C {
  return initialContext as C;
}
const withApiService = (context: Context, options: Options = {
  clientId,
  clientSecret,
  webhookSecret,
}) => {
  beforeAll(() => {
    context.apiService = new ApiServiceV1();
    context.apiService.init(options);
  });
  return context;
};

const withHttpMocks = (
  httpMockFn: MockFn = () => Promise.resolve(true),
  authMockFn: MockFn = () => Promise.resolve(authResponse),
) => {
  beforeAll(() => {
    authMock = authMockFn;
    httpMock = httpMockFn;
  });
  afterAll(() => {
    authMock = null;
    httpMock = null;
    callHttpMock.mockClear();
  });
};

describe('apiService', () => {
  describe('#init', () => {
    it('should not throw', () => {
      const apiService = new ApiServiceV1();
      expect(() => apiService.init({
        clientId,
        clientSecret,
      })).not.toThrow();
    });
  });

  describe('#validateSignature', () => {
    const webhookResource: WebhookResource = {
      eventName: EventNameTypes.VerificationCompleted,
      metadata: {
        email: 'john@gmail.com',
      },
      resource: 'https://api.getmati.com/api/v1/verifications/db8d24783',
    };

    describe('when right signature', () => {
      const context: Context = withApiService((createContext({})));
      it('should return false', () => {
        expect(context.apiService.validateSignature(
          '0c5ed2cad914fd2a1571b47bb087953af574a353ff9d96f8603f8c0d7955340c',
          webhookResource,
        )).toBe(true);
      });
    });

    describe('when no webhookSecret', () => {
      const context: Context = withApiService(
        createContext({}),
        {
          clientId,
          clientSecret,
        },
      );
      it('should return false', () => {
        expect(() => context.apiService.validateSignature('wrong sig', webhookResource)).toThrow();
      });
    });

    describe('when wrong signature', () => {
      const context: Context = withApiService((createContext({})));
      it('should return false', () => {
        expect(context.apiService.validateSignature('wrong sig', webhookResource)).toBe(false);
      });
    });
  });

  describe('#fetchResource', () => {
    const resourceUrl = 'http://resourceUrl';

    describe('with right auth', () => {
      type Resource = {
        name: string;
      };
      const resource: Resource = {
        name: 'resourceName',
      };
      const context: Context = withApiService((createContext({})));
      withHttpMocks(
        () => Promise.resolve(resource),
      );
      it('should resolve with resource',
        () => expect(context.apiService.fetchResource(resourceUrl)).resolves.toBe(resource));
      it('should call callHttp',
        () => expect(callHttpMock.mock.calls).toMatchSnapshot());
    });

    describe('with 401 error ', () => {
      const context: Context = withApiService((createContext({})));
      withHttpMocks(
        () => Promise.reject(new ErrorResponse('Oooups!', ({ status: 401 } as unknown) as Response)),
      );
      it('should resolve with resource',
        () => expect(context.apiService.fetchResource(resourceUrl))
          .rejects.toThrowErrorMatchingSnapshot());
      it('should call callHttp',
        () => expect(callHttpMock.mock.calls).toMatchSnapshot());
    });
  });
});

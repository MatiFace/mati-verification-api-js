## mati-verification-api

*This library is under intensive development right now, we're making our best to make it better.*

This is an official verification library for Mati Digital Identity Service (https://getmati.com/).
It helps to integrate this solution to your code.

### API Introduction

* We strongly recommend to use our SDKs to verify your users, since Mati already puts a lot of energy 
into supporting most devices, old and new smartphones, giving out the best UI/UX. But if for some 
reasons you can't use our SDKs, we have an official API where you can send us your users' data that 
we will verify.

* Whether you use our SDKs or API, we return the verification data via webhooks (see sections below).


### Get started

Install the library:

`npm install mati-verification-api`

or 

`yarn install mati-verification-api`

#### SDKs

Follow instructions for your platform for the integration
1. Web SDK: https://github.com/MatiFace/mati-web-button
1. iOS SDK: https://github.com/MatiFace/mati-global-id-sdk
1. Android SDK: https://github.com/MatiFace/mati-global-id-sdk-integration-android
1. You can find links to more other platforms here: https://docs.getmati.com/

If you use our SDKs for integration, all what you need is:
 1. Initialize `sdkService` with you credentials (`clientId`, `clientSecret`, `webhookSecret`)
 1. Create an endpoint for receiving webhooks in order to allow our server to send requests to your server. 
 1. Validate signature (not required, but very recommended) in order to make sure the request came from Mati 
 backend.
 1. Perform according business logic on your server. For example, mark user as verified in your database, 
 when the verification completed.   
 1. Get detailed information about verification process of the current user in order to make more elaborated decisions 
 in your code. 
For example:
```js
const { sdkService } = require('mati-verification-api');

const  router = express.Router();

// Provide your creds here
sdkService.init({
  clientId,
  clientSecret,
  webhookSecret,
});

router.post('/webhooks', async function(req, res) {
  const signature = req.headers['x-signature'];
  const isValid = sdkService.validateSignature(signature, req.body);
  if (isValid) {
    const webhookResource = req.body;
    try {
      const verificationResource = await sdkService.fetchResource(webhookResource.resource);
      console.log('verificationResource', verificationResource);
      if (webhookResource.eventName === 'verification_completed') {
        if (verificationResource.identity.status === 'reviewNeeded') {
          console.log('Need to review');
          verificationResource.documents.forEach((document) => {
            console.log('Name', document.fields.fullName.value);
          });
        }
      } else if (webhookResource.eventName === 'verification_expired') {
        console.log('User left without completing the flow');
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error('Not valid signature');
  }
  res.sendStatus(204);
});
```

* Please, draw your attention we always return `2xx` response. It says to Mati backend that webhook 
got delivered successfully.

#### API

If you are integrating API, you should use `apiService` from this library.
Before using any api calls you need to initialize `apiService` with you credentials (`clientId`, `clientSecret`, `webhookSecret`).
```js
const { apiService } = require('mati-verification-api');

apiService.init({
  clientId,
  clientSecret,
  webhookSecret,
});
```

After that you can start with verification flow by itself, creating a new identity. 

```js
  const metadata = { payload: 'some value' };
  const identityResource = await apiService.createIdentity(metadata);
```

Optional `metadata` param allow you to pass your specific data to verification, and exact the same value 
you'll receive in webhooks. It allows you to connect the beginning part of verification with the final parts.  

After that you'll be able to upload the user verification data (images of document - front/back, selfie image, liveness video).

Let's create request data. We created builder class for such requests in order to make it easy for you:

```js
// This request contains front photo of a document. Other examples will be in the next sections.
const sendInputRequest = SendInputRequestBuilder
  .createWithDocumentPhoto(
   {
      type: 'national-id',
      country: 'US',
      region: 'IL',
    },
    {
      fileName: 'front',
      stream: fs.createReadStream('./assets/front.jpeg'),
    },
  )
  .build();
```

and send them:

```js
const sendInputResponse = await apiService.sendInput(identityResource._id, sendInputRequest);
```

Notes:
* Make sure that you configured your verification flow on your Mati dashboard (both document and biometrics requirements)
* Mati API will get your verification configuration, wait for all inputs needed, and start the verification process once it received all needed inputs. 


##### Examples of `sendInputRequest`


###### Single document photo input

```js
const sendInputRequest = SendInputRequestBuilder
  .createWithDocumentPhoto(
   {
      type: 'national-id',
      country: 'US',
      region: 'IL',
    },
    {
      fileName: 'front',
      stream: fs.createReadStream('./assets/front.jpeg'),
    },
  )
  .build();
```

###### Two sided document photos input

```js
const sendInputRequest = SendInputRequestBuilder
  .createWithDocumentPhoto(
   {
      type: 'national-id',
      country: 'US',
      region: 'IL',
    },
    {
      fileName: 'front',
      stream: fs.createReadStream('./assets/front.jpeg'),
    },
    {
      fileName: 'back',
      stream: fs.createReadStream('./assets/back.jpeg'),
    },
  )
  .build();
```

###### Selfie photo input

```js
const sendInputRequest = SendInputRequestBuilder
  .createWithSelfiePhoto(
    {
      fileName: 'selfie',
      stream: fs.createReadStream('./assets/selfie.jpeg'),
    },
  )
  .build();
```

###### Liveness video input

```js
const sendInputRequest = SendInputRequestBuilder
  .createWithSelfieVideo(
    {
      fileName: 'video',
      stream: fs.createReadStream('./assets/video.jpeg'),
    },
  )
  .build();
```

###### Full user input (documents & biometrics)

```js
const sendInputRequest = SendInputRequestBuilder
  .createWithDocumentPhoto(
   {
      type: 'national-id',
      country: 'US',
      region: 'IL',
    },
    {
      fileName: 'front',
      stream: fs.createReadStream('./assets/front.jpeg'),
    },
    {
      fileName: 'back',
      stream: fs.createReadStream('./assets/back.jpeg'),
    },
  )
  .appendSelfieVideo(
    {
      fileName: 'video',
      stream: fs.createReadStream('./assets/video.jpeg'),
    },
  )
  .build();
```

##### Webhooks for API integration

Webhooks integration for API looks very similar like in SDK integration. The only difference you need to use
`apiService` instead of `sdkService`.

And there is the same list of the steps:
 1. Create an endpoint for receiving webhooks in order to allow our server to send requests to your server. 
 1. Validate signature (not required, but very recommended) in order to make sure the request came from Mati 
 backend.
 1. Perform according business logic on your server. For example, mark user as verified in your database, 
 when the verification completed.   
 1. Get detailed information about verification process of the current user in order to make more elaborated decisions 
 in your code. 
For example:
```js
const { apiService } = require('mati-verification-api');

router.post('/webhooks', async function(req, res) {
  const signature = req.headers['x-signature'];
  const isValid = apiService.validateSignature(signature, req.body);
  if (isValid) {
    const webhookResource = req.body;
    try {
      const verificationResource = await apiService.fetchResource(webhookResource.resource);
      console.log('verificationResource', verificationResource);
      if (webhookResource.eventName === 'verification_completed') {
        if (verificationResource.identity.status === 'reviewNeeded') {
          console.log('Need to review');
          verificationResource.documents.forEach((document) => {
            console.log('Name', document.fields.fullName.value);
          });
        }
      } else if (webhookResource.eventName === 'verification_expired') {
        console.log('User left without completing the flow');
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error('Not valid signature');
  }
  res.sendStatus(204);
});
``` 

### Type definitions

This package contains type definitions for all data structure and API.

### Examples

#### Preparation

1. clone repo 
2. `yarn install`
3. copy `src/example/.env.example` to `src/example/.env`, and put your vars there


#### Run server example

1. `yarn example` - it will run server with a route for webhooks
2. specify webhook URL in Dashboard
    If you use Mati SDK for integration you should use `http://<YOUR_BACKEND_URL>/webhooks/v1`  
    If you use API for integration you should use `http://<YOUR_BACKEND_URL>/webhooks/v2`
    (draw your attention this backend should be available externally, evidently `localhost` will not work)
3. start verification flow, you should see all incoming webhooks logged.

#### Run API flow example
1. `yarn runAllFlow` - it will run node app that creates identity and sends input with document photos and liveness video on one request

P.S. If you have the server example started, you should see incoming webhooks as well.  
 

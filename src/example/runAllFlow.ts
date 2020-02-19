import fs from 'fs';

import './config';
import { apiService, SendInputRequestBuilder } from '../main';
import SendInputRequest, { DocumentTypeTypes } from '../models/v2/SendInputRequest';
import SendInputResponse from '../models/v2/SendInputResponse';

const clientId = process.env.CLIENT_ID || 'default';
const clientSecret = process.env.CLIENT_SECRET || 'default';

async function main() {
  try {
    apiService.init({
      clientId,
      clientSecret,
      host: process.env.API2_HOST, // Optional
    });
    const identityResource = await apiService.createIdentity({
      payload: 'some value',
    });
    const { _id: id } = identityResource;
    enum FileNames {
      Front = 'front.png',
      Video = 'video.mp4',
    }
    const sendInputRequest: SendInputRequest = SendInputRequestBuilder
      .createWithDocumentPhoto(
        {
          type: DocumentTypeTypes.NationalId,
          country: 'US',
          region: 'IL',
        },
        {
          filename: FileNames.Front,
          stream: fs.createReadStream(`./assets/${FileNames.Front}`),
        },
      )
      .build();
    const sendInputResponse: SendInputResponse = await apiService.sendInput(id, sendInputRequest);
    if (sendInputResponse.some((inputResult) => !inputResult.result)) {
      throw new Error('Input error');
    }
    console.log('sendInputResponse', sendInputResponse);
    console.log('all flow done');
  } catch (err) {
    console.error(err);
  }
}


main()
  .then();

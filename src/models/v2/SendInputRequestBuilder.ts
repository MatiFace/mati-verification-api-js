import SendInputRequest, {
  DocumentPhotoInputData,
  DocumentTypeTypes,
  Input,
  InputTypeTypes, MediaTypeTypes,
  PageTypes, SelfiePhotoInputData, SelfieVideoInputData,
} from './SendInputRequest';

export type DocumentData = {
  type: DocumentTypeTypes;
  country: string;
  region?: string;
};

export type FileData = {
  filename: string;
  stream: any;
};

export default class SendInputRequestBuilder {
  private sendInputRequest: SendInputRequest = { inputs: [], files: [] };

  private groupCounter = 0;

  static createWithDocumentPhoto(
    documentMetadata: DocumentData,
    frontSide: FileData,
    backSide?: FileData,
  ): SendInputRequestBuilder {
    return new SendInputRequestBuilder()
      .appendDocumentPhoto(documentMetadata, frontSide, backSide);
  }

  static createWithSelfiePhoto(
    selfiePhoto: FileData,
  ): SendInputRequestBuilder {
    return new SendInputRequestBuilder()
      .appendSelfiePhoto(selfiePhoto);
  }

  static createWithSelfieVideo(
    selfieVideo: FileData,
  ): SendInputRequestBuilder {
    return new SendInputRequestBuilder()
      .appendSelfieVideo(selfieVideo);
  }

  build(): SendInputRequest {
    return this.sendInputRequest;
  }

  appendDocumentPhoto(documentMetadata: DocumentData, frontSide: FileData, backSide?: FileData) {
    this.addDocumentAndFile(documentMetadata, frontSide);
    if (backSide) {
      this.addDocumentAndFile(documentMetadata, backSide);
    }
    this.groupCounter += 1;
    return this;
  }

  appendSelfiePhoto(selfiePhoto: FileData) {
    this.sendInputRequest.inputs.push(
      <Input<SelfiePhotoInputData>>{
        inputType: InputTypeTypes.SelfiePhoto,
        group: this.groupCounter,
        data: {
          filename: selfiePhoto.filename,
        },
      },
    );
    this.sendInputRequest.files.push(
      {
        mediaType: MediaTypeTypes.Selfie,
        fileName: selfiePhoto.filename,
        stream: selfiePhoto.stream,
      },
    );
    this.groupCounter += 1;
    return this;
  }

  appendSelfieVideo(selfieVideo: FileData) {
    this.sendInputRequest.inputs.push(
      <Input<SelfieVideoInputData>>{
        inputType: InputTypeTypes.SelfieVideo,
        group: this.groupCounter,
        data: {
          filename: selfieVideo.filename,
        },
      },
    );
    this.sendInputRequest.files.push(
      {
        mediaType: MediaTypeTypes.Video,
        fileName: selfieVideo.filename,
        stream: selfieVideo.stream,
      },
    );
    this.groupCounter += 1;
    return this;
  }

  private addDocumentAndFile(documentMetadata: DocumentData, fileData: FileData) {
    this.sendInputRequest.inputs.push(
      <Input<DocumentPhotoInputData>>{
        inputType: InputTypeTypes.DocumentPhoto,
        group: this.groupCounter,
        data: {
          ...documentMetadata,
          page: PageTypes.Front,
          filename: fileData.filename,
        },
      },
    );
    this.sendInputRequest.files.push(
      {
        mediaType: MediaTypeTypes.Document,
        fileName: fileData.filename,
        stream: fileData.stream,
      },
    );
  }
}

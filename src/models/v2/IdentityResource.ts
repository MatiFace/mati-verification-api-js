export enum IdentityStatusTypes {
  Deleted = 'deleted',
  Pending = 'pending',
  Rejected = 'rejected',
  ReviewNeeded = 'reviewNeeded',
  Running = 'running',
  Verified = 'verified',
}

export default interface IdentityResource {
  _id: string; // TODO Rename
  flowId?: string;
  status: IdentityStatusTypes;
}

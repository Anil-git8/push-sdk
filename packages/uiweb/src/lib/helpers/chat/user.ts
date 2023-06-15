import type { IUser } from '@pushprotocol/restapi';
import { ProfilePicture } from '../../config';

export const displayDefaultUser = ({ caip10 }: { caip10: string }): IUser => {
  const userCreated: IUser = {
    did: caip10,
    wallets: caip10,
    publicKey: 'temp',
    profilePicture: ProfilePicture,
    encryptedPrivateKey: 'temp',
    encryptionType: 'temp',
    signature: 'temp',
    sigType: 'temp',
    encryptedPassword: null,
    about: null,
    name: null,
    numMsg: 1,
    allowedNumMsg: 100,
    nftOwner: null,
    linkedListHash: null,
    msgSent: 0,
    maxMsgPersisted: 0,
    profile: {
      name: null,
      desc: null,
      picture: ProfilePicture,
      profileVerificationProof: null,
    },
    verificationProof: '',
  };
  return userCreated;
};
// takes a did key and makes a jwe header
export const createRecipient = (didKey: any) => {
  const { id: kid } = didKey;
  return { header: { kid, alg: 'ECDH-ES+A256KW' } };
};

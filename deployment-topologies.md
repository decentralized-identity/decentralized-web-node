
# ​X.​ Deployment topologies

Based on the use cases, we consider the following deployment topologies:

## ​X.1.​ Mobile Device Only

The server and the client reside on the same device. The vault is a library
providing functionality via a binary API, using local storage to provide an
encrypted database.

## ​X.2.​ Mobile Device Plus Cloud Storage

A mobile device plays the role of a client, and the server is a remote
cloud-based service provider that has exposed the storage via a network-based
API (eg. REST over HTTPS). Data is not stored on the mobile device.

## ​X.3.​ Multiple Devices (Single User) Plus Cloud Storage

When adding more devices managed by a single user, the vault can be used to
synchronize data across devices.

## ​X.4.​ Multiple Devices (Multiple Users) Plus Cloud Storage

When pairing multiple users with cloud storage, the vault can be used to
synchronize data between multiple users with the help of replication and merge
strategies.

## ​X.5.​ Cloud(s) Only? Controlling keys handled by a different Cloud Vault

Some use cases (IoT / machine to machine / Skynet) require a non-human actor to delegate KMS/key control to a cloud vault for oversight or human intervention. In the case of some Password manager use case architectures or biometrically accessed/deployed key material storage, as well as some multi-cloud/hybrid-cloud architectures, key material will need to be retrieved from at least one other vault before accessing the vault being specified here.

Keys in control of such an entity might still need to securely store signed credentials or data in a separate vault. Additional diagramming or specifications will be needed to show how this 2-vault solution could be constrained to be secure and feasible, even if non-normative.

## ​X.6.​ Self-Hosted and/or Home-based Server?

Alice wants to host her own SDS software instance, on her own server.

## ​X.7​ Support Low Power Devices/Non-private computing

To support users without access to private computing resources, the following
three components need to be considered:

* Secure Storage
* Key vault - private key storage and recovery (Key management)
* Trusted computing - computational resources which have access to private keys
  and plain text private data
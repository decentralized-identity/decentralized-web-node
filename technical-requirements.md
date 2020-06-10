# ​3.​ Technical Requirements derived from previous sections

The following sections elaborate on the requirements that have been gathered
from the core use cases.

## ​3.1.​ Privacy and multi-party encryption

One of the main goals of this system is ensuring the privacy of an entity's data
so that it cannot be accessed by unauthorized parties, including the storage
provider.

To accomplish this, the data must be encrypted both while it is in transit
(being sent over a network) and while it is at rest (on a storage system).

Since data could be shared with more than one entity, it is also necessary for
the encryption mechanism to support encrypting data to multiple parties.

As much metadata as possible should also be protected, including filenames, file
sizes and directory topology.

## ​3.2.​ Sharing and authorization

It is necessary to have a mechanism that enables authorized sharing of encrypted
information among one or more entities.

The system is expected to specify one mandatory authorization scheme, but also
allow other alternate authorization schemes. Examples of authorization schemes
include OAuth2, Web Access Control, and ZCAPs (Authorization Capabilities).

## ​3.3.​ Identifiers

The system should be identifier agnostic. In general, identifiers that are a
form of URN or URL are preferred. While it is presumed that [DID-CORE]
(Decentralized Identifiers, DIDs) will be used by the system in a few important
ways, hard-coding the implementations to DIDs would be an anti-pattern.

## ​3.4.​ Versioning and replication

It is expected that information can be backed up on a continuous basis. For this
reason, it is necessary for the system to support at least one mandatory
versioning strategy and one mandatory replication strategy, but also allow other
alternate versioning and replication strategies.

## ​3.5.​ Metadata and searching

Large volumes of data are expected to be stored using this system, which then
need to be efficiently and selectively retrieved. To that end, an encrypted
search mechanism is a necessary feature of the system.

It is important for clients to be able to associate metadata with the data such
that it can be searched. At the same time, since privacy of both data and
metadata is a key requirement, the metadata must be stored in an encrypted
state, and service providers must be able to perform those searches in an opaque
and privacy-preserving way, without being able to see the metadata.

## ​3.6.​ Protocols

Since this system can reside in a variety of operating environments, it is
important that at least one protocol is mandatory, but that other protocols are
also allowed by the design. Examples of protocols include HTTP, gRPC, Bluetooth,
and various binary on-the-wire protocols. At least an  HTTPS API must be defined
by the specification.

## 3.7. Cryptographic Agility (or lack thereof)

At least one mandatory format for encrypted data, and then some optional ones?

# ​4.​ Design goals

This section elaborates upon a number of guiding principles and design goals
that shape Encrypted Data Vaults.

## ​4.1.​ Layered and modular architecture

A layered architectural approach is used to ensure that the foundation for the
system is easy to implement while allowing more complex functionality to be
layered on top of the lower foundations.

For example, Layer 1 might contain the mandatory features for the most basic
system, Layer 2 might contain useful features for most deployments, Layer 3
might contain advanced features needed by a small subset of the ecosystem, and
Layer 4 might contain extremely complex features that are needed by a very small
subset of the ecosystem.

## ​4.2.​ Prioritize privacy

This system is intended to protect an entity's privacy. When exploring new
features, always ask "How would this impact privacy?". New features that
negatively impact privacy are expected to undergo extreme scrutiny to determine
if the trade-offs are worth the new functionality.

## ​4.3.​ Push implementation complexity to the client

Servers in this system are expected to provide functionality strongly focused on
the storage and retrieval of encrypted data. The more a server knows, the
greater the risk to the privacy of the entity storing the data, and the more
liability the service provider might have for hosting data. In addition, pushing
complexity to the client enables service providers to provide stable server-side
implementations while innovation can be carried out by clients.

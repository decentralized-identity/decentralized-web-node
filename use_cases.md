# Use Cases and Requirements

The purpose of this document is to collect use cases, deployment scenarios,
requirements, and design goals in a document in order to guide the work of the
DIF SDS WG. At present, we are collecting information. After the information
gathering phase, we will go through a ranked choice vote in order to prioritize
each use case, scenario, requirement, and design goals.

# 1.​ Functional Requirements (or, Basic Use Cases)

The following four use cases have been identified as representative of common
usage patterns (though are by no means the only ones).

## ​1.1.​ Store and use data

I want to store my information in a safe location. I don't want the storage
provider to be able to see any data I store. This means that only I can see and
use the data. I don’t even want the storage provider to be able to see metadata
like file names, file sizes, directory topology, or who I’ve granted access to
something.

## ​1.2.​ Search data

Over time, I will store a large amount of data. I want to search the data, but
don't want the service provider to know what I'm storing or searching for.

## ​1.3.​ Share data with one or more entities

I want to share my data with other people and services. I can decide on giving
other entities access to data in my storage area when I save the data for the
first time or in a later stage. The storage should only give access to others
when I have explicitly given consent for each item.

I want to be able to revoke the access of others at any time. When sharing data,
I can include an expiration date for the access to my data by a third-party.

## ​1.4.​ Store the same data in more than one place

I want to backup my data across multiple storage locations in case one fails.
These locations can be hosted by different storage providers and can be
accessible over different protocols. One location could be local on my phone,
while another might be cloud-based. The locations should be able to masterless
synchronize between each other so data is up to date in both places regardless
of how I create or update data, and this should happen automatically and without
my help as much as possible.

## ​1.5.​ Alice wants to publish public plaintext about Bob or Carl in a censorship resistant manner.

Alice wants to be able to store data that is plaintext anonymous visible, but
authenticated. Alice does not want anyone to prevent Alice from publishing
public plaintext data.

Alice wants to be able to store plaintext and plaintext metadata on servers that
she does not operate.

## ​1.6.​ Enable storage of semantic data and the ability to retrieve it via a self-describing API (based on its schema, type, etc.)

1. As a user, I want to add schema.org _Offer_ objects so that anyone in the
  world can crawl it and create a decentralized app that displays the salable
  goods.
2. As a developer, I want to create a DID for my code package and publish its
  repo/code data as a schema.org _SoftwareSourceCode_ object so anyone can
  crawl it and create a decentralized app to visualize packages across the DID-
  based ‘DPM’ (think NPM, but decentralized)
3. As a business owner, I want to publish various schema-based objects that
  define what my business is.

## ​1.7.​ Provide a mechanism for receiving and handling a queue of task-based messages.

As a user, I would like a mechanism where other entities can send me actionable
message objects that are synced across my SDS instances, so that I can act on
them in whatever way is appropriate for the type of message. If subsequent
messages are exchanged as a result of an initiating message, the subsequent
messages should be referentially tied together (e.g. thread back to the parent).

## ​1.8.​ Alice wants to upload executable code or configuration management that service providers will run based on an event system.

Event Types, Event Subscriptions, Event Handlers, data and program should be
storable in SDS. Similar to systems which watch file changes and transpile, or
forward messages... "IF this THEN that"... could be set of predefined workflows,
or executable code. Examples of similar systems: Github Actions, Zapier, IFTT,
OpenFaaS.

## ​1.9​ Terminate a relationship with a service provider

Ensure users have the ability to terminate a relationship with one or more
service providers in a manner that does not disclose anything about the future
state or location of the user’s data. Ensure the user can verify or obtain a
verifiable certification from service provider that their data has been, if
requested, purged from the provider's system (confirming right to be forgotten).

## ​1.10​ Sharding data

Ensure users have the ability to shard their data, or create M of N key
scenarios across one or multiple providers. Provide options to the user which
allow for either the service provider to manage sharding or allow sharding that
is completely hidden from a service provider.

# ​2.​ Focal Use Cases

Would it make sense to try and distill a Focal Use Case from Adrian Gropper's [Covid Use Case document](https://github.com/agropper/secure-data-store/blob/master/COVID-19_Health_Report_Use_Case.md)?  I'm happy to take a crack at the distillation into a first draft if I get confirmation that it's not wasted effort. I think it might be productive to double-check that the functional requirements 1.3 & 1.9, as well as the technical requirements of 3.2, make sense across a change of SDS provider.

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

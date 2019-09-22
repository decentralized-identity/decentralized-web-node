# Encrypted Data Vaults
Authors (in alphabetical order): Daniel Bluhm, Kim Hamilton Duffy, Amy Guy, David Lamers, Tobias Looker, Manu Sporny, Dmitri Zagidulin

We store a significant amount of sensitive data online, such as personally
identifying information (PII), trade secrets, family pictures, and customer
information. The data that we store is often not protected in an appropriate manner.

Legislation, such as the General Data Protection Regulation (GDPR), incentivizes
service providers to better preserve individuals' privacy, primarily through
making the providers liable in the event of a data breach. This liability
pressure has revealed a technological gap, whereby providers are often not
equipped with technology that can suitably protect their customers. Encrypted
Data Vaults fill this gap and provide a variety of other benefits.

This paper describes current approaches and architectures, derived requirements,
design goals, and dangers that implementers should be aware of when implementing
data storage. This paper also explores the base assumptions of these sorts of
systems such as providing privacy-respecting mechanisms for storing, indexing,
and retrieving encrypted data, as well as data portability.

## Current ecosystem and existing work

The problem of decentralized data storage has been approached from various
different angles, and personal data stores (PDS), decentralized or otherwise,
have a long history in commercial and academic settings [[1](https://en.wikipedia.org/wiki/Personal_data_service),
[2](http://www.randomwalker.info/publications/critical-look-at-decentralization-v1.pdf)].
Different approaches have resulted in variations in terminology and architectures.
The diagram below shows the types of components that are emerging, and the roles
they play. Encrypted Data Vaults fulfill a _storage_ role.

![Roles and interactions](media/edv.png)

What follows is an outline of commonalities and differences between a selection
of existing implementations.

| Project | In-transit Encryption | At-rest Encryption Required? | Metadata | Queries  | Storage
| ------- | -------------------- | ----------------- | ----------- | ----------------- | -------
| NextCloud | TLS | no, [beta support](https://nextcloud.com/endtoend/) avail. |  | [WebDAV search](https://docs.nextcloud.com/server/16/developer_manual/client_apis/WebDAV/search.html) | database & device fs
| Solid | TLS | no | binary or structured linked data | [experimental](https://github.com/solid/query-ldflex) | modular (currently device fs)
| Blockstack | TLS | no (supported) | n/a |
| Identity Hubs | custom | yes (but not metadata) | JWTs | yes | database & device fs
| Datashards | n/a | yes | binary | no | modular (device fs)
| IPFS | [custom non-TLS](https://github.com/ipfs/specs/issues/29) | no | binary? | no | public network
| Tahoe LAFS |

| Project | Authn | Access Control | Read-write interface | Application ecosystem | Standard(s)
| ------- | ---- | -------------- | -------------------- | --------------------- | ----------------
| NextCloud | [custom](https://docs.nextcloud.com/server/16/developer_manual/client_apis/LoginFlow/) | ?? | WebDAV | yes | IETF & own
| Solid | [WebID-OIDC](https://github.com/solid/webid-oidc-spec) | [WAC](https://github.com/solid/web-access-control-spec) | REST (LDP) | yes | W3C, IETF & own
| Blockstack | bearer token | per-resource | REST | yes | own
| Identity Hubs | DID Authn | JSON-LD Permissions API | JSON API | pending | own
| Datashards | n/a | OCAP? | | no | not yet..
| IPFS | | | | | own
| Tahoe LAFS | | | | | own

Separating storage from applications which use the stored data is key to most of
these architectures.
[Blockstack](https://docs.blockstack.org/storage/overview.html),
[NextCloud](https://docs.nextcloud.com/server/16/developer_manual/client_apis/),
[Solid](https://github.com/solid/solid-spec/) and [DIF's Identity
Hubs](https://github.com/decentralized-identity/identity-hub/blob/master/explainer.md)
all describe architectures for decoupled end-user applications from storage.
Such applications may be generic file management interfaces for browsing or
sharing data, or specialized domain specific tools designed for particular tasks
(eg. a calendar).
[Datashards](https://github.com/WebOfTrustInfo/rwot9-prague/blob/master/topics-and-advance-readings/datashards-rationale.md),
[Tahoe-LAFS](https://tahoe-lafs.org/trac/tahoe-lafs) and
[IPFS](https://docs.ipfs.io) are only concerned with data storage and retrieval.

In the case of Solid, NextCloud, and Identity Hubs, end users have the option of
installing and running the server portion of the data store on a device they
control, or signing up to an already configured instance hosted by a trusted
third-party (eg. a commercial provider, affiliated institution, or friend).
Blockstack also uses this model for the "hub" interface between clients and
storage servers, alongside a blockchain for transactional data, and permits the
user to choose cloud storage (such as AWS or a Digital Ocean VPS) for the data
itself. For Datashards and Tahoe-LAFS, end users install a native application on
one or more device(s) they control, and data is stored locally to these devices.
IPFS is peer-to-peer, so end users only install the read/write client, and data
is stored across a public network.

NextCloud uses WebDAV to allow client applications to read, write, and search
data on the server's filesystem using a directory structure, and OCP for
authentication. End-to-end encryption is currently in beta and can be enabled by
users, but is not on by default. Spreading data across multiple instances for
scalability is a [commercial enterprise
offering](https://nextcloud.com/globalscale/). Different NextCloud servers do
not talk to each other directly, but can do via applications installed by the
user.

Solid combines [LDP](https://www.w3.org/TR/ldp) with [OpenID
Connect](https://github.com/solid/solid-auth-oidc) authentication and [Web
Access Control](https://github.com/solid/web-access-control-spec) to enable
users to sign into client applications, which discover the user's data store URI
from their profile and can then read or write data. Resources (data objects) on
Solid servers are represented by HTTP URIs, and Solid servers receive HTTP
requests (`GET`, `POST`, `PUT`, `DELETE`) containing RDF payloads and create or
modify the target URI accordingly. Resources are listed in `ldp:Container`s,
which serve as indexes which can be updated by end users or client applications
according to specific needs. Precisely how the data is stored is an
implementation detail (e.g., a filesystem or a database). No search interface
has been specified, but some implementations may expose a SPARQL endpoint or
Triple Pattern Fragments. Data on Solid servers is not required to be encrypted
at rest, but HTTPS is assumed for the connection between clients and servers.
Different instances of Solid servers do not communicate with each other (client
apps perform all communication between storage servers).

Blockstack uses "storage hubs" called Gaia, which run as a service and write to
a user's chosen storage once a user has authenticated with the client-side
application they wish to use. Gaia writes the data exactly as given by the
application, whether a valid or invalid data format, encrypted or not, so long
as a valid bearer token is included in the request. Clients interact with Gaia
through a REST API.

Identity Hubs enable the end user to store their data in one or more locations
which are linked to a DID. Creating and updating data and metadata in the Hub is
done by posting JWTs to specified endpoints. The JWT headers include metadata
for the data in the JWT body, as well as a signature. The read and write
requests are encrypted on the wire, and data is encrypted on the Hub. Access
control is carried out via posting to the Permissions interface and indexing is
done via the Collections interface. Clients are responsible for writing
appropriate metadata to Collections, which are not themselves encrypted,
enabling the Hub to respond to queries. Reads require multiple requests, first
to retrieve metadata for the desired data object(s), and then to retrieve the
sequence of commits which make up the actual data. Mechanisms for authentication
and synchronization of changes and conflict resolution between Hub instances are
still under development. Identity Hubs are responsible for additional things
beyond just data storage, for example management of the end user's profile;
transmission of human- or machine-readable messages through the Actions
interface; pointers to external services.

At a lower level, [Tahoe-LAFS](https://tahoe-lafs.org/trac/tahoe-lafs) uses a
client-server architecture, whereby a local client encrypts data, breaks it into
pieces, and stores it on one or more servers on other devices. The client
creates and stores redundant pieces of data so a system is resilient to
corruption of some shards or servers going offline. Servers can neither read nor
modify the data. Data is organized in a filesystem like directory structure and
access control makes use of this. Data can be mutable or immutable, and is
always encrypted.

Datashards is concerned with encrypted storage and replication of data across
devices. Datashards is similar to Tahoe-LAFS, but uses a more generalized URI
scheme and object capabilities for sharing of data objects. Data is always
encrypted.

IPFS is a distributed content-addressed storage mechanism which breaks data up
into Merkel-DAGs. IPFS uses [IPLD](https://github.com/ipld/specs) to generate
URIs for data from the content, and to link content together on the network; and
uses DHTs to discover content on the network. IPFS does not encrypt data, and
stores it across a public network.

[Hyperledger Aries](https://github.com/hyperledger/aries-rfcs) is an
infrastructure for agent interactions but does not provide a solution for data
storage.

## Core Use Cases
The following three use
cases have been identified as representative of common usage patterns (though
are by no means the only ones).

#### Use Data and Control Access to it
As an end-user, I want to store my data in a safe location. I don’t want the
storage provider to be able to see any data I store. This means that only I can
see and use the data. I should have full control over who, besides me, has
access to the data.

A large amount of data will be stored which requires that I can do some
searching, but I don't want the service provider to know what I'm searching for.

#### Share Data With One or More Entities
I want to share my data with other people and services. I can decide on giving
other entities access to data in my storage area when I save the data for the
first time or in a later stage. The storage should only give access to others
when I have explicitly given consent for each item.

I want to be able to revoke the access of others at any time. When
sharing data, I can include an expiration date for the 
access to my data by a third-party.

#### Store the Same Data in More Than One Place
I want to backup my data across multiple
storage locations in case one goes down. These locations can be hosted by
different storage providers, and can be accessible over different protocols. One
location could be local on my phone, while another is cloud-based. The locations
should be able to synchronize between each other so data is up to date in both
places regardless of how I create or update data, and this should happen
automatically and without my help as much as possible.

## Requirements

This section elaborates upon a number of requirements that have been gathered
from the core use cases.

### Privacy and Multi-party Encryption

One of the main goals of this system is ensuring the privacy of an entity's
data, so that it cannot be accessed by unauthorized parties.

To accomplish this, the data must be encrypted both while it is in transit
(being sent over a network) and while it is at rest (on disk).

Since data could be shared with more than one entity, it is also necessary for
the encryption mechanism to support encrypting data to multiple parties.

### Sharing and Authorization

It is necessary to have a mechanism that enables authorized sharing
of encrypted information among one or more entities.

The system is expected to specify one mandatory authorization scheme,
but also allow other alternate authorization schemes. Examples of
authorization schemes include OAuth2, Web Access Control, and
[Authorization Capabilities](https://w3c-ccg.github.io/zcap-ld/) (ZCAPs).

### Identifiers

The system should be identifier agnostic. In general, identifiers that are a
form of URN or URL are preferred. While it is presumed that [Decentralized
Identifiers](https://w3c-ccg.github.io/did-spec/) (DIDs) will be used by the
system in a few important ways, hardcoding the implementations to DIDs would be
an anti-pattern.

### Versioning and Replication

It is expected that information can be backed up on a continuous basis. For this
reason, it is necessary for the system to support at least one mandatory
versioning strategy and one mandatory replication strategy, but also allow other
alternate versioning and replication strategies.

### Metadata and Searching

Large volumes of data are expected to be stored using this system, which then
need to be efficiently and selectively retrieved. To that end, an encrypted
search mechanism is a necessary feature of the system.

It is important for clients to be able to associate metadata with the data such
that it can be searched. At the same time, since privacy of both data _and_
metadata is a key requirement, the metadata must be stored in an encrypted
state, and service providers must be able to perform those searches in an opaque
and privacy-preserving way, without being able to see the metadata.

### Protocols

Since this system can reside in a variety of operating environments, it is
important that at least one protocol is mandatory, but that other protocols are
also allowed by the design. Examples of protocols include HTTP, gRPC, Bluetooth,
and various binary on-the-wire protocols.

## Design Goals

This section elaborates upon a number of guiding principles and design goals
that shape Encrypted Data Vaults.

### Layered and Modular Architecture

A layered architectural approach is used to ensure that the foundation for the
system is easy to implement while allowing more complex functionality to be
layered on top of the lower foundations.

For example, Layer 1 might contain the mandatory features for the most basic
system. Layer 2 contains useful features for most deployments. Layer 3 contains
advanced features needed by a small subset of the ecosystem, and Layer 4
contains extremely complex features that are needed by a very small subset of
the ecosystem.

### Prioritize Privacy

This system is intended to protect an entity's privacy. When exploring new
features, always ask "How would this impact privacy?". New features that
negatively impact privacy are expected to undergo extreme scrutiny to determine
if the tradeoffs are worth the new functionality.

### Push Implementation Complexity to the Client

Servers in this system are expected to provide _only_ storage, with no
additional logic. The more a server knows, the greater the risk to the privacy
of the entity storing the data, and the more liability the service
provider might have for hosting data. In addition, pushing complexity to the
client enables service providers to provide stable server-side implementations
while innovation can by carried out by clients.

## Architecture

This section describes the architecture of the Encrypted Data Vaults protocol.

Encrypted Data Vaults defines a client-server relationship, whereby the vault is
regarded as the server and the client acts as the interface used to interact
with the vault.

This architecture is layered in nature, where the
foundational layer consists of an operational system with minimal features and
more advanced features are layered on top. Implementations can choose to
implement only the foundational layer, or optionally, additional layers
consisting of a richer set of features for more advanced use cases.

### Deployment Topologies

Based on the use cases, we consider the following deployment topologies:

* **Mobile Device Only:** The server and the client reside on the same device.
The vault is a library providing functionality via a binary API, using local
storage to provide an encrypted database.
* **Mobile Device Plus Cloud Storage:** A mobile device plays the role of a
client, and the server is a remote cloud-based service provider that has
exposed the storage via a network-based API (eg. REST over HTTPS). Data is
not stored on the mobile device.
* **Multiple Devices (Single User) Plus Cloud Storage:** When adding more
devices managed by a single user, the vault can be used to
synchronize data across devices.
* **Multiple Devices (Multiple Users) Plus Cloud Storage:** When pairing
multiple users with cloud storage, the vault can be used to
synchronize data between multiple users with the help of replication
and merge strategies.

### Server Responsibilities

The server is assumed to be of low trust, and must have no visibility into the
data that it persists. However, even in this model, the server still has a set
of minimum responsibilities it must adhere to.

### Client Responsibilities

The client is responsible for providing an interface to the server, with
bindings for each relevant protocol (HTTP, RPC, or binary over-the-wire
protocols), as required by the implementation.

All encryption and decryption of data is done on
the client side, at the edges. The data (including metadata) MUST be opaque to
the server, and the architecture is designed to prevent the server from being
able to decrypt it.

### Layer 1 Responsibilities

Layer 1 consists of a client-server system that is capable of encrypting data in
transit and at rest.

#### Server: Validate Requests (L1)

When a vault client makes a request to store, query, modify or delete data in
the vault, the server validates the request. Since the actual data and metadata
in any given request is encrypted, such validation is necessarily limited, and
largely depends on the protocol and the semantics of the request.

#### Server: Persist Data (L1)

The mechanism a server uses to persist data, such as storage on a local,
networked, or distributed file system, is determined by the implementation. The
persistence mechanism is expected to adhere to the common expectations of a data
storage provider, such as reliable storage and retrieval of data.

#### Server: Persist Global Configuration (L1)

A vault has a global configuration that defines the following properties:

* The controller of the vault
* Stream chunk size
* Other config metadata

The configuration allows the the client to perform capability discovery
regarding e.g. authorization, protocol and replication mechanisms, used by the
server.

#### Server: Enforcement of Authorization Policies (L1)

When a vault client makes a request to store, query, modify or delete data in
the vault, the server enforces any authorization policy that is associated with
the request.

#### Client: Encrypted Data Chunking (L1)

Encrypted Data Vaults are capable of storing many different types of data,
including large unstructured binary data. This means that storing a file as a
single entry would be challenging for systems that have limits on single record
sizes. For example, some databases set the maximum size for a single record to
16MB. As a result, it is necessary that large data is chunked into sizes that
are easily managed by a server. It is the responsibility of the client to set
the chunk size of each resource and chunk large data into manageable chunks for
the server. It is the responsibility of the server to deny requests to store
chunks larger that it can handle.

Each chunk is encrypted individually using authenticated encryption. Doing so
protects against attacks where an attacking server replaces chunks in a large
file and requires the entire file to be downloaded and decrypted by the victim
before determining that the file is compromised. Encrypting each chunk with
authenticated encryption ensures that a client knows that it has a valid chunk
before proceeding to the next one. Note that another authorized client can still
perform an attack by doing authenticated encryption on a chunk, but a server is
not capable of launching the same attack.

#### Client: Resource Structure (L1)

The process of storing encrypted data starts with the creation of a Resource by
the client, with the following structure.

Resource:

* `id` (required)
* `meta`
    * `meta.contentType` MIME type
* `content` - entire payload, or a manifest-like list of hashlinks to individual chunks

If the data is less than the chunk size, it is embedded directly into the
`content`.

Otherwise, the data is sharded into chunks by the client (see next section), and
each chunk is encrypted and sent to the server. In this case, `content` contains
a manifest-like listing of URIs to individual chunks (integrity-protected by
[Hashlinks](https://tools.ietf.org/html/draft-sporny-hashlink)).

#### Client: Encrypted Resource Structure (L1)

Creating the Encrypted Resource (if the data was sharded into chunks, this is
done after the individual chunks are written to the server):

* `id`
* `index` - encrypted index tags prepared by the client (for use with
privacy-preserving querying over encrypted resources)
* _Versioning metadata_ - such as sequence numbers, Git-like hashes, or other mechanisms
* _Encrypted resource payload_ - encoded as a [`jwe`](https://tools.ietf.org/html/rfc7516),
[`cwe`](https://tools.ietf.org/html/rfc8152#section-5) or other appropriate mechanism

### Layer 2 Responsibilities

Layer 2 consists of a system that is capable of sharing data among multiple
entities, versioning and replication, and performing privacy-preserving searches
in an efficient manner.

#### Client: Encrypted Search Indexes (L2)

To enable privacy-preserving querying (where the search index is opaque to the
server), the client must prepare a list of encrypted index tags (that are stored
in the Encrypted Resource, alongside the encrypted data contents).

* TODO: add details about the salting + encryption mechanism of the index tags

#### Client: Versioning and Replication (L2)

A server must support _at least one_ versioning/change control mechanism.
Replication is done by the client, not by the server (since the client controls
the keys, knows about which other servers to replicate to, etc.). If an
Encrypted Data Vault implementation aims to provide replication functionality,
it MUST also pick a versioning/change control strategy (since replication
necessarily involves conflict resolution). Some versioning strategies are
implicit ("last write wins", eg. `rsync` or uploading a file to a file
hosting service), but keep in mind that a replication strategy _always_ implies
that some sort of conflict resolution mechanism should be involved.

#### Client: Sharing With Other Entities (L2)

An individual vault's choice of authorization mechanism determines how a client
shares resources with other entities (authorization capability link or similar
mechanism).

### Layer 3 Responsibilities

#### Server: Notifications (L3)

A commonly associated feature with data storage providers is a mechanism by
which to notify about changes to the data it persists. A vault may optionally
implement a mechanism by which clients can subscribe to changes in data from the
vault.

#### Client: Vault-wide Integrity Protection (L3)

Vault-wide integrity protection is provided to prevent a variety of storage
provider attacks where data is modified in a way that is undetectable, such  as
if documents are reverted to older versions or deleted. This protection
requires that a global catalog of all the resource identifiers that belong to a
user, along with the most recent version, are stored and kept up to date by the
client. Some clients may store a copy of this catalog locally (and
include integrity protection mechanism such as
[Hashlinks](https://tools.ietf.org/html/draft-sporny-hashlink)) to guard against
interference or deletion by the server.

## Extension Points

Encrypted Data Vaults support a number of extension points:

- Protocol/API - One or more protocols such as library APIs, HTTPS, gRPC, or Bluetooth can be used to access the system.
- Encryption Strategies - One or more encryption strategies such as ECDH or XSalsaPoly1305 can be used to encrypt data.
- Authorization Strategies - One or more authorization strategies such as OAuth2, HTTP Signatures, or Authorization Capabilities can be used to protect access to encrypted data.
- Versioning Strategies and Replication Strategies - One or more versioning and replication strategies such as counters, cryptographic hashes, or CRDTs (Conflict-free Replicated Data Types) can be used to synchronize data.
- Notification mechanisms - One or more notification mechanisms can be used to
signal to clients that data has changed in the vault.

## Security and Privacy Considerations

This section details the general security and privacy considerations as well
as specific privacy implications of deploying Encrypted Data Vaults into
production environments.

### Malicious or Accidental Modification of Data

While a service provider is not able to read data in an
Encrypted Data Vault, it is possible for a service provider to delete, add,
or modify encrypted data. The deletion, addition, or modification of encrypted
data can be prevented by keeping a global manifest of data in the data vault.

### Compromised Vault

An Encrypted Data Vault can be compromised if the data controller (the entity
who holds the decryption keys and appropriate authorization credentials)
accidentally grants access to an attacker. For example, a victim might
accidentally authorize an attacker to the entire vault or mishandle their
encryption key. Once an attacker has access to the system, they may modify,
remove, or change the vault's configuration.

### Data Access Timing Attacks

While it is normally difficult for a server to determine the identity of an
entity as well as the purpose for which that entity is accessing the
Encrypted Data Vault, there is always metadata related to access patterns,
rough file sizes, and other information that is leaked when an entity accesses
the vault. The system has been designed to not leak information that it creates
concerning privacy limitations; an approach which protects against many, but
not all, surveillance strategies that may be used by servers that are not
acting in the best interest of the privacy of the vault's users.

### Encrypted Data on Public Networks

Assuming that all encryption schemes will eventually be broken is a safe
assumption to make when protecting one's data. For this reason, it is
inadvisable that servers use any sort of public storage network to store
encrypted data as a storage strategy.

### Unencrypted Data on Server

While this system goes to great lengths to encrypt content and metadata,
there are a handful of fields that cannot be encrypted in order to ensure
the server can provide the features outlined in this specification.
For example, a version number associated with data provides insight into
how often the data is modified. The identifiers associated with
encrypted content enables a server to gain knowledge by possibly correlating
identifiers across documents. Implementations are advised to minimize the
amount of information that is stored in an unencrypted fashion.

### Partial Matching on Encrypted Indexes

The encrypted indexes used by this system are designed to maximize privacy.
As a result, there are a number of operations that are common in search
systems that are not available with encrypted indexes, such as partial
matching on encrypted text fields, or searches over a scalar range. These
features might be added in the future through the use of zero-knowledge
encryption schemes.

### Threat Model for Malicious Service Provider

While it is expected that most service providers are not malicious, it is
also important to understand what a malicious service provider can and
cannot do. The following attacks are possible given a malicious service
provider:

- Correlation of entities accessing information in a vault.
- Speculation about the types of files stored in a vault depending on file size and access patterns
- Addition, deletion, and modification of encrypted data
- Not enforcing authorization policy set on the encrypted data
- Exfiltrating encrypted data to an unknown external system

## Future Work

The following items will be considered during our ongoing and future
work on Encrypted Data Vaults:

- Query details, sorting, pagination
- Key management
- Choice of authorization strategy
- Choice of change control / conflict resolution strategy
- Notification / pub-sub mechanisms
- With respect to the authorization model, does the vault merely enforce authorization rules, or act as an authorization server.
- What are the assumptions of trust the host the vault must provide, enforcement of authorization rules? Potential attack vectors from the host of the vault?
- What are the opportunities for encrypted searching (Homomorphic encryption, ZKPs), and what are the dangers?
- Retrieval of the history of an object's updates

# Conclusion

This paper has described current approaches and architectures for encrypted
storage systems, provided derived requirements and design goals, and has
highlighted dangers that implementers should be aware of when implementing data
storage. This paper also explored the base assumptions of these sorts of systems
such as providing privacy-respecting mechanisms for storing, indexing, and
retrieving encrypted data, as well as data portability. The authors of  this
paper expect to continue to work on these concepts and contribute them  to a
pre-standards track specification that achieves the concepts and goals  outlined
in this paper.

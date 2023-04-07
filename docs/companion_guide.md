# Decentralized Web Node Companion Guide (DWN)

**Note: This document is a WORKING DOCUMENT and IN PROGRESS.**

<!-- markdown-toc start - Don't edit this section. Run M-x
markdown-toc-refresh-toc -->

**Table of Contents**

- [Decentralized Web Node Companion Guide
  (DWN)](#decentralized-web-node-companion-guide-dwn)
  - [Overview ](#overview-chatgpt)
    - [What Are Decentralized Web Nodes?
      ](#what-are-decentralized-web-nodes-chatgpt)
  - [Target Audience ](#target-audience-chatgpt)
  - [Scope ](#scope-chatgpt)
  - [Disclaimer](#disclaimer)
  - [Terminology ](#terminology-chatgpt)
  - [Technology Comparision](#technology-comparision)
  - [Architecture and Components
    ](#architecture-and-components-chatgpt)
  - [Node Discovery and Peer-to-Peer Networking
    ](#node-discovery-and-peer-to-peer-networking-chatgpt)
  - [Data Sharing and Interoperability
    ](#data-sharing-and-interoperability-chatgpt)
  - [Security and Privacy ](#security-and-privacy-chatgpt)
  - [Testing and Debugging ](#testing-and-debugging-chatgpt)
  - [Deployment and Operations ](#deployment-and-operations-chatgpt)
    - [Example Deployment (Simple)](#example-deployment-simple)
    - [Example Deployment (Complex)](#example-deployment-complex)
  - [Miscellaneous](#miscellaneous)
    - [Example Use Cases](#example-use-cases)
    - [Real World Applications](#real-world-applications)
    - [DWN Adoption](#dwn-adoption)
    - [Ecosystem interplay](#ecosystem-interplay)
    - [Limitations and Other
      Considerations](#limitations-and-other-considerations)
    - [Q&A](#qa)
    - [Reference Implementations](#reference-implementations)

<!-- markdown-toc end -->

## Overview

The Decentralized Web Node (DWN) companion guide is a non-normative guide that
provides an overview of the functional requirements and design processes for
implementing the DWN specification developed by the Decentralized Identity
Foundation (DIF). This guide is intended to be used by developers, architects,
and solution providers who are interested in building decentralized web
applications and services that conform to the DWN specification.

This companion guide is not a [formal
specification](https://identity.foundation/decentralized-web-node/spec/), but
rather a practical resource that provides guidance on implementing the DWN
specification in a way that promotes best practices and ensures interoperability
with other decentralized web nodes. The guide covers a range of topics,
including functional requirements, design considerations, and best practices for
building and deploying decentralized web nodes.

The contents of this companion guide include:

- An overview of the DWN specification, including its purpose, scope, and key
  features.
- Functional requirements for implementing the DWN specification, including node
  discovery, peer-to-peer networking, and data sharing protocols.
- Design considerations for building decentralized web nodes that conform to the
  DWN specification, including the use of decentralized storage systems like
  IPFS, and cryptographic protocols for secure data sharing and verification.
- Best practices for building and deploying decentralized web nodes, including
  strategies for testing, debugging, and monitoring.

This companion guide is intended to supplement the [formal DWN
specification](https://identity.foundation/decentralized-web-node/spec/)
developed by the DIF. By providing practical guidance on implementing the
specification, this guide can help developers, architects, and solution
providers to build decentralized web applications and services that promote
greater privacy, security, and user control over their data.

Overall, the Decentralized Web Node companion guide is a valuable resource for
anyone who is interested in building decentralized web nodes that conform to the
DWN specification.

**STATUS:** PRE-DRAFT / IN PROGRESS

### What Are Decentralized Web Nodes?

The DWN specification is a set of standards for building and deploying
decentralized web nodes, which are the building blocks of a decentralized web
infrastructure.

The DWN specification defines a set of protocols and APIs that enable
decentralized web nodes to communicate and work together in a secure and
interoperable way. This includes standards for data sharing, node discovery, and
peer-to-peer networking.

The DWN specification is designed to enable developers to build decentralized
web applications and services that can operate independently of centralized
infrastructure. This can help to improve the privacy, security, and resilience
of the web, while also promoting greater user control over their data.

The functional advantages of DWN's are that they are very good at scaling
decentralized web apps. They enable multi-party data transactions with minimal
overhead.

Overall, the DWN specification is an important part of the DIF's work to promote
the development of decentralized web technologies and standards. By providing a
clear set of guidelines and best practices for building and deploying
decentralized web nodes, the DWN specification can help to accelerate the
adoption of a more decentralized and open web.

## Target Audience

This target audience for this document are those that have a strong technical
background and experience in building web applications, as well as a good
understanding of decentralized systems and protocols. They may also have
experience with blockchain technologies, distributed computing, and peer-to-peer
networking.

Developers who intend to implement the DWN specification will need to have a
good understanding of the protocols and APIs defined in the specification, as
well as the underlying technologies that support it. This may include
familiarity with decentralized storage systems like IPFS, as well as
cryptographic protocols for secure data sharing and verification. This guide is
intended to provide descriptive and functional color around some of the more
formal specifications provided by the core specs.

Architects and solution providers will also need to have a good understanding of
the broader decentralized web ecosystem, including emerging standards and best
practices. This can help to inform the design of decentralized web applications
and services that are secure, scalable, and interoperable.

Overall, the target audience for the DWN companion guide is a technical
community that is committed to building a more decentralized and open web. By
leveraging the DWN specification, developers, architects, and solution providers
can help to accelerate the adoption of decentralized web technologies, and
promote greater privacy, security, and user control over their data.

## Scope

This non-normative guide is intended to provide an overview of the functional
requirements and design processes for implementing the Decentralized Web Node
(DWN) specification developed by the Decentralized Identity Foundation (DIF).
This guide is intended to be used by developers, architects, and solution
providers who are interested in building decentralized web applications and
services that conform to the DWN specification.

The guide covers the following topics:

- An overview of the DWN specification, including its purpose, scope, and key
  features.
- Functional requirements for implementing the DWN specification, including node
  discovery, peer-to-peer networking, and data sharing protocols.
- Design considerations for building decentralized web nodes that conform to the
  DWN specification, including the use of decentralized storage systems like
  IPFS, and cryptographic protocols for secure data sharing and verification.
- Bestpractices for building and deploying decentralized web nodes, including
  strategies for testing, debugging, and monitoring.

This guide is intended to be a non-normative companion to the formal DWN
specification developed by the DIF. While it is not a formal specification, this
guide is intended to provide practical guidance for implementing the DWN
specification in a way that promotes best practices and ensures interoperability
with other decentralized web nodes.

Overall, the scope of this non-normative guide is to provide developers,
architects, and solution providers with a clear and practical overview of the
functional requirements and design processes for implementing the DWN
specification developed by the DIF.

## Disclaimer

This Decentralized Web Node (DWN) companion guide is a non-normative resource
that is intended to provide practical guidance on implementing the DWN
specification developed by the Decentralized Identity Foundation (DIF). This
guide is not a formal specification, and as such, it is not intended to replace
or supersede the DWN specification.

The contents of this guide are based on the opinions and experiences of the
authors, and are not necessarily endorsed by the DIF or any other organization.
The guide is intended to be opinionated in the sense that it represents a
particular perspective on how best to implement the DWN specification, based on
the authors' experiences and insights.

Readers are encouraged to use their own judgment and discretion when
implementing the DWN specification, and to consider a range of approaches and
best practices. This companion guide is not intended to be prescriptive or
comprehensive, and readers are encouraged to consult other resources and experts
in the field to inform their decisions.

Overall, this companion guide is intended to provide a helpful resource for
those interested in implementing the DWN specification, but it should be
understood that the opinions and recommendations expressed in this guide are not
the only or definitive way to approach decentralized web node design and
implementation

## Terminology

The Terminology section of the Decentralized Web Node (DWN) companion guide is
intended to provide a comprehensive and accessible reference for the key terms
and concepts related to the DWN specification. This section aims to define
important technical terms and concepts in a clear and concise manner, and to
provide examples and illustrations where appropriate. The Terminology section is
designed to be a useful resource for developers, architects, and solution
providers who are new to the world of decentralized web technologies, as well as
for those who are more experienced and looking for a refresher or clarification
on certain terms and concepts.

- **IPFS** :: A protocol, hypermedia and file sharing peer-to-peer network for
  storing and sharing data in a distributed file system.
- **DWN** :: A data storage and message relay mechanism entities can use to
  locate public or private permissioned data related to a given Decentralized
  Identifier (DID).
- **DID** :: Decentralized identifiers (DIDs) are a type of globally unique
  identifier that enables an entity to be identified in a manner that is
  verifiable, persistent (as long as the DID controller desires), and does not
  require the use of a centralized registry.
- **[DAG
  CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md)**
  :: DAG-CBOR is a codec that implements the IPLD Data Model as a subset of
  CBOR, plus some additional constraints for hash consistent representations.
- **Requests Objects** :: Request Objects are JSON object envelopes used to pass
  messages to Decentralized Web Nodes.
- **Collection** :: An interface of Decentralized Web Nodes provides a mechanism
  to store data relative to shared schemas.
- **Protocol** :: Protocols introduces a mechanism for declaratively encoding an
  app or service’s underlying protocol rules, including segmentation of records,
  relationships between records, data-level requirements, and constraints on how
  participants interact with a protocol
- **Hook** :: Web Hooks are one-way pushes of data to subscribed entities.
- **[IANA Media
  Type](https://www.iana.org/assignments/media-types/media-types.xhtml)** :: A
  two-part identifier for file formats and format contents transmitted on the
  Internet aka MIME type.
- **JSON Web Signature ( JWS )** :: Content secured with digital signatures or
  Message Authentication Codes (MACs) using JSON-based data structures
- **Content Identifier (CID)** :: A label used to point to material in IPFS
- **Message** :: All Decentralized Web Node messaging is transacted via Messages
  JSON objects. These objects contain message execution parameters,
  authorization material, authorization signatures, and signing/encryption
  information

## Technology Comparision

There has been so much rapid development of Decentralized Storage technologies
that it’s important to highlight the common aspects, and the differences with
the goal of matching their unique features with the Use Case at hand.

We will use the term “Personal and Application Data Storage” to denote the 
compared technologies whether they are a stack, libraries, protocols, or 
frameworks.

This is by no means a comprehensive comparison, and we did not test these 
technologies at a scale.

### Technologies that are not Personal Data Stores


#### **DIDComm** - https://didcomm.org/

A DID based, secured, transport-agnostic, peer-to-peer communications, protocol.
It lays the foundation to build domain/vertical/application specific protocols.

#### **KERI** - https://keri.one/

Enables the portability of Self-Sovereign Identities by eliminating the need
for a ledger to establish a root of trust.

#### **Nostr** - https://nostr.com/

Nostr has gained some popularity as an open protocol that offers a censorship-resistant
alternative to Twitter. It relies on relay servers that accept and store posts.
A client or Dapp signs messages with the user’s private key and posts messages
to as many relay servers as possible in order to prevent the user’s content to
be banned.
Relay servers do not communicate with each other thus the responsibility of 
replication is delegated to the Client application.
Users are identified by their public key. That is, every post that is signed 
can be cryptographically verified.

### Decentralized Storage that are not intrinsically Personal Data Stores

#### **ChainSafe Storage** - https://storage.chainsafe.io/

ChainSafe is an end-to-end file encrypting storage application. It persists symmetric-encrypted information on the IPFS/FileCoin network. 

It is meant to transition traditional Web 2.0 integrations with AWS S3 buckets to Web 3.0.

Fleek

Reference: https://docs.fleek.co/

Fleek is a multi-purpose set of technologies that allow Dapp Developers to host web applications on IPFS / FileCoin. It also provides general IPFS / FileCoin storage management. It is geared towards builders rather than individuals.

Fleek offers Space and Space Daemon which is intended for building Privacy preserving Dapps. It is currently in Alpha.

[TODO: A more exhaustive comparison is needed]

Web3.Storage – [Pending]

Reference: https://web3.storage/

Protocol Labs IPFS, FileCoin, FVM

Reference: https://fvm.filecoin.io/

IPFS is without a doubt the most successful storage protocol that decouples data from well-known servers, cloud storage, or any type of centralized storage. This is accomplished using Content Addressing (CID) and the segmenting of data in Direct Acyclic Graphs. In IPFS, the location of the data is its CID.

FileCoin runs on top of IPFS and offers an incentive-based model for cold storage so that any entity that wants to profit from offering hardware resources may easily do so.

The biggest drawback with IPFS/FileCoin was that once a rogue party has a hold of CIDs, the corresponding data is fully accessible. This paradigm forces client processes to encrypt data prior to storing it. Until now… 

Protocol Labs has now released the FileCoint Virtual Machine network. It is an Ethereum-compatible VM. This means that Solidity developers can also develop in the new FVM. 
This technology offers the basic L1 plumbing that unleashes the potential for a new open data economy. This in essence works as a decentralized operating system that orchestrates how data is persisted, retrieved, and governed.

One of the basic features is the ability to bring computation to decentralized data. This means that L2 Compute Networks can encrypt/decrypt sensitive information, act as a gatekeeper, and offer the same features as the various Personal Data Stores herein discussed.

It is worth mentioning that the FVM uses WebAssembly as the bytecode for Smart Contracts. This means that any program that can be compiled into WebAssembly can be used for on-chain development.

Amongst one of the most powerful features of these FVM smart contracts is the ability to define rules for data to obey, most importantly region and location for the storage of that data to obey. This is important in order to remain compliant for regulations such as GDPR, eg data about EU citizens must remain within the borders of the European Community.

FVM Consensus is achieved using their Interplanetary Consensus and it is estimated that it will be able to handle transaction in the realm of the billion tps.



## Architecture and Components

This section provides an overview of the high-level architecture of a DWN,
including the different components that make up a typical DWN, such as the
network layer, data storage layer, identity and access control layer, and the
application layer. The section could also provide guidance on how to design and
implement each of these components to conform to the DWN specification.

## Node Discovery and Peer-to-Peer Networking

This section provides detailed guidance on how to implement the node discovery
and peer-to-peer networking protocols that are required for a DWN to function
properly. This section could cover topics such as how to bootstrap a new node
onto the network, how to maintain a list of known nodes, how to discover and
connect to new peers, and how to propagate data across the network.

## Data Sharing and Interoperability

This section provides guidance on how to design and implement data sharing
protocols that conform to the DWN specification, including the use of
decentralized storage systems like IPFS and the InterPlanetary Linked Data
(IPLD) format. This section could also cover strategies for promoting
interoperability between different decentralized web nodes and data sharing
protocols, such as the use of standardized data formats and metadata.

## Security and Privacy

This section provides guidance on how to design and implement security and
privacy features that conform to the DWN specification, including the use of
cryptographic protocols like Public Key Infrastructure (PKI) and Self-Sovereign
Identity (SSI) for secure data sharing and verification. This section could also
cover best practices for securing DWN infrastructure and protecting user data
against common attacks and threats.

## Testing and Debugging

This section provides guidance on how to test and debug a DWN implementation,
including strategies for testing individual components and the network as a
whole, as well as tools and techniques for troubleshooting issues that may arise
during development or deployment.

## Deployment and Operations

This section provides guidance on how to deploy and operate a DWN implementation
in a production environment, including best practices for scaling and managing a
distributed network, as well as tools and techniques for monitoring and managing
network performance and reliability. This section could also cover strategies
for maintaining backward compatibility and promoting interoperability with other
decentralized web nodes and protocols.

### Example Deployment (Simple)

In this simple example, each actor has a remote (i.e a server) and local node
(i.e a phone). As an example, you have a chat app with a remote and local node.
Alice wants to send a message to Bob in this case, and Bob will reply with a
message back.

![DWN Simple
Connection](https://identity.foundation/decentralized-web-node/spec/images/topology.svg)

**Steps**

0. Bob shares DID to Alice (via a QR code or some other transport)
1. Alice Resolve's Bob's DID
2. Alice sends a message to Bob's node discovered via a Service Endpoint in the
   DID Document
3. Bob's Node relays the Alice's message from the remote note to the local node.
4. Bob resolves Alice's DID and finds the service endpoints
5. Bob's local node ACTs on the message, sending a message back to Alice's Node
6. Alice's remote node receives the message and relays it locally.

### Example Deployment (Complex)

## Miscellaneous

### Example Use Cases

### Real World Applications

### DWN Adoption

### Ecosystem interplay

### Limitations and Other Considerations

### Q&A

#### General Questions

- **How do you pronounce DWNs?**: We've heard a few ways to say it:

  - As dawn : _dɔːn_
  - D Web Node : _diː wɛb nəʊd_
  - D W N : _diː ˈdʌbᵊljuː ɛn_

- **How are DWNs different than SOLID Pods?** See the [Technology
  Comparision](#technology-comparision) section for a detailed understanding of
  how DWNs compare to different technology.

- **For the base case, how many DWNs should I expect a particular person to
  have?** As a general rule, a person can be expected to have a few DWNs. Possibly
  more than 1 but less than 10. There may be cases which require more than 10.

#### Security Questions

- **Are there Data Privacy Considerations like GDPR? And how are they taken care
  of in this kind of paradigm?** The full GDPR rights for individuals are: the
  right to be informed, the right of access, the right to rectification, the
  right to erasure, the right to restrict processing, the right to data
  portability, the right to object and also rights around automated decision
  making and profiling. Since DWN's are a personal data store where you control
  your data, they are basically GDPR by default. See the [Security and
  Privacy](#security-and-privacy-chatgpt) section for additional information.

- **What is the best way to ensure that recipients of PII access via DWN are not
  persistently storing the information using their own digital agent?** This
  question is very dependent on the use case. It is up to the responsibility of
  the DWN app/user to decide what data to give to whom. For sensitive data such
  as PII, it would generally be recommended to give as little information as
  possible and only when required. You can use Zero Knowledge Proofs (ZKP), if
  you need to prove something over a DWN without sharing the actual data.

#### Specification Questions

- **How flexible/dynamic are the protocol control rules?** The Protocols
  interface provides a way to define how another DWN may interact with your DWN.
  This is different to RBAC controls that you would traditionally see in a
  centralized control system. You can learn more about the protocols interface
  [here](https://identity.foundation/decentralized-web-node/spec/#protocols).
  Protocols introduces a mechanism for declaratively encoding an app or
  service’s underlying protocol rules, including segmentation of records,
  relationships between records, data-level requirements, and constraints on how
  participants interact with a protocol.

#### Technical Questions

- **If I replicate DWNs for a service, how many DID's should be assigned?** A
  single DID may point to multiple DWNs. There is a preference toward the first
  service endpoint in the [resolution
  array](https://identity.foundation/decentralized-web-node/spec/#resolution)
- **What happens when there is asymmetry of resources across DWNs w.r.t sync?**
  Although it is currently not supported, there eventually will be selective
  sync that can allow you to filter certain things to sync across DWNs.
- **How does latency impact sync?** All DWNs are built on a CRDT, so they will
  eventually resolve without conflict, however you can expect that latency may
  impact the speed of the resolution. Therefore, it's recommended to pick the
  most highly available node for sending data across.
- **How does the CRDT system work?** There are 2 levels of CRDT. The base layer,
  object level CRDT, and the second layer, which is the data CRDT. These are
  managed with commit strategies. See [here] for more information.
  TODO: Spec does not discuss CRDT.
- **Does a DWN run in the cloud, local, or both?** At the very least, they will
  probably run locally, and there is a high likelihood that they will also run
  in the cloud. The remote data will be available in case it needs to be very
  available. Imagine for example you go on a hiking trip and you are out of
  network. The DWN in the cloud would facilitate interactions that you would not
  be able to do via your phone which is out of service.
- **Do we write into an IPFS vs. IPLD Node?** DWN use IPLD as an encoding
  format, but it's not required to throw out to the IPFS layer.
- **What is IPLD?**IPLD is the data model of the content-addressable web. It
  allows us to treat all hash-linked data structures as subsets of a unified
  information space, unifying all data models that link data with hashes as
  instances of IPLD.
- **What if you want to use a DWN and don't want data on IPFS?** Not all DWNs
  require IPFS.
- **What are the main types of data store?** There are two types of datastores.
  There's a `message store` that is intended to store metadata about the data
  you're trying to store. Then there is a `datastore`, which actually has the
  data you want to store.
- **Does DWN allow or foresee applications that need cross user/company
  synchronisation (e.g., DeFi applications that pose double-spend risks or
  supply chain applications including international participants to be synced)?**
  Eventually, yes, DWNs maybe able to facilitate those interactions.
- **Would a DWN support the notion of a computational enclave that allows to
  securely execute someone else’s code to access the DWN’s data, e.g., a
  federated ML model that then the user can control what it sends back out to
  the sender of the model?** You will be able to define access to a subset of
  resources within a DWN based upon derived key permissions using Protocols.
  This will give users the ability to access encrypted data on a DWN for only a
  subset of a DWN, using a derived key. There is also a vision of DWNs being
  able to work using homomorphic entryption, however this is an area of research now.

### Reference Implementations

- [TBD's JS SDK](https://github.com/TBD54566975/dwn-sdk-js) : Javascript sdk
- [TBD's Web 5
  Implementation](https://github.com/TBD54566975/incubating-web5-labs)

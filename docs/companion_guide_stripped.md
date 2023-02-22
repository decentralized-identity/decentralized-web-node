# Decentralized Web Node Companion Guide (DWN)

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->

**Table of Contents**

- [Decentralized Web Node Companion Guide (DWN)](#decentralized-web-node-companion-guide-dwn)
  - [Overview :chatgpt:](#overview-chatgpt)
    - [What Are Decentralized Web Nodes? :chatgpt:](#what-are-decentralized-web-nodes-chatgpt)
  - [Target Audience :chatgpt:](#target-audience-chatgpt)
  - [Scope :chatgpt:](#scope-chatgpt)
  - [Disclaimer](#disclaimer)
  - [Terminology :chatgpt:](#terminology-chatgpt)
  - [Technology Comparision](#technology-comparision)
  - [Architecture and Components :chatgpt:](#architecture-and-components-chatgpt)
  - [Node Discovery and Peer-to-Peer Networking :chatgpt:](#node-discovery-and-peer-to-peer-networking-chatgpt)
  - [Data Sharing and Interoperability :chatgpt:](#data-sharing-and-interoperability-chatgpt)
  - [Security and Privacy :chatgpt:](#security-and-privacy-chatgpt)
  - [Testing and Debugging :chatgpt:](#testing-and-debugging-chatgpt)
  - [Deployment and Operations :chatgpt:](#deployment-and-operations-chatgpt)
    - [Example Deployment (Simple)](#example-deployment-simple)
    - [Example Deployment (Complex)](#example-deployment-complex)
  - [Miscellaneous](#miscellaneous)
    - [Example Use Cases](#example-use-cases)
    - [Real World Applications](#real-world-applications)
    - [DWN Adoption](#dwn-adoption)
    - [Ecosystem interplay](#ecosystem-interplay)
    - [Limitations and Other Considerations](#limitations-and-other-considerations)
    - [Q&A](#qa)
    - [Reference Implementations](#reference-implementations)

<!-- markdown-toc end -->

## Overview :chatgpt:

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

**STATUS:** PRE-DRAFT

### What Are Decentralized Web Nodes? :chatgpt:

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

Overall, the DWN specification is an important part of the DIF's work to promote
the development of decentralized web technologies and standards. By providing a
clear set of guidelines and best practices for building and deploying
decentralized web nodes, the DWN specification can help to accelerate the
adoption of a more decentralized and open web.

## Target Audience :chatgpt:

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

Overall, the target audience for the DWN companion guide is a technical community
that is committed to building a more decentralized and open web. By leveraging
the DWN specification, developers, architects, and solution providers can help
to accelerate the adoption of decentralized web technologies, and promote
greater privacy, security, and user control over their data.

## Scope :chatgpt:

This non-normative guide is intended to provide an overview of the functional
requirements and design processes for implementing the Decentralized Web Node
(DWN) specification developed by the Decentralized Identity Foundation (DIF).
This guide is intended to be used by developers, architects, and solution
providers who are interested in building decentralized web applications and
services that conform to the DWN specification.

The guide covers the following topics:

- An overview of the DWN specification, including its purpose, scope, and key
  features.
- Functional requirements for implementing the DWN specification,
  including node discovery, peer-to-peer networking, and data sharing protocols.
- Design considerations for building decentralized web nodes that conform to the
  DWN specification, including the use of decentralized storage systems like IPFS,
  and cryptographic protocols for secure data sharing and verification.
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

## Terminology :chatgpt:

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

TODO

## Architecture and Components :chatgpt:

This section provides an overview of the high-level architecture of a DWN,
including the different components that make up a typical DWN, such as the
network layer, data storage layer, identity and access control layer, and the
application layer. The section could also provide guidance on how to design and
implement each of these components to conform to the DWN specification.

## Node Discovery and Peer-to-Peer Networking :chatgpt:

This section provides detailed guidance on how to implement the node discovery
and peer-to-peer networking protocols that are required for a DWN to function
properly. This section could cover topics such as how to bootstrap a new node
onto the network, how to maintain a list of known nodes, how to discover and
connect to new peers, and how to propagate data across the network.

## Data Sharing and Interoperability :chatgpt:

This section provides guidance on how to design and implement data sharing
protocols that conform to the DWN specification, including the use of
decentralized storage systems like IPFS and the InterPlanetary Linked Data
(IPLD) format. This section could also cover strategies for promoting
interoperability between different decentralized web nodes and data sharing
protocols, such as the use of standardized data formats and metadata.

## Security and Privacy :chatgpt:

This section provides guidance on how to design and implement security and
privacy features that conform to the DWN specification, including the use of
cryptographic protocols like Public Key Infrastructure (PKI) and Self-Sovereign
Identity (SSI) for secure data sharing and verification. This section could also
cover best practices for securing DWN infrastructure and protecting user data
against common attacks and threats.

## Testing and Debugging :chatgpt:

This section provides guidance on how to test and debug a DWN implementation,
including strategies for testing individual components and the network as a
whole, as well as tools and techniques for troubleshooting issues that may arise
during development or deployment.

## Deployment and Operations :chatgpt:

This section provides guidance on how to deploy and operate a DWN
implementation in a production environment, including best practices for scaling
and managing a distributed network, as well as tools and techniques for
monitoring and managing network performance and reliability. This section could
also cover strategies for maintaining backward compatibility and promoting
interoperability with other decentralized web nodes and protocols.

### Example Deployment (Simple)

### Example Deployment (Complex)

## Miscellaneous

### Example Use Cases

### Real World Applications

### DWN Adoption

### Ecosystem interplay

### Limitations and Other Considerations

### Q&A

### Reference Implementations

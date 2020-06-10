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

Would it make sense to try and distill a Focal Use Case from Adrian Gropper's 
[Covid Use Case document](https://github.com/agropper/secure-data-store/blob/master/COVID-19_Health_Report_Use_Case.md)?  

I'm happy to take a crack at the distillation into a first draft if I get 
confirmation that it's not wasted effort. 

I think it might be productive to double-check that the functional 
requirements 1.3 & 1.9, as well as the technical requirements of 3.2, make sense 
across a change of SDS provider.

# 2.1 Virtual Safe Deposit Box

## 2.1.1 Summary

Virtual Asset Custody by analogy to safe deposit box in the physical world. 
Intentionally vague about mechanisms of delegation, multisig, authentication, 
and authorization-- should work across multiple version of all those. 

## 2.1.2 Assumptions

Each jurisdiction is different, but Alice is American and Bob works 
for an American bank so we can assume:

* Alice is over 18 and has property rights as a legal resident
* Proof of identity is required to meet KYC requirements
* Bob's bank is an actual bank licensed to offer digital asset custody services
* At no point does the bank know the contents of the storage-- it is an encrypted blob

## 2.1.3 Opening a New Safe Deposit Box

Bank customer Alice has some valuable digital assets (already-encrypted files 
containing blueprints for a missile) that she wants securely put into bank custody. 
She needs to know that the bank cannot access them in clear text. 
Bank manager Bob will be helping her set up her digital "safe deposit box". 
Alice needs to give access to her wife Carroll. Alice authenticates herself 
(with KYC) and signs an agreement for her custodial service, which includes 
assuming costs for key rotations/replacements. Alice also delegates access 
to Carroll, who is also authenticated and KYCed before receiving access as well. 

### 2.1.4 Routine Access

Once a month, Caroll checks out the contents out for an hour, decrypts them, 
sometimes adds or subtracts content before re-encrypting and filing them back 
in storage. Each time, she has to be authenticated. These events are timestamped 
and logged but otherwise privacy rights are preserved. There may be other 
restrictions on access in the contract, by analogy to 
real-world safe deposit boxes [1], or arbitrary frictions or delay having 
to do with relevant banking regulations [2].

### 2.1.5 Lost Key

Due to a severe fire, every electronic copy of Alice's key is lost. 
As per the contract, her access (and Carroll's) can be restored for a fee.

### 2.1.6 Ugly Divorce with Carroll

Carroll's key needs to be revoked without affecting any other aspects or assumptions. 
Carroll opens a separate account and places her own assets in it.

### 2.1.7 Special Agent Dave's Subpoena

Special Agent Dave has been investigating Alice's work at the missile plant, 
and decides her possession of those blueprints is a criminal act of industrial espionage. 
He gets a court order to sieze the assets, "drilling into" the virtual safe deposit box 
and extract the contents. After this point, Alice cannot get access to her files, 
although Dave's court order to get the necessary key material to decrypt them is out of scope.

### 2.1.8 Bob's intervention due to nonpayment, or incompetence

Without her ex's financial support, Caroll cannot stay on to of her banking bills. 
As per her contract, after a grace period, the contents are seized and become 
property of the bank, auctioned off to pay outstanding dues, encrypted or not.

### 2.1.9 References

[1] > We can restrict access to your box for any reason, including but not 
limited to past due rent and fees, information we receive in court documents, 
our inability to obtain information that satisfies our “Know Your Customer” 
requirements, and any unexpected circumstances (natural or manmade). 
The safe deposit vault will be open during Bank business hours except when access is prevented by reasons beyond our control or  we deem it prudent to deny or limit access. 
The bank’s business hours may be changed at any time without notice to you. 

(Source: [Chase Safe Deposit Box Lease Agreement](https://www.chase.com/content/dam/chase-ux/documents/personal/branch-disclosures/safe-deposit-box-lease-agreement.pdf))
Source [Draft report from Sovrin Compliance and Payments Task Force](https://docs.google.com/document/d/1SswHBZ1pwuIUcePeFe8czOoAOaHE78ij4okXuQq5OW0/edit): 
[2]

# 2.2 Evidence of Steel Material Origins for Auto Parts

<b>Evidence of Steel Material Origins for Auto Parts</b> 

The following company names and scenarios are hypothetical. 

<p>In order to benefit from NAFTA (North American Free Trade Agreement) per revised
rules, auto manufacturers will now be required to demonstrate that seventy
percent of their steel and aluminum purchases originated in North America. They
need to make this information available to regulators and customers, without
providing unnecessary visibility to competitors. US-based steel manufacturer
Steel Inc can generate a mill test report as evidence of steel origins across
all processing steps. This mill report (potentially structured as a verifiable 
credential issued by Steel Inc.’s decentralized identifier keys) can be saved in
a secure data store (stored in a discoverable way, one or more locations). Steel
Inc can specify that only keys held by their customer Advanced Automotive, as
well as audit and regulatory bodies in the US Government (like USTR), will be
accepted to decrypt and access the plain text mill certificate data (sharing
with explicit consent). Other parties will be required to request access, which
Steel Inc may choose to provide depending on the audience. Some attributes
included in the mill certificate may be more publicly available, such as the
type of steel product, specification/grade, and location where it was melted and
poured. These data fields are still securely stored with the rest of the mill
certificate, but they do not require authentication to view.</p>

# 2.3 Perishable Food Recall

<p> Super Fresh Market had several customers get sick after consuming a
cabbage and romaine lettuce mix. The company is worried about another E. coli
scare and wants to quickly identify where the product came and what other stores
it may be in. Their staff member Carlos scans a QR code on the salad mix and
authenticates as an employee. After logging in he can see origin and
transport details not available to the general public, such as the fact that the
lettuce came from Sunbright Farms in California, and that it was transported in
refrigerated vehicles the prior week by two different third party
logistics providers. Carlos can reach out to request that these logistics companies
provide more detailed information about their cold storage temperature readings
and transit routes. Given the potential recall situation each logistics company chooses to
grant Carlos access to view this information. Carlos is able to identify a spike in
produce temperature during the final leg of distribution, meaning that product
in three of their stores may be impacted. The salad mix is immediately removed
from the three stores as the investigation continues. In this scenario Carlos,
acting as a Super Fresh Market employee, is already able to authenticate and view some
information in a secure data store. He can also quickly be granted access to
more information based on the urgency of the recall scenario. However on a daily
basis he does not need to see trade route information for logistics companies, which is
typically considered a trade secret. </p>

# 2.4 Electronic Medical Records 

by Adrian Gropper, edited by Juan Caballero

## 2.4.1 Summary

[Note: This is extracted from a longer, more detailed use case including helpful 
flow diagrams and an enrollment section which is stored 
[here](https://github.com/agropper/secure-data-store/blob/master/COVID-19_Health_Report_Use_Case.md):

Alice’s health report is a short narrative impression of as little as one session of care signed by Dr. 
Bob to be presented to her employer and/or filed in her electronic health 
record for access by other care providers.
Alice's records are held in trust by a "personal record service" recommended to her by her local public library. 
This service consists of an SDS and an authorization server she uses to access records in that SDS, as well as to grant read and/or write access to others. 
This server does not need to use SSI, but it MUST be an interoperable one she can change for another at any time. 
(This swappability of SSI for non-SSI authorization servers may well be a crucial investment in SSI migration for health records).
For the sake of familiarity, we could use UMA as the server and OAuth as the interoperability standard for this server, but other forms of prior art might be more relevant in some contexts. [1]

This use case's main virtues for the purposes of the SDS specification is that it 
has complex authorization requirements and data privacy requirements, some of which
are best met by having a separation of concerns between authorization and storage 
which would ensure maximum prevention of vendor lock-in by ensuring authorization 
and storage are separately interchangeable/competitive.

## 2.4.2 Assumptions

* Each jurisdiction is different, but Alice is American and Dr. Bob practices so-called "direct medicine,"
meaning he needs direct access to a medical record under Alice's control rather than 
relying on a hospital-based or insurer-based medical record. 

* A trusted community institution, like a church or community center or, in this case, a public library, 
can operate a privacy-by-default server for people like Alice to manage their own health records. 
See the link above for a more detailed use-case about the enrollment/establishment of this small-scale 
trust framework. See also the MyData Operator paper linked in this use case's references section [2].

* Alice trusts the Library to recommend a compatible agent and/or secure data store. 
Bob trusts the Library to recommend a mobile wallet for signing health records as verified credentials.
* Dr. Bob’s credentials, e.g. a medical license number, are public information that 
should be broadly accessible.
* Public health authorities publish guidelines for a health report that Dr. Bob can 
follow and Alice’s employer accepts as a verifier.

### 2.4.3 Enrollments (Library, Bob, and Alice)

Note: These steps are clarified greatly with an adoption-oriented flowchart 
included in the longer version of this use case [3].

Library: The Library installs Issuer/Verifier software and displays a list of compatible mobile wallets and secure data stores. 
Secure data stores that enable **independent choice** of control agent and vice versa are called out as preferable by the library. 
For more detail and a flow diagram, see the more detailed use-case linked from the summary section above.

Dr. Bob installs a mobile identity wallet and is thus able to sign documents, 
post timestamps to a public blockchain or other timestamping service, 
and satisfy legal retention of documents and signature proofs by sending them to his secure email address. 
The Library’s issuer software enables Dr. Bob to self-assert his medical license and 
use a public notary to countersign the credential. 
The notary’s record can be verified online. Dr. Bob adds his notarized credential to his mobile wallet. 

Alice: Alice uses her mobile phone number to sign up for a secure data store chosen from the Library’s list. 
If she doesn’t have one already, Alice receives, via SMS, a link to her authorization agent as suggested by the secure data store and picks a password.

### 2.4.4 Alice seeks Dr. Bob's care 

Alice contacts Dr. Bob (out of band), gets various tests and diagnoses (out of band) and asks Dr. Bob to 
issue her a health report via the Library Issuer service for self-sovereign storage and presentation. 
Dr. Bob accesses an Issuer service using his credentials, dictates the health report, adds Alice’s SMS 
number and signs the report, leaving a timestamp and a proof. Document and proof are sent to Dr. Bob’s 
secure email for legal retention. Alice gets an SMS or secure email from the Library with a link to the  
report and proof. Alice clicks the link which opens as a form on the Library site. Alice enters her 
authorization server endpoint onto the form. The Library server contacts Alice’s authorization server. 
Alice may have to sign-in. The health report and proof are sent to Alice’s secure data store. 
The Library deletes the documents that Dr. Bob had stored temporarily for Alice. Alice receives an SMS 
confirmation with a QR code that links to the document in the secure data store.

### 2.4.5 Alice presents her health record to an employer

Alice goes to her employer and displays the QR code in the SMS message. 
The employer’s browser takes them to the Library's verifier website. 
A capability or authorization issued by Alice MAY be involved in securing the report 
while it’s being copied from her data store to the verifier. 
The Library uses the capability/token/etc at Alice’s authorization server to get the document 
and proof from the secure data store. The library verifies the document for the employer. 
[Optional:] The library deletes the document from local storage, if applicable. 
If the credential is intended to be presented only once, it may be revoked by the library.

### 2.4.6 Alice migrates SDS without changing authorization server

Alice decides to keep her authorization server but use a different secure data store. 
Alice opens a new secure data store account and specifies her existing authorization server as her agent. 
Alice moves her document from the old store to the new one. If the employer wants to check Alice’s health 
report again after the change, the old QR code points to the same authorization server and a file that has 
moved to the new document store. Where it is impossible to persist old links and references, Alice should 
at least be notified and have the option to manually or systematically issue a new QR code.

### 2.4.7 Alice migrates SDS without changing authorization server

Alice decides to keep her new data store but change the authorization server. Alice opens a new 
authorization server account. Alice goes to the new data store via its current authorization server 
and specifies her new authorization server. The employer wants to check Alice’s health report again. 
The old QR code points to the old authorization server. Alice has to create a new QR code that points 
to the new authorization server. This may need to be a manual operation, but either way is beyond 
the scope of this specification.

### 2.4.8 Follow-up Visit

A year later, Dr. Bob wants to see the old report before dictating a new report. 
Dr. Bob enters Alice’s SMS into a form at the Library. The Library sends Alice a message asking for 
her current authorization server and a request for the old report. 
Alice agrees and replies with links to her current authorization server and to the specific document 
in question. Dr. Bob, using the Library as a verifier, presents his credentials to Alice’s 
authorization server and retrieves the document.

### 2.4.9 References

[1] https://oauth.xyz/
[2] http://mydata.org/operators/
[3] https://github.com/agropper/secure-data-store/raw/master/diagrams/Health_Report_Use_Case.png



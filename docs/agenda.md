# DWN Bi-Weekly Calls Notes

## Summary

Bi-weekly DIF call notes on DWN specifications.

- [Github](https://github.com/decentralized-identity/decentralized-web-node)
- [Wiki](https://identity.foundation/decentralized-web-node/spec/)

**Editors**

- Dan Buchner @csuwildcat
- Tobias Looker (Mattr)

**Contributors**

- Henry Tsai (Microsoft)
- XinAn Xu (Microsoft)
- Moe Jangda (Block)

**Co-Chairs**

- Andor Kesselman @andorsk email: andor@benri.io
- Liran Cohen @lirancohen
- Alan Karp 
- Kirill (mee.foundation)

## DIF Meeting May 31, 2023

* [Recording](https://us02web.zoom.us/rec/share/UYcdp_7UO1ebQ4uFc84AnasAhSmW9Laxs1s2kVRgs48PLywyV12NqoyF800nHEV7.d0hxy8WiCovW8c_j)


| Item                                      | Segment                 | Time   | Owner           | Description                                                                     |
| ----------------------------------------- | ----------------------- | ------ | --------------- | ------------------------------------------------------------------------------- |
| Intro                                     | Intro                   | 5 min  | @liran          | Quick Intro. New Members. DIF IPR agreement.                                    |
| Agenda                                    | Companion Guide Updates | 10 min | @andorsk/Moises | [added dwn and peergos to the comparison guide #229](https://github.com/decentralized-identity/decentralized-web-node/pull/229) <br>[Local, Remote, and Relay Nodes. #225](https://github.com/decentralized-identity/decentralized-web-node/pull/225) |
| [Ecosystem Updates]()                           | Updates                 | 10 min | @andorsk     | protocols.preview.benri.io                                                                                  | 
| Agenda                                    | Spec PR Review | 10 min | @csuwildcat | [update the Service Endpoint section of the spec #228](https://github.com/decentralized-identity/decentralized-web-node/pull/228) <br> [added JSON schemas for DWN specification #209](https://github.com/decentralized-identity/decentralized-web-node/pull/209) |
| Spec Alignment  | Spec Alignment          | 10 min | @andorsk       | Alignment                                                                       |
| Issue Alignment | Issue Alignment         | 10 min | @liran         | Alignment                                                                       |
| Calls To Action | Closing                 | 5 min  | @andorsk       |                                                                                 |

### Issues Discussed:

- [Authorization layer should limit the amount of data permitted to be stored by a application #96](https://github.com/decentralized-identity/decentralized-web-node/issues/96)
- [Add use cases link #83](https://github.com/decentralized-identity/decentralized-web-node/issues/83)
- [Test Suite Design #213](https://github.com/decentralized-identity/decentralized-web-node/issues/213)
- [Revocation Subtleties #138](https://github.com/decentralized-identity/decentralized-web-node/issues/138)
- [Requiring fine-grained capabilities #142](https://github.com/decentralized-identity/decentralized-web-node/issues/142)
- [as a developer, I can follow docs to run the reference implmentation, so I can test it out and then contribute improvements or passing test-suites #144](https://github.com/decentralized-identity/decentralized-web-node/issues/144)
- [Support both folder based and schema based object storage #190](https://github.com/decentralized-identity/decentralized-web-node/issues/190)


## DIF Meeting July 12, 2023

* [Recording]()

- Ian Preston
- Dan Buchner
- Andor Kesselman
- Alan Karp
- Liran Cohen 


| Item                                      | Segment                 | Time   | Owner           | Description                                                                     |
| ----------------------------------------- | ----------------------- | ------ | --------------- | ------------------------------------------------------------------------------- |
| Intro                                     | Intro                   | 5 min  | @liran          | Quick Intro. New Members. DIF IPR agreement.                                    |
| Agenda                                    | Companion Guide Updates | 10 min | @andorsk ||
| [Ecosystem Updates]()                           | Updates                 | 10 min | @andorsk     |                                                | 
| [Peergos Discussion]()                           | Updates                 | 10 min | @ian     |                                                | 
| Spec Alignment  | Spec Alignment          | 10 min | @andorsk       | Alignment                                                                       |
| Issue Alignment | Issue Alignment         | 10 min | @liran         | Alignment                                                                       |
| Calls To Action | Closing                 | 5 min  | @andorsk       |                                                                                 |
### Issues Diccussed: 

### Notes:

- Peergos Discussion: 
    - 2013: 
        - Before IPFS
        - Identity/Fine Grained Access Control/Encryption
        - Global Access Control File System
        - Grant: Read|Write access to individual files or folders
        - Conventional login (username + password). Key derivation is from there. 
        - Hide metadata
        - Server can't tell if blob is directory of file 
    - Technical Difficult:
        - Don't want to depend on DNS
        - 2018: Decided HTTP over P2P Streams
    - Peergos Implementation: 
        - Peergos
    - Question: Alan 
        - Correlation Inference? 
    - Don't consider server based timing attacks are not in scope. 
    - Liran: Identity Portion: 
        - Node identity
        - User identity <- least happy with PKI global append only log signed statements of username. Add people by username over UX. Considering removing PKI entirely. 
    - Question: Capability based. 
    - Everthing split into writing subspaces.
        - KP Control
        - W/e Changes you write are atomic.
        - Sandbox application. 
        - Not sure if it makes sense in Peergos
    - Dan: 
        - How can apps expose public information in public way? Champs. Maps to encrypted blobs.Keep capability of Champ in sync with real data. Look up and do traversal. Web interface. Can publish a website. Can view in any gateway. 
    - Henry: 
        - Were there challenges around encryption, e.g.
            1. Sharing keys to friends/external participants
            2. Key rolling
        - Cryptree 
            - Voila <- 2008
        - Care alot about being post quantum. 
        - Grant a read capability is basically sharing a key.
        - Expensive: Revoke write access, rotate all the keys. 
        - Sharing capabilities: each person has an inbox. Public encryption key. People write to that to share capabilities.
    - How many? 
        - 10 Self Hosters

### Issues Discussed:

- [Requiring fine-grained capabilities #142
](https://github.com/decentralized-identity/decentralized-web-node/issues/142) To revisit after Spec alignment. Milestone 1. 
- [Revocation Subtleties #138
](https://github.com/decentralized-identity/decentralized-web-node/issues/138) - To revisit after spec alignment. Milestone 1. 


## DIF Meeting June 28, 2023

* [Recording]()

- Alan Karp
- Liran Cohen 
- Andor Kesselman
- Henry Tsai 
- Drummond Reed

| Item                                      | Segment                 | Time   | Owner           | Description                                                                     |
| ----------------------------------------- | ----------------------- | ------ | --------------- | ------------------------------------------------------------------------------- |
| Intro                                     | Intro                   | 5 min  | @liran          | Quick Intro. New Members. DIF IPR agreement.                                    |
| Agenda                                    | Companion Guide Updates | 10 min | @andorsk | [Update peergos description in companion_guide #231](https://github.com/decentralized-identity/decentralized-web-node/pull/231) |
| Peergos Discussion with Ian?                      | Companion Guide Updates | 5 min |  |  |
| [Ecosystem Updates]()                           | Updates                 | 10 min | @andorsk     |                                                | 
| Agenda                                    | Spec PR Review | 10 min |  | |
| Spec Alignment  | Spec Alignment          | 10 min | @andorsk       | Alignment                                                                       |
| Issue Alignment | Issue Alignment         | 10 min | @liran         | Alignment                                                                       |
| Calls To Action | Closing                 | 5 min  | @andorsk       |                                                                                 |

### Issues Discussed:

- [Requiring fine-grained capabilities #142
](https://github.com/decentralized-identity/decentralized-web-node/issues/142) To revisit after Spec alignment. Milestone 1. 
- [Revocation Subtleties #138
](https://github.com/decentralized-identity/decentralized-web-node/issues/138) - To revisit after spec alignment. Milestone 1. 

## DIF Meeting June 14, 2023

* [Recording](https://us02web.zoom.us/rec/share/Vjsy2TkDWy8TxBeBsXCp5ebw6tH2cFwm6OEVoKpK8tzXng6oxI0oC9MPHjm830xS.Z-fnRwAFjPBx2BP7)


| Item                                      | Segment                 | Time   | Owner           | Description                                                                     |
| ----------------------------------------- | ----------------------- | ------ | --------------- | ------------------------------------------------------------------------------- |
| Intro                                     | Intro                   | 5 min  | @liran          | Quick Intro. New Members. DIF IPR agreement.                                    |
| Agenda                                    | Companion Guide Updates | 10 min | @andorsk | [Update peergos description in companion_guide #231](https://github.com/decentralized-identity/decentralized-web-node/pull/231) |
| Peergos Discussion                       | Companion Guide Updates | 10 min |  |  |
| [Ecosystem Updates]()                           | Updates                 | 10 min | @andorsk     |                                                | 
| Agenda                                    | Spec PR Review | 10 min |  | |
| Spec Alignment  | Spec Alignment          | 10 min | @andorsk       | Alignment                                                                       |
| Issue Alignment | Issue Alignment         | 10 min | @liran         | Alignment                                                                       |
| Calls To Action | Closing                 | 5 min  | @andorsk       |                                                                                 |

### Issues Discussed:

- https://github.com/decentralized-identity/decentralized-web-node/pull/228 : Dan to Look at
- https://github.com/decentralized-identity/decentralized-web-node/issues/234 : Andor
- https://github.com/decentralized-identity/decentralized-web-node/pull/231 : Going to see if we can get Ian to comment on this. @andorsk to draft a response. 
- https://github.com/decentralized-identity/decentralized-web-node/pull/233
- Skipping Service Endpoint Section For Next Call 
Andor: add something about scalability in abstract
TODO: Check status on spec
- Section 8 and 9 will be re-written in the near future.
- Alignment Issues: https://github.com/decentralized-identity/decentralized-web-node/issues?q=is%3Aissue+is%3Aopen+label%3A%22attr%3A+alignment-effort%22

## DIF Meeting May 31, 2023

* [Recording](https://us02web.zoom.us/rec/share/UYcdp_7UO1ebQ4uFc84AnasAhSmW9Laxs1s2kVRgs48PLywyV12NqoyF800nHEV7.d0hxy8WiCovW8c_j)


| Item                                      | Segment                 | Time   | Owner           | Description                                                                     |
| ----------------------------------------- | ----------------------- | ------ | --------------- | ------------------------------------------------------------------------------- |
| Intro                                     | Intro                   | 5 min  | @liran          | Quick Intro. New Members. DIF IPR agreement.                                    |
| Agenda                                    | Companion Guide Updates | 10 min | @andorsk/Moises | [added dwn and peergos to the comparison guide #229](https://github.com/decentralized-identity/decentralized-web-node/pull/229) <br>[Local, Remote, and Relay Nodes. #225](https://github.com/decentralized-identity/decentralized-web-node/pull/225) |
| [Ecosystem Updates]()                           | Updates                 | 10 min | @andorsk     | protocols.preview.benri.io                                                                                  | 
| Agenda                                    | Spec PR Review | 10 min | @csuwildcat | [update the Service Endpoint section of the spec #228](https://github.com/decentralized-identity/decentralized-web-node/pull/228) <br> [added JSON schemas for DWN specification #209](https://github.com/decentralized-identity/decentralized-web-node/pull/209) |
| Spec Alignment  | Spec Alignment          | 10 min | @andorsk       | Alignment                                                                       |
| Issue Alignment | Issue Alignment         | 10 min | @liran         | Alignment                                                                       |
| Calls To Action | Closing                 | 5 min  | @andorsk       |                                                                                 |

### Issues Discussed:

- [Authorization layer should limit the amount of data permitted to be stored by a application #96](https://github.com/decentralized-identity/decentralized-web-node/issues/96)
- [Add use cases link #83](https://github.com/decentralized-identity/decentralized-web-node/issues/83)
- [Test Suite Design #213](https://github.com/decentralized-identity/decentralized-web-node/issues/213)
- [Revocation Subtleties #138](https://github.com/decentralized-identity/decentralized-web-node/issues/138)
- [Requiring fine-grained capabilities #142](https://github.com/decentralized-identity/decentralized-web-node/issues/142)
- [as a developer, I can follow docs to run the reference implmentation, so I can test it out and then contribute improvements or passing test-suites #144](https://github.com/decentralized-identity/decentralized-web-node/issues/144)
- [Support both folder based and schema based object storage #190](https://github.com/decentralized-identity/decentralized-web-node/issues/190)

## DIF Meeting May 17, 2023

* [Recording](https://us02web.zoom.us/rec/share/BURjRNnQ2po6lULH-MCit-GrK-i7DIKa3z9Tdqn0TF9j3Usjj52ho2P6Ft5rxaI9.Emf4aY__Zwrbm79H)

### Attendees

- Andor Kesselman @andorsk
- Liran Cohen @lirancohen 
- Alan Karp 
- Ajay Jadhav
- Kirill mee.foundation.developer
- Drummond Reed 

### Agenda

| Item                                      | Segment                 | Time   | Owner           | Description                                                                     |
| ----------------------------------------- | ----------------------- | ------ | --------------- | ------------------------------------------------------------------------------- |
| Intro                                     | Intro                   | 5 min  | @liran          | Quick Intro. New Members. DIF IPR agreement.                                    |
| Agenda                                    | Companion Guide Updates | 10 min | @andorsk/Moises | [added dwn and peergos to the comparison guide #229](https://github.com/decentralized-identity/decentralized-web-node/pull/229) <br>[Local, Remote, and Relay Nodes. #225](https://github.com/decentralized-identity/decentralized-web-node/pull/225) |
| [TBD Updates]()                           | Updates                 | 10 min | @csuwildcat     |                                                                                  | 
| Agenda                                    | Spec PR Review | 10 min | @csuwildcat | [update the Service Endpoint section of the spec #228](https://github.com/decentralized-identity/decentralized-web-node/pull/228) <br> [added JSON schemas for DWN specification #209](https://github.com/decentralized-identity/decentralized-web-node/pull/209) |
| Spec Alignment  | Spec Alignment          | 10 min | @andorsk       | Alignment                                                                       |
| Issue Alignment | Issue Alignment         | 10 min | @liran         | Alignment                                                                       |
| Calls To Action | Closing                 | 5 min  | @andorsk       |                                                                                 |


## DIF Meeting May 3, 2023

* [Recording](https://us02web.zoom.us/rec/share/hGruCrcoOs9FaNuryuQlCLTFIOONSNC98-BTCqg1uypG5kD9NY0lT4CQFRlxTO34.gBW6RZlFYRb_Nbf0)

### Attendees

- Andor Kesselman @andorsk
- Liran Cohen @liran
- Dan Buchner @csuwildcat
- @Moises Jaramillo
- Paul Trevithick
- Drummond Reed

### Agenda

| Item                                      | Segment                 | Time   | Owner           | Description                                                                     |
| ----------------------------------------- | ----------------------- | ------ | --------------- | ------------------------------------------------------------------------------- |
| Intro                                     | Intro                   | 5 min  | @liran          | Quick Intro. New Members. DIF IPR agreement.                                    |
| Agenda                                    | Companion Guide Updates | 10 min | @andorsk/Moises | Merge https://github.com/decentralized-identity/decentralized-web-node/pull/226 |
| [TBD Updates]()                           | Updates                 | 10 min | @csuwildcat     |  encryption support <br> sync this week. in testing. <br> biggest outstanding thing is permissions                                                                                |
| IIW Updates and Ecosystem Chat   | Discussion                       | 20 min | @andorsk @liran @csuwildcat     |  
| Permission Discussion  | Discussion                       | 10 min | @csuwildcat     |                                                                                 ||
| Spec Alignment  | Spec Alignment          | 10 min | @andorsk       | Alignment                                                                       |
| Issue Alignment | Issue Alignment         | 10 min | @liran         | Alignment                                                                       |
| Calls To Action | Closing                 | 5 min  | @andorsk       |                                                                                 |

### Notes

- Merged Companion Guide Updates - Comparison Matrix from Moises
- Merged agenda
- Permission Discussion: 
    - DM Opens Start
    - What happens if you have your DM's open, you accrue some DM's and you want to turn that section off. 
    - Discussion on sync and latency
    - Proposal: End of the week
- Aligned: asap to align spec. 
- Flag section 
- Party at Bitcoin Conf: 
    - 18th 6PM Miami time. 

## DIF Meeting March 22, 2023

Again this week we are overbooked with content. That's because we have a lot of cleanup to do!

### Attendees

- Andor Kesselman @andorsk
- Liran Cohen
- Dan Buchner @csuwildcat

## DIF Meeting March 22, 2023
* [Recording](https://us02web.zoom.us/rec/share/SW5VZtYayd21HDKOQcGcPJJRsSvvwzHCcrxfJXm55iK94QoZ4who5cnCdW47pYC9.vCyjDuKgDCLCXoxw)

Again this week we are overbooked with content. That's because we have a lot of cleanup to do!

### Attendees

- Andor Kesselman @andorsk
- Liran Cohen  
- Dan Buchner @csuwildcat

### Agenda

| Item  | Segment | Time  | Owner    | Description                                  |
| ----- | ------- | ----- | -------- | -------------------------------------------- |
| Intro | Intro   | 5 min | @andorsk | Quick Intro. New Members. DIF IPR agreement. |
| Spec Updates | Updates | 5 min | @liran |[Interface & Method Props](https://github.com/decentralized-identity/decentralized-web-node/commit/e964c28a3712b3873e041e614c2c5fb9c5878855) | 
| Companion Guide Updates | Updates | 5 min | @andorsk | - Tall Ted Comments on [#216](https://github.com/decentralized-identity/decentralized-web-node/pull/216) |
| [TBD Updates]()                                                                                        | Updates     | 10 min  | @csuwildcat      |  - Close on the web5 sdk front. Will make working with the DWN much easier. <br> - Dan working on encryption prototype ETA couple weeks. <br> - Moe : Sync next week start. <br> - https://github.com/TBD54566975/web5-js <br> NOTE: alpha <br> https://codesandbox.io/p/sandbox/trusting-mountain-u91fjr?file=%2Fsrc%2Findex.mjs&selection=%5B%7B%22endColumn%22%3A40%2C%22endLineNumber%22%3A121%2C%22startColumn%22%3A40%2C%22startLineNumber%22%3A121%7D%5D                                                             |
| PR Review | Maintenence | 5 min | @andorsk | - [#217](https://github.com/decentralized-identity/decentralized-web-node/pull/217)<br>- [#216](https://github.com/decentralized-identity/decentralized-web-node/pull/216) <br>- [#215](https://github.com/decentralized-identity/decentralized-web-node/pull/215) |
| Milestones and Dates | Discussions | 10 min | @andorsk | [#214](https://github.com/decentralized-identity/decentralized-web-node/issues/214)|
| TBD Alignment Updates | Discussions | 10 min | @csuwildcat | |
| Add Technology Comparison Matrix to Companion Guide #212 | Discussions | 10 min | @moisesja | [#212](https://github.com/decentralized-identity/decentralized-web-node/issues/212)
| Companion Guide Security Section | Discussions | 10 min | @andorsk | [#218](https://github.com/decentralized-identity/decentralized-web-node/issues/218)
| Label Review and Tagging | Maintenence | 20 min | @liran |Go through each open issue and figure out strategy to close them|
| Calls To Action                                                                                        | Closing     | 5 min   | @andorsk         |                                                                                                                                                                                                                        |

### Notes

- PR Review: Suggestion by @lirancohen: Bring up in meetings and give time until next meeting to approve/merge.
- [Potential Encryption Scheme from Block](https://codesandbox.io/p/sandbox/trusting-mountain-u91fjr?file=%2Fsrc%2Findex.mjs&selection=%5B%7B%22endColumn%22%3A15%2C%22endLineNumber%22%3A121%2C%22startColumn%22%3A15%2C%22startLineNumber%22%3A121%7D%5D)
- Mid-April Jukebox App - Play music from DWN Nodes.Trying to bend the model of how it differs from NOSTR. 
- Dan: April 5 : Austin Texas TBD building docs. Open to meeting and getting some contributions.
- [Milestone 1: August](https://github.com/decentralized-identity/decentralized-web-node/milestone/1) 

Suggestion For Next Meeting:

- Get consensus for get together next meeting @ Austin. 


#### Action Items
- [ ] Find a cryptographer to look at the encryption scheme for DWN. @lirancohen will ask around. @andorsk as well. 
- [ ] Call next week : Spec walkthrough. Henry to run through the spec and update it to the current state of the sdk. 

## DIF Meeting March 8, 2023

* [Recording](https://us02web.zoom.us/rec/share/SzX33iVda2e-fHTA59kBo1HcxOdC_jKEpPK2AbudkJd6rSs1VyB_jcmukmgGPCI3.UXhKc_QMpnSSUqDV)

### Attendees

- Andor Kesselman @andorsk
- Dan Buchner @csuwildcat
- Kaliya 
- Clare Nelson (DIF)
- Liran Cohen
- Moises Jaramillo
- Paul Trevithick 
- Reuben
- Steve
- Sergey Kucherenko
- Kirill Khalitov

### Agenda

Note: We are over-booked today in terms of content! Currently at 105 minutes, we
will have to figure out ways to shave or push off some of these conversations.

| Item                                                                                                   | Segment     | Time    | Owner            | Description                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------ | ----------- | ------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Co-Chair Updates. Nominate Liran as Co-Chair.                                                           | Intro       | 5 min   | @andorsk @liran  |                                                                                                                                                                          Kaliya to follow up                                              |
| Spec Updates                                                                                           | Updates     | 5 min   |      @andorsk        | No updates to the specs                                                                                                                                                                                                |
| Companion Guide Updates                                                                                | Updates     | 10 min  | @andorsk @moises | - [Questions on AMA](https://github.com/decentralized-identity/decentralized-web-node/pull/216) <br> - [Comparision Matrix (Moises)](https://github.com/decentralized-identity/decentralized-web-node/issues/212) <br> : List of comparables, SOLID PODS, KERI, |
| [TBD Updates]()                                                                                        | Updates     | 10 min  | @csuwildcat      | - MessageStore Refactoring<br>- Add participants actor to Protocol rules #242<br>                                                                                                                                      |
| [Issue 210](https://github.com/decentralized-identity/decentralized-web-node/issues/210)               | Maintenance | 5 min   | @csuwildcat      |                                                                                                                                                                                                                        |
| [Issue 208](https://github.com/decentralized-identity/decentralized-web-node/issues/208)               | Maintenance | 5 min   | @csuwildcat      |                                                                                                                                                                                                                        |
| [Issue 207](https://github.com/decentralized-identity/decentralized-web-node/issues/207)               | Maintenance | 5 min   | @andorsk         |                                                                                                                                                                                                                        |
| Tagging and Milestones                                                                                 | Discussion  | 10 min  | @andorsk         |                                                                                                                                                                                                                        |
| Specification Updates Discussion                                                                       | Discussion  | 5 min   | @andorsk         | Alignment on DWN-SDK vs. spec. TODO: Code spec review. @andor to set an issue.                                                                                                                                                                                          |
| [Milestones and Dates](https://github.com/decentralized-identity/decentralized-web-node/issues/214)    | Discussion  | 20 min. | @andorsk         | Better clarity on milestones and dates                                                                                                                                                                                 |
| [Schema PR](https://github.com/decentralized-identity/decentralized-web-node/pull/209)                 | Discussion  | 10 min. | @andorsk         | Schemas for objects in DWN                                                                                                                                                                                             |
| [Test Suite Conversation](https://github.com/decentralized-identity/decentralized-web-node/issues/213) | Discussion  | 10 min. | @andorsk         | Questions around test suite                                                                                                                                                                                            |
| Encryption Brainstorming                                                                               | Discussion  | 10 min  | @csuwildcat      |                                                                                                                                                                                                                        |
| Calls To Action                                                                                        | Closing     | 5 min   | @andorsk         |                                                                                                                                                                                                                        |

### Notes

* Expanded Query Support: 
* Making the use of DWNs easier. 
* https://github.com/TBD54566975/web5-js
* Rollup of everything. DID Support. Not instantiation. 
* Easier to interface 
* Q: SDK up to date with the spec? A: Yes, but sync spec text to add
@Clare: to look onto documentation on how to milestone this. 
* Encryption Discussion:
    * Dan: Cryptree
* Drummond: ToIP TSP interested in how all these components interlock. Question about EDV encryption. 
* Q: There is a diagram at the very top of the standard draft and it mentions that each DWN is also a relay server. Do you consider any modifications where the relay server is not self-hosted but is an external service? @andorsk  to add onto the companion guide with an answer. 
Paul: To help expand on the use case section.
- Andor Q: Protocol repository at DIF? Liran: not sure. Drummond: nomenclature issue. Protocol as a term is hard term in the larger ecosystem. Must distinguish between Protocol. Paul: Agrees. Discusses **meta-protocol**. Dan: agrees with putting in the repo. Clare: **IPR to consider**
```mermaid 
graph TD
MetaProtocol[Meta Protocol]
BaseProtocol[Base Protocol]
MetaProtocol --> BaseProtocol
```


## DIF Meeting February 22, 2023
* [Recording](https://us02web.zoom.us/rec/share/IL6w4JnvQUJC_qgXYmfPphrTHs2zWmVeGAo2RjuQ4-rTH7yRLpIeAwNS3SDBklYX.1UpamO7QSnkdx-8f)
### Attendees

- Andor Kesselman @andorsk
- Dan Buchner @csuwildcat
- kaliya
- Liran Cohen
- Ajay Jadhav
- Drummond Reed @talltree
- Sergey Kucherenko
- Clare Nelson
- Paul Trevithick

### Agenda

| Item                                 | Time   | Owner                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Co-Chair Intro and Co-Chair Call** | 5 min  | @andorsk             | Intro, meeting notes, and discuss [efforts to find a co-chair](https://hackmd.io/@andorsk/H16_4_w6j/edit)                                                                                                                                                                                                                                                                                                                                                      |
| **Office Hours Announcement**        | 5 min  | @csuwildcat          | Mention DWN office hours happening on the TBD discord channel                                                                                                                                                                                                                                                                                                                                                                                                  |
| **New Issues/PRs**                   | 15 min | @andorsk @csuwildcat | Discuss the following issues: <br>[#208](https://github.com/decentralized-identity/decentralized-web-node/issues)<br>[#207](https://github.com/decentralized-identity/decentralized-web-node/issues/207)                                                                                                                                                                                                                                                       |
| **TBD Updates**                      | 15 min | @csuwildcat          | Any updates from Dan/TBD related to new work/open repos. <br>**SDK Updates**<br> - DWN Aggregator <br> Bump to [0.0.22](https://github.com/TBD54566975/dwn-sdk-js/commit/576fda4858423b6ea80209997865d7470c811525) <br> - [#231 introduced DataStore as a peer interface to MessageStore #233](<[asdf](https://github.com/TBD54566975/dwn-sdk-js/commit/576fda4858423b6ea80209997865d7470c811525)>)<br>**Tool Updates**<br> - DWN Aggregator <br> - Music App? |
| **Open PR: Discussion #206**         | 15 min | @andorsk             | [#206](https://github.com/decentralized-identity/decentralized-web-node/pull/206). Discuss overview and Q&A section.                                                                                                                                                                                                                                                                                                                                           |
| **Calls to Action**                  | 5 min  | @andorsk             | Note calls to action                                                                                                                                                                                                                                                                                                                                                                                                                                           |

### Notes

Question from Paul: why store in electron? Dan: can store keys 1:1 way

### Calls to Action

- [ ] Co-chair @kaliya posted a list
- [ ] Note your questions in Github! Highly upvoted questions will make their way over to companion guide.
- [ ] Alex offerred to spin up a possible video to help people get started.
- [ ] Suggestion: Guest blog on DIF. Introduction and call to action.
- [ ] @andorsk to merge PR 206 in.

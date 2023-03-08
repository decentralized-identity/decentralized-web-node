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
- ??

## DIF Meeting March 8, 2023

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
| Spec Updates                                                                                           | Updates     | 0 min   |                  | No updates to the specs                                                                                                                                                                                                |
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

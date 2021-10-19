


let Messages = (await import('../dist/identity-hub.js')).Messages;
let message = await Messages.compose({
  descriptor: {
    method: 'CollectionsQuery',
    schema: 'https://schema.org/SocialMediaPosting' 
  }
});
let response = await Messages.send('did:ion:123', [message], {
  endpoints: ['/']
})


let Messages = (await import('../dist/identity-hub.js')).Messages;
let message = await Messages.compose({
  descriptor: {
    method: 'CollectionsWrite',
    schema: 'https://schema.org/SocialMediaPosting' ,
    format: 'json'
  },
  data: {
    "@context":"https://schema.org",
    "@type":"SocialMediaPosting",
    "datePublished":"2021-10-15",
    "articleBody": "It worked!"
  }
});
let response = await Messages.send('did:ion:123', [message], {
  endpoints: ['/']
})







IdentityHub.sendMessage(
  'did:ion:EiBwdoBmDvOCx4ibnku1P08zKNocHBCCQ-v5BiuZMo7QYw',
  await IdentityHub.generateRequest(
    await IdentityHub.compose({
      descriptor: {
        method: 'CollectionsQuery',
        schema: 'https://schema.org/SocialMediaPosting' 
      }
    })
  )
)

await fetch('/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(await Hub.compose({
    descriptor: {
      method: 'CollectionsQuery',
      schema: 'https://schema.org/SocialMediaPosting' 
    }
  }).then(msg => Hub.generateRequest(msg)))
}).then(res => res.json())


router.post('/:did/all/:table', async (ctx) => {
  let hub = await getHub(ctx.params.did);
  let result = await hub.storage.txn(db => db(ctx.params.table).query('select').exec()).catch(e => console.log(e));
  console.log(123, result);
  ctx.body = result;
});


// Upload post

await fetch('/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
      target: 'did:ion:123',
      descriptor: {
        id: "c5784162-84af-4aab-aff5-f1f8438dfc3d",
        method: 'CollectionsWrite',
        schema: 'https://schema.org/SocialMediaPosting'  
      },
      data: {
        "@context":"https://schema.org",
        "@type":"SocialMediaPosting",
        "datePublished":"2021-08-17",
        "articleBody": "My second decentralized tweet"
      }
  })
}).then(res => res.json())

// Fetch post

await fetch('/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
      id: "c5784162-84af-4aab-aff5-f1f8438dfc3d",
      target: 'did:ion:123',
      messages: [
          {
            content: {
                descriptor: {
                    method: 'CollectionsQuery',
                    schema: 'https://schema.org/SocialMediaPosting' 
                }
            }
          }
      ]
  })
}).then(res => res.json())

// await fetch('/upload', {
//   target: 'did:ion:123',
//   content: {
//     descriptor: {
//       id: "c5784162-84af-4aab-aff5-f1f8438dfc3d",
//       method: 'CollectionsWrite',
//       schema: 'https://schema.org/SocialMediaPosting'  
//     },
//     descriptor: { // ctx.request.body,
//       "type": "ProfileWrite",
//       "schema": "https://identity.foundation/schemas/hub/profile",
//     },
//     data: {
//       "@context": "https://identity.foundation/schemas/hub/profile",
//       "type": "Profile",
//       "descriptors": [
//         {
//           "@context": "http://schema.org",
//           "@type": "Person",
//           "name": "Jeffrey Lebowski",
//           "givenName": "Jeffery",
//           "middleName": "The Big",
//           "familyName": "Lebowski",
//           "description": "That's just, like, your opinion, man.",
//           "website": "https://ilovebowling.com",
//           "email": "jeff@ilovebowling.com",
//           "address": {
//             "@type": "PostalAddress",
//             "streetAddress": "5227 Santa Monica Boulevard",
//             "addressLocality": "Los Angeles",
//             "addressRegion": "CA"
//           }
//         }
//       ]
//     }
//   }
// });



await fetch('/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(await Hub.compose({
      descriptor: {
        method: 'CollectionsWrite',
        schema: 'https://schema.org/SocialMediaPosting' ,
        format: 'json'
      },
      data: {
        "@context":"https://schema.org",
        "@type":"SocialMediaPosting",
        "datePublished":"2021-10-15",
        "articleBody": "It worked!"
      }
  }).then(msg => Hub.generateRequest({ messages: [msg] })))
}).then(res => res.json())
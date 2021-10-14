

await fetch('/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: '12345',
    target: 'did:ion:123',
    messages: [
      {
        content: {
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
        }
      }
    ]
  })
}).then(res => res.json())


await fetch('/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    target: 'did:ion:123',
    content: {
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
    }
  })
}).then(res => res.json())
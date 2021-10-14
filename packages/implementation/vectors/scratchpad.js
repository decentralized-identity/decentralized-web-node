

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


await fetch('/upload', {
  target: 'did:ion:123',
  content: {
    descriptor: {
      id: "c5784162-84af-4aab-aff5-f1f8438dfc3d",
      method: 'CollectionsWrite',
      schema: 'https://schema.org/SocialMediaPosting'  
    },
    descriptor: { // ctx.request.body,
      "type": "ProfileWrite",
      "schema": "https://identity.foundation/schemas/hub/profile",
    },
    data: {
      "@context": "https://identity.foundation/schemas/hub/profile",
      "type": "Profile",
      "descriptors": [
        {
          "@context": "http://schema.org",
          "@type": "Person",
          "name": "Jeffrey Lebowski",
          "givenName": "Jeffery",
          "middleName": "The Big",
          "familyName": "Lebowski",
          "description": "That's just, like, your opinion, man.",
          "website": "https://ilovebowling.com",
          "email": "jeff@ilovebowling.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "5227 Santa Monica Boulevard",
            "addressLocality": "Los Angeles",
            "addressRegion": "CA"
          }
        }
      ]
    }
  }
});
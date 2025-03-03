const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET'
  };

  const month = event.queryStringParameters.month;
  
  try {
    const tokenResponse = await fetch('https://holycross-okapi.folio.indexdata.com/authn/login-with-expiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Okapi-Tenant': 'holycross'
      },
      body: JSON.stringify({
        username: process.env.FOLIO_USERNAME,
        password: process.env.FOLIO_PASSWORD
      })
    });

    const cookies = tokenResponse.headers.get('set-cookie');
    const tokenMatch = cookies.match(/folioAccessToken=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    const booksResponse = await fetch(
      `https://holycross-okapi.folio.indexdata.com/inventory/items?limit=100&query=administrativeNotes="${month}"`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Okapi-Tenant': 'holycross',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await booksResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch books' })
    };
  }
};

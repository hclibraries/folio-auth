exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET'
  };

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get token' })
    };
  }
};

// Simplified serverless function - token generation only
exports.handler = async (event) => {
  try {
    // Get the authentication token
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
    
    if (!token) {
      throw new Error('Failed to obtain authentication token');
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: JSON.stringify({ token: token })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

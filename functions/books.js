exports.handler = async (event) => {
  try {
    // Extract query parameters from the request
    const queryParams = event.queryStringParameters || {};
    const requestType = queryParams.type || 'default';
    const month = queryParams.month || 'all';
    const offset = queryParams.offset || 0;
    const limit = queryParams.limit || 100;
    const itemId = queryParams.itemId;
    const holdingsId = queryParams.holdingsId;
    const instanceId = queryParams.instanceId;
    
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
    
    // Create base headers for all FOLIO requests
    const folioHeaders = {
      'Content-Type': 'application/json',
      'X-Okapi-Tenant': 'holycross',
      'Authorization': `Bearer ${token}`
    };
    
    // Handle different types of requests
    const folioBaseUrl = 'https://holycross-okapi.folio.indexdata.com';
    let responseData;
    
    switch (requestType) {
      case 'items':
        // Fetch items for a specific month
        const itemsUrl = `${folioBaseUrl}/inventory/items?limit=${limit}&offset=${offset}&query=administrativeNotes="${month}"`;
        const itemsResponse = await fetch(itemsUrl, { headers: folioHeaders });
        
        if (!itemsResponse.ok) {
          throw new Error(`Failed to fetch items: ${itemsResponse.status}`);
        }
        
        responseData = await itemsResponse.json();
        break;
        
      case 'holdings':
        // Fetch a specific holdings record
        if (!holdingsId) {
          throw new Error('Holdings ID is required');
        }
        
        const holdingsUrl = `${folioBaseUrl}/holdings-storage/holdings/${holdingsId}`;
        const holdingsResponse = await fetch(holdingsUrl, { headers: folioHeaders });
        
        if (!holdingsResponse.ok) {
          throw new Error(`Failed to fetch holdings: ${holdingsResponse.status}`);
        }
        
        responseData = await holdingsResponse.json();
        break;
        
      case 'instance':
        // Fetch a specific instance
        if (!instanceId) {
          throw new Error('Instance ID is required');
        }
        
        const instanceUrl = `${folioBaseUrl}/instance-storage/instances/${instanceId}`;
        const instanceResponse = await fetch(instanceUrl, { headers: folioHeaders });
        
        if (!instanceResponse.ok) {
          throw new Error(`Failed to fetch instance: ${instanceResponse.status}`);
        }
        
        responseData = await instanceResponse.json();
        break;
        
      default:
        // Just return success (for backward compatibility)
        responseData = { success: true };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: JSON.stringify(responseData)
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

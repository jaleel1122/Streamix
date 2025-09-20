const { Client, Databases, Query } = require('node-appwrite')

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: ''
      }
    }

    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Method not allowed' })
      }
    }

    const projectId = process.env.APPWRITE_PROJECT_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = process.env.APPWRITE_COLLECTION_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!projectId || !databaseId || !collectionId || !apiKey) {
      const missing = {
        APPWRITE_PROJECT_ID: !!projectId,
        APPWRITE_DATABASE_ID: !!databaseId,
        APPWRITE_COLLECTION_ID: !!collectionId,
        APPWRITE_API_KEY: !!apiKey,
      }
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Missing server env vars', missing })
      }
    }

    const client = new Client()
      .setEndpoint('https://fra.cloud.appwrite.io/v1')
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);

    const result = await databases.listDocuments(databaseId, collectionId, [
      Query.limit(5),
      Query.orderDesc('count'),
    ]);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ documents: result.documents })
    }
  } catch (err) {
    console.error('get-trending error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err?.message || 'Server error' })
    }
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}

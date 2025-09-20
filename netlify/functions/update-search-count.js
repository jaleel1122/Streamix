const { Client, Databases, ID, Query } = require('node-appwrite')

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: ''
      }
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Method not allowed' })
      }
    }

    const { searchTerm, movie } = JSON.parse(event.body || '{}');

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

    const normalized = (searchTerm || '').trim().toLowerCase();
    const result = await databases.listDocuments(databaseId, collectionId, [
      Query.equal('searchTerm', normalized),
    ]);

    const safePosterPath = movie?.poster_path
      ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
      : null;

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      const current = typeof doc.count === 'number' ? doc.count : 0;
      await databases.updateDocument(databaseId, collectionId, doc.$id, {
        count: current + 1,
        poster_url: safePosterPath,
        movie_id: movie?.id,
      });
    } else {
      await databases.createDocument(databaseId, collectionId, ID.unique(), {
        searchTerm: normalized,
        count: 1,
        movie_id: movie?.id,
        poster_url: safePosterPath,
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ ok: true })
    }
  } catch (err) {
    console.error('update-search-count error:', err);
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

const text2png = require('text2png');
const data = require('@begin/data');

async function initializeData(req) {
  // check if this is the first time for this domain
  const query = {
    table: 'sites',
    key: req.headers.host,
    hits: 0,
  };
  const existing = await data.get(query);
  if (!existing) {
    await data.set(query);
  }
}

exports.handler = async function todos(req) {
  await initializeData(req);
  const { hits } = await data.incr({
    table: 'sites',
    key: req.headers.host,
    prop: 'hits',
  });
  const buffer = text2png(`${hits}`, {
    color: 'white',
    backgroundColor: 'black',
    padding: 20,
    borderWidth: 2,
    borderColor: 'white',
  });

  return {
    statusCode: 201,
    isBase64Encoded: true,
    headers: {
      'content-type': 'image/png; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body: buffer.toString('base64'),
  };
};

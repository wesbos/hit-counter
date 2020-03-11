const data = require('@begin/data');
const Jimp = require('jimp');

const { format } = Intl.NumberFormat();

async function initializeData(req) {
  // check if this is the first time for this domain
  const query = {
    table: 'sites',
    key: req.headers.Host,
    hits: 0,
  };
  const existing = await data.get(query);
  if (!existing) {
    await data.set(query);
  }
}

function isExtraneousRequest(req) {
  return (
      req.path.endsWith("favicon.ico")
  );
}

exports.handler = async function todos(req) {

  if(isExtraneousRequest(req)) {
    return { statusCode: 404 };
  }

  await initializeData(req);
  const { hits } = await data.incr({
    table: 'sites',
    key: req.headers.Host,
    prop: 'hits',
  });

  const image = new Jimp(1000, 200, 0xffffffff);
  image.background(0xffffffff);

  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  image.print(font, 0, 0, format(hits));
  image.autocrop();
  const buff = await image.getBufferAsync(Jimp.MIME_PNG);

  return {
    statusCode: 201,
    isBase64Encoded: true,
    headers: {
      'content-type': 'image/png; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body: buff.toString('base64'),
  };
};

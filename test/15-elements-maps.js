
var test    = require('tape').test
  , msgpack = require('../')

function build(size, value) {
  var map = {}
    , i

  for(i = 0; i < size; i++) {
    map[i + 100 + ''] = value
  }

  return map
}

function computeLength(map) {
  var length    = 1 // the header
    , multi     = 5 // we have 4 bytes for each key, plus 1 byte for the value

  if (map[100] && typeof map[100] === 'string') {
    multi += map[100].length
  }

  length += Object.keys(map).length * multi

  return length
}

test('encode/decode maps up to 15 elements', function(t) {

  var encoder = msgpack()
    , all     = []
    , i

  for(i = 0; i < 16; i++) {
    all.push(build(i, 42))
  }


  for(i = 0; i < 16; i++) {
    all.push(build(i, 'aaa'))
  }

  all.forEach(function(map) {
    var length = Object.keys(map).length
    t.test('encoding a map with ' + length + ' elements of ' + map[100], function(t) {
      var buf = encoder.encode(map)
      t.equal(buf.length, computeLength(map), 'must have the right length');
      t.equal(buf.readUInt8(0) & 0xf0, 0x80, 'must have the proper header');
      t.equal(buf.readUInt8(0) & 0x0f, length, 'must include the map length');
      t.end()
    })

    t.test('mirror test for a map of length ' + length + ' with ' + map[100], function(t) {
      t.deepEqual(encoder.decode(encoder.encode(map)), map, 'must stay the same');
      t.end()
    })
  })

  t.end()

})

test('do not encode undefined in a map', function(t) {
  var instance = msgpack()
    , expected = { hello: 'world' }
    , toEncode = { a: undefined, hello: 'world' }
    , buf      = instance.encode(toEncode)

  t.deepEqual(expected, instance.decode(buf), 'must ignore undefined')
  t.end()
})

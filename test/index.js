'use strict'
let should = require('should')
let sinon = require('sinon')
let fmr = require('../')
let Metalsmith = require('metalsmith')
let fs = require('fs-extra')
let path = require('path')

const buildFolder = path.resolve(__dirname, 'fixtures/build')

describe('metalsmith-frontmatter-renderer', function () {
  let sandbox = null

  function killBuildDirectory () {
    if (fs.existsSync(buildFolder)) {
      fs.removeSync(buildFolder)
    }
  }

  beforeEach(function () {
    killBuildDirectory()
    sandbox = sinon.createSandbox()
    sandbox.stub(console, 'log')
  })

  afterEach(function () {
    sandbox.restore()
    killBuildDirectory()
  })

  /**
   * This test also tests correctly outputting to the same object as the key (ie, not passing an `out` config option)
   */
  it('should replace the strings with the rendered strings', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr()
      )
      .build(function (err, files) {
        should.not.exist(err)
        files.should.match({
          'index.html': {
            'blocks': {
              'bar': '<p>Markdown <em>bar</em></p>\n',
              'foo': '<h1><code>Markdown</code> foo</h1>\n',
              'all': '<p>&lt;div&gt;Html!&lt;/div&gt;</p>\n'
            }
          }
        })
        return done()
      })
  })

  it('should throw an error if the config option `key` is not a string', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr(
          {
            key: {}
          }
        )
      )
      .build(function (err) {
        err.should.be.an.Error()
        err.message.should.equal('invalid key, the key option should be a string')
        return done()
      })
  })

  it('should throw an error if the config option `out` is not a string', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr(
          {
            out: {}
          }
        )
      )
      .build(function (err) {
        err.should.be.an.Error()
        err.message.should.equal('invalid out, the out option should be a string')
        return done()
      })
  })

  it('should output the replaced content into a different object if the \'out\' option is set', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr({
          out: 'rendered'
        })
      )
      .build(function (err, files) {
        should.not.exist(err)
        files.should.match({
          'index.html': {
            'rendered': {
              'bar': '<p>Markdown <em>bar</em></p>\n',
              'foo': '<h1><code>Markdown</code> foo</h1>\n',
              'all': '<p>&lt;div&gt;Html!&lt;/div&gt;</p>\n'
            }
          }
        })
        return done()
      })
  })

  it('should only overwrite the matching keys within the custom \'out\' object', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr({
          out: 'other'
        })
      )
      .build(function (err, files) {
        should.not.exist(err)
        files.should.match({
          'index.html': {
            'blocks': {
              'bar': 'Markdown *bar*',
              'foo': '# `Markdown` foo',
              'all': '<div>Html!</div>'
            },
            'other': {
              'bar': '<p>Markdown <em>bar</em></p>\n',
              'foo': '<h1><code>Markdown</code> foo</h1>\n',
              'all': '<p>&lt;div&gt;Html!&lt;/div&gt;</p>\n',
              'wiz': 'Another string'
            }
          }
        })
        return done()
      })
  })

  it('should throw an error if there are no files to process', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr(
          {
            key: 'noBlocks'
          }
        )
      )
      .build(function (err) {
        err.should.be.an.Error()
        err.message.should.equal('no files to process.')
        return done()
      })
  })

  it('should not throw an error if there are no files to process and the config is set to suppress this', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr(
          {
            key: 'noBlocks',
            suppressNoFilesError: true
          }
        )
      )
      .build(function (err, files) {
        should.not.exist(err)
        files.should.match({
          'index.html': {
            'blocks': {
              'bar': 'Markdown *bar*',
              'foo': '# `Markdown` foo',
              'all': '<div>Html!</div>'
            }
          }
        })
        return done()
      })
  })

  it('should throw an error if a transformer is not found', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr(
          {
            ext: 'foobar'
          }
        )
      )
      .build(function (err) {
        err.should.be.an.Error()
        err.message.should.equal('transformer not found for foobar extension')
        return done()
      })
  })

  it('should pass options through to the jstransformer', (done) => {
    Metalsmith('test/fixtures')
      .use(
        fmr(
          {
            ext: 'md',
            options: {
              html: true
            }
          }
        )
      )
      .build(function (err, files) {
        should.not.exist(err)
        files.should.match({
          'index.html': {
            'blocks': {
              'bar': '<p>Markdown <em>bar</em></p>\n',
              'foo': '<h1><code>Markdown</code> foo</h1>\n',
              'all': '<div>Html!</div>'
            }
          }
        })
        return done()
      })
  })

  it('should pass the metalsmith metadata as a render parameter', (done) => {
    Metalsmith('test/fixtures')
      .metadata(
        {
          example: 'my metadata'
        }
      )
      .use(
        fmr(
          {
            ext: 'njk',
            key: 'blocks-njk'
          }
        )
      )
      .build(function (err, files) {
        should.not.exist(err)
        files.should.match({
          'index.html': {
            'blocks-njk': {
              'njk': 'my metadata'
            }
          }
        })
        return done()
      })
  })
})

const jstransformer = require('jstransformer')
const toTransformer = require('inputformat-to-jstransformer')

function replace ({ filename, files, settings, jsTransformer }) {
  const filePathsObj = files[filename][settings.key]
  const matchedPaths = Object.keys(filePathsObj)

  // if this key doesn't already exist create it
  if (!files[filename].hasOwnProperty(settings.out)) {
    files[filename][settings.out] = {}
  }

  // Map all strings that should be rendered
  return new Promise((resolve) => {
    matchedPaths.map(pathKey => {
      files[filename][settings.out][pathKey] = jsTransformer.render(files[filename][settings.key][pathKey], {}, {}).body
    })
    resolve()
  })
}

module.exports = options => (files, metalsmith, done) => {
  const defaults = {
    key: 'blocks',
    out: '',
    ext: 'md',
    suppressNoFilesError: false
  }
  const settings = Object.assign({}, defaults, options)

  // Check whether the key option is valid
  if (!(typeof settings.key === 'string')) {
    done(
      new Error(
        'invalid key, the key option should be a string'
      )
    )
  }

  // Check whether the out option is valid
  if (!(typeof settings.out === 'string')) {
    done(
      new Error(
        'invalid out, the out option should be a string'
      )
    )
  }
  // Default to output to keys object
  if (settings.out === '') {
    settings.out = settings.key
  }

  // Filter files to only include those which have the key we"re looking for
  const matchedFiles = Object.keys(files).filter((file) => files[file].hasOwnProperty(settings.key))

  // Let the user know when there are no files to process
  if (matchedFiles.length === 0) {
    if (settings.suppressNoFilesError) {
      done()
    } else {
      done(new Error('no files to process.'))
    }
  }

  // Get transformer
  const transformer = toTransformer(settings.ext)
  if (!transformer) {
    done(new Error(`transformer not found for ${settings.ext} extension`))
  }
  const jsTransformer = jstransformer(transformer)

  // Map all files that should be processed to an array of promises and call done when finished
  Promise.all(
    matchedFiles.map(filename =>
      replace({ filename, files, settings, jsTransformer })
    )
  )
    .then(() => done())
    .catch(errorMsg => done(errorMsg))
}

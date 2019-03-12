# metalsmith-frontmatter-renderer

A [Metalsmith](http://www.metalsmith.io/) plugin to render strings within frontmatter.

You could have used [metalsmith-frontmatter-file-loader](https://github.com/djfwilkinson/metalsmith-frontmatter-file-loader) to get those strings from seperate files.

[![Build Status](https://travis-ci.org/djfwilkinson/metalsmith-frontmatter-renderer.svg?branch=master)](https://travis-ci.org/djfwilkinson/metalsmith-frontmatter-renderer)

## Installation

    $ npm install metalsmith-frontmatter-renderer

*Note: you will need to install the [jstranformer](https://github.com/jstransformers/jstransformer) that you want to use. No transformers are required as dependencies of this package.*

*e.g. to use the default markdown transformer you will need to also run `$ npm install jstransformer-markdown`*

## Config options

You can pass some basic options to customize the behaviour:

```json
{
  "key": "blocks",
  "out": "blocks",
  "ext": "md",
  "suppressNoFilesError": false,
  "options": {}
}
```

- `key` is the key of the object to iterate over in the files frontmatter. Default `blocks`.
- `out` is the key of the object to update the values upon. Default the value of `key`.
- `ext` is a string used by [inputformat-to-jstransformer](https://github.com/jstransformers/inputformat-to-jstransformer) to determine which jstransformer to load and use. *Note: you do need to install whichever jstransformer you want to use.* Default `md`.
- `suppressNoFilesError` is a boolean to determine the behaviour when there are no files to look check the frontmatter of. Set to `true` to prevent an error being thrown if there are no files. Default `false`.
- `options` is an object that will be passed to the jstransformer render function as the second parameter (options). Default to empty object `{}`.

## CLI Usage

  Install via npm and then add the `metalsmith-frontmatter-renderer` key to your `metalsmith.json` plugin:

```json
{
  "plugins": {
    "metalsmith-frontmatter-renderer": true
  }
}
```

or with configuration options:


```json
{
  "plugins": {
    "metalsmith-frontmatter-renderer": {
      "key": "files",
      "out": "blocks-rendered",
      "ext": "njk",
      "suppressNoFilesError": true,
      "options": {
        "html": true
      }
    }
  }
}
```

## Javascript Usage

  Pass `options` to the plugin and pass it to Metalsmith with the `use` method:

```js
var fmfl = require('metalsmith-frontmatter-renderer');

metalsmith.use(fmfl({
  key: 'files',
  ext: 'njk',
  suppressNoFilesError: true
}));
```

## Example frontmatter
*src/index.html*
<pre><code class="language-html">&mdash;&mdash;&mdash;
blocks:
    foo: &#39;# Here is some *markdown*&#39;
    bar: &#39;`blocks` will be rendered using a [jstranformer](https://github.com/jstransformers/jstransformer)&#39;
&mdash;&mdash;&mdash;
&lt;h1&gt;This is the &lt;code&gt;contents&lt;/code&gt; of the file.&lt;/h1&gt;</code></pre>

By default this would render the two properties `foo` and `bar` using the markdown jstransformer.
It would replace the contents of those two properties with the rendered string.

e.g this is the equivalent of having written out the rendered contents into the frontmatter as so:

<pre><code class="language-html">&mdash;&mdash;&mdash;
files:
    foo: &#39;&lt;h1&gt;Here is some &lt;em&gt;markdown&lt;/em&gt;&lt;/h1&gt;&#39;
    bar: &#39;&lt;p&gt;&lt;code&gt;blocks&lt;/code&gt; will be rendered using a &lt;a href=&quot;https://github.com/jstransformers/jstransformer&quot;&gt;jstranformer&lt;/a&gt;&lt;/p&gt;&#39;
&mdash;&mdash;&mdash;
&lt;h1&gt;This is the &lt;code&gt;contents&lt;/code&gt; of the file.&lt;/h1&gt;</code></pre>

*If you use a property other than `blocks` then you can pass the name as a configuration option. See the config documentation above.*

## License

MIT

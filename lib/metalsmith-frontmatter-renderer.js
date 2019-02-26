const fs = require("fs");
const jstransformer = require("jstransformer");
const toTransformer = require("inputformat-to-jstransformer");


function replace({ filename, files, settings, jsTransformer }) {
    const filePathsObj = files[filename][settings.key];
    const matchedPaths = Object.keys(filePathsObj);

    // Map all strings that should be rendered
    return new Promise( (done) => {
            matchedPaths.map(pathKey => {
                files[filename][settings.key][pathKey] = jsTransformer.render(files[filename][settings.key][pathKey], {}, {}).body;
            });
            done();
        }
    );
}

module.exports = options => (files, metalsmith, done) => {
    const defaults = {
        key: "blocks",
        ext: "md",
        suppressNoFilesError: false
    };
    const settings = Object.assign({}, defaults, options);
    const metadata = metalsmith.metadata();

    // Check whether the key option is valid
    if (!(typeof settings.key === "string")) {
        done(
            new Error(
                "invalid key, the key option should be a string"
            )
        );
    }

    // Filter files to only include those which have the key we"re looking for
    const matchedFiles = Object.keys(files).filter((file) => files[file].hasOwnProperty(settings.key));

    // Let the user know when there are no files to process
    if (matchedFiles.length === 0) {
        const msg =
            "no files to process.";
        if (settings.suppressNoFilesError) {
            debug(msg);
            done();
        } else {
            done(new Error(msg));
        }
    }

    // Get transformer
    const transformer = toTransformer(settings.ext);
    if (!transformer) {
        done(new Error(`transformer not found for ${settings.ext} extension`));
    }
    const jsTransformer = jstransformer(transformer);


    // Map all files that should be processed to an array of promises and call done when finished
    Promise.all(
        matchedFiles.map(filename =>
            replace({ filename, files, settings, jsTransformer })
        )
    )
    .then(() => done())
    .catch(/* istanbul ignore next */ error => done(error));
};

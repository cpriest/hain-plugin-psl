'use strict';
require('json5/lib/require');
const glob = require("glob");

let { log } = require('./utils.js');

module.exports = (pluginContext, PluginDir) => {

	// Patterns from definition files, collected here and return
	let patterns = [ ];

	LoadDefinitionFiles(PluginDir + '/defs/*.json*');

	/**
	 * @param {string} fnMatch	A glob pattern of files to match
	 */
	function LoadDefinitionFiles(fnMatch) {
		for(let file of glob.sync(fnMatch))
			ParseDefinition(require(file));
	}

	/**
	 * @param {Definition} def
	 */
	function ParseDefinition(def) {
		patterns = patterns.concat(def.patterns || []);
	}

	return [ patterns ];
};

'use strict';

module.exports = {
	log: function(...args) {
		console.log(...args);
		return args[0];
	}
};


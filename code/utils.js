'use strict';

module.exports = class Util {
	static log(...args) {
		args.unshift('PSL: ');
		console.log(...args);
		return args[1];
	}

	static indent(msg, level=1) {
		let prefix = "    ".repeat(level);
		return msg.replace(/^(.+)$/mg, prefix+'$1');
	}
};


'use strict';

module.exports = (key) => {
	let data = psl.localStorage.getItemSync(key) || {};

	return new Proxy(data, {
		set: (obj, prop, value, receiver) => {
			// psl.debug(`setting ${prop} to ${value} and saving`);
			obj[prop] = value;
			psl.localStorage.setItem(key, obj);
			// psl.debug(obj, PersistedObject);
			return true;
		}
	});
};

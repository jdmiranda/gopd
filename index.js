'use strict';

/** @type {import('.')} */
var $gOPD = require('./gOPD');

// Cache for property descriptors using WeakMap for automatic garbage collection
var descriptorCache = typeof WeakMap === 'undefined' ? null : new WeakMap();

// Fast path: Check if native implementation is available and working
var hasWorkingGOPD = false;
if ($gOPD) {
	try {
		$gOPD([], 'length');
		hasWorkingGOPD = true;
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

// Optimized wrapper with caching
if (hasWorkingGOPD && $gOPD) {
	var nativeGOPD = $gOPD;
	/** @type {import('.')} */
	module.exports = function getOwnPropertyDescriptor(obj, prop) {
		// Fast path for null/undefined
		if (obj === null || obj === undefined) {
			throw new TypeError('Cannot convert undefined or null to object');
		}

		// Fast path for primitives - convert to object
		var O = Object(obj);

		// Check cache first (WeakMap version)
		if (descriptorCache) {
			var objCache = descriptorCache.get(O);
			if (objCache && objCache[prop]) {
				return objCache[prop];
			}
		}

		// Get descriptor using native method
		var descriptor = nativeGOPD(O, prop);

		// Cache the result if descriptor exists
		if (descriptor && descriptorCache) {
			var cache = descriptorCache.get(O);
			if (!cache) {
				cache = {};
				descriptorCache.set(O, cache);
			}
			cache[prop] = descriptor;
		}

		return descriptor;
	};
} else {
	module.exports = $gOPD;
}

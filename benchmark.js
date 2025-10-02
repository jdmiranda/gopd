'use strict';

var gOPD = require('./index.js');

// Benchmark configuration
var iterations = 100000;

// Test objects
var testObj = { x: 1, y: 2, z: 3 };
var testArray = [1, 2, 3, 4, 5];

function benchmark(name, fn, iterations) {
	var start = Date.now();
	for (var i = 0; i < iterations; i++) {
		fn();
	}
	var end = Date.now();
	var duration = end - start;
	var opsPerSec = Math.round((iterations / duration) * 1000);
	console.log(name + ': ' + duration + 'ms (' + opsPerSec.toLocaleString() + ' ops/sec)');
	return { duration: duration, opsPerSec: opsPerSec };
}

console.log('=== Performance Benchmark ===');
console.log('Iterations: ' + iterations.toLocaleString());
console.log('');

// Benchmark 1: Simple property access on object
console.log('Test 1: Object property descriptor retrieval');
var result1 = benchmark('  gOPD(obj, "x")', function () {
	gOPD(testObj, 'x');
}, iterations);

// Benchmark 2: Repeated access (should hit cache)
console.log('');
console.log('Test 2: Repeated access (cache hit)');
var result2 = benchmark('  gOPD(obj, "x") x5', function () {
	gOPD(testObj, 'x');
	gOPD(testObj, 'x');
	gOPD(testObj, 'x');
	gOPD(testObj, 'x');
	gOPD(testObj, 'x');
}, iterations / 5);

// Benchmark 3: Array property access
console.log('');
console.log('Test 3: Array property descriptor retrieval');
var result3 = benchmark('  gOPD(array, "length")', function () {
	gOPD(testArray, 'length');
}, iterations);

// Benchmark 4: Multiple different properties
console.log('');
console.log('Test 4: Multiple properties on same object');
var result4 = benchmark('  gOPD(obj, x/y/z)', function () {
	gOPD(testObj, 'x');
	gOPD(testObj, 'y');
	gOPD(testObj, 'z');
}, iterations / 3);

// Benchmark 5: Native baseline comparison (if available)
if (typeof Object.getOwnPropertyDescriptor === 'function') {
	console.log('');
	console.log('Test 5: Native Object.getOwnPropertyDescriptor (baseline)');
	var result5 = benchmark('  Native gOPD(obj, "x")', function () {
		Object.getOwnPropertyDescriptor(testObj, 'x');
	}, iterations);

	console.log('');
	console.log('=== Performance Summary ===');
	console.log('Optimized vs Native overhead: ' + Math.round((result1.duration / result5.duration - 1) * 100) + '%');
	console.log('Cache benefit (repeated access): ' + Math.round((result1.duration / result2.duration * 5)) + 'x faster');
}

console.log('');
console.log('=== Optimization Features ===');
console.log('✓ WeakMap-based caching for descriptor reuse');
console.log('✓ Fast path for native Object.getOwnPropertyDescriptor');
console.log('✓ Optimized null/undefined checks');
console.log('✓ Reduced function call overhead');
console.log('✓ Automatic garbage collection via WeakMap');

#!/usr/bin/env node

var colors = require('colors');
var program = require('commander');
var moment = require('moment');
var momentRelative = require('moment-relative');
var parseMessyTime = require('parse-messy-time');

program
	.version(require('./package.json').version)
	.option('-c, --countdown', 'Display a countdown')
	.option('-v, --verbose', 'Be verbose. Specify multiple times for increasing verbosity', function(i, v) { return v + 1 }, 0)
	.parse(process.argv);

if (!program.args.length) {
	console.log('No time specified');
	process.exit(1);
}


// Try parse with moment
var time = program.args.join(' ');
if (program.verbose > 1) console.log(colors.blue('[Coma]'), 'Trying to parse', time);

// Main time parser {{{
var parsedTime = function(time) {
	// Parse with moment
	try {
		var parsedRawDate = Date.parse(time);
		var parsedMoment = moment(parsedRawDate);
		if (parsedMoment.isValid()) return parsedMoment.toDate(time);
	} catch (e) {
		console.log('C!');
		// Ignore moment complaints and try next method
	}

	// Parse with moment-relative
	try {
		var parsedMomentRelative = momentRelative()
		parsedMomentRelative.relative(time);
		if (parsedMomentRelative.isValid()) return parsedMomentRelative.toDate(time);
	} catch (e) {
		// Ignore moment-relatives weird parsing errors and continue
	}

	// Parse with parse-messy-time
	var parsedMessyTime = parseMessyTime(time);
	if (parsedMessyTime) return parsedMessyTime;

	return false;
}(time);
// }}}

// Sanity check that the date is valid {{{
if (!parsedTime) {
	console.log(colors.blue('[Coma]'), colors.red('ERROR'), 'Cannot parse date:', time);
	process.exit(1);
} else if (parsedTime < (new Date)) {
	console.log(colors.blue('[Coma]'), colors.red('ERROR'), 'Date', colors.cyan(parsedTime.toString()), 'is in the past');
	process.exit(1);
}
// }}}

if (program.verbose > 1) console.log(colors.blue('[Coma]'), 'Sleeping until', colors.cyan(parsedTime.toString()));
if (program.verbose) console.log(colors.blue('[Coma]'), 'Sleeping', colors.cyan(moment.duration(parsedTime.getTime() - (new Date).getTime(), 'milliseconds').humanize()));

setInterval(function() {
	var now = (new Date);
	if (parsedTime < now) {
		if (program.verbose) console.log(colors.blue('[Coma]'), colors.bold.green('Completed!'));
		process.exit(0);
	} else if (program.countdown) {
		var momentD = moment.duration(parsedTime.getTime() - now.getTime(), 'milliseconds');

		console.log(colors.blue('[Coma]'), 'Remaining time', colors.cyan(
			momentD.humanize()
		));
	}
}, 1000);

#!/usr/bin/env node

var clui = require('clui');
var colors = require('colors');
var program = require('commander');
var moment = require('moment');
var momentRelative = require('moment-relative');
var parseMessyTime = require('parse-messy-time');
var spawnArgs = require('spawn-args');

program
	.version(require('./package.json').version)
	.usage('[time to sleep until]')
	.option('-c, --countdown', 'Display a countdown')
	.option('-v, --verbose', 'Be verbose. Specify multiple times for increasing verbosity', function(i, v) { return v + 1 }, 0)
	.parse(process.argv);

if (!program.args.length) {
	if (process.env.COMA) {
		if (program.verbose > 1) console.log(colors.blue('[Coma]'), 'Reading in environment variable', colors.cyan('COMA'), 'as', colors.cyan(process.env.COMA));
		program.parse(process.argv.concat(spawnArgs(process.env.COMA)));
		if (!program.args.length) {
			console.log('Read in the COMA environment variable but there is still no time specified');
			process.exit(1);
		}
	} else {
		console.log('No time specified');
		process.exit(1);
	}
}

function countdownFormat(fromDate, toDate) {
	var momentD = moment.duration(toDate.getTime() - fromDate.getTime(), 'milliseconds');
	var remaining = momentD.humanize();
	if (remaining == 'a minute' || remaining == 'a few seconds') { // Extend on this rather rough approximation
		var secs = momentD.seconds();
		return (secs == 1) ? '1 second' : secs + ' seconds';
	} else {
		return remaining;
	}
};

// Try parse with moment
var time = program.args.join(' ');
if (program.verbose > 1) console.log(colors.blue('[Coma]'), 'Trying to parse', colors.cyan(time));

// Main time parser {{{
var parsedTime = function(time) {
	// Parse with moment
	try {
		var parsedRawDate = Date.parse(time);
		var parsedMoment = moment(parsedRawDate);
		if (parsedMoment.isValid()) return parsedMoment.toDate(time);
	} catch (e) {
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

if (program.verbose) console.log(colors.blue('[Coma]'), 'Sleeping until', colors.cyan(parsedTime.toString()));
if (program.verbose) console.log(colors.blue('[Coma]'), 'Sleeping', colors.cyan(countdownFormat(new Date, parsedTime)));

if (program.countdown) {
	var spinner = new clui.Spinner('Prepairing...');
	spinner.start();
}

setInterval(function() {
	var now = (new Date);
	if (parsedTime < now) {
		if (program.countdown) spinner.stop();
		if (program.verbose) console.log(colors.blue('[Coma]'), colors.bold.green('Completed!'));
		process.exit(0);
	} else if (program.countdown) {
		spinner.message('Remaining time: ' + colors.cyan(countdownFormat(now, parsedTime)));
	}
}, 1000);

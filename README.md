coma
====
Node CLI to enhance the GNU `sleep` command.

Parses a time expression, waits and quits. Designed to be used within a shell script.


	coma next friday && echo "To the pub!"

	coma midnight && echo "It its the witching hour!"

	coma 2h && echo "2 Hours from when we started"

	coma 3pm tomorrow && "Its 3 O'clock!"


Can also optionally take a `-c` / `--countdown` parameter to display the time remaining on the console every second.

The envionment variable `COMA` can be populated with default options to use if no arguments are specified. e.g. `export COMA='midnight tomorrow' -cv`.

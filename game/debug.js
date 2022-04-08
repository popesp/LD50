const DEBUG = false;

export function log(...params)
{
	if(DEBUG)
		// eslint-disable-next-line no-console
		console.log(...params);
}
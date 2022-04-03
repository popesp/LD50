const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DEFAULT_LENGTH_IDENTIFIER = 32;


function Random()
{
}

// default random number generator uses cryptographically random bits to generate numbers
Random.prototype.fraction = function()
{
	return Math.random();
};

Random.prototype.float = function(min, max)
{
	return min + this.fraction()*(max - min);
};

Random.prototype.int = function(min, max)
{
	return Math.floor(this.float(min, max));
};

Random.prototype.shuffle = function(list)
{
	for(let i = list.length - 1; i > 0; --i)
	{
		const j = this.int(0, i + 1);

		const tmp = list[i];
		list[i] = list[j];
		list[j] = tmp;
	}
};

Random.prototype.identifier = function(length)
{
	length = length || DEFAULT_LENGTH_IDENTIFIER;

	let identifier = "";
	for(let i = 0; i < length; ++i)
		identifier += ALPHABET.charAt(Math.floor(this.fraction()*ALPHABET.length));

	return identifier;
};


export default new Random();
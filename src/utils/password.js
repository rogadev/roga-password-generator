const CHAR_SETS = {
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+~`|}{[]:;?><,./-=\\',
};

/**
 * Generates a cryptographically secure random integer between min (inclusive) and max (exclusive).
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (exclusive).
 * @returns {number} A random integer.
 */
function getRandomInt(min, max) {
  const range = max - min;
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const randomNumber = randomBuffer[0] / (0xFFFFFFFF + 1); // Convert to a float in [0, 1)
  return Math.floor(randomNumber * range + min);
}

/**
 * Shuffles an array in place using the Fisher-Yates (aka Knuth) shuffle algorithm.
 * @param {Array<string>} array - The array to shuffle.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generates a password based on the provided settings.
 * @param {object} options
 * @param {number} options.length - The desired password length.
 * @param {boolean} [options.excludeLowercase=false] - Whether to exclude lowercase letters.
 * @param {boolean} [options.excludeUppercase=false] - Whether to exclude uppercase letters.
 * @param {boolean} [options.excludeNumbers=false] - Whether to exclude numbers.
 * @param {boolean} [options.excludeSymbols=false] - Whether to exclude symbols.
 * @param {string} [options.excludedChars=''] - A string of specific characters to exclude.
 * @param {boolean} [options.ruleNoLeadingSpecial=false] - Disallow numbers/symbols as the first character.
 * @returns {string} The generated password or an error message.
 */
export function generatePassword(options) {
  const { 
    length, 
    excludeLowercase = false, 
    excludeUppercase = false, 
    excludeNumbers = false, 
    excludeSymbols = false, 
    excludedChars = '', 
    ruleNoLeadingSpecial
  } = options;

  if (length <= 0 || length > 128) {
    return "Error: Invalid length.";
  }

  let charPool = '';
  const requiredChars = [];

  const effectiveExcluded = new Set(excludedChars.split(''));

  const filterExcluded = (set) => set.split('').filter(char => !effectiveExcluded.has(char)).join('');

  // Include character sets that are not excluded
  const lowercasePool = filterExcluded(CHAR_SETS.LOWERCASE);
  if (!excludeLowercase && lowercasePool) {
    charPool += lowercasePool;
    requiredChars.push(lowercasePool[getRandomInt(0, lowercasePool.length)]);
  }

  const uppercasePool = filterExcluded(CHAR_SETS.UPPERCASE);
  if (!excludeUppercase && uppercasePool) {
    charPool += uppercasePool;
    requiredChars.push(uppercasePool[getRandomInt(0, uppercasePool.length)]);
  }

  const numbersPool = filterExcluded(CHAR_SETS.NUMBERS);
  if (!excludeNumbers && numbersPool) {
    charPool += numbersPool;
    requiredChars.push(numbersPool[getRandomInt(0, numbersPool.length)]);
  }

  const symbolsPool = filterExcluded(CHAR_SETS.SYMBOLS);
  if (!excludeSymbols && symbolsPool) {
    charPool += symbolsPool;
    requiredChars.push(symbolsPool[getRandomInt(0, symbolsPool.length)]);
  }

  if (!charPool) {
    return "Error: All character types excluded or all characters excluded.";
  }

  if (requiredChars.length > length) {
    return "Error: Length too short to include all required character types.";
  }

  const password = [...requiredChars];
  const remainingLength = length - requiredChars.length;

  for (let i = 0; i < remainingLength; i++) {
    password.push(charPool[getRandomInt(0, charPool.length)]);
  }

  shuffleArray(password);

  // Handle rules after shuffling
  if (ruleNoLeadingSpecial) {
    const leadingCharIsSpecial = (numbersPool + symbolsPool).includes(password[0]);
    if (leadingCharIsSpecial) {
      // Find the first allowed character (must be lower or upper) to swap with
      const allowedLeadingPool = lowercasePool + uppercasePool;
      if (!allowedLeadingPool) {
        return "Error: Cannot satisfy 'no leading special' rule with selected characters.";
      }
      let swapIndex = -1;
      for (let i = 1; i < password.length; i++) {
          if (allowedLeadingPool.includes(password[i])) {
              swapIndex = i;
              break;
          }
      }

      if (swapIndex !== -1) {
         // Swap the leading char with the first allowed char found
         [password[0], password[swapIndex]] = [password[swapIndex], password[0]];
      } else {
          // If no swappable char found (e.g., password is all numbers/symbols but rule applied),
          // replace the first char with a random allowed one.
          // This might slightly reduce the guarantee of including all types if the swapped char was the only instance of its type.
          password[0] = allowedLeadingPool[getRandomInt(0, allowedLeadingPool.length)];
      }
    }
  }

  return password.join('');
}

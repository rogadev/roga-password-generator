/**
 * Generate a random password of a given length with given characters
 * @param {Number} length Set the length of the password to generate
 * @param {Boolean} lower True if you'd like to have lowercase letters in your password
 * @param {Boolean} upper True if you'd like to have uppercase letters in your password
 * @param {Boolean} number True if you'd like to have numbers in your password
 * @param {Boolean} special True if you'd like to have special characters in your password
 */
const get = (length, lower, upper, number, special) => {
  const gen = (min, max) =>
    max++ && [...Array(max - min)].map((s, i) => String.fromCharCode(min + i))

  const sets = {
    num: number ? gen(48, 57) : [],
    alphaLower: lower ? gen(97, 122) : [],
    alphaUpper: upper ? gen(65, 90) : [],
    special: special ? [...`~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`] : [],
  }

  const set = Object.values(sets).flat()
  let password = ''

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * set.length)
    password += set[index]
  }

  return password
}

export default get

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const JONGSEONG_COUNT = 28;

export function hasBatchim(word) {
  if (!word) return false;
  const code = word.charCodeAt(word.length - 1);
  if (code < HANGUL_BASE || code > HANGUL_LAST) return false;
  return (code - HANGUL_BASE) % JONGSEONG_COUNT !== 0;
}

export function withSubjectParticle(word) {
  return `${word}${hasBatchim(word) ? '이' : '가'}`;
}

export function withConjunctiveParticle(word) {
  return `${word}${hasBatchim(word) ? '과' : '와'}`;
}

const INITIAL_CONSONANTS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

export function getKoreanInitials(value = '') {
  return [...value]
    .map((character) => {
      const code = character.charCodeAt(0) - 0xac00;
      return code >= 0 && code <= 11171 ? INITIAL_CONSONANTS[Math.floor(code / 588)] : character;
    })
    .join('');
}

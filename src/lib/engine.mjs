export const DAY = 86_400_000;
export const DEFAULT_POLICY = {
  consolidation: { minSuccessfulReviews: 2, minDistinctDays: 2 },
  mastery: { minSuccessfulReviews: 4, minElapsedDays: 7, lastImmediateCount: 2 },
  intervals: { immediateDays: [2, 4, 7, 14, 30], associationDays: 2, hintDays: 1, missDays: 1 },
  failure: { consecutiveMissesToLearning: 2, interleaveCardsBeforeRetry: 3 },
};
export function normalizedAnswer(value) {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('es-ES');
}
export function isWrittenCorrect(answer, entry) {
  const key = normalizedAnswer(answer);
  return [entry.word, ...(entry.variants || [])].some(v => normalizedAnswer(v) === key);
}
export function distinctReviewDays(attempts) {
  return new Set(attempts.map(a => new Date(a.timestamp).toISOString().slice(0, 10))).size;
}
export function stateFor(wordId, discoveries, allAttempts, policy = DEFAULT_POLICY) {
  if (!discoveries.some(d => d.wordId === wordId)) return 'new';
  const attempts = allAttempts.filter(a => a.wordId === wordId && !a.repeatInSession && a.direction !== 'association-to-word-meaning').sort((a,b) => a.timestamp-b.timestamp);
  const success = attempts.filter(a => a.grade !== 'miss');
  if (!attempts.length) return 'learning';
  let failures = 0;
  for (let i=attempts.length-1; i>=0 && attempts[i].grade==='miss'; i--) failures++;
  if (failures >= policy.failure.consecutiveMissesToLearning) return 'learning';
  const immediateCount = policy.mastery.lastImmediateCount;
  const tailImmediate = attempts.slice(-immediateCount).length === immediateCount && attempts.slice(-immediateCount).every(a => a.grade==='immediate');
  const elapsed = attempts.length > 1 ? (attempts.at(-1).timestamp-attempts[0].timestamp)/DAY : 0;
  const qualifiesMastery = success.length >= policy.mastery.minSuccessfulReviews && elapsed >= policy.mastery.minElapsedDays && tailImmediate;
  if (qualifiesMastery && failures === 0) return 'mastered';
  const wasMastered = attempts.slice(0,-1).some((_, index) => {
    const prefix = attempts.slice(0,index+1);
    const good = prefix.filter(a=>a.grade !== 'miss');
    return good.length >= policy.mastery.minSuccessfulReviews &&
      (prefix.at(-1).timestamp-prefix[0].timestamp)/DAY >= policy.mastery.minElapsedDays &&
      prefix.slice(-immediateCount).length === immediateCount &&
      prefix.slice(-immediateCount).every(a=>a.grade==='immediate');
  });
  if (wasMastered && attempts.at(-1).grade==='miss') return 'consolidating';
  if (success.length >= policy.consolidation.minSuccessfulReviews && distinctReviewDays(success) >= policy.consolidation.minDistinctDays) return 'consolidating';
  return 'learning';
}
export function nextDueAt(wordId, discoveries, allAttempts, policy=DEFAULT_POLICY) {
  const discovered = discoveries.find(d=>d.wordId === wordId);
  if (!discovered) return null;
  const attempts=allAttempts.filter(a=>a.wordId===wordId && !a.repeatInSession && a.direction!=='association-to-word-meaning').sort((a,b)=>a.timestamp-b.timestamp);
  if (!attempts.length) return discovered.timestamp;
  const last=attempts.at(-1);
  let days=policy.intervals.missDays;
  if (last.grade==='hint') days=policy.intervals.hintDays;
  else if(last.grade==='association') days=policy.intervals.associationDays;
  else if(last.grade==='immediate') {
    const streak=[];
    for(let i=attempts.length-1;i>=0 && attempts[i].grade==='immediate';i--) streak.push(attempts[i]);
    days=policy.intervals.immediateDays[Math.min(streak.length-1,policy.intervals.immediateDays.length-1)];
  }
  return last.timestamp + days*DAY;
}
export function shuffle(list, random=Math.random) {
  const copy=[...list]; for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];} return copy;
}
export function orderEntries(entries, mode, attempts, discoveries, now=Date.now()) {
  if (mode==='random') return shuffle(entries);
  if (mode==='alphabetical') return [...entries].sort((a,b)=>a.word.localeCompare(b.word,'es'));
  const lastGrade=id=>[...attempts].reverse().find(a=>a.wordId===id && !a.repeatInSession && a.direction!=='association-to-word-meaning')?.grade;
  const due=id=>{const date=nextDueAt(id,discoveries,attempts);return date!==null && date<=now;};
  const score=e=>{
    const failed=lastGrade(e.id)==='miss';const pending=due(e.id);
    if(mode==='failed') return failed?0:1;
    if(mode==='due') return pending?0:1;
    return failed&&pending?0:failed?1:pending?2:3;
  };
  return shuffle(entries).sort((a,b)=>score(a)-score(b));
}

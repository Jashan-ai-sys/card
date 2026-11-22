// Picks the scripted persona answer for a question. Tested by persona.test.js.
// Keys match at the start of a word ("hallucinat" catches "hallucinate"), never inside one,
// so "accurate" doesn't hit "rates". Entries are checked by `matchOrder`, then config order.
window.makeAnswerer = (profile) => {
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matchers = profile.persona
    .map((p) => ({ p, re: new RegExp(`\\b(${p.keys.map(escapeRe).join("|")})`, "i") }))
    .sort((a, b) => (a.p.matchOrder ?? 99) - (b.p.matchOrder ?? 99));
  return (question) => {
    const hit = matchers.find((m) => m.re.test(question));
    return hit ? hit.p.a : profile.personaFallback;
  };
};

// Run: node persona.test.js — checks the persona picks the right answer for real visitor questions.
const assert = require("node:assert");
global.window = {};
require("./config.js");
require("./persona.js");

const P = window.PROFILE;
const answer = window.makeAnswerer(P);
const topic = (q) => P.persona.find((p) => p.q === q).a;

const cases = [
  ...P.persona.map((p) => [p.q, p.a]), // every chip answers itself
  ["Tell me about yourself", topic("What do you build?")],
  ["Can you integrate with our CRM?", topic("What do you build?")],
  ["Can your agents call customers?", topic("What do you build?")],
  ["What does it cost?", topic("How do I hire you?")],
  ["I want to hire you to build a bot", topic("How do I hire you?")],
  ["How accurate is it?", topic("How do you test them?")],
  ["Does it hallucinate?", topic("How do you test them?")],
  ["Can it work on our servers?", topic("Can it run on our servers?")],
  ["separate question", P.personaFallback], // "rates" must not match inside "separate"
  ["what is your favourite food", P.personaFallback],
];

for (const [q, want] of cases) assert.strictEqual(answer(q), want, `wrong answer for: ${q}`);
console.log(`ok: ${cases.length} persona cases`);

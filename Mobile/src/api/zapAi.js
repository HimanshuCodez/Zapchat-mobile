const GREETING_RE = /\b(hi|hello|hey|yo|sup)\b/i;
const THANKS_RE = /\b(thanks|thank you|thx|appreciate)\b/i;
const HOW_ARE_YOU_RE = /how (are|r) (you|u)/i;
const NAME_RE = /\b(your name|who are you)\b/i;
const HELP_RE = /\b(help|what can you do|features)\b/i;
const TIME_RE = /\b(time|date|today)\b/i;
const JOKE_RE = /\b(joke|funny|laugh)\b/i;
const BYE_RE = /\b(bye|goodbye|see ya|later)\b/i;

const JOKES = [
  "Why don't programmers like nature? It has too many bugs.",
  'I told my Wi-Fi router a joke. No response — bad connection.',
  "Why did the developer go broke? Because they used up all their cache.",
];

const FALLBACKS = [
  "I'm still learning — I don't have a live AI backend wired up yet, but I'm happy to chat!",
  "That's interesting! Tell me more, or ask me for the time, a joke, or what I can do.",
  "I hear you. Right now I'm running on simple built-in logic rather than a real model.",
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export async function getZapAiReply(message) {
  const text = (message || '').trim();

  await new Promise((resolve) => setTimeout(resolve, 550 + Math.random() * 550));

  if (!text) {
    return "Say something and I'll respond!";
  }
  if (GREETING_RE.test(text)) {
    return 'Hey there! I\'m Zap AI ⚡ How can I help you today?';
  }
  if (THANKS_RE.test(text)) {
    return "You're welcome! Anything else on your mind?";
  }
  if (HOW_ARE_YOU_RE.test(text)) {
    return "I'm just a bunch of code, but I'm running smoothly! How about you?";
  }
  if (NAME_RE.test(text)) {
    return "I'm Zap AI, your assistant inside ZapChat ⚡";
  }
  if (HELP_RE.test(text)) {
    return "I can chat, tell jokes, or just keep you company. Try asking me the time or for a joke!";
  }
  if (TIME_RE.test(text)) {
    return `Right now it's ${new Date().toLocaleString()}.`;
  }
  if (JOKE_RE.test(text)) {
    return pick(JOKES);
  }
  if (BYE_RE.test(text)) {
    return 'See you later! I\'ll be right here whenever you need me. ⚡';
  }

  return pick(FALLBACKS);
}

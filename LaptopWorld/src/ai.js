// Simple AI helper placeholder. Replace internals with a real API call when ready.
require('dotenv').config();

async function askAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY not set in environment');
  }
  // Placeholder: implement actual API call to OpenAI or another provider.
  return `AI placeholder response for prompt: ${prompt}`;
}

module.exports = { askAI };

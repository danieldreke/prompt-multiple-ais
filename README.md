# Prompt Multiple AIs

![Claude](https://img.shields.io/badge/Built_With-Claude-D97757?style=flat&logo=claude&logoColor=D97757) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Chrome extension that sends the same prompt to multiple AI chatbots simultaneously.

## Features

- New tab override with a prompt textarea
- Toggle individual AIs on/off
- Omnibox shortcut (`pp`) to fire prompts without opening a new tab

## Installation

1. Clone or download this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select this folder

## Usage

### New tab

Type your prompt and press **Ctrl+Enter** (or click Send). Click any pill to toggle that AI on or off.

### URL bar shortcut

Type `pp` in the address bar, then a space, then one of:

| Input           | Behavior                                                                |
| --------------- | ----------------------------------------------------------------------- |
| `pp <query>`    | Send to all enabled AIs                                                 |
| `pp cg <query>` | Send to specific AIs by key (combinable, e.g. `cg` for Claude and grok) |
| `pp 3 <query>`  | Send to first 3 AIs                                                     |

### Supported AIs

| ID  | Key | Service    |
| --- | --- | ---------- |
| 1   | `c` | Claude     |
| 2   | `g` | Grok       |
| 3   | `p` | Perplexity |
| 4   | `m` | Gemini     |
| 5   | `o` | ChatGPT    |
| 6   | `d` | DeepSeek   |
| 7   | `q` | Qwen       |
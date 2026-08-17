# 1min.ai Image Bulk Generator

A modern, fast, and secure React interface for interacting with 1min.ai's image generation and upscaling APIs. Designed to handle bulk-processing asynchronously via pasting prompts or uploading a `.txt` file.

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Lumi-Script/1min-API-ImageGen)

## Features

- 🚀 **Multi-threaded Bulk Generation:** Process up to 10 prompts concurrently (streamlined via the React client).
- 📁 **Smart File System Access:** Saves outputs instantly to a chosen desktop folder without zip bottlenecks, or defaults to a clean ZIP download.
- 🌐 **Cloudflare Worker CORS Proxy:** A built-in `_worker.ts` script that securely bypasses browser CORS errors when downloading generated images from 1min.ai servers.
- 🎨 **Dynamic Configs:** Dynamically swaps configuration menus ensuring strict compatibility with models like GPT Image, Flux, and Dzine.
- ⚡ **Gemini Prompt Generation:** Brainstorm 5, 10, or 50 high-quality prompts instantly using Google AI Studio.
- 🔒 **Local & Secure:** Your API keys are strictly saved in `localStorage` and requests are executed locally from your browser.

## Setup & Deployment

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Set your 1min.ai API Key as an environment variable:
   - **Windows CMD:** `set API_KEY=your_key_here`
   - **Windows PSH:** `$env:API_KEY="your_key_here"`
   - **Linux/macOS:** `export API_KEY="your_key_here"`

3. Create a `prompts.txt` file in the root directory. Place each image generation prompt (or asset path for bulk upscaling) on a new line.

## Usage

You can run the script by passing the target algorithm name. You can use either the system internal name or the Clean Human Name. Have prompts.txt with the image prompts for each image line separated. 

**Basic Image Generation:**
```bash
npm start GPTImage1Mini
npm start Flux2-9B
```

**Dzine (With Custom Styles):**
Dzine requires a style code or style name as the second argument, and an optional intensity as the third argument.
```bash
# Using a style name
npm start Dzine "Anime"
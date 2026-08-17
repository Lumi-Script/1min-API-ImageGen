# 1min.ai Image Generator & Upscaler

A multi-threaded, robust command-line script for interacting with 1min.ai's image generation and upscaling APIs. Designed to handle bulk-processing asynchronously via a `prompts.txt` file and safely organizes generated images into structured directories.

## Features

- 🚀 **Multi-threaded Bulk Generation:** Process up to 10 prompts concurrently using `p-limit`.
- 📁 **Smart Organization:** Automatically sorts outputs into dedicated `images/[AlgorithmName]/image_###` folders.
- 🛡️ **Conflict Resolution:** Prevents overwrites by appending `_01`, `_02` to filenames if they already exist.
- 🤖 **Multiple Models Supported:** Generate images using GPTImage1, GPTImage1Mini, GPTImage2, Flux2-4B, and Flux2-9B.
  - 🎨 **Dzine Style Support:** Pick from a vast array of Dzine styles dynamically.
- 🔍 **Image Upscaling:** Directly pass a filepath or URL via the CLI to instantly upscale.
- ✨ **Human-Readable Commands:** Use easy-to-remember names (like `GPTImage1Mini`) or their system aliases.

## Setup

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

# Using a style code and intensity
npm start Dzine 12345 0.8
```

**Image Upscaling:**
Upscaling can process files line-by-line via `prompts.txt` just like generators, or you can bypass the file entirely and provide a single image path directly:
```bash
npm start Upscaled "images/your_uploaded_image_path.png"
```

## Supported Algorithms

You can pass any of the following names into the CLI:

- **GPTImage1** (Aliases: `gpt-image-1`, `gpt1`)
- **GPTImage1Mini** (Aliases: `gpt-image-1-mini`, `gpt-mini`)
- **GPTImage2** (Aliases: `gpt-image-2`, `gpt2`)
- **Flux2-4B** (Aliases: `flux-2-klein-4b`)
- **Flux2-9B** (Aliases: `flux-2-klein-9b`)
- **Upscaled** (Aliases: `upscale`)
- **Dzine** (Aliases: `dzine`)

## Output

All generated assets are safely stored within the `images/` directory at the root of the project, categorized by the Human Name of the algorithm used:
```text
images/
├── GPTImage1Mini/
│   ├── image_001.webp
│   └── image_002.webp
└── Upscaled/
    └── image_001.png
```

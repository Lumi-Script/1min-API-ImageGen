import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import fetch from 'node-fetch';
import {
    DzineStyles,
    DEFAULT_DZINE_PROMPT_OBJECT,
    DEFAULT_GPT_IMAGE_1_PROMPT_OBJECT,
    DEFAULT_GPT_IMAGE_2_PROMPT_OBJECT,
    DEFAULT_FLUX_PROMPT_OBJECT,
    DEFAULT_UPSCALER_PROMPT_OBJECT,
    MethodConfig,
    DzinePromptConfig,
    GptImage1PromptConfig,
    GptImage2PromptConfig,
    FluxPromptConfig,
    StableImageUpscalerPromptConfig,
    HUMAN_NAME_MAP
} from './constants';

const API_URL = "https://api.1min.ai/api/features";
const API_KEY = process.env.API_KEY;
const PROMPTS_FILE = "prompts.txt";
const CONCURRENCY_LIMIT = 10;

const limit = pLimit(CONCURRENCY_LIMIT);

interface ApiResponse {
    aiRecord?: {
        temporaryUrl?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

const METHODS: Record<string, MethodConfig> = {
    "gpt-mini": {
        model: "gpt-image-1-mini",
        promptObject: { ...DEFAULT_GPT_IMAGE_1_PROMPT_OBJECT } as GptImage1PromptConfig
    },
    "gpt-image-1-mini": {
        model: "gpt-image-1-mini",
        promptObject: { ...DEFAULT_GPT_IMAGE_1_PROMPT_OBJECT } as GptImage1PromptConfig
    },
    "gpt1": {
        model: "gpt-image-1",
        promptObject: { ...DEFAULT_GPT_IMAGE_1_PROMPT_OBJECT } as GptImage1PromptConfig
    },
    "gpt-image-1": {
        model: "gpt-image-1",
        promptObject: { ...DEFAULT_GPT_IMAGE_1_PROMPT_OBJECT } as GptImage1PromptConfig
    },
    "gpt2": {
        model: "gpt-image-2",
        promptObject: { ...DEFAULT_GPT_IMAGE_2_PROMPT_OBJECT } as GptImage2PromptConfig
    },
    "gpt-image-2": {
        model: "gpt-image-2",
        promptObject: { ...DEFAULT_GPT_IMAGE_2_PROMPT_OBJECT } as GptImage2PromptConfig
    },
    "flux-2-klein-4b": {
        model: "black-forest-labs/flux-2-klein-4b",
        promptObject: { ...DEFAULT_FLUX_PROMPT_OBJECT } as FluxPromptConfig
    },
    "flux-2-klein-9b": {
        model: "black-forest-labs/flux-2-klein-9b",
        promptObject: { ...DEFAULT_FLUX_PROMPT_OBJECT } as FluxPromptConfig
    },
    "dzine": {
        model: "dzine",
        promptObject: { ...DEFAULT_DZINE_PROMPT_OBJECT } as DzinePromptConfig
    },
    "upscale": {
        model: "stable-image",
        type: "IMAGE_UPSCALER",
        inputField: "imageUrl",
        promptObject: { ...DEFAULT_UPSCALER_PROMPT_OBJECT } as StableImageUpscalerPromptConfig
    }
};

async function generateImage(prompt: string, index: number, methodConfig: MethodConfig, methodName: string): Promise<void> {
    const paddedIndex = String(index).padStart(3, '0');
    const ext = (methodConfig.promptObject as any)?.output_format || 'webp';
    
    const safeModelName = HUMAN_NAME_MAP[methodName] || methodName.replace(/[\/\\]/g, '-');
    const outDir = path.join('images', safeModelName);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    let filename = path.join(outDir, `image_${paddedIndex}.${ext}`);
    let suffixCounter = 1;
    while (fs.existsSync(filename)) {
        const paddedSuffix = String(suffixCounter).padStart(2, '0');
        filename = path.join(outDir, `image_${paddedIndex}_${paddedSuffix}.${ext}`);
        suffixCounter++;
    }

    const payload = {
        type: methodConfig.type || "IMAGE_GENERATOR",
        model: methodConfig.model,
        promptObject: {
            [methodConfig.inputField || "prompt"]: prompt,
            ...methodConfig.promptObject
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'API-KEY': API_KEY || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = (await response.json()) as ApiResponse;
        const tempUrl = data?.aiRecord?.temporaryUrl;

        if (tempUrl) {
            const imgRes = await fetch(tempUrl);
            const buffer = await imgRes.buffer();
            fs.writeFileSync(filename, buffer);
            console.log(`[${paddedIndex}] Success!`);
        } else {
            console.error(`[${paddedIndex}] Error: No URL found in API response.`);
        }
    } catch (err: any) {
        console.error(`[${paddedIndex}] Failed: ${err.message}`);
    }
}

async function main(): Promise<void> {
    // Check if API key exists
    if (!API_KEY) {
        console.error("================================================================");
        console.error("❌ ERROR: API_KEY is missing!");
        console.error("Please provide your API key as an environment variable.");
        console.error("");
        console.error("Windows CMD:   set API_KEY=your_key_here");
        console.error("Windows PSH:   $env:API_KEY='your_key_here'");
        console.error("Linux/macOS:   export API_KEY='your_key_here'");
        console.error("================================================================");
        process.exit(1);
    }

    let methodName = process.argv[2] || "gpt-mini";

    // If the user provided a human name (e.g. GPTImage1Mini), map it to the system key
    const humanNameEntry = Object.entries(HUMAN_NAME_MAP).find(
        ([sys, hum]) => hum.toLowerCase() === methodName.toLowerCase()
    );
    if (humanNameEntry) {
        methodName = humanNameEntry[0];
    }

    const methodConfig = METHODS[methodName];

    if (!methodConfig) {
        console.error(`❌ ERROR: Unknown method '${methodName}'. Available methods: ${Object.keys(METHODS).join(', ')}`);
        process.exit(1);
    }

    if (methodName === "dzine") {
        const styleArg = process.argv[3];
        const intensityArg = process.argv[4];
        const dzinePrompt = methodConfig.promptObject as DzinePromptConfig;
        if (styleArg) {
            const query = styleArg.trim().toLowerCase();
            const matchedStyle = DzineStyles.find(s => 
                s.style_code.toLowerCase() === query ||
                s.name.toLowerCase() === query
            );

            if (!matchedStyle) {
                console.error(`❌ ERROR: Dzine style '${styleArg}' not found in available styles.`);
                console.error(`Please provide a valid style name or style_code ID from constants.ts / dzine.json.`);
                process.exit(1);
            }

            dzinePrompt.style_code = matchedStyle.style_code;
            dzinePrompt.style_base_model = matchedStyle.style_base_model;
            // Default to style_intensity from dzine.json unless explicitly set
            if (intensityArg !== undefined && !isNaN(parseFloat(intensityArg))) {
                dzinePrompt.style_intensity = parseFloat(intensityArg);
            } else {
                dzinePrompt.style_intensity = matchedStyle.style_intensity;
            }
            console.log(`🎨 Selected Dzine Style: "${matchedStyle.name}" [${matchedStyle.style_code}] (Base: ${matchedStyle.style_base_model}, Intensity: ${dzinePrompt.style_intensity})`);
        } else {
            if (intensityArg !== undefined && !isNaN(parseFloat(intensityArg))) {
                dzinePrompt.style_intensity = parseFloat(intensityArg);
            }
            const defaultName = DzineStyles.find(s => s.style_code === dzinePrompt.style_code)?.name || "Default";
            console.log(`🎨 Using default Dzine style: "${defaultName}" [${dzinePrompt.style_code}] (Base: ${dzinePrompt.style_base_model}, Intensity: ${dzinePrompt.style_intensity})`);
        }
    }

    let prompts: string[] = [];
    if (methodName === "upscale" && process.argv[3]) {
        prompts.push(process.argv[3]);
    } else {
        if (!fs.existsSync(PROMPTS_FILE)) {
            console.error(`❌ ERROR: Could not find ${PROMPTS_FILE} in the directory.`);
            process.exit(1);
        }
        prompts = fs.readFileSync(PROMPTS_FILE, 'utf-8').split('\n').filter(p => p.trim());
    }

    console.log(`Starting generation for ${prompts.length} prompts using method '${methodName}'...`);
    
    const tasks = prompts.map((p, i) => limit(() => generateImage(p, i + 1, methodConfig, methodName)));
    await Promise.all(tasks);
    console.log('Finished!');
}

main();

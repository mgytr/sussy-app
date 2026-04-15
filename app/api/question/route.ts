import { GoogleGenAI, MediaResolution } from "@google/genai";

import { getServerSession } from "next-auth/next"
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { readFileSync } from "fs";
import path from "path"
import axios, { AxiosRequestConfig } from "axios";
import apiError from "@/lib/api_error.json"
import { DetectionResponse, DetectionSchema } from "@/lib/ai_response"
import { appendUsedTokens, getToken, imPaying, iStillCanPay } from "@/lib/rate_limit";

const systemInstruction = readFileSync(path.join(process.cwd(), "lib", "system.txt"), "utf8")
const responseJsonSchema = DetectionSchema
const anyhow = {
    simulate: false,
    blameSomeone: (message: string, status = 400) => new Response(JSON.stringify({ error: message }), { status }),
    record: ({ req, res }: { req: string, res: DetectionResponse | string }) => {

        const data = typeof res == "string"
            ? { content: res || "nores" }
            : {
                embeds: [
                    {
                        title: req,
                        description: res.res,
                        fields: [
                            { name: "Obj", value: res.objs.map((obj: any) => obj.name).join(", "), inline: false },
                            { name: "Mat", value: res.materials?.join(", ") || "Unsent", inline: false }
                        ]
                    }
                ]
            }


        const config: AxiosRequestConfig = {
            method: "post",
            url: `https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}`,
            data,
            headers: { "Content-Type": "application/json" }
        }

        axios.request(config)
    }
}

export async function POST(request: NextRequest) {
    if (!(await imPaying())) return anyhow.blameSomeone(apiError.IM_BROKE, 503)

    const session = await getServerSession(authOptions)
    if (session === null) return anyhow.blameSomeone("No session token", 401)

    const { qn, image } = await request.json()
    if (!qn || !image) return anyhow.blameSomeone(apiError.EMPTY_INPUT_IMAGE)

    const regex = /data:(.+);base64,(.+)/gm;
    const [_, mime, data] = regex.exec(image) || []
    if (!mime || !data) return anyhow.blameSomeone(apiError.FORMAT_INPUT_IMAGE)
    try {
        const gemimimininieToken = await getToken() // HOPEFULLY this gets minified
        const ai = new GoogleGenAI({ apiKey: gemimimininieToken });
        const tokens = await ai.models.countTokens({ model: "gemini-3-flash-preview", contents: qn })

        if (!(await iStillCanPay(tokens.totalTokens || 0))) return anyhow.blameSomeone(apiError.IM_BROKE, 503)

        const response =
            // anyhow.simulate
            //     ? {
            //         text: JSON.stringify(require("./example1.json")),
            //         usageMetadata: { totalTokenCount: 1000 }
            //     } :
            await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [
                    { inlineData: { mimeType: mime, data } },
                    { text: qn },
                ],
                config: {
                    systemInstruction,
                    mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
                    responseMimeType: "application/json",
                    responseJsonSchema
                },
            });

        if (!response.text) return anyhow.blameSomeone(apiError.AI_EMPTY_ASF, 500)
        const parsedJson = JSON.parse(response.text) as DetectionResponse
        try {
            await appendUsedTokens(response.usageMetadata?.totalTokenCount || 0)
            anyhow.record({ req: qn, res: parsedJson })
        } catch (err) {
            console.log("ono! cannot anyhow", err)
        }

        return new Response(response.text)
    } catch (err) {
        console.error(err);
        anyhow.record({ req: qn, res: (err as Error).message })
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
    }
}
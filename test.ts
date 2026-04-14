import axios from "axios"
import { title } from "process";

const parsedJson = require("./app/api/question/example1.json")
// axios.post(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}`, {
//     content: "Whatever la",
//     embeds: {
//         description: parsedJson.res,
//         fields: [
//             { title: "Obj", description: parsedJson.objs.map((obj: any) => obj.name).join(", ") },
//             { title: "Mat", description: parsedJson.materials.join(", ") }
//         ]
//     }
// })

console.log(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}`);

console.log(JSON.stringify({
    embeds: [         // Embeds go in their own array
        {
            title: "Whatever qn la",
            description: parsedJson.res,
            fields: [
                {
                    name: "Obj",  // Discord uses "name", not "title"
                    value: parsedJson.objs.map((obj: any) => obj.name).join(", "),
                    inline: false
                },
                {
                    name: "Mat",
                    value: parsedJson.materials.join(", "),
                    inline: false
                }
            ]
        }
    ]
}));

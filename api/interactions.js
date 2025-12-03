import crypto from "crypto";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method not allowed");
    }

    const rawBody = JSON.stringify(req.body);
    const PUBLIC_KEY = process.env.PUBLIC_KEY;

    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];

    const isValid = crypto.verify(
        null,
        Buffer.from(timestamp + rawBody),
        {
            key: Buffer.from(PUBLIC_KEY, "hex"),
            format: "der",
            type: "spki"
        },
        Buffer.from(signature, "hex")
    );

    if (!isValid) {
        return res.status(401).send("Invalid request signature");
    }

    const interaction = req.body;

    if (interaction.type === 1) {
        return res.status(200).json({ type: 1 });
    }

    if (interaction.type === 3) {
        const message = interaction.data?.resolved?.messages?.[interaction.data.target_id];

        if (message && message.content?.startsWith(".")) {
            const cmd = message.content.slice(1);

            if (cmd === "c&d") {
                return res.status(200).json({
                    type: 4,
                    data: {
                        content:
"Groovy is being shut down as we have received a cease and desist from YouTube.\n\nFind more info at: https://www.theverge.com/2021/8/24/22640024/youtube-discord-groovy-music-bot-closure"
                    }
                });
            }

            if (cmd === "ping") {
                const start = Date.now();
                const ping = Math.min(Date.now() - start, 999);
                const formatted = String(ping).padStart(3, "0");
                return res.status(200).json({
                    type: 4,
                    data: {
                        content: `Ping: \`${formatted}ms\``
                    }
                });
            }
        }

        const botId = interaction.application_id;

        if (
            message &&
            message.content.includes(`<@${botId}>`) &&
            message.content.toLowerCase().includes("help")
        ) {
            return res.status(200).json({
                type: 4,
                data: {
                    embeds: [
                        {
                            title: "Groovy",
                            color: 0x79a5fa,
                            description:
"Groovy is the easiest way to play music in your Discord server. It supports Spotify, YouTube, Soundcloud and more!\n\nTo get started, join a voice channel and `-play` a song. You can use song names, video links, and playlist links.\n\nCommands\nA full list of commands is available here.\n\nPremium\nGroovy Premium gives you access to cool features, like volume control, 24/7 mode, audio effects, and saved queues.\n\nInvite\nGroovy can be added to as many servers as you want.\n\nSupport\nClick here to talk to our support team if you're having trouble or have any questions."
                        }
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 5,
                                    label: "Invite",
                                    url: "https://groovy.bot/invite"
                                },
                                {
                                    type: 2,
                                    style: 5,
                                    label: "Commands",
                                    url: "https://groovy.bot/commands"
                                },
                                {
                                    type: 2,
                                    style: 5,
                                    label: "Premium",
                                    url: "https://groovy.bot/premium"
                                },
                                {
                                    type: 2,
                                    style: 5,
                                    label: "Support",
                                    url: "https://groovy.bot/support"
                                }
                            ]
                        }
                    ]
                }
            });
        }
    }

    return res.status(200).json({});
}
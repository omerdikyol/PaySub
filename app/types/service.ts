export type ServiceCategory = {
    id: string;
    name: string;
    services: SubscriptionService[];
};

export type SubscriptionService = {
    id: string;
    name: string;
    logo: string; // URL or require path
    defaultPrice?: number;
    defaultCurrency?: string;
};

export const PREDEFINED_SERVICES: ServiceCategory[] = [
    {
        id: 'streaming-video',
        name: 'Streaming Video',
        services: [
            {
                id: 'netflix',
                name: 'Netflix',
                logo: require('@/assets/services/netflix.png'),
                defaultPrice: 149.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'disney-plus',
                name: 'Disney+',
                logo: require('@/assets/services/disney-plus.png'),
                defaultPrice: 134.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'prime-video',
                name: 'Amazon Prime',
                logo: require('@/assets/services/prime-video.png'),
                defaultPrice: 39.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'blutv',
                name: 'BluTV',
                logo: require('@/assets/services/blutv.png'),
                defaultPrice: 139.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'exxen',
                name: 'EXXEN',
                logo: require('@/assets/services/exxen.png'),
                defaultPrice: 160.99,
                defaultCurrency: 'TRY'
            }
        ]
    },
    {
        id: 'streaming-music',
        name: 'Streaming Music',
        services: [
            {
                id: 'spotify',
                name: 'Spotify',
                logo: require('@/assets/services/spotify.png'),
                defaultPrice: 59.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'apple-music',
                name: 'Apple Music',
                logo: require('@/assets/services/apple-music.png'),
                defaultPrice: 39.99,
                defaultCurrency: 'TRY'
            }
        ]
    },
    {
        id: 'social-streaming',
        name: 'Social & Streaming',
        services: [
            {
                id: 'youtube',
                name: 'YouTube Premium',
                logo: require('@/assets/services/youtube.png'),
                defaultPrice: 79.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'twitter-premium',
                name: 'X Premium',
                logo: require('@/assets/services/twitter.png'),
                defaultPrice: 49.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'twitch',
                name: 'Twitch Subscription',
                logo: require('@/assets/services/twitch.png'),
                defaultPrice: 9.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'kick',
                name: 'Kick Subscription',
                logo: require('@/assets/services/kick.png'),
                defaultPrice: 199.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'discord',
                name: 'Discord Nitro',
                logo: require('@/assets/services/discord.png'),
                defaultPrice: 37.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'onlyfans',
                name: 'OnlyFans',
                logo: require('@/assets/services/onlyfans.png'),
                defaultPrice: 99.99,
                defaultCurrency: 'TRY'
            }
        ]
    },
    {
        id: 'gaming',
        name: 'Gaming',
        services: [
            {
                id: 'xbox',
                name: 'Xbox Game Pass',
                logo: require('@/assets/services/xbox.png'),
                defaultPrice: 209.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'playstation',
                name: 'PlayStation Plus',
                logo: require('@/assets/services/playstation.png'),
                defaultPrice: 179.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'nvidia-geforce-now',
                name: 'NVIDIA GeForce Now',
                logo: require('@/assets/services/nvidia-geforce-now.png'),
                defaultPrice: 340.99,
                defaultCurrency: 'TRY'
            }
        ]
    },
    {
        id: 'ai-cloud',
        name: 'AI & Cloud',
        services: [
            {
                id: 'chatgpt',
                name: 'ChatGPT Plus',
                logo: require('@/assets/services/chatgpt.png'),
                defaultPrice: 499.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'google-drive',
                name: 'Google Drive',
                logo: require('@/assets/services/google-drive.png'),
                defaultPrice: 99.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'icloud',
                name: 'iCloud+',
                logo: require('@/assets/services/icloud.png'),
                defaultPrice: 49.99,
                defaultCurrency: 'TRY'
            }
        ]
    },
    {
        id: 'professional',
        name: 'Professional',
        services: [
            {
                id: 'linkedin',
                name: 'LinkedIn Premium',
                logo: require('@/assets/services/linkedin.png'),
                defaultPrice: 149.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'adobe',
                name: 'Adobe Creative Cloud',
                logo: require('@/assets/services/adobe.png'),
                defaultPrice: 459.99,
                defaultCurrency: 'TRY'
            },
            {
                id: 'zoom',
                name: 'Zoom Pro',
                logo: require('@/assets/services/zoom.png'),
                defaultPrice: 149.99,
                defaultCurrency: 'TRY'
            }
        ]
    }
];

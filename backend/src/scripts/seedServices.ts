import { collections } from '../config/firebase';

const services = [
  // Streaming Video
  {
    id: 'netflix',
    name: 'Netflix',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/netflix.png',
    defaultPrice: 149.99,
    defaultCurrency: 'TRY',
    category: 'streaming_video'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/disney-plus.png',
    defaultPrice: 134.99,
    defaultCurrency: 'TRY',
    category: 'streaming_video'
  },
  {
    id: 'prime-video',
    name: 'Amazon Prime',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/prime-video.png',
    defaultPrice: 39.99,
    defaultCurrency: 'TRY',
    category: 'streaming_video'
  },
  {
    id: 'blutv',
    name: 'BluTV',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/blutv.png',
    defaultPrice: 139.99,
    defaultCurrency: 'TRY',
    category: 'streaming_video'
  },
  {
    id: 'exxen',
    name: 'EXXEN',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/exxen.png',
    defaultPrice: 160.99,
    defaultCurrency: 'TRY',
    category: 'streaming_video'
  },
  // Streaming Music
  {
    id: 'spotify',
    name: 'Spotify',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/spotify.png',
    defaultPrice: 59.99,
    defaultCurrency: 'TRY',
    category: 'streaming_music'
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/apple-music.png',
    defaultPrice: 39.99,
    defaultCurrency: 'TRY',
    category: 'streaming_music'
  },
  // Social & Streaming
  {
    id: 'youtube',
    name: 'YouTube Premium',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/youtube.png',
    defaultPrice: 79.99,
    defaultCurrency: 'TRY',
    category: 'social_streaming'
  },
  {
    id: 'twitter-premium',
    name: 'X Premium',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/twitter.png',
    defaultPrice: 49.99,
    defaultCurrency: 'TRY',
    category: 'social_streaming'
  },
  {
    id: 'twitch',
    name: 'Twitch Subscription',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/twitch.png',
    defaultPrice: 9.99,
    defaultCurrency: 'TRY',
    category: 'social_streaming'
  },
  {
    id: 'kick',
    name: 'Kick Subscription',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/kick.png',
    defaultPrice: 199.99,
    defaultCurrency: 'TRY',
    category: 'social_streaming'
  },
  {
    id: 'discord',
    name: 'Discord Nitro',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/discord.png',
    defaultPrice: 37.99,
    defaultCurrency: 'TRY',
    category: 'social_streaming'
  },
  {
    id: 'onlyfans',
    name: 'OnlyFans',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/onlyfans.png',
    defaultPrice: 99.99,
    defaultCurrency: 'TRY',
    category: 'social_streaming'
  },
  // Gaming
  {
    id: 'xbox',
    name: 'Xbox Game Pass',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/xbox.png',
    defaultPrice: 209.99,
    defaultCurrency: 'TRY',
    category: 'gaming'
  },
  {
    id: 'playstation',
    name: 'PlayStation Plus',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/playstation.png',
    defaultPrice: 179.99,
    defaultCurrency: 'TRY',
    category: 'gaming'
  },
  {
    id: 'nvidia-geforce-now',
    name: 'NVIDIA GeForce Now',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/nvidia-geforce-now.png',
    defaultPrice: 340.99,
    defaultCurrency: 'TRY',
    category: 'gaming'
  },
  // AI & Cloud
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/chatgpt.png',
    defaultPrice: 499.99,
    defaultCurrency: 'TRY',
    category: 'ai_cloud'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/google-drive.png',
    defaultPrice: 99.99,
    defaultCurrency: 'TRY',
    category: 'ai_cloud'
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/icloud.png',
    defaultPrice: 49.99,
    defaultCurrency: 'TRY',
    category: 'ai_cloud'
  },
  // Professional
  {
    id: 'linkedin',
    name: 'LinkedIn Premium',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/linkedin.png',
    defaultPrice: 149.99,
    defaultCurrency: 'TRY',
    category: 'professional'
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/adobe.png',
    defaultPrice: 459.99,
    defaultCurrency: 'TRY',
    category: 'professional'
  },
  {
    id: 'zoom',
    name: 'Zoom Pro',
    logo: 'https://raw.githubusercontent.com/omerdikyol/PaySub/main/assets/services/zoom.png',
    defaultPrice: 149.99,
    defaultCurrency: 'TRY',
    category: 'professional'
  }
];

const categories = [
  {
    id: 'streaming_video',
    name: 'Streaming Video'
  },
  {
    id: 'streaming_music',
    name: 'Streaming Music'
  },
  {
    id: 'social_streaming',
    name: 'Social & Streaming'
  },
  {
    id: 'gaming',
    name: 'Gaming'
  },
  {
    id: 'ai_cloud',
    name: 'AI & Cloud'
  },
  {
    id: 'professional',
    name: 'Professional'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Test database connection
    await collections.services.limit(1).get();
    console.log('Database connection successful');

    // Clear existing data
    console.log('Clearing existing data...');
    const servicesSnapshot = await collections.services.get();
    const categoriesSnapshot = await collections.serviceCategories.get();

    const deletePromises = [
      ...servicesSnapshot.docs.map(doc => {
        console.log(`Deleting service: ${doc.id}`);
        return doc.ref.delete();
      }),
      ...categoriesSnapshot.docs.map(doc => {
        console.log(`Deleting category: ${doc.id}`);
        return doc.ref.delete();
      })
    ];
    await Promise.all(deletePromises);
    console.log('Cleared existing data');

    // Insert categories
    console.log('Inserting categories...');
    const categoryPromises = categories.map(category => {
      console.log(`Creating category: ${category.name}`);
      return collections.serviceCategories.doc(category.id).set(category);
    });
    await Promise.all(categoryPromises);
    console.log('Categories seeded');

    // Insert services
    console.log('Inserting services...');
    const servicePromises = services.map(service => {
      console.log(`Creating service: ${service.name}`);
      return collections.services.doc(service.id).set(service);
    });
    await Promise.all(servicePromises);
    console.log('Services seeded');

    // Update categories with service references
    console.log('Updating category references...');
    const categoryUpdatePromises = categories.map(async category => {
      const categoryServices = services
        .filter(service => service.category === category.id)
        .map(service => service.id);
      
      console.log(`Updating category ${category.name} with ${categoryServices.length} services`);
      await collections.serviceCategories.doc(category.id).update({
        services: categoryServices
      });
    });
    await Promise.all(categoryUpdatePromises);
    console.log('Category references updated');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

// Run the seeding
console.log('Initializing database seeding...');
seedDatabase(); 
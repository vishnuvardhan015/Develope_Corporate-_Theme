import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const images = [
  { name: 'about_team.webp', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?fm=webp&w=800&q=80' },
  { name: 'avatar1.webp', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fm=webp&w=150&q=80' },
  { name: 'avatar2.webp', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=webp&w=150&q=80' },
  { name: 'pricing_managed.webp', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&w=600&q=80' },
  { name: 'pricing_cloud.webp', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?fm=webp&w=600&q=80' },
  { name: 'service_cloud.webp', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?fm=webp&w=600&q=80' },
  { name: 'service_cyber.webp', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?fm=webp&w=600&q=80' },
  { name: 'service_devops.webp', url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?fm=webp&w=600&q=80' },
  { name: 'service_data.webp', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&w=600&q=80' },
  { name: 'service_network.webp', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?fm=webp&w=600&q=80' },
  { name: 'service_custom.webp', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?fm=webp&w=600&q=80' },
  { name: 'team1.webp', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?fm=webp&w=400&q=80' },
  { name: 'team2.webp', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?fm=webp&w=400&q=80' },
  { name: 'team3.webp', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=webp&w=400&q=80' },
  { name: 'blog1.webp', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?fm=webp&w=600&q=80' },
  { name: 'blog2.webp', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?fm=webp&w=600&q=80' },
  { name: 'blog3.webp', url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?fm=webp&w=600&q=80' },
  { name: 'blog4.webp', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?fm=webp&w=600&q=80' },
  { name: 'blog5.webp', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&w=600&q=80' },
  { name: 'blog6.webp', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?fm=webp&w=600&q=80' },
];

async function downloadImages() {
  await fs.mkdir('./assets/images/new', { recursive: true });
  for (const img of images) {
    console.log(`Downloading ${img.name}...`);
    try {
      const response = await fetch(img.url);
      if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
      await fs.writeFile(`./assets/images/new/${img.name}`, Buffer.from(await response.arrayBuffer()));
    } catch (e) {
      console.error(`Failed to download ${img.name}: ${e.message}`);
    }
  }
}

downloadImages();

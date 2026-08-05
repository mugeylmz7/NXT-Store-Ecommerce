import { put } from '@vercel/blob';

export async function uploadProductImagesService(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    const uploadPromises = files.map(async (file) => {
      if (!file || file.size === 0) return null;
      
      const blob = await put(`products/${Date.now()}-${file.name}`, file, {
        access: 'public',
        addRandomSuffix: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return blob.url;
    });

    const urls = await Promise.all(uploadPromises);
    return urls.filter(Boolean) as string[];
  } catch (error) {
    console.error('Blob upload error in imageService:', error);
    return [];
  }
}
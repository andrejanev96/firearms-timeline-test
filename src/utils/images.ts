export const preloadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(src);
    img.src = src;
  });
};

export const preloadImages = (imageUrls: string[]): Promise<PromiseSettledResult<string>[]> => {
  return Promise.allSettled(imageUrls.map(preloadImage));
};
// Mapping local thumbnails to modules based on their category or title
export const getModuleThumbnail = (title: string = '', category: string = '') => {
  const titleLower = title.toLowerCase();
  const catLower = category.toLowerCase();
  
  if (titleLower.includes('code') || titleLower.includes('python') || catLower.includes('code') || catLower.includes('dev')) {
    return require('@/../assets/images/coding.png');
  } else if (titleLower.includes('copy') || titleLower.includes('write') || catLower.includes('copy') || catLower.includes('market')) {
    return require('@/../assets/images/copywriting.png');
  } else if (titleLower.includes('image') || titleLower.includes('art') || catLower.includes('image') || catLower.includes('visual')) {
    return require('@/../assets/images/image-gen.png');
  }
  
  return null;
};

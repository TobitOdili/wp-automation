export function validateColors(colors) {
  if (!Array.isArray(colors)) {
    throw new Error('Colors must be an array');
  }

  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  colors.forEach(color => {
    if (!color || !hexColorRegex.test(color)) {
      throw new Error(`Invalid color format: ${color}. Must be a valid hex color.`);
    }
  });

  return colors;
}
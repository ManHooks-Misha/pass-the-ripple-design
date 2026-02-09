import { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: string;
}

function Avatar({ src, name, size = "w-8 h-8" }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset error and loaded state when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [src]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
    ];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (src && !imageError) {
    return (
      <div className={`${size} relative rounded-full overflow-hidden`}>
        <img
          src={src}
          alt={name}
          className={`${size} rounded-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          loading="lazy"
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={(e) => {
            const img = e.currentTarget;
            // console.error('Avatar image failed to load:', {
            //   src,
            //   name,
            //   naturalWidth: img.naturalWidth,
            //   naturalHeight: img.naturalHeight,
            //   complete: img.complete
            // });

            setImageError(true);
            setImageLoaded(false);
          }}
        />
        {!imageLoaded && !imageError && (
          <div className={`absolute inset-0 ${size} rounded-full ${getBackgroundColor(name)} flex items-center justify-center text-white font-medium text-sm`}>
            {getInitials(name)}
          </div>
        )}
        {imageError && (
          <div className={`absolute inset-0 ${size} rounded-full ${getBackgroundColor(name)} flex items-center justify-center text-white font-medium text-sm`}>
            {getInitials(name)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${size} rounded-full ${getBackgroundColor(name)} flex items-center justify-center text-white font-medium text-sm`}>
      {getInitials(name)}
    </div>
  );
}

export { Avatar }
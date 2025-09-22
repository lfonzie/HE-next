import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends Omit<ImageProps, 'sizes'> {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

export function ResponsiveImage({ 
  className, 
  aspectRatio = 'auto',
  priority = false,
  loading = 'lazy',
  ...props 
}: ResponsiveImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: ''
  };

  // Generate responsive sizes based on container
  const getSizes = () => {
    if (aspectRatio === 'auto') {
      return '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw';
    }
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';
  };

  return (
    <div className={cn('relative overflow-hidden', aspectClasses[aspectRatio], className)}>
      <Image
        {...props}
        sizes={getSizes()}
        priority={priority}
        loading={loading}
        className="object-cover w-full h-full"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}

// Componente de exemplo para demonstrar o uso
export function ExampleImages() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="type-h2 font-bold">Imagens Responsivas</h2>
        <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
          Imagens otimizadas com lazy loading, blur placeholder e aspect ratios responsivos.
        </p>
      </div>

      <div className="space-y-6">
        {/* Aspect Ratios */}
        <div className="space-y-4">
          <h3 className="type-h4 font-semibold">Aspect Ratios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="type-small font-medium">Square</h4>
              <ResponsiveImage
                src="/placeholder-400x400.jpg"
                alt="Square image"
                aspectRatio="square"
                width={400}
                height={400}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="type-small font-medium">Video</h4>
              <ResponsiveImage
                src="/placeholder-400x225.jpg"
                alt="Video aspect image"
                aspectRatio="video"
                width={400}
                height={225}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="type-small font-medium">Portrait</h4>
              <ResponsiveImage
                src="/placeholder-300x400.jpg"
                alt="Portrait image"
                aspectRatio="portrait"
                width={300}
                height={400}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="type-small font-medium">Landscape</h4>
              <ResponsiveImage
                src="/placeholder-400x300.jpg"
                alt="Landscape image"
                aspectRatio="landscape"
                width={400}
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Grid de Imagens */}
        <div className="space-y-4">
          <h3 className="type-h4 font-semibold">Grid Responsivo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ResponsiveImage
                key={i}
                src={`/placeholder-${400 + i * 50}x${300 + i * 30}.jpg`}
                alt={`Image ${i + 1}`}
                aspectRatio="video"
                width={400}
                height={300}
                className="rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div className="space-y-4">
          <h3 className="type-h4 font-semibold">Hero Image</h3>
          <ResponsiveImage
            src="/placeholder-1200x600.jpg"
            alt="Hero image"
            aspectRatio="video"
            width={1200}
            height={600}
            priority
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

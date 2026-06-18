interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = 'h-10' }: BrandLogoProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt="eProtege"
      className={`block w-auto max-w-none shrink-0 object-contain ${className}`}
    />
  );
}

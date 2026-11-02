import { clsx } from 'clsx';
import './epic.css';

const ART_SIZE = {
  warrior: { width: 289, height: 440 },
  back: { width: 352, height: 440 },
  smith: { width: 218, height: 440 },
};

const FALLBACK_SIZE = { width: 289, height: 440 };

export const CardArt = ({ name, className }) => {
  if (['spartan-discipline', 'athena-wisdom', 'temple-foundation'].includes(name)) {
    return <img src={`/art/ui/${name}.webp`} alt="" aria-hidden="true" draggable="false"
      width="768" height="1152" loading="lazy" decoding="async" className={clsx('epic-card-art', className)} />;
  }
  const { width, height } = ART_SIZE[name] || FALLBACK_SIZE;

  return (
    <>
      <picture>
        <source srcSet={`/art/${name}-light.webp`} type="image/webp" />
        <img
          src={`/art/${name}-light.png`}
          alt="" aria-hidden="true" draggable="false"
          width={width} height={height}
          loading="lazy" decoding="async"
          className={clsx('card-art card-art-light', className)}
        />
      </picture>
      <picture>
        <source srcSet={`/art/${name}-dark.webp`} type="image/webp" />
        <img
          src={`/art/${name}-dark.png`}
          alt="" aria-hidden="true" draggable="false"
          width={width} height={height}
          loading="lazy" decoding="async"
          className={clsx('card-art card-art-dark', className)}
        />
      </picture>
    </>
  );
};
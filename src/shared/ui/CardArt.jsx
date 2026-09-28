const ART_SIZE = {
  warrior: { width: 289, height: 440 },
  back: { width: 352, height: 440 },
  smith: { width: 218, height: 440 },
};

const FALLBACK_SIZE = { width: 289, height: 440 };

export const CardArt = ({ name }) => {
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
          className="card-art card-art-light"
        />
      </picture>
      <picture>
        <source srcSet={`/art/${name}-dark.webp`} type="image/webp" />
        <img
          src={`/art/${name}-dark.png`}
          alt="" aria-hidden="true" draggable="false"
          width={width} height={height}
          loading="lazy" decoding="async"
          className="card-art card-art-dark"
        />
      </picture>
    </>
  );
};

export const CardArt = ({ name }) => (
  <>
    <img
      src={`/art/${name}-light.png`}
      alt="" aria-hidden="true" draggable="false"
      className="card-art card-art-light"
    />
    <img
      src={`/art/${name}-dark.png`}
      alt="" aria-hidden="true" draggable="false"
      className="card-art card-art-dark"
    />
  </>
);
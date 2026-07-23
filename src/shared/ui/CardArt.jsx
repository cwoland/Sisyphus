import { clsx } from 'clsx';

const base = 'pointer-events-none absolute select-none object-contain';
const mask = {
    maskImage: 'linear-gradient(to left, black 40%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 100%)',
};

export const CardArt = ({ name, className }) => (
    <>
    <img
        src={`/art/${name}-light.png`}
        alt="" aria-hidden="true" draggable="false"
        className={clsx(base, 'opacity=[0.10] mix-blend-multiply dark:hidden', className)}
        style={mask} />
    <img
        src={`/art/${name}-dark.png`}
        alt="" aria-hidden="true" draggable="false"
        className={clsx(base, 'opacity-[0.10] mix-blend-multiply dark:hidden', className)}
        style={mask} />
    </>
);
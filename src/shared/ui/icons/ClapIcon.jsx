const HAND = [
    'M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2',
    'M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2',
    'M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8',
    'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
];

const TICKS = ['M2.5 7.5h2.5', 'M4.3 2.4 6 4.1', 'M9.5 1.5V4'];

export const ClapIcon = ({ size = 17, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <g transform="translate(6.8 6.2) scale(0.7)">
            {HAND.map((d) => (
                <path key={d} d={d} vectorEffect="non-scaling-stroke" />
            ))}
        </g>
        {TICKS.map((d) => (
            <path key={d} d={d} />
        ))}
    </svg>
);
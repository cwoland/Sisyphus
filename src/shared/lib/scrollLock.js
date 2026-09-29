let locks = 0;
let savedY = 0;

export const lockScroll = () => {
  locks += 1;
  if (locks > 1) return;

  savedY = window.scrollY;
  const { style } = document.body;
  style.position = 'fixed';
  style.top = `-${savedY}px`;
  style.left = '0';
  style.right = '0';
  // bottom вместе с top держит бокс body до нижней границы вьюпорта.
  // Без него сдвинутый вверх body заканчивается раньше экрана, и снизу
  // остаётся полоса фона html.
  style.bottom = '0';
  style.width = '100%';
  style.overflow = 'hidden';
};

export const unlockScroll = () => {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;

  const { style } = document.body;
  style.position = '';
  style.top = '';
  style.left = '';
  style.right = '';
  style.bottom = '';
  style.width = '';
  style.overflow = '';
  window.scrollTo(0, savedY);
};

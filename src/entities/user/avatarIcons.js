import {
  Mountain, Dumbbell, Flame, Zap, Trophy, Target,
  Anchor, Rocket, Crown, Swords, Bike, Snowflake,
} from 'lucide-react';

export const avatarIcons = {
  Mountain, Dumbbell, Flame, Zap, Trophy, Target,
  Anchor, Rocket, Crown, Swords, Bike, Snowflake,
};

export const avatarIconNames = Object.keys(avatarIcons);

export const parseAvatar = (value) => {
  if (typeof value === 'string' && value.startsWith('lucide:')) {
    const name = value.slice(7);
    return { type: 'icon', Icon: avatarIcons[name] || null };
  }
  if (value) return { type: 'image', src: value };
  return { type: 'initials' };
};
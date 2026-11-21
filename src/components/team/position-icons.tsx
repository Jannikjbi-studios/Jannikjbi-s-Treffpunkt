"use client";

import { Camera, Code, Confetti, Cube, DeviceMobile, Handshake, Headset, Microphone, Palette, Scissors, ShieldCheck, Sword, Tent, UsersThree } from "@phosphor-icons/react/ssr";

const ICONS = {
  scissors: Scissors,
  phone: DeviceMobile,
  microphone: Microphone,
  sword: Sword,
  headset: Headset,
  palette: Palette,
  tent: Tent,
  handshake: Handshake,
  shield: ShieldCheck,
  code: Code,
  camera: Camera,
  cube: Cube,
  confetti: Confetti,
  users: UsersThree,
};
export const POSITION_ICON_KEYS_CLIENT = Object.keys(ICONS) as (keyof typeof ICONS)[];

export function PositionIconClient({ icon }: { icon: string }) {
  const I = ICONS[icon as keyof typeof ICONS] ?? UsersThree;
  return <I size={20} weight="duotone" aria-hidden />;
}

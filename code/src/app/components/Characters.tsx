// Left character: dark-skinned person waving with backpack
export function CharacterLeft() {
  return (
    <svg
      viewBox="0 0 160 280"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ maxWidth: 160 }}
    >
      {/* Body */}
      <ellipse cx="80" cy="185" rx="38" ry="50" fill="#F5C69B" />
      {/* Shirt */}
      <ellipse cx="80" cy="190" rx="38" ry="45" fill="#E8A96A" />
      {/* Head */}
      <circle cx="80" cy="90" r="42" fill="#6B3F1E" />
      {/* Face highlight */}
      <ellipse cx="80" cy="98" rx="28" ry="24" fill="#8B5128" />
      {/* Eyes */}
      <circle cx="68" cy="88" r="5" fill="white" />
      <circle cx="92" cy="88" r="5" fill="white" />
      <circle cx="69" cy="89" r="3" fill="#111" />
      <circle cx="93" cy="89" r="3" fill="#111" />
      {/* Smile */}
      <path d="M66 104 Q80 116 94 104" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Teeth */}
      <path d="M70 107 Q80 114 90 107" stroke="none" fill="white" />
      {/* Hair */}
      <ellipse cx="80" cy="55" rx="42" ry="20" fill="#2C1810" />
      {/* Left arm (raised/waving) */}
      <line x1="42" y1="170" x2="10" y2="120" stroke="#6B3F1E" strokeWidth="18" strokeLinecap="round" />
      <circle cx="10" cy="118" r="10" fill="#6B3F1E" />
      {/* Right arm (down) */}
      <line x1="118" y1="175" x2="138" y2="218" stroke="#6B3F1E" strokeWidth="18" strokeLinecap="round" />
      <circle cx="138" cy="220" r="10" fill="#6B3F1E" />
      {/* Legs */}
      <rect x="54" y="225" width="22" height="50" rx="11" fill="#3D2B1A" />
      <rect x="84" y="225" width="22" height="50" rx="11" fill="#3D2B1A" />
      {/* Shoes */}
      <ellipse cx="65" cy="274" rx="16" ry="8" fill="#1A1A1A" />
      <ellipse cx="95" cy="274" rx="16" ry="8" fill="#1A1A1A" />
      {/* Backpack */}
      <rect x="100" y="155" width="28" height="38" rx="8" fill="#6B8DD6" />
      <rect x="103" y="160" width="8" height="28" rx="4" fill="#5577C6" />
      <rect x="115" y="160" width="8" height="28" rx="4" fill="#5577C6" />
      {/* Backpack strap */}
      <path d="M100 162 Q88 175 100 188" stroke="#6B8DD6" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Right character: lighter-skinned person waving in green shirt
export function CharacterRight() {
  return (
    <svg
      viewBox="0 0 160 280"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ maxWidth: 160 }}
    >
      {/* Body */}
      <ellipse cx="80" cy="185" rx="38" ry="50" fill="#F5D5B0" />
      {/* Shirt (green) */}
      <ellipse cx="80" cy="192" rx="38" ry="44" fill="#6B9E52" />
      {/* Shirt collar/detail */}
      <rect x="62" y="148" width="36" height="20" rx="4" fill="#5A8A42" />
      <line x1="80" y1="148" x2="80" y2="168" stroke="#4A7A32" strokeWidth="2" />
      {/* Head */}
      <circle cx="80" cy="88" r="42" fill="#D4956A" />
      {/* Hair */}
      <ellipse cx="80" cy="55" rx="42" ry="20" fill="#5C3A1A" />
      {/* Eyes */}
      <circle cx="68" cy="86" r="5" fill="white" />
      <circle cx="92" cy="86" r="5" fill="white" />
      <circle cx="69" cy="87" r="3" fill="#333" />
      <circle cx="93" cy="87" r="3" fill="#333" />
      {/* Eyebrows */}
      <path d="M62 78 Q68 74 74 78" stroke="#5C3A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M86 78 Q92 74 98 78" stroke="#5C3A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M68 102 Q80 112 92 102" stroke="#A06040" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Right arm (raised/waving) */}
      <line x1="118" y1="168" x2="148" y2="118" stroke="#D4956A" strokeWidth="18" strokeLinecap="round" />
      <circle cx="148" cy="116" r="10" fill="#D4956A" />
      {/* Left arm (down) */}
      <line x1="42" y1="175" x2="22" y2="218" stroke="#D4956A" strokeWidth="18" strokeLinecap="round" />
      <circle cx="22" cy="220" r="10" fill="#D4956A" />
      {/* Legs */}
      <rect x="54" y="225" width="22" height="50" rx="11" fill="#2A5090" />
      <rect x="84" y="225" width="22" height="50" rx="11" fill="#2A5090" />
      {/* Shoes */}
      <ellipse cx="65" cy="274" rx="16" ry="8" fill="#1A1A1A" />
      <ellipse cx="95" cy="274" rx="16" ry="8" fill="#1A1A1A" />
    </svg>
  );
}

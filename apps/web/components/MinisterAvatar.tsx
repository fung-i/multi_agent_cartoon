"use client";

export type AvatarState =
  | "idle"
  | "thinking"
  | "speaking"
  | "happy"
  | "angry";

interface Palette {
  robe: string;
  robeDark: string;
  sash: string;
  hat: string;
  skin: string;
}

const PALETTES: Record<string, Palette> = {
  libu: {
    robe: "#2f4a78",
    robeDark: "#1f3359",
    sash: "#d4a24c",
    hat: "#111111",
    skin: "#f5d9bc",
  },
  hubu: {
    robe: "#3d7a55",
    robeDark: "#285538",
    sash: "#d9b34a",
    hat: "#111111",
    skin: "#f5d9bc",
  },
  bingbu: {
    robe: "#9c2b2b",
    robeDark: "#6f1c1c",
    sash: "#f0c560",
    hat: "#1a1a1a",
    skin: "#f1ceaa",
  },
  libu2: {
    robe: "#6a4a8e",
    robeDark: "#483168",
    sash: "#e7c8a0",
    hat: "#2d1b4c",
    skin: "#f5d9bc",
  },
  zhongshu: {
    robe: "#1e4d6b",
    robeDark: "#123548",
    sash: "#e8c87a",
    hat: "#0e2433",
    skin: "#f5d9bc",
  },
  menxia: {
    robe: "#2d4a3e",
    robeDark: "#1a3028",
    sash: "#c9a77a",
    hat: "#111816",
    skin: "#f0d2b8",
  },
  xingbu: {
    robe: "#3a2a2a",
    robeDark: "#1f1818",
    sash: "#c9a0a0",
    hat: "#0d0a0a",
    skin: "#e8c4a8",
  },
  gongbu: {
    robe: "#6b4e2a",
    robeDark: "#3d2d16",
    sash: "#d4b48a",
    hat: "#2a1f0f",
    skin: "#f1d3b0",
  },
};

interface Props {
  agentId: string;
  state?: AvatarState;
}

export function MinisterAvatar({ agentId, state = "idle" }: Props) {
  const p = PALETTES[agentId] ?? PALETTES.libu!;
  return (
    <svg
      viewBox="0 0 180 240"
      className={`minister minister--${state}`}
      aria-hidden
    >
      <ellipse cx="90" cy="234" rx="52" ry="6" fill="rgba(0,0,0,0.4)" />

      <path
        d="M 35 132 Q 30 180 42 230 L 138 230 Q 150 180 145 132 Q 90 115 35 132 Z"
        fill={p.robe}
      />
      <path d="M 82 118 L 82 230 L 98 230 L 98 118 Z" fill={p.sash} />

      <ellipse cx="30" cy="175" rx="18" ry="40" fill={p.robeDark} />
      <ellipse cx="150" cy="175" rx="18" ry="40" fill={p.robeDark} />

      <circle cx="62" cy="190" r="10" fill={p.skin} />
      <circle cx="118" cy="190" r="10" fill={p.skin} />

      <Accessory agentId={agentId} />

      <rect x="80" y="100" width="20" height="22" fill={p.skin} />
      <circle cx="90" cy="84" r="28" fill={p.skin} />

      <Face agentId={agentId} state={state} />
      <Hat agentId={agentId} p={p} />
    </svg>
  );
}

function Accessory({ agentId }: { agentId: string }) {
  switch (agentId) {
    case "libu":
      return (
        <rect
          x="78"
          y="140"
          width="24"
          height="60"
          rx="4"
          fill="#e8d7a6"
          stroke="#a88550"
          strokeWidth="1.5"
        />
      );
    case "hubu":
      return (
        <g>
          <rect x="62" y="170" width="56" height="24" rx="3" fill="#7a5432" />
          <rect x="64" y="172" width="52" height="20" fill="#f3d8a2" />
          <circle cx="72" cy="178" r="2.5" fill="#2a1a08" />
          <circle cx="80" cy="178" r="2.5" fill="#2a1a08" />
          <circle cx="88" cy="178" r="2.5" fill="#2a1a08" />
          <circle cx="96" cy="178" r="2.5" fill="#2a1a08" />
          <circle cx="104" cy="178" r="2.5" fill="#2a1a08" />
          <circle cx="72" cy="188" r="2.5" fill="#2a1a08" />
          <circle cx="80" cy="188" r="2.5" fill="#2a1a08" />
          <circle cx="96" cy="188" r="2.5" fill="#2a1a08" />
          <circle cx="104" cy="188" r="2.5" fill="#2a1a08" />
        </g>
      );
    case "bingbu":
      return (
        <g>
          <rect x="86" y="150" width="8" height="80" fill="#d9dee3" />
          <rect x="78" y="148" width="24" height="6" fill="#b5892e" />
          <rect x="82" y="130" width="16" height="18" rx="3" fill="#3a2a18" />
          <circle cx="90" cy="132" r="4" fill="#d6b54a" />
        </g>
      );
    case "libu2":
      return (
        <path
          d="M 78 200 L 78 158 Q 90 140 102 158 L 102 200 Z"
          fill="#b9d9c9"
          stroke="#5f8e7d"
          strokeWidth="1.5"
        />
      );
    case "zhongshu":
      return (
        <rect
          x="64"
          y="148"
          width="52"
          height="44"
          rx="3"
          fill="#f5edd4"
          stroke="#7a5c28"
          strokeWidth="1.2"
        />
      );
    case "menxia":
      return (
        <g>
          <rect x="78" y="168" width="24" height="28" rx="2" fill="#8b2332" />
          <path
            d="M 88 176 L 92 180 L 88 184"
            stroke="#f6e1b0"
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      );
    case "xingbu":
      return (
        <g>
          <line
            x1="72"
            y1="188"
            x2="108"
            y2="188"
            stroke="#7a5c28"
            strokeWidth="2"
          />
          <circle cx="80" cy="180" r="3" fill="#c9a227" />
          <circle cx="100" cy="180" r="3" fill="#c9a227" />
        </g>
      );
    case "gongbu":
      return (
        <path
          d="M 70 175 L 110 175 L 105 200 L 75 200 Z"
          fill="#8b7350"
          stroke="#4a3a20"
        />
      );
    default:
      return null;
  }
}

function Face({
  agentId,
  state,
}: {
  agentId: string;
  state: AvatarState;
}) {
  const beard = (() => {
    switch (agentId) {
      case "libu":
        return <path d="M 78 100 Q 90 132 102 100 Z" fill="#2c1e0f" />;
      case "hubu":
        return <ellipse cx="90" cy="104" rx="4" ry="7" fill="#2c1e0f" />;
      case "bingbu":
        return (
          <path
            d="M 74 93 Q 84 100 90 96 Q 96 100 106 93 Q 98 104 90 102 Q 82 104 74 93 Z"
            fill="#1a1208"
          />
        );
      default:
        return null;
    }
  })();

  const eyebrows = (() => {
    switch (agentId) {
      case "bingbu":
        return (
          <g>
            <path
              d="M 72 72 L 86 77"
              stroke="#111"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 108 77 L 94 72"
              stroke="#111"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        );
      case "libu2":
        return (
          <g>
            <path
              d="M 74 76 Q 80 72 86 76"
              stroke="#111"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 94 76 Q 100 72 106 76"
              stroke="#111"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
      default:
        return (
          <g>
            <path
              d="M 74 76 L 86 76"
              stroke="#111"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 94 76 L 106 76"
              stroke="#111"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );
    }
  })();

  const mouth = (() => {
    if (state === "speaking")
      return <ellipse cx="90" cy="96" rx="4" ry="3.5" fill="#5a1a1a" />;
    if (state === "angry")
      return (
        <path
          d="M 82 99 Q 90 94 98 99"
          stroke="#5a1a1a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    if (state === "happy")
      return (
        <path
          d="M 82 94 Q 90 101 98 94"
          stroke="#5a1a1a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    return (
      <path
        d="M 84 95 L 96 95"
        stroke="#5a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  })();

  return (
    <g>
      {eyebrows}
      <circle cx="80" cy="82" r="2.5" fill="#111" />
      <circle cx="100" cy="82" r="2.5" fill="#111" />
      {mouth}
      {beard}
    </g>
  );
}

function Hat({ agentId, p }: { agentId: string; p: Palette }) {
  if (agentId === "bingbu") {
    return (
      <g>
        <path d="M 60 64 Q 90 30 120 64 L 120 72 L 60 72 Z" fill="#2b2b2b" />
        <path
          d="M 60 64 Q 90 30 120 64"
          fill="none"
          stroke={p.sash}
          strokeWidth="2"
        />
        <path d="M 88 30 Q 80 8 96 4 Q 102 20 92 30 Z" fill="#c13e3e" />
        <circle cx="90" cy="54" r="3" fill={p.sash} />
        <rect x="62" y="70" width="56" height="4" fill="#1a1a1a" />
      </g>
    );
  }
  return (
    <g>
      <rect x="64" y="40" width="52" height="28" rx="6" fill={p.hat} />
      <rect x="58" y="62" width="64" height="6" rx="2" fill={p.hat} />
      <rect x="28" y="58" width="30" height="5" fill={p.hat} />
      <rect x="122" y="58" width="30" height="5" fill={p.hat} />
      <circle cx="90" cy="52" r="4" fill={p.sash} />
    </g>
  );
}

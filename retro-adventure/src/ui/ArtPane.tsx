import { useGameStore } from '../engine/store';

// CGA-style color palette
const COLORS = {
  black: '#000000',
  darkBlue: '#0000AA',
  darkCyan: '#00AAAA',
  cyan: '#55FFFF',
  white: '#FFFFFF',
  magenta: '#FF55FF',
  darkMagenta: '#AA00AA',
  blue: '#5555FF',
  gray: '#AAAAAA',
  darkGray: '#555555',
  ice: '#88DDFF',
  iceLight: '#AAEEFF',
  iceDark: '#446688',
};

// Pixel art scenes as SVG components
function CaveEntrance() {
  return (
    <g>
      {/* Sky/outside light */}
      <rect x="0" y="0" width="640" height="200" fill={COLORS.darkBlue} />

      {/* Cave opening with light */}
      <ellipse cx="320" cy="200" rx="200" ry="150" fill={COLORS.black} />
      <ellipse cx="320" cy="220" rx="120" ry="80" fill={COLORS.darkBlue} />

      {/* Ice formations on ceiling */}
      {[80, 150, 220, 280, 360, 420, 490, 560].map((x, i) => (
        <polygon
          key={i}
          points={`${x},0 ${x+15},${40 + (i % 3) * 20} ${x+30},0`}
          fill={COLORS.cyan}
        />
      ))}

      {/* Ground ice */}
      <rect x="0" y="300" width="640" height="100" fill={COLORS.iceDark} />
      <rect x="0" y="310" width="640" height="90" fill={COLORS.ice} />

      {/* Torch on ground */}
      <rect x="280" y="280" width="8" height="30" fill="#8B4513" />
      <ellipse cx="284" cy="275" rx="6" ry="8" fill="#AA5500" />

      {/* Ice crystals */}
      <polygon points="100,300 115,250 130,300" fill={COLORS.cyan} />
      <polygon points="500,300 520,240 540,300" fill={COLORS.iceLight} />
    </g>
  );
}

function TorchHall({ torchLit }: { torchLit: boolean }) {
  return (
    <g>
      {/* Dark background */}
      <rect x="0" y="0" width="640" height="400" fill={torchLit ? COLORS.darkBlue : COLORS.black} />

      {torchLit ? (
        <>
          {/* Corridor walls */}
          <polygon points="0,0 150,100 150,300 0,400" fill={COLORS.iceDark} />
          <polygon points="640,0 490,100 490,300 640,400" fill={COLORS.iceDark} />

          {/* Floor */}
          <polygon points="150,300 490,300 640,400 0,400" fill={COLORS.ice} />

          {/* Ceiling stalactites */}
          {[180, 250, 320, 390, 460].map((x, i) => (
            <polygon
              key={i}
              points={`${x},100 ${x+20},${140 + (i % 2) * 30} ${x+40},100`}
              fill={COLORS.cyan}
            />
          ))}

          {/* Torch brackets on walls */}
          <rect x="160" y="180" width="20" height="10" fill={COLORS.gray} />
          <rect x="460" y="180" width="20" height="10" fill={COLORS.gray} />

          {/* Torch glow */}
          <circle cx="320" cy="200" r="100" fill="rgba(255,200,100,0.2)" />
        </>
      ) : (
        <>
          {/* Darkness text */}
          <text x="320" y="200" textAnchor="middle" fill={COLORS.darkGray} fontSize="24" fontFamily="monospace">
            * PITCH BLACK *
          </text>
        </>
      )}
    </g>
  );
}

function CrystalChamber() {
  return (
    <g>
      {/* Background */}
      <rect x="0" y="0" width="640" height="400" fill={COLORS.darkBlue} />

      {/* Large crystals */}
      <polygon points="50,400 100,200 150,400" fill={COLORS.cyan} opacity="0.8" />
      <polygon points="80,400 120,250 160,400" fill={COLORS.iceLight} opacity="0.6" />

      <polygon points="500,400 560,180 620,400" fill={COLORS.cyan} opacity="0.8" />
      <polygon points="480,400 530,220 580,400" fill={COLORS.iceLight} opacity="0.6" />

      {/* Ceiling crystals */}
      {[100, 200, 320, 440, 540].map((x, i) => (
        <polygon
          key={i}
          points={`${x},0 ${x+30},${80 + (i % 3) * 40} ${x+60},0`}
          fill={i % 2 ? COLORS.cyan : COLORS.iceLight}
          opacity="0.9"
        />
      ))}

      {/* Stone door on the right */}
      <rect x="520" y="150" width="80" height="150" fill={COLORS.gray} />
      <rect x="530" y="160" width="60" height="130" fill={COLORS.darkGray} />
      <circle cx="540" cy="220" r="5" fill={COLORS.ice} />

      {/* Floor */}
      <rect x="0" y="320" width="640" height="80" fill={COLORS.iceDark} />

      {/* Crystal shard on ground */}
      <polygon points="300,310 315,280 330,310" fill={COLORS.magenta} />
      <polygon points="305,310 315,290 325,310" fill={COLORS.white} opacity="0.5" />

      {/* Rainbow light effects */}
      <line x1="150" y1="200" x2="250" y2="300" stroke={COLORS.magenta} strokeWidth="2" opacity="0.5" />
      <line x1="160" y1="200" x2="260" y2="300" stroke={COLORS.cyan} strokeWidth="2" opacity="0.5" />
    </g>
  );
}

function WizardThrone({ wizardDefeated }: { wizardDefeated: boolean }) {
  return (
    <g>
      {/* Ice cave background */}
      <rect x="0" y="0" width="640" height="400" fill={COLORS.black} />

      {/* Stalactites/stalagmites */}
      {[40, 120, 200, 440, 520, 580].map((x, i) => (
        <polygon
          key={`top-${i}`}
          points={`${x},0 ${x+25},${60 + (i % 3) * 30} ${x+50},0`}
          fill={COLORS.cyan}
        />
      ))}
      {[60, 140, 480, 560].map((x, i) => (
        <polygon
          key={`bot-${i}`}
          points={`${x},400 ${x+30},${340 - (i % 2) * 40} ${x+60},400`}
          fill={COLORS.ice}
        />
      ))}

      {/* Ice throne */}
      <polygon points="250,350 270,180 320,150 370,180 390,350" fill={COLORS.iceDark} />
      <polygon points="260,340 280,200 320,170 360,200 380,340" fill={COLORS.ice} />

      {wizardDefeated ? (
        <>
          {/* Puddle and robes */}
          <ellipse cx="320" cy="340" rx="60" ry="20" fill={COLORS.darkCyan} />
          <path d="M290,330 Q320,300 350,330" fill={COLORS.darkBlue} />
          <text x="320" y="380" textAnchor="middle" fill={COLORS.cyan} fontSize="14" fontFamily="monospace">
            * melted remains *
          </text>
        </>
      ) : (
        <>
          {/* Ice Wizard */}
          <ellipse cx="320" cy="220" rx="40" ry="50" fill={COLORS.ice} /> {/* Body */}
          <ellipse cx="320" cy="160" rx="30" ry="35" fill={COLORS.iceLight} /> {/* Head */}

          {/* Eyes */}
          <ellipse cx="305" cy="155" rx="8" ry="10" fill={COLORS.darkBlue} />
          <ellipse cx="335" cy="155" rx="8" ry="10" fill={COLORS.darkBlue} />
          <circle cx="305" cy="155" r="3" fill={COLORS.cyan} />
          <circle cx="335" cy="155" r="3" fill={COLORS.cyan} />

          {/* Crown */}
          <polygon points="280,130 295,100 310,125 320,95 330,125 345,100 360,130" fill={COLORS.cyan} />

          {/* Arms raised menacingly */}
          <path d="M280,200 L240,160 L250,150" fill="none" stroke={COLORS.ice} strokeWidth="15" />
          <path d="M360,200 L400,160 L390,150" fill="none" stroke={COLORS.ice} strokeWidth="15" />

          {/* Magical frost effect */}
          <circle cx="245" cy="145" r="15" fill={COLORS.cyan} opacity="0.6" />
          <circle cx="395" cy="145" r="15" fill={COLORS.cyan} opacity="0.6" />
        </>
      )}

      {/* Floor */}
      <rect x="0" y="350" width="640" height="50" fill={COLORS.iceDark} />
    </g>
  );
}

function FrozenDeath() {
  return (
    <g>
      {/* Ice cave background - matching the Big screenshot */}
      <rect x="0" y="0" width="640" height="400" fill={COLORS.black} />

      {/* Stalactites */}
      {[20, 80, 140, 200, 260, 380, 440, 500, 560, 600].map((x, i) => (
        <polygon
          key={i}
          points={`${x},0 ${x+20},${50 + (i % 4) * 25} ${x+40},0`}
          fill={i % 2 ? COLORS.cyan : COLORS.ice}
        />
      ))}

      {/* Ice Wizard on the left */}
      <g transform="translate(-50, 20)">
        <ellipse cx="150" cy="220" rx="50" ry="70" fill={COLORS.ice} />
        <ellipse cx="150" cy="140" rx="40" ry="45" fill={COLORS.iceLight} />
        {/* Multiple eyes like in the screenshot */}
        <circle cx="130" cy="130" r="12" fill={COLORS.black} />
        <circle cx="170" cy="130" r="12" fill={COLORS.black} />
        <circle cx="150" cy="160" r="10" fill={COLORS.black} />
        <circle cx="130" cy="130" r="4" fill={COLORS.cyan} />
        <circle cx="170" cy="130" r="4" fill={COLORS.cyan} />
        {/* Crown/spikes */}
        <polygon points="100,100 120,60 140,95 150,50 160,95 180,60 200,100" fill={COLORS.cyan} />
        {/* Arms */}
        <path d="M100,200 L60,150" stroke={COLORS.ice} strokeWidth="20" fill="none" />
        <path d="M200,200 L240,150" stroke={COLORS.ice} strokeWidth="20" fill="none" />
        {/* Magic orb in hand */}
        <circle cx="60" cy="140" r="15" fill={COLORS.magenta} />
      </g>

      {/* FROZEN PLAYER in ice block - center */}
      <rect x="260" y="120" width="120" height="200" fill={COLORS.iceDark} opacity="0.8" />
      <rect x="270" y="130" width="100" height="180" fill={COLORS.ice} opacity="0.6" />
      {/* Person inside */}
      <ellipse cx="320" cy="170" rx="20" ry="25" fill={COLORS.magenta} /> {/* Head */}
      <rect x="300" y="195" width="40" height="80" fill={COLORS.magenta} /> {/* Body */}
      <rect x="295" y="275" width="15" height="40" fill={COLORS.magenta} /> {/* Leg */}
      <rect x="330" y="275" width="15" height="40" fill={COLORS.magenta} /> {/* Leg */}
      {/* Arms spread */}
      <rect x="260" y="200" width="40" height="12" fill={COLORS.magenta} />
      <rect x="340" y="200" width="40" height="12" fill={COLORS.magenta} />
      {/* Ice cracks */}
      <line x1="270" y1="140" x2="300" y2="180" stroke={COLORS.white} strokeWidth="1" />
      <line x1="370" y1="150" x2="340" y2="200" stroke={COLORS.white} strokeWidth="1" />

      {/* Another frozen adventurer on right */}
      <g transform="translate(420, 100)">
        <rect x="0" y="50" width="80" height="150" fill={COLORS.iceDark} opacity="0.6" />
        <ellipse cx="40" cy="80" rx="15" ry="18" fill={COLORS.darkGray} />
        <rect x="25" y="98" width="30" height="60" fill={COLORS.darkGray} />
        <rect x="20" y="158" width="12" height="35" fill={COLORS.darkGray} />
        <rect x="48" y="158" width="12" height="35" fill={COLORS.darkGray} />
      </g>

      {/* Stalagmites from bottom */}
      {[40, 120, 480, 560].map((x, i) => (
        <polygon
          key={i}
          points={`${x},400 ${x+30},${320 - (i % 2) * 40} ${x+60},400`}
          fill={COLORS.ice}
        />
      ))}

      {/* Floor */}
      <rect x="0" y="350" width="640" height="50" fill={COLORS.iceDark} />
    </g>
  );
}

function HiddenGrotto() {
  return (
    <g>
      {/* Dark cave with bioluminescent glow */}
      <rect x="0" y="0" width="640" height="400" fill="#001122" />

      {/* Glowing moss spots on ceiling */}
      {[50, 150, 250, 350, 450, 550].map((x, i) => (
        <circle key={i} cx={x} cy={30 + (i % 3) * 20} r={10 + (i % 2) * 5} fill="#44FFAA" opacity="0.4" />
      ))}

      {/* Frozen pool in center */}
      <ellipse cx="320" cy="300" rx="150" ry="60" fill={COLORS.darkCyan} />
      <ellipse cx="320" cy="295" rx="130" ry="50" fill={COLORS.ice} opacity="0.5" />

      {/* Strange star reflections */}
      {[220, 280, 340, 400].map((x, i) => (
        <text key={i} x={x} y={290 + (i % 2) * 20} fill={COLORS.white} fontSize="12">*</text>
      ))}

      {/* Thermal Orb glowing */}
      <circle cx="320" cy="250" r="30" fill="#FF6600" opacity="0.3" />
      <circle cx="320" cy="250" r="20" fill="#FF8800" />
      <circle cx="320" cy="250" r="12" fill="#FFAA00" />
      <circle cx="315" cy="245" r="4" fill="#FFFFFF" />

      {/* Cave walls */}
      <polygon points="0,0 80,150 60,400 0,400" fill={COLORS.iceDark} />
      <polygon points="640,0 560,150 580,400 640,400" fill={COLORS.iceDark} />
    </g>
  );
}

function IceBridge() {
  return (
    <g>
      {/* Chasm background */}
      <rect x="0" y="0" width="640" height="400" fill={COLORS.black} />

      {/* Distant cave walls */}
      <rect x="0" y="0" width="100" height="400" fill={COLORS.iceDark} />
      <rect x="540" y="0" width="100" height="400" fill={COLORS.iceDark} />

      {/* The bridge */}
      <polygon points="100,200 540,200 560,220 80,220" fill={COLORS.ice} />
      <polygon points="100,200 120,180 520,180 540,200" fill={COLORS.iceLight} />

      {/* Stalactites above */}
      {[150, 250, 350, 450].map((x, i) => (
        <polygon
          key={i}
          points={`${x},0 ${x+20},${80 + (i % 2) * 40} ${x+40},0`}
          fill={COLORS.cyan}
        />
      ))}

      {/* Chasm depth - water sound visual */}
      <text x="320" y="350" textAnchor="middle" fill={COLORS.darkCyan} fontSize="12" fontFamily="monospace">
        ~ ~ ~ rushing water below ~ ~ ~
      </text>

      {/* Mist effect */}
      <ellipse cx="320" cy="300" rx="200" ry="40" fill={COLORS.ice} opacity="0.2" />
    </g>
  );
}

function TreasureVault() {
  return (
    <g>
      {/* Cave background */}
      <rect x="0" y="0" width="640" height="400" fill={COLORS.darkBlue} />

      {/* Light from exit */}
      <ellipse cx="320" cy="100" rx="100" ry="80" fill="#FFFFAA" opacity="0.3" />
      <rect x="270" y="20" width="100" height="100" fill="#FFFFCC" />

      {/* Gold piles */}
      {[100, 200, 400, 500].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy="340" rx={50 + (i % 2) * 20} ry={30} fill="#DAA520" />
          <ellipse cx={x} cy="330" rx={40 + (i % 2) * 15} ry={20} fill="#FFD700" />
          {/* Coins */}
          {[0, 15, -15, 8, -8].map((ox, j) => (
            <circle key={j} cx={x + ox} cy={320 + (j % 3) * 5} r="6" fill="#FFFF00" />
          ))}
        </g>
      ))}

      {/* Crown on pedestal */}
      <rect x="295" y="280" width="50" height="60" fill={COLORS.gray} />
      <polygon points="290,260 310,230 320,250 330,230 350,260" fill={COLORS.cyan} />

      {/* Gems scattered */}
      <polygon points="150,320 160,300 170,320" fill={COLORS.magenta} />
      <polygon points="450,310 465,290 480,310" fill="#00FF00" />
      <polygon points="250,330 260,315 270,330" fill="#FF0000" />

      {/* Floor */}
      <rect x="0" y="350" width="640" height="50" fill={COLORS.iceDark} />
    </g>
  );
}

function Freedom() {
  return (
    <g>
      {/* Bright sky */}
      <rect x="0" y="0" width="640" height="400" fill="#87CEEB" />

      {/* Sun */}
      <circle cx="320" cy="80" r="60" fill="#FFFF00" />
      <circle cx="320" cy="80" r="50" fill="#FFFFAA" />

      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={320 + Math.cos(rad) * 70}
            y1={80 + Math.sin(rad) * 70}
            x2={320 + Math.cos(rad) * 100}
            y2={80 + Math.sin(rad) * 100}
            stroke="#FFFF00"
            strokeWidth="4"
          />
        );
      })}

      {/* Cave entrance behind (collapsing) */}
      <ellipse cx="320" cy="350" rx="150" ry="100" fill={COLORS.black} />
      <polygon points="200,300 250,250 280,280 320,240 360,280 390,250 440,300" fill={COLORS.darkGray} />

      {/* Falling rocks */}
      <rect x="280" y="280" width="20" height="20" fill={COLORS.gray} transform="rotate(15 290 290)" />
      <rect x="350" y="300" width="15" height="15" fill={COLORS.gray} transform="rotate(-20 357 307)" />

      {/* Green hills in distance */}
      <ellipse cx="100" cy="400" rx="150" ry="80" fill="#228B22" />
      <ellipse cx="540" cy="400" rx="150" ry="80" fill="#228B22" />

      {/* Ground */}
      <rect x="0" y="360" width="640" height="40" fill="#8B4513" />
      <rect x="0" y="370" width="640" height="30" fill="#228B22" />
    </g>
  );
}

function DefaultScene({ roomName }: { roomName: string }) {
  return (
    <g>
      <rect x="0" y="0" width="640" height="400" fill={COLORS.darkBlue} />
      {/* Generic ice cave */}
      {[50, 150, 250, 350, 450, 550].map((x, i) => (
        <polygon
          key={i}
          points={`${x},0 ${x+25},${70 + (i % 3) * 30} ${x+50},0`}
          fill={COLORS.cyan}
        />
      ))}
      <rect x="0" y="320" width="640" height="80" fill={COLORS.ice} />
      <text x="320" y="200" textAnchor="middle" fill={COLORS.white} fontSize="20" fontFamily="monospace">
        {roomName}
      </text>
    </g>
  );
}

export function ArtPane() {
  const currentRoomId = useGameStore((state) => state.currentRoomId);
  const flags = useGameStore((state) => state.flags);
  const gameOver = useGameStore((state) => state.gameOver);
  const victory = useGameStore((state) => state.victory);

  const roomName = currentRoomId.replace(/_/g, ' ').toUpperCase();

  const renderScene = () => {
    // Show death scene if game over (frozen)
    if (gameOver && !victory) {
      return <FrozenDeath />;
    }

    switch (currentRoomId) {
      case 'cave_entrance':
      case 'outside':
        return <CaveEntrance />;
      case 'torch_hall':
      case 'storage_alcove':
        return <TorchHall torchLit={!!flags.torch_lit} />;
      case 'crystal_chamber':
        return <CrystalChamber />;
      case 'hidden_grotto':
        return <HiddenGrotto />;
      case 'ice_bridge':
        return <IceBridge />;
      case 'antechamber':
        return <DefaultScene roomName="ANTECHAMBER" />;
      case 'wizard_throne':
        return <WizardThrone wizardDefeated={!!flags.wizard_defeated} />;
      case 'treasure_vault':
        return <TreasureVault />;
      case 'freedom':
        return <Freedom />;
      default:
        return <DefaultScene roomName={roomName} />;
    }
  };

  return (
    <div className="art-pane">
      <svg
        viewBox="0 0 640 400"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
      >
        {renderScene()}
      </svg>
    </div>
  );
}

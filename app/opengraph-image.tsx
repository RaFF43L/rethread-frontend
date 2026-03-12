import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Segunda Aura Brechó - Moda Sustentável';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F9F7F2',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Decoração de fundo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(160,82,45,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(74,93,78,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Borda decorativa */}
        <div
          style={{
            position: 'absolute',
            inset: '32px',
            border: '1.5px solid rgba(160,82,45,0.18)',
            borderRadius: '16px',
          }}
        />

        {/* Ícone / Monograma */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#A0522D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            boxShadow: '0 8px 32px rgba(160,82,45,0.3)',
          }}
        >
          <span
            style={{
              color: '#F9F7F2',
              fontSize: '36px',
              fontStyle: 'italic',
              fontWeight: 'bold',
            }}
          >
            SA
          </span>
        </div>

        {/* Nome */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            color: '#A0522D',
            letterSpacing: '-1px',
            marginBottom: '16px',
          }}
        >
          Segunda Aura
        </div>

        {/* Subtítulo */}
        <div
          style={{
            fontSize: '24px',
            color: '#4A5D4E',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          Brechó · Moda Sustentável
        </div>

        {/* Linha divisória */}
        <div
          style={{
            width: '64px',
            height: '2px',
            background: '#A0522D',
            marginBottom: '24px',
            opacity: 0.5,
          }}
        />

        {/* Descrição */}
        <div
          style={{
            fontSize: '18px',
            color: '#7A7068',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          Peças únicas com estilo e propósito
        </div>
      </div>
    ),
    { ...size }
  );
}

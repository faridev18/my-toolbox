import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';

const COLORS = [
  '#A7F3D0', '#BFDBFE', '#DDD6FE', '#FBCFE8', '#FED7AA', '#FEF08A',
  '#86EFAC', '#93C5FD', '#C4B5FD', '#F9A8D4', '#FDBA74', '#FDE047',
  '#6EE7B7', '#60A5FA', '#A78BFA', '#F472B6', '#FB923C', '#FACC15',
  '#34D399', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#EAB308',
  '#10B981', '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#CA8A04',
  '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#000000'
];

const CANVAS_W = 1800;
const CANVAS_H = 1300;
const PHONE_ASPECT = 9 / 19.5;

// Utilitaire : rectangle à coins arrondis
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawPhoneFrame(ctx, x, y, w, h, img) {
  const r = w * 0.11; // rayon proportionnel à la largeur

  // Bords du biseau (bezel fins comme un iPhone moderne)
  const sideBezel = w * 0.028;
  const topBezel  = h * 0.038;
  const botBezel  = h * 0.05;
  const screenX = x + sideBezel;
  const screenY = y + topBezel;
  const screenW = w - sideBezel * 2;
  const screenH = h - topBezel - botBezel;
  const screenR = r * 0.82;

  // ── Ombre multicouche ───────────────────────────────────────
  ctx.save();
  // Ombre diffuse large
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = w * 0.18;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = h * 0.04;
  rrect(ctx, x, y, w, h, r);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.restore();

  // Ombre proche plus nette
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = w * 0.05;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = h * 0.015;
  rrect(ctx, x, y, w, h, r);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.restore();

  // ── Corps du téléphone (dégradé métallique sombre) ──────────
  ctx.save();
  rrect(ctx, x, y, w, h, r);
  const bodyGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  bodyGrad.addColorStop(0,    '#3a3a3c');
  bodyGrad.addColorStop(0.35, '#1c1c1e');
  bodyGrad.addColorStop(0.7,  '#141416');
  bodyGrad.addColorStop(1,    '#0d0d0f');
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // ── Liseret métallique (rim) ─────────────────────────────────
  ctx.save();
  rrect(ctx, x, y, w, h, r);
  ctx.strokeStyle = '#5a5a5e';
  ctx.lineWidth = w * 0.012;
  ctx.stroke();
  // Reflet haut du rim
  rrect(ctx, x, y, w, h, r);
  const rimGrad = ctx.createLinearGradient(x, y, x, y + h * 0.15);
  rimGrad.addColorStop(0,   'rgba(255,255,255,0.18)');
  rimGrad.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = w * 0.008;
  ctx.stroke();
  ctx.restore();

  // ── Boutons latéraux gauche (volume ×2 + silencieux) ─────────
  const btnW  = w * 0.028;
  const btnR  = btnW / 2;
  const silH  = h * 0.055;
  const volH  = h * 0.08;
  const silY  = y + h * 0.16;
  const vol1Y = y + h * 0.26;
  const vol2Y = y + h * 0.36;
  for (const [by, bh] of [[silY, silH], [vol1Y, volH], [vol2Y, volH]]) {
    ctx.save();
    rrect(ctx, x - btnW * 0.6, by, btnW, bh, btnR);
    const btnGrad = ctx.createLinearGradient(x - btnW, by, x, by);
    btnGrad.addColorStop(0, '#2a2a2c');
    btnGrad.addColorStop(1, '#4a4a4e');
    ctx.fillStyle = btnGrad;
    ctx.fill();
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = w * 0.005;
    ctx.stroke();
    ctx.restore();
  }

  // ── Bouton power droit ───────────────────────────────────────
  const pwrH = h * 0.12;
  const pwrY = y + h * 0.24;
  ctx.save();
  rrect(ctx, x + w - btnW * 0.4, pwrY, btnW, pwrH, btnR);
  const pwrGrad = ctx.createLinearGradient(x + w, pwrY, x + w + btnW, pwrY);
  pwrGrad.addColorStop(0, '#4a4a4e');
  pwrGrad.addColorStop(1, '#2a2a2c');
  ctx.fillStyle = pwrGrad;
  ctx.fill();
  ctx.strokeStyle = '#5a5a60';
  ctx.lineWidth = w * 0.005;
  ctx.stroke();
  ctx.restore();

  // ── Écran ────────────────────────────────────────────────────
  ctx.save();
  rrect(ctx, screenX, screenY, screenW, screenH, screenR);
  if (img) {
    ctx.clip();
    const scaleX = screenW / img.width;
    const scaleY = screenH / img.height;
    const scale  = Math.max(scaleX, scaleY);
    const dw = img.width  * scale;
    const dh = img.height * scale;
    ctx.drawImage(img,
      screenX + (screenW - dw) / 2,
      screenY + (screenH - dh) / 2,
      dw, dh
    );
  } else {
    ctx.clip();
    // Fond écran dégradé sombre
    const scGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + screenH);
    scGrad.addColorStop(0,   '#1a1a2e');
    scGrad.addColorStop(1,   '#0f0f1a');
    ctx.fillStyle = scGrad;
    ctx.fill();
    // Icône + centrée
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.font = `bold ${Math.round(screenW * 0.18)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', screenX + screenW / 2, screenY + screenH / 2);
  }
  ctx.restore();

  // ── Reflet vitre (overlay dégradé diagonal) ──────────────────
  ctx.save();
  rrect(ctx, screenX, screenY, screenW, screenH, screenR);
  ctx.clip();
  const glassGrad = ctx.createLinearGradient(
    screenX, screenY,
    screenX + screenW * 0.6, screenY + screenH * 0.45
  );
  glassGrad.addColorStop(0,    'rgba(255,255,255,0.10)');
  glassGrad.addColorStop(0.4,  'rgba(255,255,255,0.03)');
  glassGrad.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(screenX, screenY, screenW, screenH);
  ctx.restore();

  // ── Dynamic Island (pill) ────────────────────────────────────
  const diW = w * 0.30;
  const diH = h * 0.022;
  const diX = x + (w - diW) / 2;
  const diY = y + topBezel * 0.28;
  ctx.save();
  rrect(ctx, diX, diY, diW, diH, diH / 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  // ── Barre home indicator ─────────────────────────────────────
  const barW = w * 0.32;
  const barH = h * 0.005;
  const barX = x + (w - barW) / 2;
  const barY = y + h - botBezel * 0.42;
  ctx.save();
  rrect(ctx, barX, barY, barW, barH, barH / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();
  ctx.restore();
}

function TripleFramer() {
  const [images, setImages] = useState([null, null, null]);
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  });
  const [padding, setPadding] = useState(60);
  const canvasRef = useRef(null);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

  const loadImage = (file, index) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImages((prev) => {
          const next = [...prev];
          next[index] = img;
          return next;
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e, index) => {
    loadImage(e.target.files[0], index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    loadImage(file, index);
  };

  const handleDragOver = (e) => e.preventDefault();

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // Fond
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Calcul dimensions des téléphones (contraindre par hauteur ET largeur)
    const totalPadding = padding * 2;
    const gapBetween = padding * 0.8;
    const availableH = CANVAS_H - totalPadding;
    const availableW = CANVAS_W - totalPadding - gapBetween * 2;
    // Taille depuis la hauteur
    let phoneH = availableH;
    let phoneW = phoneH * PHONE_ASPECT;
    // Si trop large, contraindre par la largeur
    if (phoneW * 3 > availableW) {
      phoneW = availableW / 3;
      phoneH = phoneW / PHONE_ASPECT;
    }

    const startY = (CANVAS_H - phoneH) / 2;
    const startX = (CANVAS_W - (phoneW * 3 + gapBetween * 2)) / 2;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (phoneW + gapBetween);
      drawPhoneFrame(ctx, x, startY, phoneW, phoneH, images[i]);
    }
  }, [images, backgroundColor, padding]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'triple-framer.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const hasAnyImage = images.some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-gray-400 hover:text-indigo-600 transition-colors">
            ← Accueil
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Triple Mobile Framer</h1>
            <p className="text-gray-600 mt-1">Composez 3 captures mobiles dans un mockup téléphone et exportez</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Colonne gauche : slots upload */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">Captures d'écran</h2>
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-xs font-medium text-gray-500">#{i + 1}</p>
                  <div
                    className="relative w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden bg-white shadow-sm"
                    style={{ aspectRatio: '9/19.5' }}
                    onClick={() => fileInputRefs[i].current?.click()}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragOver={handleDragOver}
                  >
                    {images[i] ? (
                      <img
                        src={images[i].src}
                        alt={`Capture ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-center px-1 leading-tight">Ajouter</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs[i]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, i)}
                  />
                  {images[i] && (
                    <button
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      onClick={() => setImages((prev) => { const n = [...prev]; n[i] = null; return n; })}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Colonne centrale + droite : aperçu */}
          <div className="lg:col-span-2 space-y-6">

            {/* Aperçu canvas */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Aperçu</h2>
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Contrôles */}
            <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-700">Personnalisation</h2>

              {/* Couleur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-10 w-16 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Couleurs prédéfinies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Palette</label>
                <div className="grid grid-cols-9 gap-1.5">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`h-7 rounded transition-all ${
                        backgroundColor === color
                          ? 'ring-2 ring-indigo-500 scale-110'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #e5e7eb' : 'none' }}
                    />
                  ))}
                </div>
              </div>

              {/* Marge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Espacement : {padding}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Export */}
              <button
                onClick={handleExport}
                disabled={!hasAnyImage}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                  hasAnyImage
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                ⬇ Télécharger l'image (PNG)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripleFramer;

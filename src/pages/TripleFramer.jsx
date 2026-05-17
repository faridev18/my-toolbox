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
const CANVAS_H = 900;
const PHONE_RADIUS = 36;
const PHONE_ASPECT = 9 / 19.5; // largeur/hauteur ratio téléphone

function drawPhoneFrame(ctx, x, y, w, h, img) {
  const r = PHONE_RADIUS;

  // Ombre portée
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;

  // Fond blanc du téléphone (bezel)
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
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.restore();

  // Bordure intérieure (écran)
  const bezel = w * 0.05;
  const screenX = x + bezel;
  const screenY = y + bezel;
  const screenW = w - bezel * 2;
  const screenH = h - bezel * 2;
  const screenR = r * 0.75;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(screenX + screenR, screenY);
  ctx.lineTo(screenX + screenW - screenR, screenY);
  ctx.arcTo(screenX + screenW, screenY, screenX + screenW, screenY + screenR, screenR);
  ctx.lineTo(screenX + screenW, screenY + screenH - screenR);
  ctx.arcTo(screenX + screenW, screenY + screenH, screenX + screenW - screenR, screenY + screenH, screenR);
  ctx.lineTo(screenX + screenR, screenY + screenH);
  ctx.arcTo(screenX, screenY + screenH, screenX, screenY + screenH - screenR, screenR);
  ctx.lineTo(screenX, screenY + screenR);
  ctx.arcTo(screenX, screenY, screenX + screenR, screenY, screenR);
  ctx.closePath();

  if (img) {
    ctx.clip();
    // Adapter l'image en cover
    const scaleX = screenW / img.width;
    const scaleY = screenH / img.height;
    const scale = Math.max(scaleX, scaleY);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = screenX + (screenW - dw) / 2;
    const dy = screenY + (screenH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = '#374151';
    ctx.fill();
    // Icône placeholder
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(screenX + screenR, screenY);
    ctx.lineTo(screenX + screenW - screenR, screenY);
    ctx.arcTo(screenX + screenW, screenY, screenX + screenW, screenY + screenR, screenR);
    ctx.lineTo(screenX + screenW, screenY + screenH - screenR);
    ctx.arcTo(screenX + screenW, screenY + screenH, screenX + screenW - screenR, screenY + screenH, screenR);
    ctx.lineTo(screenX + screenR, screenY + screenH);
    ctx.arcTo(screenX, screenY + screenH, screenX, screenY + screenH - screenR, screenR);
    ctx.lineTo(screenX, screenY + screenR);
    ctx.arcTo(screenX, screenY, screenX + screenR, screenY, screenR);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    // Texte placeholder
    ctx.fillStyle = '#6b7280';
    ctx.font = `bold ${Math.round(screenW * 0.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', screenX + screenW / 2, screenY + screenH / 2);
  }
  ctx.restore();

  // Notch
  const notchW = w * 0.28;
  const notchH = bezel * 0.9;
  const notchX = x + (w - notchW) / 2;
  const notchY = y + bezel * 0.1;
  const notchR = notchH / 2;
  ctx.save();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(notchX + notchR, notchY);
  ctx.lineTo(notchX + notchW - notchR, notchY);
  ctx.arcTo(notchX + notchW, notchY, notchX + notchW, notchY + notchR, notchR);
  ctx.arcTo(notchX + notchW, notchY + notchH, notchX + notchW - notchR, notchY + notchH, notchR);
  ctx.lineTo(notchX + notchR, notchY + notchH);
  ctx.arcTo(notchX, notchY + notchH, notchX, notchY + notchR, notchR);
  ctx.arcTo(notchX, notchY, notchX + notchR, notchY, notchR);
  ctx.closePath();
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

    // Calcul dimensions des téléphones
    const totalPadding = padding * 2;
    const gapBetween = padding * 0.8;
    const availableW = CANVAS_W - totalPadding - gapBetween * 2;
    const phoneW = availableW / 3;
    const phoneH = phoneW / PHONE_ASPECT;

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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Captures d'écran</h2>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <p className="text-sm font-medium text-gray-600 mb-3">Téléphone {i + 1}</p>
                <div
                  className="relative border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden"
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-center px-2">Cliquer ou déposer une image</span>
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
                    className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors"
                    onClick={() => setImages((prev) => { const n = [...prev]; n[i] = null; return n; })}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
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

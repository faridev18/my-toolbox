import { useState, useRef, useEffect } from 'react';

const COLORS = [
  '#A7F3D0', '#BFDBFE', '#DDD6FE', '#FBCFE8', '#FED7AA', '#FEF08A',
  '#86EFAC', '#93C5FD', '#C4B5FD', '#F9A8D4', '#FDBA74', '#FDE047',
  '#6EE7B7', '#60A5FA', '#A78BFA', '#F472B6', '#FB923C', '#FACC15',
  '#34D399', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#EAB308',
  '#10B981', '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#CA8A04',
  '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#000000'
];

function ScreenshotFramer() {
  const [image, setImage] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(() => {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randomIndex];
  });
  const [padding, setPadding] = useState(100);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            setImage(img);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas();
    }
  }, [image, backgroundColor, padding]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Ratio 3:2 avec padding
    const aspectRatio = 3 / 2;
    const canvasWidth = 1200;
    const canvasHeight = canvasWidth / aspectRatio;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Dessiner le fond
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculer les dimensions de l'image avec padding
    const availableWidth = canvasWidth - (padding * 2);
    const availableHeight = canvasHeight - (padding * 2);
    
    let imgWidth = availableWidth;
    let imgHeight = (image.height / image.width) * availableWidth;
    
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = (image.width / image.height) * availableHeight;
    }

    // Centrer l'image
    const x = (canvasWidth - imgWidth) / 2;
    const y = (canvasHeight - imgHeight) / 2;

    // Rayon des coins arrondis
    const borderRadius = 12;

    // Sauvegarder le contexte
    ctx.save();

    // Ajouter une ombre
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // Créer un chemin avec coins arrondis
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + imgWidth - borderRadius, y);
    ctx.arcTo(x + imgWidth, y, x + imgWidth, y + borderRadius, borderRadius);
    ctx.lineTo(x + imgWidth, y + imgHeight - borderRadius);
    ctx.arcTo(x + imgWidth, y + imgHeight, x + imgWidth - borderRadius, y + imgHeight, borderRadius);
    ctx.lineTo(x + borderRadius, y + imgHeight);
    ctx.arcTo(x, y + imgHeight, x, y + imgHeight - borderRadius, borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
    ctx.closePath();

    // Appliquer le clip et dessiner l'image
    ctx.clip();
    ctx.drawImage(image, x, y, imgWidth, imgHeight);

    // Restaurer le contexte
    ctx.restore();
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'screenshot-framed.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Screenshot Framer</h1>
          <p className="text-gray-600">Ajoutez un fond coloré à vos captures d'écran</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contrôles */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Contrôles</h2>
              
              {/* Upload Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importer une image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Choisir une image
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  💡 Astuce : Vous pouvez aussi coller une image avec Ctrl+V
                </p>
              </div>

              {/* Couleur de fond */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur de fond
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-12 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Couleurs prédéfinies */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleurs prédéfinies
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`h-10 rounded-lg transition-all ${
                        backgroundColor === color 
                          ? 'ring-2 ring-indigo-500' 
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Marge */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marge interne: {padding}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Export */}
              <button
                onClick={handleExport}
                disabled={!image}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  image
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Exporter l'image
              </button>
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Aperçu</h2>
            <div className="flex items-center justify-center">
              {image ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[3/2] flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-400">Aucune image importée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenshotFramer;

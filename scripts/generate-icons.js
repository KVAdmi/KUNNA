import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceIcon = path.join(__dirname, '..', 'Icono tiendas kunna.png');

// Definir todos los tamaños necesarios
const iconSizes = {
  // Android
  android: [
    { size: 36, name: 'mipmap-ldpi/ic_launcher.png' },
    { size: 48, name: 'mipmap-mdpi/ic_launcher.png' },
    { size: 72, name: 'mipmap-hdpi/ic_launcher.png' },
    { size: 96, name: 'mipmap-xhdpi/ic_launcher.png' },
    { size: 144, name: 'mipmap-xxhdpi/ic_launcher.png' },
    { size: 192, name: 'mipmap-xxxhdpi/ic_launcher.png' },
    { size: 512, name: 'playstore-icon.png' }
  ],
  // iOS
  ios: [
    { size: 20, name: 'AppIcon-20x20@1x.png' },
    { size: 40, name: 'AppIcon-20x20@2x.png' },
    { size: 60, name: 'AppIcon-20x20@3x.png' },
    { size: 29, name: 'AppIcon-29x29@1x.png' },
    { size: 58, name: 'AppIcon-29x29@2x.png' },
    { size: 87, name: 'AppIcon-29x29@3x.png' },
    { size: 40, name: 'AppIcon-40x40@1x.png' },
    { size: 80, name: 'AppIcon-40x40@2x.png' },
    { size: 120, name: 'AppIcon-40x40@3x.png' },
    { size: 120, name: 'AppIcon-60x60@2x.png' },
    { size: 180, name: 'AppIcon-60x60@3x.png' },
    { size: 76, name: 'AppIcon-76x76@1x.png' },
    { size: 152, name: 'AppIcon-76x76@2x.png' },
    { size: 167, name: 'AppIcon-83.5x83.5@2x.png' },
    { size: 1024, name: 'AppIcon-1024x1024@1x.png' }
  ],
  // Web/PWA
  web: [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 180, name: 'apple-touch-icon.png' }
  ]
};

async function generateIcons() {
  console.log('🚀 Iniciando generación de iconos...\n');

  // Verificar que existe la imagen fuente
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Error: No se encontró el archivo "Icono tiendas kunna.png"');
    process.exit(1);
  }

  // Android
  console.log('📱 Generando iconos para Android...');
  const androidDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  
  for (const icon of iconSizes.android) {
    const outputPath = path.join(androidDir, icon.name);
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await sharp(sourceIcon)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`  ✓ ${icon.name} (${icon.size}x${icon.size})`);
  }

  // iOS
  console.log('\n🍎 Generando iconos para iOS...');
  const iosDir = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  
  if (!fs.existsSync(iosDir)) {
    fs.mkdirSync(iosDir, { recursive: true });
  }
  
  for (const icon of iconSizes.ios) {
    const outputPath = path.join(iosDir, icon.name);
    
    await sharp(sourceIcon)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`  ✓ ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Web/PWA
  console.log('\n🌐 Generando iconos para Web/PWA...');
  const webDir = path.join(__dirname, '..', 'public', 'images');
  
  if (!fs.existsSync(webDir)) {
    fs.mkdirSync(webDir, { recursive: true });
  }
  
  for (const icon of iconSizes.web) {
    const outputPath = path.join(webDir, icon.name);
    
    await sharp(sourceIcon)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`  ✓ ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Copiar también a resources (para Capacitor)
  console.log('\n📦 Copiando icono base a resources...');
  const resourcesDir = path.join(__dirname, '..', 'resources');
  
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
  }
  
  await sharp(sourceIcon)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(resourcesDir, 'icon.png'));
  
  console.log('  ✓ icon.png (1024x1024)');

  // Generar favicon.ico
  console.log('\n🔖 Generando favicon.ico...');
  const faviconDir = path.join(__dirname, '..', 'public');
  
  await sharp(sourceIcon)
    .resize(48, 48, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(faviconDir, 'favicon.png'));
  
  console.log('  ✓ favicon.png (48x48)');

  console.log('\n✅ ¡Todos los iconos han sido generados exitosamente!');
}

// Ejecutar
generateIcons().catch(err => {
  console.error('❌ Error al generar iconos:', err);
  process.exit(1);
});

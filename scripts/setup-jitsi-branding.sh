#!/bin/bash

# 1. Copiar assets (asegúrate que los archivos existan en el directorio actual)
sudo cp logo-zinha.png /usr/share/jitsi-meet/images/
sudo cp sello-zinha.svg /usr/share/jitsi-meet/images/

# 2. Crear archivo CSS personalizado
sudo tee /usr/share/jitsi-meet/css/custom-zinha.css << 'EOF'
:root {
  --zinha-primary:#263152;
  --zinha-secondary:#6f5a8e;
  --zinha-accent:#e87bff;
  --zinha-accent-2:#b2d235;
  --glass-bg: rgba(255,255,255,.24);
  --glass-br: 18px;
}

/* ====== WELCOME (landing) ====== */
#welcome_page, #welcome-page-header, .welcome-page {
  background:
    radial-gradient(1200px 600px at 20% 0%, rgba(233,214,255,.45), transparent 60%),
    radial-gradient(1000px 500px at 90% 20%, rgba(255,210,240,.35), transparent 55%),
    linear-gradient(135deg, #f5e6ff 0%, #e8d9ff 40%, #f3dbe9 100%) !important;
  color: #1b1f2a !important;
}

#welcome-page-header, .welcome-page-settings, .header {
  background: transparent !important;
  border: 0 !important;
}

/* Card central glass */
.welcome .container .enter-room,
.welcome .welcome-card,
.welcome .welcome-watermark {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: var(--glass-br);
  border: 1px solid rgba(255,255,255,.35);
  box-shadow: 0 18px 45px rgba(38,49,82,.25);
}

/* Inputs */
input, .input-control, .input-large {
  background: rgba(255,255,255,.75) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(0,0,0,.08) !important;
  color: #1b1f2a !important;
}

/* Botones */
.button, .button-control, .enter-room__button, .action-btn {
  background: linear-gradient(180deg, var(--zinha-accent-2), #9ac020) !important;
  color:#1b1f2a !important; font-weight:700 !important;
  border-radius:14px !important; padding:12px 18px !important;
  box-shadow: 0 8px 20px rgba(178,210,53,.35) !important;
  border:0 !important;
}
.button:hover, .enter-room__button:hover, .action-btn:hover { filter: brightness(1.02); }

/* Toolbar en conferencia */
.toolbox, .toolbox-content, .filmstrip .filmstripToolbar {
  background: rgba(38,49,82,.85) !important;
  border-top-left-radius: 14px; border-top-right-radius: 14px;
}

/* ====== LOGOS ====== */
/* Ocultar marca Jitsi */
.watermark, .leftwatermark, .rightwatermark, .jitsiLogo, .jitsi-icon {
  display:none !important;
}

/* Logo Zinha en welcome (arriba izq) */
#welcome_page::after {
  content: "";
  position: absolute; top: 24px; left: 24px;
  width: 140px; height: 36px;
  background: url('/images/logo-zinha.png') no-repeat center/contain;
  pointer-events: none;
}

/* Sello Zinha en esquina (abajo der) */
body::after {
  content: "";
  position: fixed; right: 16px; bottom: 16px;
  width: 48px; height: 48px; opacity: .9;
  background: url('/images/sello-zinha.svg') no-repeat center/contain;
  pointer-events: none; z-index: 99999;
}

/* ====== Detalles ====== */
.subject, .recording-label { border-radius: 8px !important; }
.recording-label { background: var(--zinha-secondary) !important; }
EOF

# 3. Crear/Actualizar interface_config.js
sudo tee /usr/share/jitsi-meet/interface_config.js << 'EOF'
/* eslint-disable no-var */
var interfaceConfig = {
    APP_NAME: 'Zinha Meet',
    NATIVE_APP_NAME: 'Zinha',
    PROVIDER_NAME: 'Zinha',
    DEFAULT_BACKGROUND: '#263152',
    DEFAULT_LOGO_URL: '/images/logo-zinha.png',
    DEFAULT_WELCOME_PAGE_LOGO_URL: '/images/logo-zinha.png',

    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    SHOW_BRAND_WATERMARK: false,
    BRAND_WATERMARK_LINK: '',

    // Botonera minimal
    TOOLBAR_BUTTONS: [
      'microphone','camera','desktop','participants-pane','chat','tileview','hangup',
      'raisehand','settings','videoquality','toggle-camera'
    ],

    SETTINGS_SECTIONS: ['devices','language','profile'],
    MOBILE_APP_PROMO: false,
    DISABLE_VIDEO_BACKGROUND: true,
    FILM_STRIP_MAX_HEIGHT: 120,
    INITIAL_TOOLBAR_TIMEOUT: 20000,
    MAX_DISPLAY_NAME_LENGTH: 50,
    OPTIMAL_BROWSERS: ['chrome','chromium','firefox','nwjs','electron']
};
EOF

# 4. Actualizar config del sitio
sudo sed -i '/webUiConfig/d' /etc/jitsi/meet/meet.zinha.app-config.js
sudo sed -i '/enableClosePage/d' /etc/jitsi/meet/meet.zinha.app-config.js
sudo sed -i '1i\    webUiConfig: { customCss: "css/custom-zinha.css" },' /etc/jitsi/meet/meet.zinha.app-config.js
sudo sed -i '1i\    enableClosePage: false,' /etc/jitsi/meet/meet.zinha.app-config.js

# 5. Reiniciar servicios
sudo systemctl restart prosody
sudo systemctl restart jicofo
sudo systemctl restart jitsi-videobridge2

# 6. Verificar que el sitio responde
curl -I https://meet.zinha.app

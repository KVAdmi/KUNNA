#!/bin/bash
# Script para quitar logo de Jitsi y configurar JWT
# Ejecutar en el servidor meet.zinha.app

echo "🔧 Configurando servidor Jitsi..."

# 1. QUITAR LOGO DEL SERVIDOR
echo "📝 Editando interface_config.js..."
sudo cp /usr/share/jitsi-meet/interface_config.js /usr/share/jitsi-meet/interface_config.js.backup

# Crear el archivo interface_config.js sin branding
sudo tee /usr/share/jitsi-meet/interface_config.js > /dev/null <<EOF
var interfaceConfig = {
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    SHOW_BRAND_WATERMARK: false,
    BRAND_WATERMARK_LINK: '',
    DEFAULT_LOGO_URL: '',
    DEFAULT_WELCOME_PAGE_LOGO_URL: '',
    DISPLAY_ROOM_NAME: false,
    SHOW_ROOM_TIMER: false,
    HIDE_DEEP_LINKING_LOGO: true,
    SHOW_POWERED_BY: false,
    MOBILE_APP_PROMO: false,
    TOOLBAR_ALWAYS_VISIBLE: false,
    SHOW_CHROME_EXTENSION_BANNER: false,
    DISPLAY_WELCOME_PAGE_CONTENT: false,
    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false
};
EOF

# 2. CONFIGURAR JWT AUTHENTICATION
echo "🔐 Configurando JWT en Prosody..."
sudo cp /etc/prosody/conf.avail/meet.zinha.app.cfg.lua /etc/prosody/conf.avail/meet.zinha.app.cfg.lua.backup

# Buscar y reemplazar la línea de authentication
sudo sed -i 's/authentication = "anonymous"/authentication = "token"/' /etc/prosody/conf.avail/meet.zinha.app.cfg.lua

# Agregar configuración de JWT si no existe
if ! grep -q "app_id" /etc/prosody/conf.avail/meet.zinha.app.cfg.lua; then
    sudo sed -i '/authentication = "token"/a\    app_id = "zinha"\n    app_secret = "your-secret-key"\n    allow_empty_token = false' /etc/prosody/conf.avail/meet.zinha.app.cfg.lua
fi

# 3. REINICIAR SERVICIOS
echo "🔄 Reiniciando servicios Jitsi..."
sudo systemctl restart prosody
sudo systemctl restart jicofo
sudo systemctl restart jitsi-videobridge2
sudo systemctl restart nginx

echo "✅ Configuración completada!"
echo "💡 Ahora conecta SSH y ejecuta este script:"
echo "   ssh ubuntu@TU_IP_SERVER"
echo "   bash fix-jitsi-server.sh"

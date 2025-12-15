package com.zinha.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Registrar el plugin ZinhaBridgePlugin
        this.init(this.getBridge(), this.getBridge().getPlugins());

        // Configurar permisos de cámara/micrófono para Jitsi
        getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    String origin = request.getOrigin().toString();
                    if (origin.endsWith("meet.zinha.app/") || origin.contains("meet.zinha.app")) {
                        request.grant(request.getResources()); // cámara/mic para Jitsi
                    } else {
                        request.deny();
                    }
                });
            }
        });
    }
}
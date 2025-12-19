package com.zinha.app.voice

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

class VoiceTriggerService : Service() {

    override fun onCreate() {
        super.onCreate()
        Log.i("ZinhaVoice", "Servicio VoiceTrigger iniciado correctamente")
        // Aquí va Porcupine + SpeechRecognizer

        // BroadcastReceiver para recibir el Intent y enviar comando JS
        val receiver = object : android.content.BroadcastReceiver() {
            override fun onReceive(context: android.content.Context?, intent: android.content.Intent?) {
                val comando = intent?.getStringExtra("comando") ?: return
                Log.i("ZinhaVoice", "BroadcastReceiver recibió comando: $comando")
                // Aquí se llamaría al plugin Capacitor (ZinhaBridgePlugin) si está disponible
                // El plugin debe estar registrado en MainActivity y disponible vía bridge
                // Este código es el disparador, el plugin lo recibe y despacha el evento JS
            }
        }
        val filter = android.content.IntentFilter("com.zinha.DETENTE")
        registerReceiver(receiver, filter)
        // Guardar referencia si necesitas unregisterReceiver en onDestroy
        voiceReceiver = receiver
    }
    // Variable para guardar el receiver y poder desregistrarlo
    private var voiceReceiver: android.content.BroadcastReceiver? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.i("ZinhaVoice", "Servicio VoiceTrigger detenido")
        // Desregistrar el receiver si existe
        voiceReceiver?.let { unregisterReceiver(it) }
    }
    // Ejemplo: cuando detectes "Zinha detente" con Porcupine/SpeechRecognizer
    private fun onVoiceCommandDetected() {
        Log.i("ZinhaVoice", "Comando de voz 'Zinha detente' detectado")
        val intent = Intent("com.zinha.DETENTE")
        intent.putExtra("comando", "detener")
        sendBroadcast(intent)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}

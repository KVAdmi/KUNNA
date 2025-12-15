package com.zinha.app

import android.app.*
import android.content.Intent
import android.os.IBinder
import android.content.Context
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat

class SOSForegroundService : Service() {
    private val CHANNEL_ID = "ZinhaSOS"
    private val NOTIFICATION_ID = 1
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val stopIntent = Intent(this, MainActivity::class.java).apply {
            action = "STOP_SOS"
        }
        val stopPendingIntent = PendingIntent.getActivity(
            this, 0, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SOS Zinha Activo")
            .setContentText("Estamos contigo. Tu ubicación está siendo monitoreada.")
            .setSmallIcon(R.drawable.ic_notification)
            .setColor(Color.parseColor("#E63946"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .addAction(R.drawable.ic_stop, "Detener", stopPendingIntent)
            .build()

        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SOS Zinha",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Canal para el servicio SOS de Zinha"
                enableLights(true)
                lightColor = Color.RED
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

package com.zinha.app;

import android.app.*;
import android.content.Intent;
import android.os.IBinder;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class ZinhaLocationService extends Service {
    private static final String CHANNEL_ID = "ZinhaSOSChannel";
    private static final int NOTIFICATION_ID = 1;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Intent stopIntent = new Intent(this, MainActivity.class);
        stopIntent.setAction("STOP_SOS");
        PendingIntent stopPendingIntent = PendingIntent.getActivity(
            this, 0, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SOS Zinha Activo")
            .setContentText("Estamos contigo. Tu ubicación está siendo monitoreada.")
            .setSmallIcon(R.drawable.ic_notification)
            .setColor(Color.parseColor("#E63946"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .addAction(R.drawable.ic_stop, "Detener SOS", stopPendingIntent)
            .build();

        startForeground(NOTIFICATION_ID, notification);
        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "SOS Zinha",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Canal para el servicio SOS de Zinha");
            channel.enableLights(true);
            channel.setLightColor(Color.RED);
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

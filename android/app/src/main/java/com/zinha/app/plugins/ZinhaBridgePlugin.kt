package com.zinha.app.plugins

import android.util.Log
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.JSObject
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter

@CapacitorPlugin(name = "ZinhaBridgePlugin")
class ZinhaBridgePlugin : Plugin() {
    private var receiver: BroadcastReceiver? = null

    override fun load() {
        super.load()
        val filter = IntentFilter("com.zinha.DETENTE")
        receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val comando = intent?.getStringExtra("comando") ?: return
                Log.i("ZinhaBridgePlugin", "Recibido comando: $comando")
                // Envía evento JS a React
                bridge?.webView?.post {
                    bridge?.webView?.evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('zinhavoice', { detail: { comando: 'detener' } }));",
                        null
                    )
                }
                val data = JSObject()
                data.put("comando", comando)
                notifyListeners("zinhavoice", data)
            }
        }
        context.registerReceiver(receiver, filter)
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        receiver?.let { context.unregisterReceiver(it) }
    }

    // Método dummy para test JS
    fun test(call: PluginCall) {
        val ret = JSObject()
        ret.put("value", "ok")
        call.resolve(ret)
    }
}

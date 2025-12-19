package com.zinha.app

import android.content.Intent
import android.graphics.drawable.Icon
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService

class QuickSettingsTileService : TileService() {
    
    override fun onStartListening() {
        super.onStartListening()
        qsTile?.apply {
            icon = Icon.createWithResource(this@QuickSettingsTileService, R.drawable.ic_sos_tile)
            label = "SOS Zinha"
            state = Tile.STATE_INACTIVE
            updateTile()
        }
    }

    override fun onClick() {
        super.onClick()
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
            action = "zinha://sos-start"
        }
        startActivityAndCollapse(intent)
    }
}

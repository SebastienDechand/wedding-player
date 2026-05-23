package com.sebastien.bloved;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Bridge Capacitor entre Angular et AudioForegroundService.
 *
 * Méthodes JS disponibles :
 *  - updateNowPlaying({ title, artist, playing })
 *  - stopService()
 *
 * Événements émis vers JS :
 *  - onCommand : { command: 'play' | 'pause' | 'next' | 'prev' }
 */
@CapacitorPlugin(name = "AudioPlayer")
public class AudioPlugin extends Plugin {

    @Override
    public void load() {
        // Abonne le plugin aux commandes venant du service natif
        // (boutons notif, lock screen, casque Bluetooth…)
        AudioForegroundService.setCommandListener(command -> {
            JSObject data = new JSObject();
            data.put("command", command);
            notifyListeners("onCommand", data);
        });
    }

    /**
     * Démarre / met à jour le foreground service avec les infos du morceau.
     * Appelé depuis Angular à chaque changement de piste ou d'état play/pause.
     */
    @PluginMethod
    public void updateNowPlaying(PluginCall call) {
        String  title   = call.getString("title",  "B-Loved");
        String  artist  = call.getString("artist", "");
        boolean playing = Boolean.TRUE.equals(call.getBoolean("playing"));
        String  cover   = call.getString("cover",  null);

        Context ctx    = getContext();
        Intent  intent = new Intent(ctx, AudioForegroundService.class);
        intent.setAction(AudioForegroundService.ACTION_UPDATE);
        intent.putExtra("title",   title);
        intent.putExtra("artist",  artist);
        intent.putExtra("playing", playing);
        if (cover != null) intent.putExtra("cover", cover);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(intent);
        } else {
            ctx.startService(intent);
        }
        call.resolve();
    }

    /** Arrête le foreground service (ex: quand l'utilisateur ferme l'app). */
    @PluginMethod
    public void stopService(PluginCall call) {
        Intent intent = new Intent(getContext(), AudioForegroundService.class);
        intent.setAction(AudioForegroundService.ACTION_STOP);
        getContext().startService(intent);
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        AudioForegroundService.setCommandListener(null);
    }
}

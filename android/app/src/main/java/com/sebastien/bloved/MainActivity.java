package com.sebastien.bloved;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // registerPlugin DOIT être appelé avant super.onCreate()
        registerPlugin(AudioPlugin.class);
        super.onCreate(savedInstanceState);
    }

    /**
     * Contrecarre webView.onPause() de Capacitor pour que l'audio HTML5
     * continue de jouer quand l'app passe en arrière-plan.
     * Le foreground service prend le relais pour la persistance.
     */
    @Override
    public void onPause() {
        super.onPause();
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().onResume();
        }
    }

    /**
     * Bouton retour → minimise (ne ferme pas) comme Spotify.
     */
    @Override
    public void onBackPressed() {
        moveTaskToBack(true);
    }
}

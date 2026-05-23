package com.sebastien.bloved;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import androidx.core.app.NotificationCompat;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Foreground service audio — responsable de :
 *  - Garder le processus vivant en arrière-plan (comme Spotify)
 *  - Afficher la notification persistante avec contrôles
 *  - Exposer un MediaSession natif → lock screen + Bluetooth + casque
 *
 * Communique avec AudioPlugin via une interface statique (pas de dépendance extra).
 */
public class AudioForegroundService extends Service {

    private static final String CHANNEL_ID   = "bloved_audio";
    private static final int    NOTIF_ID     = 42;

    public static final String ACTION_UPDATE = "bloved.UPDATE";
    public static final String ACTION_PLAY   = "bloved.PLAY";
    public static final String ACTION_PAUSE  = "bloved.PAUSE";
    public static final String ACTION_NEXT   = "bloved.NEXT";
    public static final String ACTION_PREV   = "bloved.PREV";
    public static final String ACTION_STOP   = "bloved.STOP";

    // ─── Listener statique → plugin peut s'abonner sans broadcast ─────────────
    public interface CommandListener {
        void onCommand(String command);
    }
    private static CommandListener commandListener;
    public static void setCommandListener(CommandListener l) { commandListener = l; }

    // ─── État courant ──────────────────────────────────────────────────────────
    private MediaSessionCompat mediaSession;
    private String  title     = "B-Loved";
    private String  artist    = "";
    private boolean isPlaying = false;
    private String  coverUrl  = null;
    private Bitmap  coverBitmap = null;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    // ══════════════════════════════════════════════════════════════════════════
    // Cycle de vie
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel();
        buildMediaSession();
        // startForeground DOIT être appelé immédiatement (< 5 s) pour éviter ANR
        startForeground(NOTIF_ID, buildNotification());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) return START_STICKY;

        switch (intent.getAction()) {
            case ACTION_UPDATE:
                String t = intent.getStringExtra("title");
                String a = intent.getStringExtra("artist");
                if (t != null) title  = t;
                if (a != null) artist = a;
                isPlaying = intent.getBooleanExtra("playing", false);
                String newCover = intent.getStringExtra("cover");
                if (newCover != null && !newCover.equals(coverUrl)) {
                    coverUrl = newCover;
                    loadCoverAsync(newCover);
                }
                refreshMediaSession();
                refreshNotification();
                break;
            case ACTION_PLAY:
                dispatch("play");  break;
            case ACTION_PAUSE:
                dispatch("pause"); break;
            case ACTION_NEXT:
                dispatch("next");  break;
            case ACTION_PREV:
                dispatch("prev");  break;
            case ACTION_STOP:
                stopForeground(true);
                stopSelf();
                break;
        }
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onDestroy() {
        commandListener = null;
        executor.shutdownNow();
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
            mediaSession = null;
        }
        super.onDestroy();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MediaSession — lock screen + casque + Bluetooth
    // ══════════════════════════════════════════════════════════════════════════

    private void buildMediaSession() {
        mediaSession = new MediaSessionCompat(this, "BLovedAudio");
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override public void onPlay()           { dispatch("play");  }
            @Override public void onPause()          { dispatch("pause"); }
            @Override public void onSkipToNext()     { dispatch("next");  }
            @Override public void onSkipToPrevious() { dispatch("prev");  }
            @Override public void onStop()           { dispatch("pause"); }
        });
        refreshMediaSession();
        mediaSession.setActive(true);
    }

    private void refreshMediaSession() {
        if (mediaSession == null) return;

        long actions = PlaybackStateCompat.ACTION_PLAY
            | PlaybackStateCompat.ACTION_PAUSE
            | PlaybackStateCompat.ACTION_PLAY_PAUSE
            | PlaybackStateCompat.ACTION_SKIP_TO_NEXT
            | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS;

        int state = isPlaying
            ? PlaybackStateCompat.STATE_PLAYING
            : PlaybackStateCompat.STATE_PAUSED;

        mediaSession.setPlaybackState(new PlaybackStateCompat.Builder()
            .setActions(actions)
            .setState(state, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1f)
            .build());

        MediaMetadataCompat.Builder meta = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE,  title)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM,  "B-Loved ♥");
        if (coverBitmap != null) {
            meta.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, coverBitmap);
            meta.putBitmap(MediaMetadataCompat.METADATA_KEY_ART,       coverBitmap);
        }
        mediaSession.setMetadata(meta.build());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Notification MediaStyle — apparaît dans le fil ET sur l'écran de verrouillage
    // ══════════════════════════════════════════════════════════════════════════

    private void refreshNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NOTIF_ID, buildNotification());
    }

    private Notification buildNotification() {
        PendingIntent piPrev  = servicePI(ACTION_PREV,  10);
        PendingIntent piPlay  = servicePI(isPlaying ? ACTION_PAUSE : ACTION_PLAY, 11);
        PendingIntent piNext  = servicePI(ACTION_NEXT,  12);

        Intent openApp = new Intent(this, MainActivity.class);
        openApp.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent piOpen = PendingIntent.getActivity(this, 20, openApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        int playIcon = isPlaying
            ? android.R.drawable.ic_media_pause
            : android.R.drawable.ic_media_play;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title.isEmpty() ? "B-Loved" : title)
            .setContentText(artist.isEmpty()  ? "♥ b-loved" : artist)
            .setContentIntent(piOpen)
            .addAction(android.R.drawable.ic_media_previous, "Précédent", piPrev)
            .addAction(playIcon, isPlaying ? "Pause" : "Play",            piPlay)
            .addAction(android.R.drawable.ic_media_next,     "Suivant",   piNext)
            .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(isPlaying)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW);
        if (coverBitmap != null) {
            builder.setLargeIcon(coverBitmap);
        }
        return builder.build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Cover art — chargement asynchrone depuis l'URL (Apple Music CDN)
    // ══════════════════════════════════════════════════════════════════════════

    private void loadCoverAsync(String urlStr) {
        executor.execute(() -> {
            try {
                HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(8000);
                conn.connect();
                try (InputStream is = conn.getInputStream()) {
                    Bitmap bmp = BitmapFactory.decodeStream(is);
                    if (bmp != null) {
                        coverBitmap = bmp;
                        refreshMediaSession();
                        refreshNotification();
                    }
                } finally {
                    conn.disconnect();
                }
            } catch (Exception ignored) { /* pas de cover = pas grave */ }
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Helpers
    // ══════════════════════════════════════════════════════════════════════════

    private PendingIntent servicePI(String action, int code) {
        Intent i = new Intent(this, AudioForegroundService.class).setAction(action);
        return PendingIntent.getService(this, code, i,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static void dispatch(String cmd) {
        if (commandListener != null) commandListener.onCommand(cmd);
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID, "B-Loved Lecture", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Contrôles de lecture audio");
            ch.setShowBadge(false);
            ch.setSound(null, null);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(ch);
        }
    }
}

package ru.chmogame.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** Скачивание APK обновления внутри приложения и запуск системного установщика. */
@CapacitorPlugin(name = "Updater")
public class UpdaterPlugin extends Plugin {

    private File apkFile;

    @PluginMethod
    public void canInstall(PluginCall call) {
        boolean ok = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ok = getContext().getPackageManager().canRequestPackageInstalls();
        }
        JSObject ret = new JSObject();
        ret.put("value", ok);
        call.resolve(ret);
    }

    @PluginMethod
    public void openInstallSettings(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + getContext().getPackageName()));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void download(final PluginCall call) {
        final String url = call.getString("url");
        if (url == null) {
            call.reject("Не указан адрес файла");
            return;
        }
        new Thread(new Runnable() {
            @Override
            public void run() {
                HttpURLConnection conn = null;
                try {
                    String current = url;
                    for (int hop = 0; hop < 5; hop++) {
                        conn = (HttpURLConnection) new URL(current).openConnection();
                        conn.setConnectTimeout(20000);
                        conn.setReadTimeout(30000);
                        conn.setInstanceFollowRedirects(false);
                        conn.connect();
                        int code = conn.getResponseCode();
                        if (code == 301 || code == 302 || code == 303 || code == 307 || code == 308) {
                            current = conn.getHeaderField("Location");
                            conn.disconnect();
                            conn = null;
                            continue;
                        }
                        if (code != 200) throw new Exception("HTTP " + code);
                        break;
                    }
                    if (conn == null) throw new Exception("Слишком много перенаправлений");

                    int total = conn.getContentLength();
                    File dir = getContext().getExternalCacheDir();
                    if (dir == null) dir = getContext().getCacheDir();
                    File out = new File(dir, "update.apk");
                    if (out.exists() && !out.delete()) throw new Exception("Не удалось очистить кэш");

                    InputStream in = conn.getInputStream();
                    FileOutputStream fos = new FileOutputStream(out);
                    byte[] buf = new byte[65536];
                    int read;
                    long done = 0, lastNotify = 0;
                    while ((read = in.read(buf)) > 0) {
                        fos.write(buf, 0, read);
                        done += read;
                        long now = System.currentTimeMillis();
                        if (now - lastNotify > 120) {
                            lastNotify = now;
                            JSObject ev = new JSObject();
                            ev.put("loaded", done);
                            ev.put("total", total);
                            notifyListeners("progress", ev);
                        }
                    }
                    fos.flush();
                    fos.close();
                    in.close();

                    if (done < 100000) throw new Exception("Файл повреждён");
                    apkFile = out;
                    JSObject ret = new JSObject();
                    ret.put("path", out.getAbsolutePath());
                    ret.put("size", done);
                    call.resolve(ret);
                } catch (Exception e) {
                    call.reject(e.getMessage() == null ? "Ошибка загрузки" : e.getMessage());
                } finally {
                    if (conn != null) conn.disconnect();
                }
            }
        }).start();
    }

    @PluginMethod
    public void install(PluginCall call) {
        try {
            File f = apkFile;
            if (f == null) {
                File dir = getContext().getExternalCacheDir();
                if (dir == null) dir = getContext().getCacheDir();
                f = new File(dir, "update.apk");
            }
            if (!f.exists()) {
                call.reject("Файл обновления не найден");
                return;
            }
            Uri uri = FileProvider.getUriForFile(getContext(),
                    getContext().getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage() == null ? "Не удалось открыть установщик" : e.getMessage());
        }
    }
}

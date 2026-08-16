package com.welcomecoworking.display

import android.app.Activity
import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.http.SslError
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.SslErrorHandler
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private lateinit var connectivityManager: ConnectivityManager
    private val handler = Handler(Looper.getMainLooper())
    private var networkCallbackRegistered = false
    private var wasPaused = false

    private val retryLoad = Runnable { loadDisplay() }
    private val periodicRefresh = object : Runnable {
        override fun run() {
            loadDisplay()
            handler.postDelayed(this, REFRESH_INTERVAL_MS)
        }
    }

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            handler.post { loadDisplay() }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        enterImmersiveMode()

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setPadding(0, 0, 0, 0)
            setBackgroundColor(0xFF000000.toInt())
        }
        setContentView(webView)
        configureWebView()

        connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        registerNetworkCallback()
        loadDisplay()
        handler.postDelayed(periodicRefresh, REFRESH_INTERVAL_MS)
    }

    @Suppress("SetJavaScriptEnabled")
    private fun configureWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            allowFileAccess = false
            allowContentAccess = false
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
        }

        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                handler.removeCallbacks(retryLoad)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                if (request?.isForMainFrame == true) scheduleRetry()
            }

            @Deprecated("Required for Fire OS versions using the legacy WebView callback")
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                scheduleRetry()
            }

            override fun onReceivedSslError(
                view: WebView?,
                handler: SslErrorHandler?,
                error: SslError?
            ) {
                // Never bypass certificate validation.
                handler?.cancel()
                scheduleRetry()
            }
        }
    }

    private fun loadDisplay() {
        if (!isNetworkAvailable()) {
            scheduleRetry()
            return
        }
        handler.removeCallbacks(retryLoad)
        webView.loadUrl(DISPLAY_URL)
    }

    private fun scheduleRetry() {
        handler.removeCallbacks(retryLoad)
        handler.postDelayed(retryLoad, RETRY_DELAY_MS)
    }

    private fun isNetworkAvailable(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun registerNetworkCallback() {
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        try {
            connectivityManager.registerNetworkCallback(request, networkCallback)
            networkCallbackRegistered = true
        } catch (_: RuntimeException) {
            // Periodic retries remain active if Fire OS refuses callback registration.
        }
    }

    @Suppress("DEPRECATION")
    private fun enterImmersiveMode() {
        window.decorView.systemUiVisibility =
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) enterImmersiveMode()
    }

    override fun onPause() {
        wasPaused = true
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        enterImmersiveMode()
        if (wasPaused) {
            wasPaused = false
            loadDisplay()
        }
    }

    @Deprecated("Back is deliberately consumed in kiosk mode")
    override fun onBackPressed() {
        enterImmersiveMode()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        if (networkCallbackRegistered) {
            try {
                connectivityManager.unregisterNetworkCallback(networkCallback)
            } catch (_: RuntimeException) {
                // Already unregistered by the system.
            }
        }
        webView.stopLoading()
        webView.destroy()
        super.onDestroy()
    }

    companion object {
        private const val DISPLAY_URL = "https://www.welcome-coworking.com/display"
        private const val RETRY_DELAY_MS = 5_000L
        private const val REFRESH_INTERVAL_MS = 30 * 60 * 1_000L
    }
}

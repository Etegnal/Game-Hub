package com.example.gamehub

import android.graphics.Color as AndroidColor
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import com.example.gamehub.theme.GameHubTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      var webViewRef by remember { mutableStateOf<WebView?>(null) }

      BackHandler(enabled = true) {
        if (webViewRef?.canGoBack() == true) {
          webViewRef?.goBack()
        } else {
          finish()
        }
      }

      GameHubTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF070B14)) {
          AndroidView(
            modifier = Modifier
              .fillMaxSize()
              .safeDrawingPadding(),
            factory = { context ->
              WebView(context).apply {
                setBackgroundColor(AndroidColor.parseColor("#070B14"))
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.databaseEnabled = true
                settings.useWideViewPort = true
                settings.loadWithOverviewMode = true
                settings.cacheMode = WebSettings.LOAD_DEFAULT
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                webViewClient = object : WebViewClient() {
                  override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?,
                  ): Boolean = false
                }
                loadUrl("https://etegnal.github.io/Game-Hub/?platform=android-webview")
                webViewRef = this
              }
            }
          )
        }
      }
    }
  }
}

import Capacitor

// Registers the app's own native plugins with the Capacitor bridge
// (2026-10-09). Main.storyboard points at this class instead of
// CAPBridgeViewController.
class BastionViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeVoicePlugin())
        // The left-edge swipe goes back through the page's history, which the web
        // app keeps one entry deep per open screen (components/shell/backStack.ts).
        webView?.allowsBackForwardNavigationGestures = true
    }
}

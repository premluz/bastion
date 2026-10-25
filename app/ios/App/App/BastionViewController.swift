import Capacitor
import WebKit

// Registers the app's own native plugins with the Capacitor bridge
// (2026-10-09). Main.storyboard points at this class instead of
// CAPBridgeViewController.
class BastionViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeVoicePlugin())
        // The left-edge swipe goes back through the page's history, which the web
        // app keeps one entry deep per open screen (components/shell/backStack.ts).
        webView?.allowsBackForwardNavigationGestures = true
        // No form accessory bar (the ^ ˅ ✓ row) above the keyboard: it sat as a dark
        // band between the composer and the keyboard (2026-10-14, direct feedback).
        webView?.hideFormAccessoryBar()
    }
}

private final class NoAccessoryBar: NSObject {
    @objc var inputAccessoryView: AnyObject? { nil }
}

private extension WKWebView {
    // WKWebView offers no switch for its accessory bar. The same technique
    // @capacitor/keyboard uses (without adding the package): give the web content
    // view a subclass whose inputAccessoryView is nil.
    func hideFormAccessoryBar() {
        guard let content = scrollView.subviews.first(where: { String(describing: type(of: $0)).hasPrefix("WKContent") }),
              let contentClass = object_getClass(content) else { return }
        let name = "\(contentClass)_NoAccessoryBar"
        var subclass: AnyClass? = NSClassFromString(name)
        if subclass == nil, let created = objc_allocateClassPair(contentClass, name, 0) {
            objc_registerClassPair(created)
            subclass = created
        }
        guard let subclass,
              let getter = class_getInstanceMethod(NoAccessoryBar.self, #selector(getter: NoAccessoryBar.inputAccessoryView)) else { return }
        class_addMethod(subclass, #selector(getter: NoAccessoryBar.inputAccessoryView),
                        method_getImplementation(getter), method_getTypeEncoding(getter))
        object_setClass(content, subclass)
    }
}

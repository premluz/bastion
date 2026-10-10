import AVFoundation
import Capacitor
import Speech

// Apple's own speech recognition and voices for the iOS app (2026-10-09,
// Prem: "go native Apple voice"). The web app's browser speech is not
// reliable inside a WKWebView — the simulator's returns a canned "Test" — so
// the shell listens and speaks natively and streams events to the same
// JavaScript voice code (components/shell/nativeVoice.ts).
//
// Events: "result" { session, text, isFinal }, "end" { session }, "error"
// { session, code, message } while listening — `session` is the id the
// caller passed to startListening, so an aborted listener ignores a newer one; "speechStart" / "speechEnd" { id } while speaking.
@objc(NativeVoicePlugin)
public class NativeVoicePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeVoicePlugin"
    public let jsName = "NativeVoice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "abortListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "speak", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopSpeaking", returnType: CAPPluginReturnPromise),
    ]

    private let audioEngine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    // Bumped on every start/abort: callbacks from an older task are ignored.
    private var generation = 0
    private var sessionId = ""
    let synthesizer = AVSpeechSynthesizer()
    var utteranceIds: [ObjectIdentifier: String] = [:]

    override public func load() {
        synthesizer.delegate = self
    }

    @objc func startListening(_ call: CAPPluginCall) {
        let language = call.getString("lang") ?? "en-US"
        guard let session = call.getString("session") else {
            call.reject("startListening needs a session id.", "invalid-arguments")
            return
        }
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                guard status == .authorized else {
                    call.reject("Speech recognition permission was denied.", "not-allowed")
                    return
                }
                self.requestMicrophone { granted in
                    guard granted else {
                        call.reject("Microphone permission was denied.", "not-allowed")
                        return
                    }
                    do {
                        try self.beginRecognition(language: language, session: session)
                        call.resolve()
                    } catch {
                        call.reject("Could not start listening: \(error.localizedDescription)", "audio-capture", error)
                    }
                }
            }
        }
    }

    /// Finishes the current phrase: the recognizer delivers its final result, then "end".
    @objc func stopListening(_ call: CAPPluginCall) {
        stopAudio()
        request?.endAudio()
        call.resolve()
    }

    /// Drops the current phrase without a result; "end" follows at once.
    @objc func abortListening(_ call: CAPPluginCall) {
        let wasListening = task != nil
        generation += 1
        task?.cancel()
        finishRecognition()
        if wasListening { notifyListeners("end", data: ["session": sessionId]) }
        call.resolve()
    }

    private func requestMicrophone(_ completion: @escaping (Bool) -> Void) {
        let respond = { (granted: Bool) in DispatchQueue.main.async { completion(granted) } }
        if #available(iOS 17.0, *) {
            AVAudioApplication.requestRecordPermission(completionHandler: respond)
        } else {
            AVAudioSession.sharedInstance().requestRecordPermission(respond)
        }
    }

    /// Play-and-record through the speaker, so narration stays loud between phrases.
    func activateAudioSession() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothHFP])
        try session.setActive(true)
    }

    private func beginRecognition(language: String, session: String) throws {
        generation += 1
        let current = generation
        sessionId = session
        task?.cancel()
        finishRecognition()
        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: language)), recognizer.isAvailable else {
            throw NSError(domain: "NativeVoice", code: 1, userInfo: [NSLocalizedDescriptionKey: "Speech recognition is unavailable for \(language)."])
        }
        try activateAudioSession()
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        self.request = request
        let input = audioEngine.inputNode
        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: input.outputFormat(forBus: 0)) { buffer, _ in
            request.append(buffer)
        }
        audioEngine.prepare()
        try audioEngine.start()
        task = recognizer.recognitionTask(with: request) { [weak self] result, error in
            DispatchQueue.main.async {
                guard let self, current == self.generation else { return }
                if let result {
                    self.notifyListeners("result", data: ["session": session, "text": result.bestTranscription.formattedString, "isFinal": result.isFinal])
                }
                let finished = result?.isFinal ?? false
                if let error, !finished { self.reportRecognitionError(error, session: session) }
                if finished || error != nil {
                    self.finishRecognition()
                    self.notifyListeners("end", data: ["session": session])
                }
            }
        }
    }

    // Silence and cancellation surface as errors from the recognizer; the
    // JavaScript side treats "no-speech" as a quiet restart, like Chrome's.
    private func reportRecognitionError(_ error: Error, session: String) {
        let nsError = error as NSError
        let silent = nsError.domain == "kAFAssistantErrorDomain" && [1110, 216, 203, 301].contains(nsError.code)
        notifyListeners("error", data: ["session": session, "code": silent ? "no-speech" : "network", "message": nsError.localizedDescription])
    }

    private func stopAudio() {
        if audioEngine.isRunning { audioEngine.stop() }
        audioEngine.inputNode.removeTap(onBus: 0)
    }

    private func finishRecognition() {
        stopAudio()
        request?.endAudio()
        request = nil
        task = nil
    }
}

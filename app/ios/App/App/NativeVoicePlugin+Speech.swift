import AVFoundation
import Capacitor

// Speaking with Apple's voices. The recorded assistant is a male speaker
// (measured), so prefer the male English voices iOS ships, best quality
// first; otherwise the system voice for the language.
private let preferredVoiceNames = ["Aaron", "Nathan", "Evan", "Tom", "Alex", "Daniel", "Arthur"]

extension NativeVoicePlugin: AVSpeechSynthesizerDelegate {
    @objc func speak(_ call: CAPPluginCall) {
        guard let text = call.getString("text"), let id = call.getString("id") else {
            call.reject("speak needs text and id.", "invalid-arguments")
            return
        }
        do {
            try activateAudioSession()
        } catch {
            call.reject("Could not start audio for speech: \(error.localizedDescription)", "audio-session", error)
            return
        }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = Self.voice(for: call.getString("lang") ?? "en-US")
        utteranceIds[ObjectIdentifier(utterance)] = id
        synthesizer.speak(utterance)
        call.resolve()
    }

    @objc func stopSpeaking(_ call: CAPPluginCall) {
        synthesizer.stopSpeaking(at: .immediate)
        call.resolve()
    }

    static func voice(for language: String) -> AVSpeechSynthesisVoice? {
        let english = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.hasPrefix("en") }
        for name in preferredVoiceNames {
            let matches = english.filter { $0.name == name }.sorted { $0.quality.rawValue > $1.quality.rawValue }
            if let best = matches.first(where: { $0.language == language }) ?? matches.first { return best }
        }
        return AVSpeechSynthesisVoice(language: language)
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        guard let id = utteranceIds[ObjectIdentifier(utterance)] else { return }
        notifyListeners("speechStart", data: ["id": id])
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        guard let id = utteranceIds.removeValue(forKey: ObjectIdentifier(utterance)) else { return }
        notifyListeners("speechEnd", data: ["id": id])
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        utteranceIds.removeValue(forKey: ObjectIdentifier(utterance))
    }
}

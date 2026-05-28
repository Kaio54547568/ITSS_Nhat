import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { Mic, MicOff, Phone, PhoneCall, PhoneOff } from "lucide-react";
import { useAppData } from "../store/AppDataContext";
import { useWebRTCAudioCall, type StartAudioCallInput } from "./useWebRTCAudioCall";

type VoiceCallContextValue = {
  startAudioCall: (input: StartAudioCallInput) => Promise<void>;
  isCallActive: boolean;
};

const VoiceCallContext = createContext<VoiceCallContextValue | null>(null);

export function VoiceCallProvider({ children }: { children: ReactNode }) {
  const { currentUser, users } = useAppData();
  const findUser = useCallback((id: string) => users.find((user) => user.id === id) ?? null, [users]);
  const call = useWebRTCAudioCall({ currentUser, findUser });

  const contextValue = useMemo(
    () => ({
      startAudioCall: call.startAudioCall,
      isCallActive: call.isCallActive,
    }),
    [call.isCallActive, call.startAudioCall],
  );

  const title = call.phase === "incoming" ? "着信中" : call.phase === "outgoing" ? "呼び出し中" : call.phase === "active" ? "通話中" : "";
  const detail =
    call.phase === "incoming" ? "音声通話が届いています" : call.phase === "outgoing" ? "相手の応答を待っています" : "マイクで会話できます";

  return (
    <VoiceCallContext.Provider value={contextValue}>
      {children}
      <audio ref={call.audioRef} autoPlay playsInline />

      {call.phase !== "idle" && call.remoteUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div
            className="w-full rounded-[20px] p-5 text-center"
            style={{
              maxWidth: 430,
              background: "white",
              border: "1.5px solid #F5DDD0",
              boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
            }}
          >
            <h2 style={{ color: "#F97316", fontWeight: 700, fontSize: "1.25rem", marginBottom: 18 }}>{title}</h2>

            <div className="flex flex-col items-center py-4">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4"
                style={{ background: call.remoteUser.avatarColor }}
              >
                {call.remoteUser.avatarEmoji}
              </div>
              <div style={{ color: "#1A1A1A", fontWeight: 700, fontSize: "1.1rem" }}>{call.remoteUser.name}</div>
              <div style={{ color: "#888", fontSize: "0.9rem", marginTop: 4 }}>{detail}</div>
              {call.errorMessage && <div style={{ color: "#EF4444", fontSize: "0.82rem", marginTop: 10 }}>{call.errorMessage}</div>}

              <div
                className="mt-3 px-3 py-2 rounded-xl text-left"
                style={{ background: "#FFF7F2", border: "1px solid #F5DDD0", color: "#777", fontSize: "0.72rem", lineHeight: 1.55 }}
              >
                <div>peer: {call.debug.connectionState}</div>
                <div>current user: {call.debug.currentUserId}</div>
                <div>session: {call.debug.sessionId}</div>
                <div>caller: {call.debug.callerId}</div>
                <div>callee: {call.debug.calleeId}</div>
                <div>computed role: {call.debug.computedRole}</div>
                <div>peer id: {call.debug.peerDebugId}</div>
                <div>peer role: {call.debug.peerRole}</div>
                <div>peer created: {call.debug.peerCreatedAt}</div>
                <div>peer closed: {String(call.debug.isPeerClosed)}</div>
                <div>subscriptions: {call.debug.activeSubscriptionsCount}</div>
                <div>timeouts: {call.debug.activeTimeoutsCount}</div>
                <div>ice: {call.debug.iceConnectionState}</div>
                <div>ice gathering: {call.debug.iceGatheringState}</div>
                <div>signaling: {call.debug.signalingState}</div>
                <div>local SDP audio: {call.debug.localAudioSdp}</div>
                <div>remote SDP audio: {call.debug.remoteAudioSdp}</div>
                <div>local audio tracks: {call.debug.localTrackCount}</div>
                <div>remote audio tracks: {call.debug.remoteAudioTrackCount}</div>
                <div>receiver audio tracks: {call.debug.receiverAudioTrackCount}</div>
                <div>audio srcObject: {String(call.debug.audioElementSrcObject)}</div>
                <div>audio paused: {String(call.debug.audioElementPaused)}</div>
                <div>audio muted: {String(call.debug.audioElementMuted)}</div>
                <div>audio volume: {call.debug.audioElementVolume}</div>
                <div>local candidates: {call.debug.localCandidateCount}</div>
                <div>remote candidates: {call.debug.remoteCandidateCount}</div>
                <div>caller onicecandidate: {call.debug.callerOnIceCandidateCount}</div>
                <div>caller ICE inserts: {call.debug.callerIceInsertSuccessCount}</div>
                <div>callee onicecandidate: {call.debug.calleeOnIceCandidateCount}</div>
                <div>callee ICE inserts: {call.debug.calleeIceInsertSuccessCount}</div>
                <div>received remote ICE: {call.debug.receivedRemoteIceCount}</div>
                <div>added remote ICE: {call.debug.addedRemoteIceCount}</div>
                <div>pending ICE: {call.debug.pendingIceCount}</div>
                <div>local SDP candidates: {call.debug.localSdpCandidateCount}</div>
                <div>remote SDP candidates: {call.debug.remoteSdpCandidateCount}</div>
                <div>candidate pair: {call.debug.selectedCandidatePair}</div>
                <div>outbound audio bytes: {call.debug.outboundAudioBytes}</div>
                <div>inbound audio bytes: {call.debug.inboundAudioBytes}</div>
                {call.debug.iceCandidateError && <div>ICE error: {call.debug.iceCandidateError}</div>}
                {call.debug.lastIceCandidateError && <div>last ICE error: {call.debug.lastIceCandidateError}</div>}
                {call.debug.noLocalCandidateError && <div>no local candidate: {call.debug.noLocalCandidateError}</div>}
                {call.debug.callerIceInsertError && <div>caller ICE insert error: {call.debug.callerIceInsertError}</div>}
                {call.debug.calleeIceInsertError && <div>callee ICE insert error: {call.debug.calleeIceInsertError}</div>}
                {call.debug.lastSignalError && <div>signal error: {call.debug.lastSignalError}</div>}
              </div>

              {call.needsAudioUnlock && (
                <button
                  type="button"
                  onClick={() => void call.playRemoteAudio()}
                  className="mt-3 px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#F97316", color: "white", fontWeight: 700, fontSize: "0.86rem" }}
                >
                  Bật âm thanh / Enable audio
                </button>
              )}
            </div>

            {call.phase === "incoming" ? (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => void call.endCall()}
                  className="py-3 rounded-full transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: "#EF4444", color: "white", fontWeight: 700 }}
                >
                  <PhoneOff size={18} />
                  拒否
                </button>
                <button
                  type="button"
                  onClick={() => void call.acceptIncomingCall()}
                  className="py-3 rounded-full transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: "#22C55E", color: "white", fontWeight: 700 }}
                >
                  <PhoneCall size={18} />
                  応答
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  type="button"
                  onClick={call.toggleMute}
                  className="py-3 rounded-full transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: "#FFF0E8", color: "#F97316", border: "1.5px solid #F5DDD0", fontWeight: 700 }}
                >
                  {call.isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  {call.isMuted ? "ミュート中" : "ミュート"}
                </button>
                <button
                  type="button"
                  onClick={() => void call.endCall()}
                  className="py-3 rounded-full transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: "#EF4444", color: "white", fontWeight: 700 }}
                >
                  <Phone size={18} />
                  終了
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </VoiceCallContext.Provider>
  );
}

export function useVoiceCall() {
  const value = useContext(VoiceCallContext);
  if (!value) throw new Error("useVoiceCall must be used inside VoiceCallProvider");
  return value;
}

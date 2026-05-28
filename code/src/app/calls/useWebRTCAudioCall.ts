import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import type { AppUser } from "../store/AppDataContext";

type CallStatus = "ringing" | "accepted" | "rejected" | "ended" | "missed";
type SignalType = "offer" | "answer" | "ice-candidate";
export type CallPhase = "idle" | "incoming" | "outgoing" | "active";
type CallRole = "caller" | "callee";

type CallSession = {
  id: string;
  caller_id: string;
  receiver_id: string;
  thread_id: string | null;
  call_type: "audio";
  status: CallStatus;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
};

type CallSignal = {
  id: string;
  session_id: string;
  sender_id: string;
  receiver_id: string;
  signal_type: SignalType;
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
  created_at: string;
};

export type StartAudioCallInput = {
  receiver: AppUser;
  threadId?: string;
};

type TrackDebug = {
  enabled: boolean;
  id: string;
  label: string;
  muted: boolean;
  readyState: MediaStreamTrackState;
};

export type WebRTCAudioDebug = {
  audioElementMuted: boolean;
  audioElementPaused: boolean;
  audioElementSrcObject: boolean;
  audioElementVolume: number;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  iceGatheringState: RTCIceGatheringState;
  inboundAudioBytes: number;
  iceCandidateError: string;
  isPeerClosed: boolean;
  localCandidateCount: number;
  localAudioSdp: string;
  localSdpCandidateCount: number;
  localTrackCount: number;
  localTracks: TrackDebug[];
  lastSignalError: string;
  lastIceCandidateError: string;
  noLocalCandidateError: string;
  outboundAudioBytes: number;
  pendingIceCount: number;
  peerDebugId: string;
  peerRole: string;
  receiverAudioTrackCount: number;
  remoteAudioSdp: string;
  remoteAudioTrackCount: number;
  remoteCandidateCount: number;
  remoteSdpCandidateCount: number;
  remoteTracks: TrackDebug[];
  selectedCandidatePair: string;
  callerOnIceCandidateCount: number;
  callerIceInsertSuccessCount: number;
  callerIceInsertError: string;
  calleeOnIceCandidateCount: number;
  calleeIceInsertSuccessCount: number;
  calleeIceInsertError: string;
  activeSubscriptionsCount: number;
  activeTimeoutsCount: number;
  addedRemoteIceCount: number;
  callerId: string;
  calleeId: string;
  computedRole: string;
  currentUserId: string;
  peerCreatedAt: string;
  receivedRemoteIceCount: number;
  sessionId: string;
  signalingState: RTCSignalingState;
};

const initialDebug: WebRTCAudioDebug = {
  audioElementMuted: false,
  audioElementPaused: true,
  audioElementSrcObject: false,
  audioElementVolume: 1,
  connectionState: "new",
  iceConnectionState: "new",
  iceGatheringState: "new",
  inboundAudioBytes: 0,
  iceCandidateError: "",
  isPeerClosed: true,
  localCandidateCount: 0,
  localAudioSdp: "-",
  localSdpCandidateCount: 0,
  localTrackCount: 0,
  localTracks: [],
  lastSignalError: "",
  lastIceCandidateError: "",
  noLocalCandidateError: "",
  outboundAudioBytes: 0,
  pendingIceCount: 0,
  peerDebugId: "-",
  peerRole: "-",
  receiverAudioTrackCount: 0,
  remoteAudioSdp: "-",
  remoteAudioTrackCount: 0,
  remoteCandidateCount: 0,
  remoteSdpCandidateCount: 0,
  remoteTracks: [],
  selectedCandidatePair: "-",
  callerOnIceCandidateCount: 0,
  callerIceInsertSuccessCount: 0,
  callerIceInsertError: "",
  calleeOnIceCandidateCount: 0,
  calleeIceInsertSuccessCount: 0,
  calleeIceInsertError: "",
  activeSubscriptionsCount: 0,
  activeTimeoutsCount: 0,
  addedRemoteIceCount: 0,
  callerId: "-",
  calleeId: "-",
  computedRole: "-",
  currentUserId: "-",
  peerCreatedAt: "-",
  receivedRemoteIceCount: 0,
  sessionId: "-",
  signalingState: "stable",
};

const rtcConfig: RTCConfiguration = {
  bundlePolicy: "balanced",
  iceCandidatePoolSize: 0,
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  iceTransportPolicy: "all",
};

function createPeerConnection(role: "caller" | "callee") {
  console.info(`[webrtc][${role}] create pc`, { config: rtcConfig });
  return new RTCPeerConnection(rtcConfig);
}

function isPeerClosed(pc: RTCPeerConnection | null | undefined) {
  return !pc || pc.signalingState === "closed" || pc.connectionState === "closed";
}

function getSessionRole(session: CallSession, currentUserId: string): CallRole | null {
  if (session.caller_id === currentUserId) return "caller";
  if (session.receiver_id === currentUserId) return "callee";
  return null;
}

function getRemoteUserId(session: CallSession, role: CallRole) {
  return role === "caller" ? session.receiver_id : session.caller_id;
}

function getLogPrefix(sessionId: string | undefined, peerDebugId: string | undefined, role: string | undefined) {
  return `[webrtc][${sessionId ?? "-"}][${peerDebugId ?? "-"}][${role ?? "-"}]`;
}

function callIdFor(callerId: string, receiverId: string) {
  return `call_${Date.now()}_${callerId}_${receiverId}`;
}

function isCallSession(value: unknown): value is CallSession {
  return Boolean(value && typeof value === "object" && "id" in value && "caller_id" in value && "receiver_id" in value);
}

function isCallSignal(value: unknown): value is CallSignal {
  return Boolean(value && typeof value === "object" && "id" in value && "session_id" in value && "signal_type" in value);
}

function describeTracks(stream: MediaStream | null): TrackDebug[] {
  return (
    stream?.getAudioTracks().map((track) => ({
      enabled: track.enabled,
      id: track.id,
      label: track.label,
      muted: track.muted,
      readyState: track.readyState,
    })) ?? []
  );
}

function countSdpCandidates(description?: RTCSessionDescription | RTCSessionDescriptionInit | null) {
  return (description?.sdp?.match(/^a=candidate:/gm) ?? []).length;
}

function getAudioSdpSection(description?: RTCSessionDescription | RTCSessionDescriptionInit | null) {
  const sdp = description?.sdp;
  if (!sdp) return "";
  const sections = sdp.split(/\r?\n(?=m=)/);
  return sections.find((section) => section.startsWith("m=audio")) ?? "";
}

function describeAudioSdp(description?: RTCSessionDescription | RTCSessionDescriptionInit | null) {
  const section = getAudioSdpSection(description);
  if (!section) return "audio:none";

  const lines = section.split(/\r?\n/).filter(Boolean);
  const mLine = lines.find((line) => line.startsWith("m=audio")) ?? "";
  const direction = lines.find((line) => /^a=(sendrecv|sendonly|recvonly|inactive)$/.test(line))?.replace("a=", "") ?? "unknown";
  const port = mLine.split(" ")[1] ?? "unknown";
  const candidateCount = lines.filter((line) => line.startsWith("a=candidate:")).length;
  const hasIceUfrag = lines.some((line) => line.startsWith("a=ice-ufrag:"));
  const hasIcePwd = lines.some((line) => line.startsWith("a=ice-pwd:"));

  return `port:${port} dir:${direction} ufrag:${hasIceUfrag ? "yes" : "no"} pwd:${hasIcePwd ? "yes" : "no"} cand:${candidateCount}`;
}

function logDescription(label: string, description?: RTCSessionDescription | RTCSessionDescriptionInit | null) {
  console.info(`[audio-call] ${label} full SDP`, description?.sdp ?? "(empty)");
  console.info(`[audio-call] ${label} audio SDP`, {
    summary: describeAudioSdp(description),
    section: getAudioSdpSection(description) || "(no audio m-line)",
  });
}

function describeTransceivers(pc: RTCPeerConnection) {
  return pc.getTransceivers().map((transceiver) => ({
    currentDirection: transceiver.currentDirection,
    direction: transceiver.direction,
    mid: transceiver.mid,
    receiverTrack: transceiver.receiver.track?.kind,
    senderTrack: transceiver.sender.track?.kind,
  }));
}

function describeSenders(pc: RTCPeerConnection) {
  return pc.getSenders().map((sender) => ({
    enabled: sender.track?.enabled,
    kind: sender.track?.kind,
    readyState: sender.track?.readyState,
  }));
}

function logPeerState(label: string, pc: RTCPeerConnection, peerDebugId: string, role: "caller" | "callee", sessionId?: string) {
  console.info(`${getLogPrefix(sessionId, peerDebugId, role)} ${label}`, {
    connectionState: pc.connectionState,
    iceConnectionState: pc.iceConnectionState,
    iceGatheringState: pc.iceGatheringState,
    localDescription: pc.localDescription?.sdp,
    peerDebugId,
    senders: describeSenders(pc),
    signalingState: pc.signalingState,
    transceivers: describeTransceivers(pc),
  });
}

function createPeerDebugId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `peer_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function describeIceCandidate(candidate: RTCIceCandidate) {
  return {
    address: candidate.address,
    candidate: candidate.candidate,
    port: candidate.port,
    protocol: candidate.protocol,
    relatedAddress: candidate.relatedAddress,
    sdpMLineIndex: candidate.sdpMLineIndex,
    sdpMid: candidate.sdpMid,
    tcpType: candidate.tcpType,
    type: candidate.type,
  };
}

function isIceCandidate(payload: RTCSessionDescriptionInit | RTCIceCandidateInit): payload is RTCIceCandidateInit {
  return "candidate" in payload;
}

function candidateKeyFor(signal: CallSignal) {
  if (!isIceCandidate(signal.payload) || !signal.payload.candidate) return signal.id;
  return `${signal.sender_id}:${signal.payload.candidate}:${signal.payload.sdpMid ?? ""}:${signal.payload.sdpMLineIndex ?? ""}`;
}

async function fetchLatestSignalWithRetry(sessionId: string, receiverId: string, signalType: SignalType) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const { data, error } = await supabase
      .from("call_signals")
      .select("*")
      .eq("session_id", sessionId)
      .eq("receiver_id", receiverId)
      .eq("signal_type", signalType)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (data?.[0]) return data[0] as CallSignal;

    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }
  return undefined;
}

type UseWebRTCAudioCallInput = {
  currentUser: AppUser;
  findUser: (id: string) => AppUser | null;
};

export function useWebRTCAudioCall({ currentUser, findUser }: UseWebRTCAudioCallInput) {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [activeSession, setActiveSession] = useState<CallSession | null>(null);
  const [remoteUser, setRemoteUser] = useState<AppUser | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [debug, setDebug] = useState<WebRTCAudioDebug>(initialDebug);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUserRef = useRef(currentUser);
  const findUserRef = useRef(findUser);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const activeSessionRef = useRef<CallSession | null>(null);
  const phaseRef = useRef<CallPhase>("idle");
  const peerDebugIdRef = useRef("-");
  const peerRoleRef = useRef<CallRole | null>(null);
  const peerSessionIdRef = useRef<string | null>(null);
  const peerCreatedAtRef = useRef("-");
  const localCandidateCountsRef = useRef<Map<string, number>>(new Map());
  const noLocalCandidateTimeoutsRef = useRef<Map<string, number>>(new Map());
  const pendingIceRef = useRef<CallSignal[]>([]);
  const processedSignalIdsRef = useRef<Set<string>>(new Set());
  const processedCandidateKeysRef = useRef<Set<string>>(new Set());
  const isAcceptingRef = useRef(false);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    findUserRef.current = findUser;
  }, [findUser]);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const patchDebug = useCallback((partial: Partial<WebRTCAudioDebug>) => {
    setDebug((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearNoLocalCandidateTimeouts = useCallback(() => {
    noLocalCandidateTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    noLocalCandidateTimeoutsRef.current.clear();
    patchDebug({ activeTimeoutsCount: 0 });
  }, [patchDebug]);

  const patchSessionDebug = useCallback((session: CallSession | null, role: CallRole | null = null) => {
    patchDebug({
      callerId: session?.caller_id ?? "-",
      calleeId: session?.receiver_id ?? "-",
      computedRole: role ?? (session ? getSessionRole(session, currentUserRef.current.id) ?? "-" : "-"),
      currentUserId: currentUserRef.current.id,
      sessionId: session?.id ?? "-",
    });
  }, [patchDebug]);

  const refreshAudioElementDebug = useCallback(() => {
    const audio = audioRef.current;
    patchDebug({
      audioElementMuted: Boolean(audio?.muted),
      audioElementPaused: audio?.paused ?? true,
      audioElementSrcObject: Boolean(audio?.srcObject),
      audioElementVolume: audio?.volume ?? 1,
    });
  }, [patchDebug]);

  const refreshTrackDebug = useCallback(() => {
    const pc = pcRef.current;
    const remoteStream = remoteStreamRef.current;
    patchDebug({
      localTrackCount: localStreamRef.current?.getAudioTracks().length ?? 0,
      localTracks: describeTracks(localStreamRef.current),
      receiverAudioTrackCount: pc?.getReceivers().filter((receiver) => receiver.track?.kind === "audio").length ?? 0,
      remoteAudioTrackCount: remoteStream?.getAudioTracks().length ?? 0,
      remoteTracks: describeTracks(remoteStream),
    });
    refreshAudioElementDebug();
  }, [patchDebug, refreshAudioElementDebug]);

  const playRemoteAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio?.srcObject) {
      refreshAudioElementDebug();
      return;
    }

    audio.autoplay = true;
    audio.playsInline = true;
    audio.muted = false;
    audio.volume = 1;

    try {
      await audio.play();
      setNeedsAudioUnlock(false);
    } catch (error) {
      console.warn("[audio-call] remote audio play blocked", error);
      setNeedsAudioUnlock(true);
    } finally {
      refreshAudioElementDebug();
    }
  }, [refreshAudioElementDebug]);

  const attachRemoteStream = useCallback(() => {
    const audio = audioRef.current;
    const remoteStream = remoteStreamRef.current;
    if (!audio || !remoteStream) return;

    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.playsInline = true;
    audio.muted = false;
    audio.volume = 1;
    void playRemoteAudio();
    refreshTrackDebug();
  }, [playRemoteAudio, refreshTrackDebug]);

  const cleanup = useCallback((reason = "manual") => {
    const sessionId = activeSessionRef.current?.id ?? peerSessionIdRef.current ?? "-";
    const peerDebugId = peerDebugIdRef.current;
    const role = peerRoleRef.current ?? "-";
    console.info(`${getLogPrefix(sessionId, peerDebugId, role)} cleanup`, {
      reason,
      signalingState: pcRef.current?.signalingState,
    });
    clearNoLocalCandidateTimeouts();
    pcRef.current?.close();
    pcRef.current = null;
    peerDebugIdRef.current = "-";
    peerRoleRef.current = null;
    peerSessionIdRef.current = null;
    peerCreatedAtRef.current = "-";
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    if (audioRef.current) audioRef.current.srcObject = null;
    activeSessionRef.current = null;
    phaseRef.current = "idle";
    localCandidateCountsRef.current.clear();
    pendingIceRef.current = [];
    processedSignalIdsRef.current.clear();
    processedCandidateKeysRef.current.clear();
    isAcceptingRef.current = false;
    setActiveSession(null);
    setRemoteUser(null);
    setPhase("idle");
    setIsMuted(false);
    setErrorMessage("");
    setNeedsAudioUnlock(false);
    setDebug({ ...initialDebug, currentUserId: currentUserRef.current.id });
  }, [clearNoLocalCandidateTimeouts]);

  const sendSignal = useCallback(async (session: CallSession, receiverId: string, signalType: SignalType, payload: RTCSessionDescriptionInit | RTCIceCandidateInit) => {
    const { error } = await supabase.from("call_signals").insert({
      session_id: session.id,
      sender_id: currentUserRef.current.id,
      receiver_id: receiverId,
      signal_type: signalType,
      payload,
    });
    if (error) {
      console.error("[audio-call] Supabase signal insert failed", {
        error,
        receiverId,
        sessionId: session.id,
        signalType,
      });
      setDebug((prev) => ({ ...prev, lastSignalError: error.message }));
      throw error;
    }
    console.info("[audio-call] Supabase signal inserted", {
      receiverId,
      sessionId: session.id,
      signalType,
    });
  }, []);

  const addLocalTracks = useCallback((pc: RTCPeerConnection, localStream: MediaStream) => {
    const audioTracks = localStream.getAudioTracks();
    console.info("[audio-call] local audio tracks", audioTracks.map((track) => ({
      enabled: track.enabled,
      id: track.id,
      label: track.label,
      muted: track.muted,
      readyState: track.readyState,
    })));
    audioTracks.forEach((track) => {
      if (!pc.getSenders().some((sender) => sender.track?.id === track.id)) pc.addTrack(track, localStream);
    });
    console.info("[audio-call] transceivers after addTrack", describeTransceivers(pc));
    refreshTrackDebug();
  }, [refreshTrackDebug]);

  const getLocalAudioStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    refreshTrackDebug();
    return stream;
  }, [refreshTrackDebug]);

  const queueIceSignal = useCallback((signal: CallSignal) => {
    const candidateKey = candidateKeyFor(signal);
    const alreadyQueued = pendingIceRef.current.some((pendingSignal) => candidateKeyFor(pendingSignal) === candidateKey);
    if (!alreadyQueued) {
      pendingIceRef.current = [...pendingIceRef.current, signal];
      console.info("[audio-call] queued remote ICE candidate", {
        candidate: isIceCandidate(signal.payload) ? signal.payload.candidate : undefined,
        pendingIceCount: pendingIceRef.current.length,
        senderId: signal.sender_id,
        sessionId: signal.session_id,
      });
      patchDebug({ pendingIceCount: pendingIceRef.current.length });
    }
  }, [patchDebug]);

  const flushPendingIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc?.remoteDescription) return;
    const pendingSignals = pendingIceRef.current;
    pendingIceRef.current = [];
    patchDebug({ pendingIceCount: 0 });
    for (const signal of pendingSignals) {
      await addIceSignal(signal);
    }
  }, [patchDebug]);

  const scheduleNoLocalCandidateCheck = useCallback((pc: RTCPeerConnection, peerDebugId: string, role: "caller" | "callee") => {
    const sessionId = activeSessionRef.current?.id;
    const timeoutKey = `${sessionId ?? "-"}:${peerDebugId}:${role}:no-local-candidates`;
    const existingTimeoutId = noLocalCandidateTimeoutsRef.current.get(timeoutKey);
    if (existingTimeoutId) window.clearTimeout(existingTimeoutId);

    const timeoutId = window.setTimeout(() => {
      noLocalCandidateTimeoutsRef.current.delete(timeoutKey);
      patchDebug({ activeTimeoutsCount: noLocalCandidateTimeoutsRef.current.size });
      if (
        pcRef.current !== pc ||
        activeSessionRef.current?.id !== sessionId ||
        peerSessionIdRef.current !== sessionId ||
        peerRoleRef.current !== role ||
        peerDebugIdRef.current !== peerDebugId
      ) {
        console.info(`${getLogPrefix(sessionId, peerDebugId, role)} ignore stale no-local-candidate timer`, {
          activePeerId: peerDebugIdRef.current,
          activeRole: peerRoleRef.current,
          activeSessionId: activeSessionRef.current?.id,
        });
        return;
      }
      const localCandidateCount = localCandidateCountsRef.current.get(peerDebugId) ?? 0;
      if (localCandidateCount > 0) return;

      const diagnostic = {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        localDescription: pc.localDescription?.sdp,
        peerDebugId,
        role,
        rtcConfig,
        senders: describeSenders(pc),
        signalingState: pc.signalingState,
        transceivers: describeTransceivers(pc),
      };
      console.error(`${getLogPrefix(sessionId, peerDebugId, role)} no local candidates generated`, diagnostic);
      patchDebug({
        noLocalCandidateError: `${role} ${peerDebugId}: no local candidates after 5s`,
      });
    }, 5000);
    noLocalCandidateTimeoutsRef.current.set(timeoutKey, timeoutId);
    patchDebug({ activeTimeoutsCount: noLocalCandidateTimeoutsRef.current.size });
  }, [patchDebug]);

  const createPeer = useCallback((session: CallSession, requestedRole: "caller" | "callee") => {
    const computedRole = getSessionRole(session, currentUserRef.current.id);
    if (!computedRole) {
      throw new Error("Current user is not a participant of this call session");
    }
    if (computedRole !== requestedRole) {
      throw new Error(`Invalid WebRTC role. requested=${requestedRole}, computed=${computedRole}`);
    }

    const existingPc = pcRef.current;
    if (existingPc && !isPeerClosed(existingPc)) {
      console.warn("[webrtc] peer already exists, skip creating new peer", {
        existingPeerId: peerDebugIdRef.current,
        existingRole: peerRoleRef.current,
        existingSessionId: peerSessionIdRef.current,
        requestedRole,
        sessionId: session.id,
      });
      return existingPc;
    }

    clearNoLocalCandidateTimeouts();
    const role = computedRole;
    const remoteUserId = getRemoteUserId(session, role);
    const peerDebugId = createPeerDebugId();
    const peerCreatedAt = new Date().toISOString();
    const pc = createPeerConnection(role);
    localCandidateCountsRef.current.set(peerDebugId, 0);
    peerDebugIdRef.current = peerDebugId;
    peerRoleRef.current = role;
    peerSessionIdRef.current = session.id;
    peerCreatedAtRef.current = peerCreatedAt;
    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    pcRef.current = pc;
    console.info(`${getLogPrefix(session.id, peerDebugId, role)} create peer`, {
      callerId: session.caller_id,
      calleeId: session.receiver_id,
      peerDebugId,
      role,
      sessionId: session.id,
      userId: currentUserRef.current.id,
    });

    if (role === "caller") {
      try {
        const channel = pc.createDataChannel("ice-check");
        console.info(`${getLogPrefix(session.id, peerDebugId, role)} created debug datachannel`, { channel });
        channel.onopen = () => console.info(`${getLogPrefix(session.id, peerDebugId, role)} ice-check data channel open`);
        channel.onerror = (event) => console.warn(`${getLogPrefix(session.id, peerDebugId, role)} ice-check data channel error`, { event });
      } catch (error) {
        console.warn(`${getLogPrefix(session.id, peerDebugId, role)} create ice-check data channel failed`, { error });
      }
    }

    patchDebug({
      callerId: session.caller_id,
      calleeId: session.receiver_id,
      computedRole: role,
      connectionState: pc.connectionState,
      currentUserId: currentUserRef.current.id,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      isPeerClosed: false,
      peerDebugId,
      peerCreatedAt,
      peerRole: role,
      sessionId: session.id,
      signalingState: pc.signalingState,
    });

    pc.ontrack = (event) => {
      console.info(`${getLogPrefix(session.id, peerDebugId, role)} ontrack`, {
        receiverTracks: pc.getReceivers().map((receiver) => receiver.track && {
          enabled: receiver.track.enabled,
          id: receiver.track.id,
          kind: receiver.track.kind,
          muted: receiver.track.muted,
          readyState: receiver.track.readyState,
        }),
        streams: event.streams.length,
        track: {
          enabled: event.track.enabled,
          id: event.track.id,
          kind: event.track.kind,
          muted: event.track.muted,
          readyState: event.track.readyState,
        },
      });

      if (event.track.kind === "audio" && !remoteStream.getTracks().some((track) => track.id === event.track.id)) {
        remoteStream.addTrack(event.track);
      }
      if (event.streams[0]) {
        event.streams[0].getAudioTracks().forEach((track) => {
          if (!remoteStream.getTracks().some((existingTrack) => existingTrack.id === track.id)) remoteStream.addTrack(track);
        });
      }
      attachRemoteStream();
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        console.info(`${getLogPrefix(session.id, peerDebugId, role)} local ICE gathering completed`, {
          localDescription: describeAudioSdp(pc.localDescription),
          localSdpCandidates: countSdpCandidates(pc.localDescription),
          peerDebugId,
          role,
          userId: currentUserRef.current.id,
        });
        return;
      }
      const payload = event.candidate.toJSON();
      const nextPeerCandidateCount = (localCandidateCountsRef.current.get(peerDebugId) ?? 0) + 1;
      localCandidateCountsRef.current.set(peerDebugId, nextPeerCandidateCount);
      console.info(`${getLogPrefix(session.id, peerDebugId, role)} onicecandidate`, {
        ...describeIceCandidate(event.candidate),
        peerDebugId,
        receiverId: remoteUserId,
        role,
        sessionId: session.id,
        userId: currentUserRef.current.id,
      });
      setDebug((prev) => ({
        ...prev,
        callerOnIceCandidateCount: role === "caller" ? prev.callerOnIceCandidateCount + 1 : prev.callerOnIceCandidateCount,
        calleeOnIceCandidateCount: role === "callee" ? prev.calleeOnIceCandidateCount + 1 : prev.calleeOnIceCandidateCount,
        localCandidateCount: prev.localCandidateCount + 1,
        localSdpCandidateCount: countSdpCandidates(pc.localDescription),
        noLocalCandidateError: "",
      }));
      void sendSignal(session, remoteUserId, "ice-candidate", payload)
        .then(() => {
          console.info(`${getLogPrefix(session.id, peerDebugId, role)} insert ICE success`, { receiverId: remoteUserId });
          if (role === "caller") {
            setDebug((prev) => ({
              ...prev,
              callerIceInsertError: "",
              callerIceInsertSuccessCount: prev.callerIceInsertSuccessCount + 1,
            }));
          }
          if (role === "callee") {
            setDebug((prev) => ({
              ...prev,
              calleeIceInsertSuccessCount: prev.calleeIceInsertSuccessCount + 1,
              calleeIceInsertError: "",
            }));
          }
        })
        .catch((error) => {
          console.error(`${getLogPrefix(session.id, peerDebugId, role)} insert ICE error`, error);
          if (role === "caller") {
            setDebug((prev) => ({
              ...prev,
              callerIceInsertError: error instanceof Error ? error.message : String(error),
            }));
          }
          if (role === "callee") {
            setDebug((prev) => ({
              ...prev,
              calleeIceInsertError: error instanceof Error ? error.message : String(error),
            }));
          }
          setErrorMessage(error instanceof Error ? error.message : "ICE candidateを送信できませんでした");
        });
    };

    pc.onicecandidateerror = (event) => {
      const message = `${event.errorCode} ${event.errorText || "ICE candidate error"} (${event.url || "no url"})`;
      console.warn(`${getLogPrefix(session.id, peerDebugId, role)} ICE candidate error`, {
        address: event.address,
        errorCode: event.errorCode,
        errorText: event.errorText,
        port: event.port,
        url: event.url,
      });
      patchDebug({ iceCandidateError: message, lastIceCandidateError: message });
    };

    pc.onconnectionstatechange = () => {
      patchDebug({ connectionState: pc.connectionState, isPeerClosed: pc.signalingState === "closed" || pc.connectionState === "closed" });
      console.info(`${getLogPrefix(session.id, peerDebugId, role)} connectionState`, { state: pc.connectionState });
      if (pc.connectionState === "connected") setPhase("active");
      if (pc.connectionState === "failed") setErrorMessage("接続に失敗しました");
    };

    pc.oniceconnectionstatechange = () => {
      patchDebug({ iceConnectionState: pc.iceConnectionState });
      console.info(`${getLogPrefix(session.id, peerDebugId, role)} iceConnectionState`, { state: pc.iceConnectionState });
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") setPhase("active");
      if (pc.iceConnectionState === "failed") setErrorMessage("音声接続に失敗しました");
    };

    pc.onicegatheringstatechange = () => {
      console.info(`${getLogPrefix(session.id, peerDebugId, role)} iceGatheringState`, { state: pc.iceGatheringState });
      patchDebug({
        iceGatheringState: pc.iceGatheringState,
        localSdpCandidateCount: countSdpCandidates(pc.localDescription),
      });
    };

    pc.onsignalingstatechange = () => {
      patchDebug({ isPeerClosed: pc.signalingState === "closed", signalingState: pc.signalingState });
      console.info(`${getLogPrefix(session.id, peerDebugId, role)} signalingState`, { state: pc.signalingState });
    };

    return pc;
  }, [attachRemoteStream, clearNoLocalCandidateTimeouts, patchDebug, sendSignal]);

  async function addIceSignal(signal: CallSignal) {
    const pc = pcRef.current;
    if (!pc || signal.sender_id === currentUserRef.current.id || signal.receiver_id !== currentUserRef.current.id) return;
    if (signal.session_id !== activeSessionRef.current?.id || signal.session_id !== peerSessionIdRef.current) return;
    if (!isIceCandidate(signal.payload) || !signal.payload.candidate) return;
    const role = peerRoleRef.current ?? "-";
    const peerDebugId = peerDebugIdRef.current;

    const candidateKey = candidateKeyFor(signal);
    if (processedCandidateKeysRef.current.has(candidateKey)) {
      console.info(`${getLogPrefix(signal.session_id, peerDebugId, role)} remote ICE candidate skipped duplicate`, {
        candidate: signal.payload.candidate,
        senderId: signal.sender_id,
        sessionId: signal.session_id,
      });
      return;
    }
    if (pc.remoteDescription?.sdp?.includes(signal.payload.candidate)) {
      processedCandidateKeysRef.current.add(candidateKey);
      patchDebug({ remoteCandidateCount: processedCandidateKeysRef.current.size });
      console.info(`${getLogPrefix(signal.session_id, peerDebugId, role)} remote ICE candidate already present in SDP`, {
        candidate: signal.payload.candidate,
        senderId: signal.sender_id,
        sessionId: signal.session_id,
      });
      return;
    }

    if (!pc.remoteDescription) {
      queueIceSignal(signal);
      return;
    }

    console.info(`${getLogPrefix(signal.session_id, peerDebugId, role)} addIceCandidate`, {
      candidate: signal.payload.candidate,
      senderId: signal.sender_id,
      sessionId: signal.session_id,
    });
    await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
    processedCandidateKeysRef.current.add(candidateKey);
    patchDebug({
      addedRemoteIceCount: processedCandidateKeysRef.current.size,
      remoteCandidateCount: processedCandidateKeysRef.current.size,
    });
  }

  const handleSignal = useCallback(async (signal: CallSignal) => {
    if (signal.receiver_id !== currentUserRef.current.id || signal.sender_id === currentUserRef.current.id) return;
    if (processedSignalIdsRef.current.has(signal.id)) return;
    const session = activeSessionRef.current;
    if (!session || signal.session_id !== session.id) return;
    if (peerSessionIdRef.current && signal.session_id !== peerSessionIdRef.current) return;

    try {
      const pc = pcRef.current;
      const role = peerRoleRef.current;
      console.info(`${getLogPrefix(signal.session_id, peerDebugIdRef.current, role ?? "-")} receive signal`, {
        senderId: signal.sender_id,
        signalId: signal.id,
        signalType: signal.signal_type,
      });

      if (signal.signal_type === "ice-candidate") {
        if (!isIceCandidate(signal.payload) || !signal.payload.candidate) {
          processedSignalIdsRef.current.add(signal.id);
          return;
        }

        const candidateKey = candidateKeyFor(signal);
        if (processedCandidateKeysRef.current.has(candidateKey)) {
          processedSignalIdsRef.current.add(signal.id);
          return;
        }

        setDebug((prev) => ({ ...prev, receivedRemoteIceCount: prev.receivedRemoteIceCount + 1 }));

        if (!pc || !pc.remoteDescription) {
          queueIceSignal(signal);
          processedSignalIdsRef.current.add(signal.id);
          return;
        }

        await addIceSignal(signal);
        processedSignalIdsRef.current.add(signal.id);
        return;
      }

      if (!pc) return;

      if (signal.signal_type === "answer") {
        if (peerRoleRef.current !== "caller") {
          console.warn(`${getLogPrefix(signal.session_id, peerDebugIdRef.current, peerRoleRef.current ?? "-")} ignore answer for non-caller peer`);
          processedSignalIdsRef.current.add(signal.id);
          return;
        }
        if (pc.signalingState !== "have-local-offer") return;
        console.info(`${getLogPrefix(signal.session_id, peerDebugIdRef.current, "caller")} receive answer`, {
          peerDebugId: peerDebugIdRef.current,
          sessionId: signal.session_id,
          signalId: signal.id,
        });
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
        logPeerState("after setRemoteDescription(answer)", pc, peerDebugIdRef.current, "caller", signal.session_id);
        logDescription("caller remote answer", pc.remoteDescription);
        processedSignalIdsRef.current.add(signal.id);
        patchDebug({
          remoteAudioSdp: describeAudioSdp(pc.remoteDescription),
          remoteSdpCandidateCount: countSdpCandidates(pc.remoteDescription),
          signalingState: pc.signalingState,
        });
        await flushPendingIce();
        setPhase("active");
        void playRemoteAudio();
        return;
      }
    } catch (error) {
      console.error("[audio-call] signal handling failed", error);
      setErrorMessage(error instanceof Error ? error.message : "通話シグナルを処理できませんでした");
    }
  }, [flushPendingIce, patchDebug, playRemoteAudio, queueIceSignal]);

  const fetchSignalsForActiveSession = useCallback(async () => {
    const session = activeSessionRef.current;
    if (!session) return;

    const { data, error } = await supabase
      .from("call_signals")
      .select("*")
      .eq("session_id", session.id)
      .eq("receiver_id", currentUserRef.current.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[audio-call] fetch signals failed", error);
      return;
    }

    for (const signal of (data ?? []) as CallSignal[]) {
      await handleSignal(signal);
    }
  }, [handleSignal]);

  const startAudioCall = useCallback(async ({ receiver, threadId }: StartAudioCallInput) => {
    if (phaseRef.current !== "idle") return;
    cleanup("start new call");
    setErrorMessage("");

    try {
      const session: CallSession = {
        id: callIdFor(currentUserRef.current.id, receiver.id),
        caller_id: currentUserRef.current.id,
        receiver_id: receiver.id,
        thread_id: threadId ?? null,
        call_type: "audio",
        status: "ringing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ended_at: null,
      };

      const { data, error } = await supabase.from("call_sessions").insert(session).select("*").single();
      if (error) throw error;
      const createdSession = data as CallSession;
      const role = getSessionRole(createdSession, currentUserRef.current.id);
      if (role !== "caller") throw new Error("発信者として通話セッションを開始できません");
      console.info(`${getLogPrefix(createdSession.id, "-", role)} startCall`, {
        callerId: createdSession.caller_id,
        calleeId: createdSession.receiver_id,
        receiverId: receiver.id,
      });
      activeSessionRef.current = createdSession;
      setActiveSession(createdSession);
      setRemoteUser(receiver);
      setPhase("outgoing");
      patchSessionDebug(createdSession, role);

      const pc = createPeer(createdSession, "caller");
      const localStream = await getLocalAudioStream();
      addLocalTracks(pc, localStream);
      console.info(`${getLogPrefix(createdSession.id, peerDebugIdRef.current, "caller")} transceivers before createOffer`, describeTransceivers(pc));
      console.info(`${getLogPrefix(createdSession.id, peerDebugIdRef.current, "caller")} createOffer`);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      logPeerState("after setLocalDescription(offer)", pc, peerDebugIdRef.current, "caller", createdSession.id);
      scheduleNoLocalCandidateCheck(pc, peerDebugIdRef.current, "caller");
      logDescription("caller local offer", pc.localDescription);
      patchDebug({
        localAudioSdp: describeAudioSdp(pc.localDescription),
        localSdpCandidateCount: countSdpCandidates(pc.localDescription),
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
      });
      console.info(`${getLogPrefix(createdSession.id, peerDebugIdRef.current, "caller")} insert offer`, {
        peerDebugId: peerDebugIdRef.current,
        receiverId: receiver.id,
        sessionId: createdSession.id,
      });
      await sendSignal(createdSession, receiver.id, "offer", pc.localDescription?.toJSON() ?? offer);
    } catch (error) {
      console.error("[audio-call] start failed", error);
      setErrorMessage(error instanceof Error ? error.message : "通話を開始できませんでした");
      cleanup("start failed");
    }
  }, [addLocalTracks, cleanup, createPeer, getLocalAudioStream, patchDebug, patchSessionDebug, scheduleNoLocalCandidateCheck, sendSignal]);

  const acceptIncomingCall = useCallback(async () => {
    const session = activeSessionRef.current;
    if (!session || phaseRef.current !== "incoming" || isAcceptingRef.current) return;
    isAcceptingRef.current = true;
    setErrorMessage("");

    try {
      const offerSignal = await fetchLatestSignalWithRetry(session.id, currentUserRef.current.id, "offer");
      const offer = offerSignal?.payload as RTCSessionDescriptionInit | undefined;
      if (!offer) throw new Error("通話リクエストが見つかりません");

      const role = getSessionRole(session, currentUserRef.current.id);
      if (role !== "callee") throw new Error("着信者として通話に応答できません");
      console.info(`${getLogPrefix(session.id, "-", role)} answerCall`, {
        callerId: session.caller_id,
        calleeId: session.receiver_id,
      });
      patchSessionDebug(session, role);

      const pc = createPeer(session, "callee");
      const localStream = await getLocalAudioStream();
      addLocalTracks(pc, localStream);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.info(`${getLogPrefix(session.id, peerDebugIdRef.current, "callee")} setRemoteDescription(offer)`);
      logDescription("callee remote offer", pc.remoteDescription);
      console.info(`${getLogPrefix(session.id, peerDebugIdRef.current, "callee")} callee transceivers after remote offer`, describeTransceivers(pc));
      patchDebug({
        remoteAudioSdp: describeAudioSdp(pc.remoteDescription),
        remoteSdpCandidateCount: countSdpCandidates(pc.remoteDescription),
        signalingState: pc.signalingState,
      });
      await flushPendingIce();
      console.info(`${getLogPrefix(session.id, peerDebugIdRef.current, "callee")} createAnswer`);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      scheduleNoLocalCandidateCheck(pc, peerDebugIdRef.current, "callee");
      console.info(`${getLogPrefix(session.id, peerDebugIdRef.current, "callee")} localDescription after setLocalDescription`, pc.localDescription);
      console.info(`${getLogPrefix(session.id, peerDebugIdRef.current, "callee")} transceivers`, describeTransceivers(pc));
      logDescription("callee local answer", pc.localDescription);
      patchDebug({
        localAudioSdp: describeAudioSdp(pc.localDescription),
        localSdpCandidateCount: countSdpCandidates(pc.localDescription),
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
      });
      await sendSignal(session, session.caller_id, "answer", pc.localDescription?.toJSON() ?? answer);
      setPhase("active");
      void playRemoteAudio();
      await supabase.from("call_sessions").update({ status: "accepted" }).eq("id", session.id);
    } catch (error) {
      console.error("[audio-call] accept failed", error);
      setErrorMessage(error instanceof Error ? error.message : "通話に参加できませんでした");
      await supabase.from("call_sessions").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", session.id);
      cleanup("accept failed");
    } finally {
      isAcceptingRef.current = false;
    }
  }, [addLocalTracks, cleanup, createPeer, flushPendingIce, getLocalAudioStream, patchDebug, patchSessionDebug, scheduleNoLocalCandidateCheck, sendSignal]);

  const endCall = useCallback(async () => {
    const session = activeSessionRef.current;
    let cleanupReason = "end without session";
    if (session) {
      const status: CallStatus = phaseRef.current === "incoming" ? "rejected" : "ended";
      cleanupReason = status;
      await supabase.from("call_sessions").update({ status, ended_at: new Date().toISOString() }).eq("id", session.id);
    }
    cleanup(cleanupReason);
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
    refreshTrackDebug();
  }, [isMuted, refreshTrackDebug]);

  useEffect(() => {
    const channel = supabase
      .channel(`voice-call:${currentUser.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "call_sessions" }, (payload) => {
        if (!isCallSession(payload.new)) return;
        const session = payload.new;
        if (session.receiver_id !== currentUserRef.current.id || session.status !== "ringing" || phaseRef.current !== "idle") return;
        const role = getSessionRole(session, currentUserRef.current.id);
        if (role !== "callee") return;
        console.info(`${getLogPrefix(session.id, "-", role)} incoming ringing session`, {
          callerId: session.caller_id,
          calleeId: session.receiver_id,
        });
        activeSessionRef.current = session;
        setActiveSession(session);
        setRemoteUser(findUserRef.current(session.caller_id));
        patchSessionDebug(session, role);
        setPhase("incoming");
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "call_sessions" }, (payload) => {
        if (!isCallSession(payload.new)) return;
        const session = payload.new;
        if (session.id !== activeSessionRef.current?.id) return;
        setActiveSession(session);
        if (["rejected", "ended", "missed"].includes(session.status)) cleanup(`remote ${session.status}`);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "call_signals" }, (payload) => {
        if (isCallSignal(payload.new)) void handleSignal(payload.new);
      })
      .subscribe((status) => {
        patchDebug({ activeSubscriptionsCount: status === "SUBSCRIBED" ? 1 : 0 });
      });

    return () => {
      void supabase.removeChannel(channel);
      patchDebug({ activeSubscriptionsCount: 0 });
    };
  }, [cleanup, currentUser.id, handleSignal, patchDebug, patchSessionDebug]);

  useEffect(() => {
    if (phase === "idle" || !pcRef.current) return;
    const intervalId = window.setInterval(async () => {
      const pc = pcRef.current;
      if (!pc) return;
      const stats = await pc.getStats();
      const statsById = new Map<string, RTCStats>();
      let inboundAudioBytes = 0;
      let outboundAudioBytes = 0;
      let selectedCandidatePairId = "";
      stats.forEach((report) => {
        statsById.set(report.id, report);
        if (report.type === "inbound-rtp" && report.kind === "audio") inboundAudioBytes += report.bytesReceived ?? 0;
        if (report.type === "outbound-rtp" && report.kind === "audio") outboundAudioBytes += report.bytesSent ?? 0;
        if (report.type === "transport" && report.selectedCandidatePairId) selectedCandidatePairId = report.selectedCandidatePairId;
        if (report.type === "candidate-pair" && (report.selected || (report.nominated && report.state === "succeeded"))) {
          selectedCandidatePairId = report.id;
        }
      });
      const selectedPair = selectedCandidatePairId ? statsById.get(selectedCandidatePairId) : undefined;
      const localCandidate = selectedPair?.localCandidateId ? statsById.get(selectedPair.localCandidateId) : undefined;
      const remoteCandidate = selectedPair?.remoteCandidateId ? statsById.get(selectedPair.remoteCandidateId) : undefined;
      const selectedCandidatePair = selectedPair
        ? `${localCandidate?.candidateType ?? "local"}:${localCandidate?.protocol ?? "?"} -> ${remoteCandidate?.candidateType ?? "remote"}:${remoteCandidate?.protocol ?? "?"} ${selectedPair.state ?? ""}`.trim()
        : "-";
      patchDebug({
        inboundAudioBytes,
        outboundAudioBytes,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        isPeerClosed: pc.signalingState === "closed" || pc.connectionState === "closed",
        peerDebugId: peerDebugIdRef.current,
        peerCreatedAt: peerCreatedAtRef.current,
        peerRole: peerRoleRef.current ?? "-",
        selectedCandidatePair,
        sessionId: peerSessionIdRef.current ?? activeSessionRef.current?.id ?? "-",
        signalingState: pc.signalingState,
      });
      refreshTrackDebug();
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [patchDebug, phase, refreshTrackDebug]);

  useEffect(() => {
    if (!activeSession || phase === "idle" || debug.connectionState === "connected") return;
    const intervalId = window.setInterval(() => {
      void fetchSignalsForActiveSession();
    }, 800);
    return () => window.clearInterval(intervalId);
  }, [activeSession, debug.connectionState, fetchSignalsForActiveSession, phase]);

  useEffect(() => cleanup, [cleanup]);

  return {
    acceptIncomingCall,
    audioRef,
    debug,
    endCall,
    errorMessage,
    isCallActive: phase !== "idle",
    isMuted,
    needsAudioUnlock,
    phase,
    playRemoteAudio,
    remoteUser,
    startAudioCall,
    toggleMute,
  };
}

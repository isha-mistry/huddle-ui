"use client";

import RemotePeer from "@/components/remotePeer";
import { useStudioState } from "@/store/studioState";
import { BasicIcons } from "@/utils/BasicIcons";
import {
  useDataMessage,
  useDevices,
  useLocalAudio,
  useLocalMedia,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from "@huddle01/react/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BottomBar from "@/components/bottomBar";
import { Button } from "@/components/ui/button";
import { PeerMetadata } from "@/utils/types";
import ChatBar from "@/components/sidebars/ChatBar/chatbar";
import ParticipantsBar from "@/components/sidebars/participantsSidebar/participantsBar";
import Video from "@/components/Media/Video";
import { Role } from "@huddle01/server-sdk/auth";
import clsx from "clsx";
import GridContainer from "@/components/GridContainer";
import ShowCaptions from "@/components/Caption/showCaptions";
import RemoteScreenShare from "@/components/remoteScreenShare";
import MainGridLayout from "@/components/MainGridLayout";
import Camera from "@/components/Media/Camera";

export default function Component({ params }: { params: { roomId: string } }) {
  const { isVideoOn, enableVideo, disableVideo, stream } = useLocalVideo();
  const {
    isAudioOn,
    enableAudio,
    disableAudio,
    stream: audioStream,
  } = useLocalAudio();
  const { fetchStream } = useLocalMedia();
  const [streamNew, setStreamNew] = useState<any>("");
  const { setPreferredDevice: setCamPrefferedDevice } = useDevices({
    type: "cam",
  });
  const { setPreferredDevice: setAudioPrefferedDevice } = useDevices({
    type: "mic",
  });
  const {
    name,
    isChatOpen,
    isParticipantsOpen,
    addChatMessage,
    activeBg,
    videoDevice,
    audioInputDevice,
    layout,
    isScreenShared,
  } = useStudioState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { peerIds } = usePeerIds({
    roles: [Role.HOST, Role.GUEST],
  });
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const { peerId } = useLocalPeer();
  const { metadata, role } = useLocalPeer<PeerMetadata>();
  const { videoTrack, shareStream } = useLocalScreenShare();
  const { state } = useRoom({
    onLeave: async () => {
      router.push(`/${params.roomId}/lobby`);
    },
  });

  useDataMessage({
    async onMessage(payload, from, label) {
      if (label === "chat") {
        const { message, name } = JSON.parse(payload);
        addChatMessage({
          name: name,
          text: message,
          isUser: from === peerId,
        });
      }
      if (label === "file") {
        const { message, fileName, name } = JSON.parse(payload);
        // fetch file from message and display it
        addChatMessage({
          name: name,
          text: message,
          isUser: from === peerId,
          fileName,
        });
      }
      if (label === "server-message") {
        const { s3URL } = JSON.parse(payload);
        alert(`Your recording: ${s3URL}`);
      }
    },
  });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (state === "idle") {
      router.push(`${params.roomId}/lobby`);
    }
  }, [state]);

  useEffect(() => {
    setCamPrefferedDevice(videoDevice.deviceId);
    if (isVideoOn) {
      disableVideo();
      const changeVideo = async () => {
        const { stream } = await fetchStream({
          mediaDeviceKind: "cam",
        });
        if (stream) {
          await enableVideo(stream);
        }
      };
      changeVideo();
    }
  }, [videoDevice]);

  useEffect(() => {
    setAudioPrefferedDevice(audioInputDevice.deviceId);
    if (isAudioOn) {
      disableAudio();
      const changeAudio = async () => {
        const { stream } = await fetchStream({
          mediaDeviceKind: "mic",
        });
        if (stream) {
          enableAudio(stream);
        }
      };
      changeAudio();
    }
  }, [audioInputDevice]);

  useEffect(() => {
    console.log(shareStream);
  }, [shareStream]);

  useEffect(() => {
    setStreamNew(videoTrack && new MediaStream([videoTrack]));
    console.log("videoTrack", videoTrack);
  }, [videoTrack]);

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      const message = "Are you sure you want to leave?";
      event.returnValue = message; // Standard way to display an alert in modern browsers
      return message; // For some older browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className={clsx("flex flex-col h-screen bg-white")}>
      <header className="flex items-center justify-between pt-4 px-4">
        <h1 className="text-black text-xl font-semibold">Health01</h1>
        <div className="flex space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex gap-2 bg-gray-600/50 text-gray-200 hover:bg-gray-500/50">
                {BasicIcons.invite}
                Invite
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="flex space-x-2">
                <span className="p-2 bg-gray-200 rounded-lg text-black">
                  {typeof window !== "undefined" &&
                    `http://${window.location.host}/${params.roomId}`}
                </span>
                <Button
                  className="bg-gray-200 hover:bg-gray-300"
                  onClick={() => {
                    if (typeof window === "undefined") return;
                    navigator.clipboard.writeText(
                      `http://${window.location.host}/${params.roomId}`
                    );
                    setIsCopied(true);
                    setTimeout(() => {
                      setIsCopied(false);
                    }, 3000);
                  }}
                >
                  {isCopied ? "Copied" : "Copy"}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main
        className={`transition-all ease-in-out flex items-center justify-center flex-1 duration-300 w-full h-[80%] p-2`}
        style={{
          backgroundColor: activeBg === "bg-white" ? "white" : undefined,
          backgroundImage:
            activeBg === "bg-white" ? undefined : `url(${activeBg})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex w-full h-full">
          {shareStream && (
            <div className="w-3/4">
              <GridContainer className="w-full h-full">
                <>
                  <Video
                    stream={streamNew}
                    name={metadata?.displayName ?? "guest"}
                  />
                </>
              </GridContainer>
            </div>
          )}
          {peerIds.map((peerId) => (
            <RemoteScreenShare key={peerId} peerId={peerId} />
          ))}
          <section
            className={clsx(
              "justify-center px-4",
              isScreenShared
                ? "flex flex-col w-1/4 gap-2"
                : "flex flex-wrap gap-3 w-full"
            )}
          >
            {role !== Role.BOT && (
              <GridContainer
                className={clsx(
                  isScreenShared ? "w-full h-full gap-y-2 mx-1" : "w-[49%]"
                )}
              >
                {metadata?.isHandRaised && (
                  <span className="absolute top-4 right-4 text-4xl text-gray-200 font-medium">
                    ✋
                  </span>
                )}
                {stream ? (
                  <>
                    <Camera
                      stream={stream}
                      name={metadata?.displayName ?? "guest"}
                    />
                  </>
                ) : (
                  <div className="flex text-3xl font-semibold items-center justify-center w-24 h-24 bg-[#004DFF] text-gray-200 rounded-full">
                    {name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-4 left-4 text-gray-800 font-medium">
                  {`${metadata?.displayName} (You) ${role}`}
                </span>
              </GridContainer>
            )}
            {isScreenShared
              ? peerIds
                  .slice(0, 2)
                  .map((peerId) => <RemotePeer key={peerId} peerId={peerId} />)
              : peerIds.map((peerId) => (
                  <RemotePeer key={peerId} peerId={peerId} />
                ))}
          </section>
          {/* <MainGridLayout params={params} /> */}
        </div>
        {isChatOpen && <ChatBar />}
        {isParticipantsOpen && <ParticipantsBar />}
      </main>
      {/* <ShowCaptions
        mediaStream={audioStream}
        name={metadata?.displayName}
        localPeerId={peerId}
      /> */}
      <BottomBar />
    </div>
  );
}

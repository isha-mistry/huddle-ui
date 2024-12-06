"use server";

export const createRoom = async () => {
  const response = await fetch("https://api.huddle01.com/api/v1/create-room", {
    method: "POST",
    body: JSON.stringify({
      title: "Huddle01 Room",
      hostWallets: ["0xB351a70dD6E5282A8c84edCbCd5A955469b9b032"],
    }),
    headers: {
      "Content-type": "application/json",
      "x-api-key": process.env.API_KEY!,
    },
    cache: "no-cache",
  });

  const data = await response.json();
  const roomId = data.data.roomId;
  return roomId;
};

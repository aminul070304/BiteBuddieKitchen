import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const OrderWebSocketContext = createContext(null);

export const useOrderWebSocket = () => {
  const context = useContext(OrderWebSocketContext);
  if (!context) {
    throw new Error("useOrderWebSocket must be used within OrderWebSocketProvider");
  }
  return context;
};

export const OrderWebSocketProvider = ({ children, token }) => {
  const [orders, setOrders] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const audioRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  // Play notification sound 2 times
  const playNotificationSound = () => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    let playCount = 0;
    const maxPlays = 2;

    const playSound = () => {
      if (playCount >= maxPlays) return;

      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 1.0;
      audioRef.current = audio;

      audio.play()
        .then(() => {
          console.log(`🔊 Notification sound playing (${playCount + 1}/${maxPlays})`);
          audioUnlockedRef.current = true;
        })
        .catch((err) => {
          console.warn("🔇 Audio autoplay blocked:", err);
          if (playCount === 0 && !audioUnlockedRef.current) {
            // Use toast() instead of toast.info()
            toast("🔊 Click anywhere to enable sound notifications", {
              duration: 4000,
              id: 'audio-unlock',
              icon: '🔔'
            });

            const unlockAudio = () => {
              audio.play()
                .then(() => {
                  console.log("🔊 Audio unlocked!");
                  audioUnlockedRef.current = true;
                  toast.success("Sound notifications enabled!", { duration: 2000 });
                })
                .catch(() => {});
              document.removeEventListener("click", unlockAudio);
              document.removeEventListener("touchstart", unlockAudio);
            };

            document.addEventListener("click", unlockAudio, { once: true });
            document.addEventListener("touchstart", unlockAudio, { once: true });
          }
        });

      // When this audio ends, play the next one
      audio.onended = () => {
        playCount++;
        audioRef.current = null;
        if (playCount < maxPlays) {
          // Wait 500ms before playing again
          setTimeout(playSound, 500);
        }
      };
    };

    // Start playing
    playSound();
  };

  // Initialize WebSocket
  useEffect(() => {
    if (!token) return;

    const kitchenId = localStorage.getItem("kitchenId");
    if (!kitchenId) {
      console.warn("⚠️ kitchenId missing. Cannot open WebSocket.");
      return;
    }

    // Construct WebSocket URL
    const BASE_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_ORDERBASE_URL;
    
    let wsUrl = BASE_URL
      .replace(/\/+$/, '')
      .replace(/\/api\/order$/, '')
      .replace(/\/order$/, '');
    
    if (wsUrl.startsWith('https://')) {
      wsUrl = wsUrl.replace('https://', 'wss://');
    } else if (wsUrl.startsWith('http://')) {
      wsUrl = wsUrl.replace('http://', 'ws://');
    } else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      wsUrl = 'ws://' + wsUrl;
    }

    wsUrl = wsUrl + '/ws';

    console.log("🔗 Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WebSocket connected successfully");
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "register", kitchenId }));
      console.log("📨 Sent registration for kitchen:", kitchenId);

      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WebSocket message received:", data);

        if (data.type === "registered") {
          console.log("✅ Successfully registered with server");
          toast.success("Connected to order system");
        } else if (data.type === "pong") {
          console.log("💓 Heartbeat response received");
        } else if (data.type === "new_order") {
          console.log("🆕 New order received:", data);
          setOrders((prev) => [data, ...prev]);
          toast.success("🆕 New order received!");
          playNotificationSound();
        } else if (data.type === "order_update") {
          console.log("🔄 Order update received:", data);
          setOrders((prev) =>
            prev.map((order) =>
              order.orderId === data.orderId ? { ...order, ...data } : order
            )
          );
          toast("Order updated", { icon: '🔄' });
        }
      } catch (err) {
        console.error("❌ WebSocket message parse error:", err.message);
      }
    };

    ws.onclose = (event) => {
      console.log(`🔴 WebSocket closed (code: ${event.code}, reason: ${event.reason || "unknown"})`);
      setIsConnected(false);
      clearInterval(heartbeatIntervalRef.current);
      
      // Only reconnect on abnormal closure
      if (event.code !== 1000 && event.code !== 1001) {
        toast.error("Connection lost. Reconnecting...");
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...");
          window.location.reload();
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error("⚠️ WebSocket error occurred:", error);
      toast.error("Connection error. Please check your network.");
    };

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up WebSocket connection");
      clearInterval(heartbeatIntervalRef.current);
      clearTimeout(reconnectTimeoutRef.current);
      
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [token]);

  const value = {
    orders,
    setOrders,
    isConnected,
  };

  return (
    <OrderWebSocketContext.Provider value={value}>
      {children}
    </OrderWebSocketContext.Provider>
  );
};
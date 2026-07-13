import React, { useEffect, useState } from "react";

interface DeviceOrientationPermissionGateProps {
  children: React.ReactNode;
}

export const DeviceOrientationPermissionGate = ({
  children,
}: DeviceOrientationPermissionGateProps) => {
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const DeviceOrientationEventAny = DeviceOrientationEvent as any;
    // iOS 13+ の場合は確認が必要
    if (
      typeof DeviceOrientationEventAny !== "undefined" &&
      typeof DeviceOrientationEventAny.requestPermission === "function"
    ) {
      setNeedsPermission(true);
    } else {
      setPermissionGranted(true);
    }
  }, []);

  const requestPermission = async () => {
    const DeviceOrientationEventAny = DeviceOrientationEvent as any;
    if (
      typeof DeviceOrientationEventAny !== "undefined" &&
      typeof DeviceOrientationEventAny.requestPermission === "function"
    ) {
      try {
        const response = await DeviceOrientationEventAny.requestPermission();
        if (response === "granted") {
          setPermissionGranted(true);
          setNeedsPermission(false);
        } else {
          alert("センサーのアクセスが拒否されました。");
        }
      } catch (e) {
        console.error(e);
        alert("エラーが発生しました。");
      }
    }
  };

  if (needsPermission && !permissionGranted) {
    return (
      <div
        id="PermissionRequestContainer"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          zIndex: 1000,
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ marginBottom: "20px", fontSize: "18px" }}>
          ジャイロセンサーのアクセス許可が必要です
        </p>
        <button
          onClick={requestPermission}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007aff",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          許可する
        </button>
      </div>
    );
  }

  if (permissionGranted) {
    return <>{children}</>;
  }

  return null;
};

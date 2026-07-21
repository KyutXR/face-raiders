import React, { useEffect, useState } from "react";
import styled from "styled-components";

interface DeviceOrientationPermissionGateProps {
  children: React.ReactNode;
}

const PermissionRequestContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 1000;
  font-family: sans-serif;
`;

const MessageText = styled.p`
  margin-bottom: 20px;
  font-size: 18px;
`;

const PermissionButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  background-color: #007aff;
  color: white;
  cursor: pointer;
  font-weight: bold;
`;

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
      <PermissionRequestContainer id="PermissionRequestContainer">
        <MessageText>
          ジャイロセンサーのアクセス許可が必要です
        </MessageText>
        <PermissionButton onClick={requestPermission}>
          許可する
        </PermissionButton>
      </PermissionRequestContainer>
    );
  }

  if (permissionGranted) {
    return <>{children}</>;
  }

  return null;
};


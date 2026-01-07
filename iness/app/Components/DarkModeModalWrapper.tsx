import React from "react";
import { useTheme } from "@/app/Theme/ThemeContext";
import DarkModeSetupModal from "@/app/Modals/DarkModeSetupModal";

export default function DarkModeModalWrapper() {
  const { showDarkModeModal, setShowDarkModeModal, setThemeMode } = useTheme();

  const handleActivate = async () => {
    // Theme mode is already set by the modal
    setShowDarkModeModal(false);
  };

  const handleClose = () => {
    setShowDarkModeModal(false);
  };

  return (
    <DarkModeSetupModal
      visible={showDarkModeModal}
      onClose={handleClose}
      onActivate={handleActivate}
    />
  );
}


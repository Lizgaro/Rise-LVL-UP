import { useEffect } from "react";
import { appStore } from "./store/use-app-store";
import { AppShell } from "./ui/AppShell";

export default function App() {
  useEffect(() => {
    void appStore.getState().loadInitial();
  }, []);

  return <AppShell />;
}

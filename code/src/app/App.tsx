import { RouterProvider } from "react-router";
import { router } from "./routes";
import { VoiceCallProvider } from "./calls/VoiceCallProvider";
import { AppDataProvider } from "./store/AppDataContext";

export default function App() {
  return (
    <AppDataProvider>
      <VoiceCallProvider>
        <RouterProvider router={router} />
      </VoiceCallProvider>
    </AppDataProvider>
  );
}
